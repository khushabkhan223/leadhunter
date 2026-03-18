"""Pydantic models for every stage of the LeadHunter pipeline."""

from __future__ import annotations
from typing import Any, Literal
from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────
class HuntRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=120)
    competitor_name: str = Field(..., min_length=1, max_length=120)
    product_description: str = Field(..., min_length=10, max_length=1000)


# ── Stage 1: Query Generation ───────────────────────────────────────
class SearchQuery(BaseModel):
    query: str
    rationale: str


# ── Stage 2: Discovery ──────────────────────────────────────────────
class DiscoveredPost(BaseModel):
    title: str
    url: str
    snippet: str
    source: str  # e.g. "reddit", "hn", "stackoverflow"


# ── Stage 3: Intent Filtering ───────────────────────────────────────
class FilteredLead(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    frustration_score: int = Field(..., ge=1, le=10)
    frustration_signals: list[str] = Field(default_factory=list)


# ── Stage 4: Context Extraction ─────────────────────────────────────
class LeadWithContext(BaseModel):
    title: str
    url: str
    source: str
    frustration_score: int
    core_problem: str
    specific_complaints: list[str]
    user_situation: str


# ── Stage 5: Outreach Drafting ──────────────────────────────────────
class FinalLead(BaseModel):
    title: str
    url: str
    source: str
    frustration_score: int
    core_problem: str
    specific_complaints: list[str]
    user_situation: str
    outreach_message: str


# ── SSE Event Wrapper ───────────────────────────────────────────────
class PipelineEvent(BaseModel):
    stage: int = Field(..., ge=1, le=5)
    stage_name: str
    status: Literal["start", "progress", "complete", "error"]
    message: str = ""
    data: Any = None
