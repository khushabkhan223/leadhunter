"""
LeadHunter 5-stage AI pipeline — Production Config.

Model: gemini-2.5-flash (latest stable model for paid accounts)
Pacing: 1.5s safety pause between AI calls
Budget: Sequential per-lead processing (extract → draft per lead)
"""

from __future__ import annotations

import json
import asyncio
from typing import AsyncGenerator

from google import genai
import serpapi

from .config import GEMINI_API_KEY, SERPAPI_KEY
from .models import (
    HuntRequest,
    SearchQuery,
    DiscoveredPost,
    FilteredLead,
    LeadWithContext,
    FinalLead,
    PipelineEvent,
)
from . import prompts


# ── Production Config ────────────────────────────────────────────────

MODEL = "gemini-2.5-flash"        # latest stable model for paid tier
SAFETY_PAUSE = 1.5                # seconds between AI calls (anti-burst)
RETRY_DELAY = 10                  # seconds to wait on transient errors
MAX_RETRIES = 3                   # max retries per call

_RATE_LIMIT_KEYWORDS = [
    "429", "resource_exhausted", "resourceexhausted",
    "rate limit", "rate_limit", "quota", "too many requests",
]


def _is_rate_limit_error(error: Exception) -> bool:
    """Check if an exception is a rate-limit / quota error."""
    error_str = str(error).lower()
    return any(kw in error_str for kw in _RATE_LIMIT_KEYWORDS)


# ── Helpers ──────────────────────────────────────────────────────────

def _gemini_client() -> genai.Client:
    return genai.Client(
        api_key=GEMINI_API_KEY,
        http_options={"api_version": "v1"},
    )


def _sse(event: PipelineEvent) -> str:
    """Format a PipelineEvent as an SSE string."""
    return f"data: {event.model_dump_json()}\n\n"


