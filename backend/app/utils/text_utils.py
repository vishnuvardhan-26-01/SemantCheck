"""Text cleaning and sentence splitting utilities.

Sentence splitting is regex-based so no heavyweight tokenizer dependency is
required (spacy/NLTK punkt downloads are avoided for offline reliability).
"""
import re

# A sentence ends with . ! or ? optionally followed by closing quotes/brackets.
# Requires at least one word character after the terminator so numbers like
# "3." or abbreviations at the very end don't create empty fragments.
_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+(?=[^\s])")
_WHITESPACE_RE = re.compile(r"\s+")


def clean_text(raw_text: str) -> str:
    """Collapse whitespace artifacts while preserving sentence punctuation."""
    if not raw_text:
        return ""
    # Normalize newlines/tabs to spaces, then collapse repeated spaces.
    cleaned = _WHITESPACE_RE.sub(" ", raw_text.replace("\r", "\n").replace("\x00", ""))
    # Remove hyphenation artifacts from PDF line breaks: "docu-\nment" -> "document"
    cleaned = re.sub(r"(\w)-\s+(\w)", r"\1\2", cleaned)
    return cleaned.strip()


def split_sentences(text: str, max_sentences: int = 400) -> list[str]:
    """Split text into meaningful sentences.

    Fragments shorter than 3 words are dropped (headings, page numbers,
    reference markers), which keeps the embedding workload meaningful and
    avoids thousands of tiny junk vectors.
    """
    if not text or not text.strip():
        return []

    cleaned = clean_text(text)
    candidates = _SENTENCE_SPLIT_RE.split(cleaned)

    sentences: list[str] = []
    for candidate in candidates:
        candidate = candidate.strip()
        if not candidate:
            continue
        if len(candidate.split()) < 3:  # skip fragments: headings, numbers
            continue
        sentences.append(candidate)
        if len(sentences) >= max_sentences:
            break
    return sentences
