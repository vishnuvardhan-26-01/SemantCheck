"""End-to-end backend tests covering the API and the NLP pipeline.

Run with: .venv/Scripts/python -m pytest backend/tests -q
These tests use the real sentence-transformer model (cached on first run).
"""
import io

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.document_service import extract_text_from_bytes
from app.utils.text_utils import split_sentences


@pytest.fixture(scope="module")
def client():
    # Startup event loads the model once for the whole test module.
    with TestClient(app) as c:
        yield c


def _analyze_text(client, a: str, b: str) -> dict:
    resp = client.post("/api/analyze", data={"text_a": a, "text_b": b})
    assert resp.status_code == 200, resp.text
    return resp.json()


PARA_A = (
    "Artificial intelligence is increasingly being used in healthcare to "
    "assist doctors in diagnosing diseases. Machine learning models require "
    "large amounts of training data. The stock market fell sharply yesterday "
    "afternoon."
)
PARA_B = (
    "AI technology is becoming common in medicine because it helps medical "
    "professionals identify illnesses. Training modern neural networks "
    "depends on vast datasets. My neighbour grows tomatoes in his garden "
    "every summer."
)


# --- 1. Health ---------------------------------------------------------------
def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["model"]["loaded"] is True
    assert body["model"]["model_name"] == "all-MiniLM-L6-v2"


# --- 2-4. Text analysis: paraphrase vs unrelated ------------------------------
def test_paraphrased_sentences_score_high(client):
    result = _analyze_text(
        client,
        "Artificial intelligence helps doctors identify diseases.",
        "AI assists medical professionals in detecting illnesses.",
    )
    assert result["sentence_count_a"] == 1
    assert result["sentence_count_b"] == 1
    assert result["matches"][0]["similarity"] >= 70.0
    assert result["matches"][0]["level"] in ("High", "Very High")


def test_unrelated_sentences_score_low(client):
    result = _analyze_text(
        client,
        "The chef prepared a delicious pasta dinner for the guests.",
        "Quarterly revenue increased due to strong sales in Europe.",
    )
    assert result["matches"][0]["similarity"] <= 40.0
    assert result["matches"][0]["level"] == "Low"


def test_paraphrase_scores_meaningfully_higher_than_unrelated(client):
    para = _analyze_text(
        client,
        "Solar panels convert sunlight directly into electricity.",
        "Photovoltaic cells transform solar radiation into electrical power.",
    )
    unrelated = _analyze_text(
        client,
        "Solar panels convert sunlight directly into electricity.",
        "The children played football in the park after school.",
    )
    assert para["matches"][0]["similarity"] > unrelated["matches"][0]["similarity"] + 20.0


# --- 5. Multiple sentences, distribution, sorted matches ----------------------
def test_multiple_sentences_distribution_and_counts(client):
    result = _analyze_text(client, PARA_A, PARA_B)
    assert result["sentence_count_a"] == 3
    assert result["sentence_count_b"] == 3
    dist = result["distribution"]
    assert sum(dist.values()) == 3
    # Matches must come back sorted by similarity, highest first.
    sims = [m["similarity"] for m in result["matches"]]
    assert sims == sorted(sims, reverse=True)
    assert result["overall_similarity"] == pytest.approx(
        sum(sims) / len(sims), abs=0.2
    )


# --- 6-8. File formats: TXT, PDF, DOCX ----------------------------------------
def _make_files():
    # TXT
    txt_bytes = PARA_A.encode("utf-8")

    # DOCX built in-memory with python-docx
    from docx import Document

    doc = Document()
    doc.add_paragraph(PARA_B)
    docx_buffer = io.BytesIO()
    doc.save(docx_buffer)

    # PDF built in-memory with PyMuPDF
    import fitz

    pdf = fitz.open()
    page = pdf.new_page()
    page.insert_text((72, 72), PARA_A)
    pdf_bytes = pdf.tobytes()
    pdf.close()

    return {
        "a.txt": txt_bytes,
        "b.txt": PARA_B.encode("utf-8"),
        "a.docx": docx_buffer.getvalue(),
        "b.docx": docx_buffer.getvalue(),
        "a.pdf": pdf_bytes,
        "b.pdf": pdf_bytes,
    }


FILES = _make_files()


@pytest.mark.parametrize("extension", ["txt", "pdf", "docx"])
def test_file_upload_analysis(extension, client):
    a_name = f"a.{extension}"
    b_name = f"b.{extension}"
    resp = client.post(
            "/api/analyze",
            files=[
        ("file_a", (a_name, FILES[a_name], "application/octet-stream")),
        ("file_b", (b_name, FILES[b_name], "application/octet-stream")),
    ],
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["sentence_count_a"] >= 1
    assert body["matches"][0]["similarity"] >= 60.0


def test_extract_text_endpoint_txt(client):
    resp = client.post(
        "/api/extract-text",
        files={"file": ("x.txt", FILES["a.txt"], "application/octet-stream")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["characters"] > 0
    assert len(body["sentences"]) == 3


# --- 9-10. Error handling -----------------------------------------------------
def test_empty_text_rejected(client):
    resp = client.post("/api/analyze", data={"text_a": "", "text_b": "hello world foo"})
    assert resp.status_code == 400


def test_unsupported_file_type(client):
    resp = client.post(
        "/api/analyze",
        files=[
            ("file_a", ("a.exe", b"MZ\x90\x00", "application/octet-stream")),
            ("file_b", ("b.txt", b"some plain text here okay", "application/octet-stream")),
        ],
    )
    assert resp.status_code == 400
    assert "Unsupported file type" in resp.json()["detail"]


def test_corrupted_pdf(client):
    resp = client.post(
        "/api/analyze",
        files=[
            ("file_a", ("a.pdf", b"%PDF-1.4 this is not a real pdf body", "application/octet-stream")),
            ("file_b", ("b.txt", PARA_B.encode(), "application/octet-stream")),
        ],
    )
    assert resp.status_code == 400
    assert "PDF" in resp.json()["detail"]


def test_no_extractable_text(client):
    resp = client.post(
        "/api/analyze",
        files=[
            ("file_a", ("a.txt", b"   ", "application/octet-stream")),
            ("file_b", ("b.txt", PARA_B.encode(), "application/octet-stream")),
        ],
    )
    assert resp.status_code == 400


# --- Sentence splitter sanity ---------------------------------------------------
def test_split_sentences_filters_fragments():
    text = "This is a complete sentence. Fig. 1 shows results. Another full sentence here! Short."
    sentences = split_sentences(text)
    assert "This is a complete sentence." in sentences
    # "Fig. 1" merges into the following sentence rather than creating junk.
    assert all(len(s.split()) >= 3 for s in sentences)


def test_extract_txt_decodes_windows_encoding():
    text = extract_text_from_bytes("doc.txt", "caf\xe9 na\xefve r\xe9sum\xe9".encode("cp1252"))
    assert "café" in text
