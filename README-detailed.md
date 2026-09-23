# SemantiCheck
### AI-Powered Semantic Similarity Detection — Presentation Guide

---

## 1. Project Overview

**SemantiCheck** is an AI-powered document similarity analysis system.

It compares two documents based on their **semantic meaning**, rather than relying only on matching words.

The system can identify sentences that express similar ideas even when they use different words or sentence structures.

### Supported Inputs

- PDF
- DOCX
- TXT
- Pasted text

---

## 2. Problem Statement

Traditional text comparison systems often depend on:

- Exact word matching
- Keyword matching
- String similarity

These approaches can miss **paraphrased content**.

### Example

**Document A**

> Artificial intelligence helps doctors identify diseases.

**Document B**

> AI assists medical professionals in detecting illnesses.

Although the wording is different, both sentences have a similar meaning.

SemantiCheck is designed to detect this type of **semantic similarity**.

---

## 3. Proposed Solution

SemantiCheck uses a **pre-trained sentence-transformer model** to convert sentences into numerical vectors called **embeddings**.

The system then compares these embeddings using **cosine similarity**.

### Basic Process

```text
Document A
     │
     ▼
Extract Text
     │
     ▼
Split into Sentences
     │
     ▼
Generate Embeddings
     │
     │     Document B
     │          │
     │          ▼
     │     Extract Text
     │          │
     │          ▼
     │     Split into Sentences
     │          │
     │          ▼
     │     Generate Embeddings
     │          │
     └────┬─────┘
          ▼
   Cosine Similarity
          │
          ▼
    Best Sentence Matches
          │
          ▼
    Similarity Analysis
          │
          ▼
      Results Dashboard
```

---

## 4. Core AI Model

### Model
**all-MiniLM-L6-v2**

### Library
**Sentence Transformers**

The model converts sentences into semantic embeddings.

```text
Sentence
   ↓
all-MiniLM-L6-v2
   ↓
Numerical Vector
```

Similar meanings generally produce embeddings that are closer together in vector space.

---

## 5. Similarity Calculation

SemantiCheck uses **cosine similarity**.

### Formula

```text
                 A · B
Similarity = ─────────────
              ||A|| ||B||
```

Where:

- `A` = embedding of sentence A
- `B` = embedding of sentence B

The project normalizes embeddings before comparison, allowing the similarity calculation to be performed efficiently using vector operations.

---

## 6. Sentence Matching

Suppose Document A contains:

```text
A1
A2
A3
```

and Document B contains:

```text
B1
B2
B3
B4
```

The system compares each sentence from Document A against the sentences in Document B.

Example:

```text
A1 → B3 = 86%
A2 → B1 = 74%
A3 → B4 = 32%
```

The highest similarity score is selected as the best match for each sentence in Document A.

---

## 7. Overall Similarity

The overall similarity score is calculated from the best-match scores for the sentences in Document A.

Example:

```text
A1 → 90%
A2 → 80%
A3 → 70%

Overall = (90 + 80 + 70) / 3

Overall Similarity = 80%
```

The score therefore represents approximately how much of **Document A has a semantically similar counterpart in Document B**.

---

## 8. Similarity Classification

| Score | Classification |
|---:|---|
| 0–39.9% | Low |
| 40–69.9% | Moderate |
| 70–84.9% | High |
| 85–100% | Very High |

These thresholds are configurable in the backend.

---

## 9. System Architecture

```text
┌──────────────────────┐
│       User           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   React Frontend     │
│                      │
│ Upload / Paste Text  │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│   FastAPI Backend    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Document Processing  │
│ PDF / DOCX / TXT     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Text Processing      │
│ Cleaning             │
│ Sentence Splitting   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ NLP Service          │
│ MiniLM Embeddings    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Cosine Similarity    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Analysis Results     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ React Results Page   │
└──────────────────────┘
```

---

## 10. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Charts | Recharts |
| Backend | Python |
| API Framework | FastAPI |
| Server | Uvicorn |
| NLP | Sentence Transformers |
| AI Model | all-MiniLM-L6-v2 |
| ML Framework | PyTorch |
| Numerical Processing | NumPy |
| PDF Processing | PyMuPDF |
| DOCX Processing | python-docx |
| Testing | Pytest |

---

## 11. Frontend

The frontend is built using **React**.

### Main Pages

#### Home
Provides an introduction to SemantiCheck and explains the system.

#### Analyze
Allows the user to:

- Upload two documents
- Paste text
- Start analysis

#### Results
Displays:

- Overall similarity
- Sentence statistics
- Similarity distribution
- Sentence-level matches
- Similarity classifications
- Search and filtering
- Sort options
- Printable report

---

## 12. Backend

The backend is built using **Python and FastAPI**.

### Main Responsibilities

- Receive documents
- Validate inputs
- Extract text
- Clean text
- Split text into sentences
- Generate embeddings
- Calculate similarity
- Generate analysis results
- Return results to the frontend

---

## 13. Important Backend Components

```text
backend/
└── app/
    ├── main.py
    ├── config.py
    │
    ├── routes/
    │   ├── analyze.py
    │   └── health.py
    │
    ├── services/
    │   ├── document_service.py
    │   ├── nlp_service.py
    │   └── analysis_service.py
    │
    └── utils/
        └── text_utils.py
```

### `main.py`
Initializes the FastAPI application and registers routes.

### `config.py`
Stores application configuration and similarity thresholds.

### `document_service.py`
Handles document extraction for PDF, DOCX and TXT files.

### `nlp_service.py`
Loads and uses the sentence-transformer model.

