"""Document text extraction: PDF (PyMuPDF), DOCX (python-docx), TXT.

Every function returns raw extracted text; cleaning and sentence splitting
live in text_utils so they can be tested independently of file parsing.
"""
import io
import logging

import fitz  # PyMuPDF
from docx import Document as DocxDocument

from .. import config

logger = logging.getLogger(__name__)


class ExtractionError(Exception):
    """Raised when a document cannot be parsed (corrupt, unreadable, etc.)."""


class UnsupportedFileTypeError(ExtractionError):
    """Raised for file types outside config.ALLOWED_EXTENSIONS."""


def validate_file_size(size_bytes: int) -> None:
    if size_bytes > config.MAX_FILE_SIZE_BYTES:
        raise ExtractionError(
            f"File is too large. Maximum allowed size is "
            f"{config.MAX_FILE_SIZE_MB} MB."
        )


def validate_extension(filename: str) -> None:
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in config.ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(config.ALLOWED_EXTENSIONS))
        raise UnsupportedFileTypeError(
            f"Unsupported file type '{ext or '(none)'}'. Allowed: {allowed}."
        )


async def read_upload(upload) -> str:
    """Read a FastAPI UploadFile into text (validates size and type first)."""
    data = await upload.read()
    validate_file_size(len(data))
    validate_extension(upload.filename or "")
    return extract_text_from_bytes(upload.filename or "", data)


def extract_text_from_bytes(filename: str, data: bytes) -> str:
    """Dispatch to the right extractor based on the file extension."""
    validate_extension(filename)
    validate_file_size(len(data))

    lower = filename.lower()
    try:
        if lower.endswith(".pdf"):
            return _extract_pdf(data)
        if lower.endswith(".docx"):
            return _extract_docx(data)
        return _extract_txt(data)
    except ExtractionError:
        raise
    except Exception as exc:  # corrupt PDF/DOCX or unexpected parse failure
        logger.warning("Extraction failed for %s: %s", filename, exc)
        raise ExtractionError(
            f"Could not read '{filename}'. The file may be corrupted or not "
            f"a valid {lower.rsplit('.', 1)[-1].upper()} document."
        ) from exc


def _extract_pdf(data: bytes) -> str:
    try:
        with fitz.open(stream=data, filetype="pdf") as doc:
            if doc.is_encrypted:
                raise ExtractionError(
                    "This PDF is password protected and cannot be analyzed."
                )
            pages = [page.get_text("text") for page in doc]
    except ExtractionError:
        raise
    except Exception as exc:
        raise ExtractionError(
            "Could not read this PDF. It may be corrupted or not a real PDF."
        ) from exc

    text = "\n".join(pages).strip()
    if not text:
        raise ExtractionError(
            "No text could be extracted from this PDF. It may be a scanned "
            "image (OCR is not supported)."
        )
    return text


def _extract_docx(data: bytes) -> str:
    try:
        document = DocxDocument(io.BytesIO(data))
        paragraphs = [p.text for p in document.paragraphs]
    except Exception as exc:
        raise ExtractionError(
            "Could not read this DOCX file. It may be corrupted or not a "
            "real Word document."
        ) from exc

    text = "\n".join(paragraphs).strip()
    if not text:
        raise ExtractionError("No text could be extracted from this DOCX file.")
    return text


def _extract_txt(data: bytes) -> str:
    # UTF-8 first, fall back to Windows code pages commonly produced by Notepad.
    for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            return data.decode(encoding).strip()
        except UnicodeDecodeError:
            continue
    raise ExtractionError("Could not decode this text file.")
