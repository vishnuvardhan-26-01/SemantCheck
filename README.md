# SemantiCheck

**AI-Powered Semantic Plagiarism Detection Agent**

SemantiCheck compares two documents by *meaning*, not by exact wording. It uses
real sentence embeddings (`all-MiniLM-L6-v2`, running locally) and cosine
similarity to find rewritten / paraphrased content that traditional
exact-match plagiarism tools miss.

> ⚠️ **Disclaimer:** Semantic similarity does not by itself prove plagiarism.
> Results should always be reviewed by a human.

---

## Problem

Traditional plagiarism detection relies mostly on exact word and phrase
matching. It fails when someone copies the *meaning* of a sentence and rewrites
it with completely different words:

| Document A | Document B | Exact match |
|---|---|---|
| "Artificial intelligence helps doctors identify diseases." | "AI assists medical professionals in detecting illnesses." | MISS ❌ |

A human immediately sees these sentences express the same idea.

## Solution

SemantiCheck converts every sentence into a numeric *embedding* (a vector that
captures its meaning), then compares vectors with cosine similarity.
Semantically equivalent sentences land close together even when they share
almost no words.

### How the similarity score is computed (methodology)

1. Each document is **extracted** (PDF via PyMuPDF, DOCX via python-docx, TXT
   natively) and **cleaned** (whitespace collapsed, PDF line-break artifacts
   removed).
2. Text is **split into meaningful sentences** (regex-based; fragments shorter
   than 3 words such as headings/page numbers are dropped).
3. Every sentence is embedded with `all-MiniLM-L6-v2`
   (L2-normalized, batched, runs locally — no API).
4. A **vectorized cosine-similarity matrix** (sentences A × sentences B) is
   computed with a single matrix product.
5. For every sentence in Document A, its **best semantic match** in Document B
   is the row maximum.
6. **Overall similarity = the mean of those best-match scores** — i.e. "how
   much of Document A has a semantically similar counterpart in Document B".

Similarity levels (configurable in one place — `backend/app/config.py`):

| Range | Level |
|---|---|
| 0–39% | Low |
| 40–69% | Moderate |
| 70–84% | High |
| 85–100% | Very High |

Every percentage shown in the UI comes from the embedding model — there are no
hard-coded scores anywhere.

## Features

- 🧠 Real semantic sentence comparison (sentence-transformers, local model)
- 🔍 Paraphrase detection with per-sentence best matches
- 📄 PDF / DOCX / TXT upload **and** paste-text input
- 📊 Results dashboard: score dial, distribution chart (Recharts), stat cards
- 🎛️ Filter by level, sort by similarity, search within sentences
- 🖨️ Print/save report (browser print → PDF) with full disclaimer
- 🔒 Privacy-focused: documents are processed locally, never sent to any
  external AI service
- 📱 Responsive (desktop-first, works on tablet/mobile)

## Architecture

```
Browser (React)
   │  POST /api/analyze  (multipart: files or text)
   ▼
FastAPI backend
   │
   ├─ document_service  → validate + extract text (PDF/DOCX/TXT)
   ├─ text_utils        → clean + split sentences
   ├─ nlp_service       → sentence-transformer model (loaded ONCE at startup)
   │                      → batched embeddings (L2-normalized)
   │                      → vectorized cosine similarity matrix
   └─ analysis_service  → best matches, levels, distribution, overall score
   │
   ▼
JSON result → React results dashboard (charts, filters, report)
```

## Technologies

- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Recharts, React Router
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **NLP:** sentence-transformers (`all-MiniLM-L6-v2`), PyTorch (CPU), NumPy
- **Documents:** PyMuPDF (PDF), python-docx (DOCX), built-in (TXT)
- **No paid APIs. No API keys. No external AI services.**

## Project structure

```
SemantiCheck/                     (workspace root)
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + CORS + model preload
│   │   ├── config.py             # ⚙️ ALL thresholds & limits (single source)
│   │   ├── routes/
│   │   │   ├── analyze.py        # POST /api/analyze, /api/extract-text
│   │   │   └── health.py         # GET  /api/health
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── nlp_service.py
│   │   │   └── analysis_service.py
│   │   └── utils/
│   │       └── text_utils.py
│   ├── tests/test_backend.py     # 15 end-to-end tests (real model)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, DocumentInput, landing sections
│   │   ├── pages/                # LandingPage, AnalysisPage, ResultsPage
│   │   ├── services/api.js       # single backend URL configuration point
│   │   ├── App.jsx / main.jsx
│   ├── vite.config.js            # /api proxy → backend :8000
│   └── package.json
├── .gitignore
└── README.md
```

## Installation

Prerequisites: **Python 3.10+** and **Node 18+**.

### 1. Backend setup

From the workspace root (Windows PowerShell example — adjust paths for
macOS/Linux: `python -m venv .venv`, `.venv/bin/python`):

```powershell
py -3 -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv\Scripts\python -m pip install -r backend/requirements.txt
```

