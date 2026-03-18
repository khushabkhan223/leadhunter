# LeadHunter

**Intent Discovery Assistant** — Find people actively frustrated with your competitor and generate contextual outreach messages.

LeadHunter surfaces high-intent conversations, not contact lists. It finds real discussions where people are complaining about a competitor product and helps you craft genuine, relevant responses.

## How It Works

1. **You provide**: Your product name, a competitor name, and a short description
2. **AI generates** targeted search queries based on dissatisfaction signals
3. **Discovers** public discussions from forums, Reddit, HN, Stack Overflow, etc.
4. **Filters** to only high-intent conversations (real frustration, not general talk)
5. **Enriches & Drafts** — for each lead, extracts the core problem then drafts a personalized outreach message (processed sequentially for predictable token usage)

## Quick Start

### 1. Get API Keys
- **Gemini API Key**: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **SerpAPI Key**: [serpapi.com](https://serpapi.com/manage-api-key)

### 2. Configure
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys
```

### 3. Run
```bash
run.bat
```
Then open [http://localhost:8000](http://localhost:8000)

## Tech Stack
- **Backend**: Python, FastAPI, Google Gemini AI (gemini-2.5-flash), SerpAPI
- **Frontend**: Vanilla HTML/CSS/JS with SSE streaming
- **Architecture**: 4-stage AI pipeline with real-time progress and sequential lead processing

## Rules
- No personal data fabrication
- No automated message sending
- No private data enrichment
- Quality over quantity — real conversations worth joining
