"""Central configuration for SemantiCheck backend.

All thresholds, limits and model settings live here so they can be tuned
without touching application logic.
"""
import os

# --- Model ---
MODEL_NAME = os.getenv("SEMANTICHECK_MODEL", "all-MiniLM-L6-v2")

# --- Similarity level thresholds (percentages, 0-100) ---
# Level boundaries are inclusive of the lower bound and exclusive of the upper
# bound, so a score of exactly 85.0 is "Very High".
LOW_MAX = 40.0       # scores below this are "Low"
MODERATE_MAX = 70.0  # below this -> "Moderate"
HIGH_MAX = 85.0      # below this -> "High"; at/above -> "Very High"

LEVEL_LOW = "Low"
LEVEL_MODERATE = "Moderate"
LEVEL_HIGH = "High"
LEVEL_VERY_HIGH = "Very High"

# --- Upload / document limits ---
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

# Cap on sentences per document: keeps embedding time predictable on a
# normal laptop while still handling typical reports/papers.
MAX_SENTENCES_PER_DOC = 400

# --- API ---
API_TITLE = "SemantiCheck API"
API_DESCRIPTION = "Semantic plagiarism detection using sentence embeddings"
API_VERSION = "1.0.0"

# Allowed origins for local development (React dev server on any port).
CORS_ORIGINS = os.getenv(
    "SEMANTICHECK_CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")


def classify_level(score_pct: float) -> str:
    """Map a 0-100 similarity percentage to its level label.

    Single source of truth for level thresholds.
    """
    if score_pct < LOW_MAX:
        return LEVEL_LOW
    if score_pct < MODERATE_MAX:
        return LEVEL_MODERATE
    if score_pct < HIGH_MAX:
        return LEVEL_HIGH
    return LEVEL_VERY_HIGH