> The first backend start downloads the ~90 MB `all-MiniLM-L6-v2` model once
> from Hugging Face and caches it locally. Every run after that is fully
> offline.

### 2. Frontend setup

```powershell
cd frontend
npm install
```

## Running the application

Open **two terminals**:

**Terminal 1 — backend** (from workspace root):

```powershell
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

(On macOS/Linux: `../.venv/bin/python -m uvicorn app.main:app --port 8000`)

**Terminal 2 — frontend:**

```powershell
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

| URL | What |
|---|---|
| http://localhost:5173 | The web application |
| http://localhost:8000/api/health | Backend health + model status |
| http://localhost:8000/docs | Interactive API docs (Swagger) |

## Demo instructions (for judges)

1. Open http://localhost:5173
2. Click **"Try Demo"** in the hero.
3. The app loads two paraphrased documents and runs the **real model** — watch
   the dashboard show High/Moderate/Low matches (AI-medicine pair scores high,
   the deliberately unrelated pair scores very low).
4. Try the level filters, sorting and search.
5. Click **"Print / Save Report (PDF)"** for a shareable summary.
6. Then try your own documents: upload two PDF/DOCX/TXT files or paste text.

## API documentation

### `GET /api/health`

```json
{ "status": "ok", "model": { "model_name": "all-MiniLM-L6-v2", "loaded": true, "error": null } }
```

### `POST /api/analyze`

Multipart form. Either two files or two texts:

- `file_a`, `file_b` — uploaded PDF/DOCX/TXT files, **or**
- `text_a`, `text_b` — pasted text fields

Response:

```json
{
  "overall_similarity": 56.2,
  "sentence_count_a": 5,
  "sentence_count_b": 5,
  "high_similarity_count": 2,
  "moderate_similarity_count": 2,
  "low_similarity_count": 1,
  "matches": [
    {
      "sentence_a": "Artificial intelligence is increasingly being used in healthcare to assist doctors in diagnosing diseases.",
      "sentence_b": "AI technology is becoming common in medicine because it helps medical professionals identify illnesses.",
      "similarity": 80.8,
      "level": "High",
      "explanation": "These sentences appear to communicate closely related ideas."
    }
  ],
  "distribution": { "low": 1, "moderate": 2, "high": 2, "very_high": 0 }
}
```

### `POST /api/extract-text`

Multipart: `file` — returns extracted text, character count and sentence list
(useful for previewing what the analyzer sees).

### Example usage (curl)

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "text_a=Artificial intelligence helps doctors identify diseases." \
  -F "text_b=AI assists medical professionals in detecting illnesses."
```

## Running the tests

```powershell
cd backend
..\.venv\Scripts\python -m pytest tests -q
```

(15 tests: health, paraphrase-vs-unrelated differentiation, multiple-sentence
distribution, TXT/PDF/DOCX upload analysis, extract-text, empty input,
unsupported type, corrupted PDF, no-extractable-text, sentence splitting.)

## Privacy

- Documents are processed **locally** by the backend.
- Uploaded documents are processed by this application and are **not
  intentionally sent to third-party AI services**.
- Documents are not persisted — nothing is written to disk.
- The only network call the backend ever makes (once) is downloading the open
  model from Hugging Face.

## Limitations

- **Semantic similarity alone cannot prove plagiarism.** Common knowledge,
  standard definitions, and generic phrasing naturally produce high scores.
- Scanned/image PDFs are not supported (no OCR).
- The regex sentence splitter is English-oriented.
- Overall score is asymmetric by design (A→B); reversing the documents can
  give a slightly different number.
- Levels use global thresholds; different domains may warrant different
  cutoffs (tune them in `backend/app/config.py`).

## Future improvements

- Cross-language semantic comparison (multilingual embedding models)
- Citation-aware analysis that ignores properly quoted material
- Optional analysis history (SQLite)
- Side-by-side document view with inline highlighting
- Larger/multilingual models (configurable via `SEMANTICHECK_MODEL` env var)
- Section-level and paragraph-level similarity views

---

## 🏆 Hackathon presentation

**Problem** — Traditional plagiarism systems rely heavily on exact word and
phrase matching.

**Existing limitation** — Paraphrased content can retain the same meaning
while using different vocabulary, so copied ideas slip past word-overlap
checkers.

**Proposed solution** — SemantiCheck uses sentence embeddings to compare the
semantic meaning of sentences and flags potential similarity with cautious,
human-review-oriented wording.

**Innovation** — Meaning-based sentence comparison rather than simple keyword
matching: every sentence of Document A is matched to its closest meaning in
Document B.

**Technology** — React · FastAPI · Python · sentence-transformers ·
all-MiniLM-L6-v2 · PyMuPDF · python-docx · Tailwind CSS · Recharts

**Impact** — Can assist educators, reviewers, researchers, and organizations
in identifying potentially similar content that traditional exact-match
systems may overlook.

**Future scope** — Cross-language semantic comparison · citation-aware
analysis · larger models · document history · advanced explanations ·
large-scale document comparison.
