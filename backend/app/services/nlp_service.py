"""NLP service: sentence-transformer model loading and embedding generation.

The model is loaded exactly once per backend process (module-level singleton)
and reused for every request. Embeddings are L2-normalized so plain dot
products give cosine similarity.
"""
import logging
import threading

import numpy as np

from .. import config

logger = logging.getLogger(__name__)

# --- Module-level singleton state ---
_model = None
_load_lock = threading.Lock()
_load_error: str | None = None


class ModelLoadError(Exception):
    """Raised when the sentence-transformer model cannot be loaded."""


def get_model():
    """Load the model once; subsequent calls return the cached instance.

    Thread-safe via a lock so concurrent first requests don't double-load.
    Raises ModelLoadError with a friendly message if loading fails.
    """
    global _model, _load_error

    if _model is not None:
        return _model

    with _load_lock:
        if _model is not None:  # double-checked after acquiring lock
            return _model
        try:
            # Imported here so the API can start (and report health) even if
            # torch/model files are missing, instead of crashing at import.
            from sentence_transformers import SentenceTransformer

            logger.info("Loading sentence-transformer model '%s'...", config.MODEL_NAME)
            _model = SentenceTransformer(config.MODEL_NAME)
            logger.info("Model loaded successfully.")
            return _model
        except Exception as exc:
            _load_error = str(exc)
            logger.exception("Failed to load model '%s'", config.MODEL_NAME)
            raise ModelLoadError(
                "The NLP model could not be loaded. Please check the backend "
                "logs; a common cause is no internet connection on first run "
                "(the model downloads once from Hugging Face)."
            ) from exc


def is_model_loaded() -> bool:
    return _model is not None


def get_model_status() -> dict:
    """Status dict for the /api/health endpoint."""
    return {
        "model_name": config.MODEL_NAME,
        "loaded": is_model_loaded(),
        "error": _load_error,
    }


def encode_sentences(sentences: list[str]) -> np.ndarray:
    """Generate L2-normalized embeddings for a list of sentences.

    Returns a 2D numpy array of shape (n_sentences, dim). Raises
    ModelLoadError if the model is unavailable.
    """
    model = get_model()  # may raise ModelLoadError
    if not sentences:
        return np.empty((0, 1), dtype=np.float32)

    embeddings = model.encode(
        sentences,
        batch_size=32,
        convert_to_numpy=True,
        normalize_embeddings=True,  # cosine similarity == dot product
        show_progress_bar=False,
    )
    return np.asarray(embeddings, dtype=np.float32)


def cosine_similarity_matrix(embeddings_a: np.ndarray, embeddings_b: np.ndarray) -> np.ndarray:
    """Vectorized cosine similarity between two sets of normalized embeddings.

    Since embeddings are already L2-normalized, this reduces to a single
    matrix product: (n_a, dim) @ (dim, n_b) -> (n_a, n_b).
    """
    if embeddings_a.size == 0 or embeddings_b.size == 0:
        return np.empty((embeddings_a.shape[0], embeddings_b.shape[0]), dtype=np.float32)
    return np.clip(embeddings_a @ embeddings_b.T, -1.0, 1.0)