### `analysis_service.py`
Performs sentence comparison and similarity analysis.

### `text_utils.py`
Handles text cleaning and sentence processing.

### `analyze.py`
Contains the main document analysis API.

### `health.py`
Provides a backend health-check endpoint.

---

## 14. API Endpoints

### `GET /api/health`

Checks whether the backend and NLP model are available.

### `POST /api/analyze`

Main analysis endpoint.

Receives two documents or text inputs and returns the semantic similarity analysis.

### `POST /api/extract-text`

Extracts text from supported documents.

---

## 15. Document Processing

### PDF
Processed using **PyMuPDF**.

### DOCX
Processed using **python-docx**.

### TXT
Read using Python text decoding.

The system also performs basic text cleaning before semantic analysis.

---

## 16. Input Validation

The backend includes basic validation.

### Supported formats

```text
PDF
DOCX
TXT
```

### Maximum file size

```text
10 MB
```

The system also checks for:

- Empty documents
- Invalid file types
- Corrupted files
- Documents without extractable text

---

## 17. Results Dashboard

The results page provides a visual representation of the analysis.

### Displays

```text
Overall Similarity
       │
       ├── Low
       ├── Moderate
       ├── High
       └── Very High
```

It also displays individual sentence matches.

Example:

```text
Document A Sentence
        │
        ▼
Best Matching Sentence
        │
        ▼
Similarity: 87%
        │
        ▼
Very High
```

---

## 18. Important Distinction

### Semantic Similarity ≠ Proven Plagiarism

SemantiCheck identifies **similar content**.

It does not automatically determine whether plagiarism has occurred.

A high similarity score should be treated as an indication for further review.

For example, legitimate quotations or commonly used technical statements can also produce high similarity.

---

## 19. Privacy and Processing

The system is designed around local processing.

The semantic analysis uses the locally available sentence-transformer model rather than a paid external AI API.

The project does not require:

- OpenAI API
- Gemini API
- Claude API
- Paid AI services

The model may need to be downloaded initially before it can be used locally.

---

## 20. Database

The current version does **not use a database for storing analysis results**.

Each analysis is processed as a request and returned to the frontend.

### Possible future implementation

A database could be added for:

- User accounts
- Analysis history
- Saved reports
- Previous documents
- User-specific results

---

## 21. Testing

The project includes backend tests using **Pytest**.

Testing covers areas including:

- Health endpoint
- Semantic similarity
- Paraphrased sentences
- Unrelated sentences
- Multiple sentences
- PDF processing
- DOCX processing
- TXT processing
- Text extraction
- Invalid files
- Empty input
- Corrupted documents
- Text encoding
- Sentence processing

---

## 22. Current Limitations

### No OCR
Scanned/image-only PDFs are not currently processed through OCR.

### Directional Scoring
The main score measures the best matches from Document A against Document B.

### No Persistent Storage
Analysis history is not currently stored in a database.

### Similarity Is Not Proof of Plagiarism
The system provides similarity evidence rather than a final plagiarism decision.

### Sentence-Level Analysis
The current approach focuses primarily on sentence-level semantic similarity rather than deeper document structure.

---

## 23. Future Scope

Possible improvements include:

- OCR support for scanned documents
- Database integration
- User authentication
- Saved analysis history
- Symmetric document similarity
- Citation/reference analysis
- Larger document optimization
- Hybrid lexical + semantic plagiarism detection
- Improved document structure analysis
- More advanced reporting

---

## 24. Complete Workflow

```text
User uploads two documents
             ↓
      File validation
             ↓
       Text extraction
             ↓
        Text cleaning
             ↓
      Sentence splitting
             ↓
   Sentence embeddings
             ↓
    MiniLM Transformer
             ↓
    Cosine similarity
             ↓
   Best sentence matches
             ↓
 Similarity classification
             ↓
    Overall similarity
             ↓
       JSON response
             ↓
     React dashboard
             ↓
       User reviews
```

---

## 25. One-Minute Project Explanation

> **SemantiCheck is an AI-powered semantic similarity detection system designed to identify similar content between two documents, even when the wording is different. Users can upload PDF, DOCX or TXT files, or provide text directly. The system extracts and cleans the text, divides it into sentences, and converts each sentence into a semantic embedding using the all-MiniLM-L6-v2 sentence-transformer model. It then calculates cosine similarity between sentences and identifies the best matching sentence for each sentence in Document A. The similarity scores are classified into Low, Moderate, High and Very High levels, and the results are presented through a React-based dashboard. The backend is implemented using Python and FastAPI. The system is designed for local processing and provides similarity analysis to assist human review rather than automatically declaring something as plagiarism.**

---

## 26. Key Points to Remember

```text
PROJECT
SemantiCheck

PURPOSE
Semantic document similarity detection

FRONTEND
React + Vite + Tailwind

BACKEND
Python + FastAPI

AI MODEL
all-MiniLM-L6-v2

AI TECHNIQUE
Sentence Embeddings

SIMILARITY
Cosine Similarity

DOCUMENTS
PDF / DOCX / TXT / Text

MAIN OUTPUT
Sentence-level matches + Overall Similarity

DATABASE
Not currently used

OCR
Not currently supported

IMPORTANT
Similarity does not automatically mean plagiarism
```

---

## 27. Core Concept

```text
WORDS
  ↓
SENTENCES
  ↓
SEMANTIC EMBEDDINGS
  ↓
VECTOR COMPARISON
  ↓
COSINE SIMILARITY
  ↓
BEST MATCHES
  ↓
SIMILARITY REPORT
```

**This is the fundamental idea behind SemantiCheck.**
