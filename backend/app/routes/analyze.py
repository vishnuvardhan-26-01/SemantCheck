"""Analysis routes: POST /api/analyze and POST /api/extract-text.

Accepts multipart/form-data with either two uploaded files (file_a, file_b)
or two pasted texts (text_a, text_b). At least one valid pair is required.
"""
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .. import config
from ..services import analysis_service, document_service, nlp_service
from ..utils.text_utils import split_sentences

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze")
async def analyze_endpoint(
    file_a: UploadFile | None = File(None),
    file_b: UploadFile | None = File(None),
    text_a: str = Form(""),
    text_b: str = Form(""),
) -> dict:
    """Compare two documents (uploaded) or two pasted texts semantically.

    Exactly one pair is needed: files or texts. Mixing is allowed only in the
    sense that a file for A and text for B is technically fine, but the
    frontend sends a consistent pair; the backend resolves each side to text
    and requires both sides to yield sentences.
    """
    # Resolve Document A
    try:
        raw_a = await document_service.read_upload(file_a) if file_a and file_a.filename else text_a or ""
    except document_service.ExtractionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Resolve Document B
    try:
        raw_b = await document_service.read_upload(file_b) if file_b and file_b.filename else text_b or ""
    except document_service.ExtractionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not raw_a.strip() or not raw_b.strip():
        raise HTTPException(
            status_code=400,
            detail="Both documents are required. Provide two uploaded files or two pasted texts.",
        )

    # Enforce text length cap for pasted text (files already capped by size).
    max_chars = config.MAX_SENTENCES_PER_DOC * 1200  # generous char budget
    if len(raw_a) > max_chars or len(raw_b) > max_chars:
        raise HTTPException(
            status_code=413,
            detail=f"Document too large. Please keep each document under roughly {config.MAX_SENTENCES_PER_DOC} sentences.",
        )

    try:
        result = analysis_service.analyze_texts(raw_a, raw_b)
    except nlp_service.ModelLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except analysis_service.AnalysisError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Unexpected analysis failure")
        raise HTTPException(status_code=500, detail="Unexpected server error during analysis.")

    return result


@router.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)) -> dict:
    """Extract raw text from a single uploaded document (useful for preview)."""
    try:
        data = await document_service.read_upload(file)
    except document_service.ExtractionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "filename": file.filename,
        "characters": len(data),
        "sentences": split_sentences(data, config.MAX_SENTENCES_PER_DOC),
    }
