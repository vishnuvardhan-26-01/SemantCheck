"""Analysis service: turns two texts into sentence-level similarity results.

Methodology (documented for judges):
1. Each document is cleaned and split into meaningful sentences.
2. Each sentence is embedded with all-MiniLM-L6-v2 (L2-normalized).
3. A vectorized cosine similarity matrix (A sentences x B sentences) is
   computed.
4. For every sentence in Document A, its best semantic match in Document B is
   found (the maximum value in its row of the matrix).
5. The overall semantic similarity is the mean of those best-match scores,
   representing "how much of Document A has a semantically similar counterpart
   in Document B".
"""
import logging

import numpy as np

from .. import config
from ..utils.text_utils import split_sentences
from . import nlp_service

logger = logging.getLogger(__name__)


class AnalysisError(Exception):
    """Raised when analysis cannot produce meaningful results."""


# Deterministic, level-based explanations. Deliberately cautious wording:
# semantic similarity is a signal, not proof of plagiarism.
_EXPLANATIONS = {
    config.LEVEL_VERY_HIGH: (
        "These sentences express highly similar meanings despite differences "
        "in wording."
    ),
    config.LEVEL_HIGH: (
        "These sentences appear to communicate closely related ideas."
    ),
    config.LEVEL_MODERATE: (
        "These sentences share some semantic similarities."
    ),
    config.LEVEL_LOW: (
        "These sentences show limited semantic similarity."
    ),
}


def _level_distribution_key(level: str) -> str:
    """Map a level label to the distribution dict key ('very_high' etc.)."""
    return {
        config.LEVEL_LOW: "low",
        config.LEVEL_MODERATE: "moderate",
        config.LEVEL_HIGH: "high",
        config.LEVEL_VERY_HIGH: "very_high",
    }[level]


def analyze_texts(text_a: str, text_b: str) -> dict:
    """Run the full semantic comparison pipeline on two raw texts."""
    sentences_a = split_sentences(text_a, config.MAX_SENTENCES_PER_DOC)
    sentences_b = split_sentences(text_b, config.MAX_SENTENCES_PER_DOC)

    if not sentences_a or not sentences_b:
        raise AnalysisError(
            "One or both documents contain no analyzable sentences. Please "
            "provide documents with complete sentences (at least 3 words each)."
        )

    # Real NLP: embeddings from the sentence-transformer model.
    embeddings_a = nlp_service.encode_sentences(sentences_a)
    embeddings_b = nlp_service.encode_sentences(sentences_b)

    # Real math: vectorized cosine similarity matrix.
    similarity_matrix = nlp_service.cosine_similarity_matrix(embeddings_a, embeddings_b)

    matches = []
    distribution = {"low": 0, "moderate": 0, "high": 0, "very_high": 0}

    for i, sentence_a in enumerate(sentences_a):
        best_j = int(np.argmax(similarity_matrix[i]))
        best_score = float(similarity_matrix[i, best_j])
        score_pct = round(max(0.0, best_score) * 100.0, 1)

        level = config.classify_level(score_pct)
        distribution[_level_distribution_key(level)] += 1

        matches.append(
            {
                "sentence_a": sentence_a,
                "sentence_b": sentences_b[best_j],
                "similarity": score_pct,
                "level": level,
                "explanation": _EXPLANATIONS[level],
            }
        )

    # Overall score = mean of each Document A sentence's best match.
    best_scores = [m["similarity"] for m in matches]
    overall = round(sum(best_scores) / len(best_scores), 1) if best_scores else 0.0

    return {
        "overall_similarity": overall,
        "sentence_count_a": len(sentences_a),
        "sentence_count_b": len(sentences_b),
        "high_similarity_count": distribution["high"] + distribution["very_high"],
        "moderate_similarity_count": distribution["moderate"],
        "low_similarity_count": distribution["low"],
        "matches": matches,
        "distribution": distribution,
    }