def _parse_json(text: str) -> list | dict:
    """Extract JSON from Gemini response, stripping markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return json.loads(text)


async def _gemini_call(prompt: str, label: str = "AI call") -> str:
    """
    Call Gemini with a 1.5s safety pause and auto-retry on errors.
    Uses gemini-2.5-flash via the stable v1 API.
    """
    client = _gemini_client()

    for attempt in range(1, MAX_RETRIES + 1):
        await asyncio.sleep(SAFETY_PAUSE)
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=MODEL,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            if _is_rate_limit_error(e) and attempt < MAX_RETRIES:
                print(f"[LeadHunter] Rate limited on {label} (attempt {attempt}/{MAX_RETRIES}). "
                      f"Retrying in {RETRY_DELAY}s...")
                await asyncio.sleep(RETRY_DELAY)
            else:
                raise

    raise RuntimeError(f"{label} failed after {MAX_RETRIES} retries")


# ── Stage 1: Query Generation ───────────────────────────────────────

async def _stage_1_generate_queries(
    req: HuntRequest,
) -> list[SearchQuery]:
    """Use Gemini to generate 5 targeted search queries."""
    prompt = prompts.QUERY_GENERATOR.format(
        product_name=req.product_name,
        competitor_name=req.competitor_name,
        product_description=req.product_description,
    )
    text = await _gemini_call(prompt, label="Stage 1: Query Generation")
    raw = _parse_json(text)
    return [SearchQuery(**q) for q in raw]


def _run_serp_search(query: str) -> dict:
    """Run a single SerpAPI search (blocking — called via asyncio.to_thread)."""
    results = serpapi.search({
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": 10,
    })
    return dict(results)


# ── Stage 2: Discovery via SerpAPI ───────────────────────────────────

async def _stage_2_discover(
    queries: list[SearchQuery],
) -> list[DiscoveredPost]:
    """Execute each search query via SerpAPI and collect results."""
    all_posts: list[DiscoveredPost] = []
    seen_urls: set[str] = set()

    for sq in queries:
        try:
            results = await asyncio.to_thread(_run_serp_search, sq.query)

            for r in results.get("organic_results", []):
                url = r.get("link", "")
                if url in seen_urls:
                    continue
                seen_urls.add(url)

                source = "other"
                url_lower = url.lower()
                if "reddit.com" in url_lower:
                    source = "reddit"
                elif "news.ycombinator.com" in url_lower:
                    source = "hn"
                elif "stackoverflow.com" in url_lower:
                    source = "stackoverflow"
                elif any(f in url_lower for f in ["forum", "community", "discuss"]):
                    source = "forum"

                all_posts.append(DiscoveredPost(
                    title=r.get("title", "Untitled"),
                    url=url,
                    snippet=r.get("snippet", ""),
                    source=source,
                ))
        except Exception:
            continue

    return all_posts


# ── Stage 3: Intent Filtering via Gemini ─────────────────────────────

async def _stage_3_filter_intent(
    posts: list[DiscoveredPost],
    competitor_name: str,
) -> list[FilteredLead]:
    """Score each post on frustration intent, keep only high-intent."""
    if not posts:
        return []

    results_json = json.dumps([p.model_dump() for p in posts], indent=2)
    prompt = prompts.INTENT_FILTER.format(
        competitor_name=competitor_name,
        results_json=results_json,
    )
    text = await _gemini_call(prompt, label="Stage 3: Intent Filtering")
    raw = _parse_json(text)
    return [FilteredLead(**lead) for lead in raw]


# ── Stages 4+5: Sequential Per-Lead Processing ──────────────────────
#    For each lead: Extract Context → Draft Outreach → move to next.
#    This keeps token usage predictable and sequential.

async def _process_single_lead(
    lead: FilteredLead,
    req: HuntRequest,
    index: int,
    total: int,
) -> FinalLead | None:
    """Process one lead end-to-end: extract context, then draft outreach."""

    # Step A: Extract context
    try:
        ctx_prompt = prompts.CONTEXT_EXTRACTOR.format(
            competitor_name=req.competitor_name,
            title=lead.title,
            url=lead.url,
            snippet=lead.snippet,
            source=lead.source,
        )
        ctx_text = await _gemini_call(
            ctx_prompt,
            label=f"Lead {index}/{total}: Extract Context",
        )
        ctx = _parse_json(ctx_text)
    except Exception:
        return None

    enriched = LeadWithContext(
        title=lead.title,
        url=lead.url,
        source=lead.source,
        frustration_score=lead.frustration_score,
        core_problem=ctx.get("core_problem", ""),
        specific_complaints=ctx.get("specific_complaints", []),
        user_situation=ctx.get("user_situation", ""),
    )

    # Step B: Draft outreach
    try:
        outreach_prompt = prompts.OUTREACH_DRAFTER.format(
            competitor_name=req.competitor_name,
            core_problem=enriched.core_problem,
            specific_complaints=", ".join(enriched.specific_complaints),
            user_situation=enriched.user_situation,
            source=enriched.source,
            product_name=req.product_name,
            product_description=req.product_description,
        )
        outreach_text = await _gemini_call(
            outreach_prompt,
            label=f"Lead {index}/{total}: Draft Outreach",
        )
    except Exception:
        return None

    return FinalLead(
        title=enriched.title,
        url=enriched.url,
        source=enriched.source,
        frustration_score=enriched.frustration_score,
        core_problem=enriched.core_problem,
        specific_complaints=enriched.specific_complaints,
        user_situation=enriched.user_situation,
        outreach_message=outreach_text.strip(),
    )


# ── Main Pipeline (SSE Generator) ───────────────────────────────────

STAGE_NAMES = [
    "Generating Search Queries",
    "Discovering Discussions",
    "Filtering High-Intent Leads",
    "Enriching & Drafting",          # merged stages 4+5
]


async def run_pipeline(req: HuntRequest) -> AsyncGenerator[str, None]:
    """
    Run the production pipeline and yield SSE events.
    Stages 4+5 are merged: each lead is processed sequentially
    (extract context → draft outreach) before moving to the next.
    """

    # ── Stage 1: Generate Queries ──
    yield _sse(PipelineEvent(
        stage=1, stage_name=STAGE_NAMES[0], status="start",
        message="Analyzing your product and competitor to craft targeted search queries..."
    ))
    try:
        queries = await _stage_1_generate_queries(req)
        yield _sse(PipelineEvent(
            stage=1, stage_name=STAGE_NAMES[0], status="complete",
            message=f"Generated {len(queries)} search queries",
            data=[q.model_dump() for q in queries],
        ))
    except Exception as e:
        yield _sse(PipelineEvent(
            stage=1, stage_name=STAGE_NAMES[0], status="error",
            message=f"Failed to generate queries: {str(e)}"
        ))
        yield "data: [DONE]\n\n"
        return

    # ── Stage 2: Discover Posts ──
    yield _sse(PipelineEvent(
        stage=2, stage_name=STAGE_NAMES[1], status="start",
        message=f"Searching across forums, Reddit, HN, and more with {len(queries)} queries..."
    ))
    try:
        posts = await _stage_2_discover(queries)
        yield _sse(PipelineEvent(
            stage=2, stage_name=STAGE_NAMES[1], status="complete",
            message=f"Discovered {len(posts)} discussions",
            data=[p.model_dump() for p in posts],
        ))
    except Exception as e:
        yield _sse(PipelineEvent(
            stage=2, stage_name=STAGE_NAMES[1], status="error",
            message=f"Search failed: {str(e)}"
        ))
        yield "data: [DONE]\n\n"
        return

    if not posts:
        yield _sse(PipelineEvent(
            stage=2, stage_name=STAGE_NAMES[1], status="complete",
            message="No discussions found. Try different product/competitor names."
        ))
        yield "data: [DONE]\n\n"
        return

    # ── Stage 3: Filter Intent ──
    yield _sse(PipelineEvent(
        stage=3, stage_name=STAGE_NAMES[2], status="start",
        message=f"Analyzing {len(posts)} discussions for genuine frustration signals..."
    ))
    try:
        filtered = await _stage_3_filter_intent(posts, req.competitor_name)
        yield _sse(PipelineEvent(
            stage=3, stage_name=STAGE_NAMES[2], status="complete",
            message=f"Found {len(filtered)} high-intent leads" if filtered else "No high-intent leads found",
            data=[f.model_dump() for f in filtered],
        ))
    except Exception as e:
        yield _sse(PipelineEvent(
            stage=3, stage_name=STAGE_NAMES[2], status="error",
            message=f"Filtering failed: {str(e)}"
        ))
        yield "data: [DONE]\n\n"
        return

    if not filtered:
        yield "data: [DONE]\n\n"
        return

    # ── Stage 4: Sequential Lead Processing (Enrich + Draft) ──
    yield _sse(PipelineEvent(
        stage=4, stage_name=STAGE_NAMES[3], status="start",
        message=f"Processing {len(filtered)} leads sequentially (extract → draft)..."
    ))

    final_leads: list[FinalLead] = []
    for i, lead in enumerate(filtered):
        yield _sse(PipelineEvent(
            stage=4, stage_name=STAGE_NAMES[3], status="progress",
            message=f"Lead {i+1}/{len(filtered)}: Extracting context & drafting outreach...",
        ))
        result = await _process_single_lead(lead, req, i + 1, len(filtered))
        if result:
            final_leads.append(result)

    yield _sse(PipelineEvent(
        stage=4, stage_name=STAGE_NAMES[3], status="complete",
        message=f"Ready! {len(final_leads)} leads with personalized outreach",
        data=[f.model_dump() for f in final_leads],
    ))

    yield "data: [DONE]\n\n"
