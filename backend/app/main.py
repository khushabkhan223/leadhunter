"""
LeadHunter — FastAPI application.

Serves the frontend as static files and provides the /hunt SSE endpoint.
"""

from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse

from .config import validate_keys
from .models import HuntRequest
from .pipeline import run_pipeline

# ── App Setup ────────────────────────────────────────────────────────

app = FastAPI(
    title="LeadHunter",
    description="Intent Discovery Assistant — Find frustrated competitor users",
    version="1.0.0",
)

# Paths
_backend_dir = Path(__file__).resolve().parent.parent
_project_dir = _backend_dir.parent
_frontend_dir = _project_dir / "frontend"

# Serve frontend static files (CSS, JS)
app.mount("/static", StaticFiles(directory=str(_frontend_dir)), name="static")


# ── Routes ───────────────────────────────────────────────────────────

@app.get("/")
async def serve_frontend():
    """Serve the main HTML page."""
    index_path = _frontend_dir / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend not found")
    return FileResponse(str(index_path))


@app.get("/health")
async def health_check():
    """Health check with API key validation."""
    missing = validate_keys()
    return {
        "status": "healthy" if not missing else "missing_keys",
        "missing_keys": missing,
    }


@app.post("/hunt")
async def hunt(request: HuntRequest):
    """
    Run the LeadHunter pipeline and stream results via SSE.
    
    Returns Server-Sent Events with real-time progress for each
    of the 5 pipeline stages.
    """
    # Validate API keys
    missing = validate_keys()
    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Missing API keys: {', '.join(missing)}. Add them to backend/.env",
        )

    return StreamingResponse(
        run_pipeline(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
