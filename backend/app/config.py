"""Configuration loader — reads .env and validates API keys."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")


def validate_keys() -> list[str]:
    """Return a list of missing key names (empty list = all good)."""
    missing = []
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("your_"):
        missing.append("GEMINI_API_KEY")
    if not SERPAPI_KEY or SERPAPI_KEY.startswith("your_"):
        missing.append("SERPAPI_KEY")
    return missing
