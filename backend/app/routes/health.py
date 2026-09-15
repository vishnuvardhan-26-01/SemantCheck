"""Health check endpoint."""
from fastapi import APIRouter

from ..services import nlp_service

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "model": nlp_service.get_model_status(),
    }
