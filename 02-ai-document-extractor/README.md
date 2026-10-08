# AI Document Extractor

An AI-powered document extraction application built with Python, Groq, and Pydantic.

This is **Project 2** in my hands-on Associate AI Engineering roadmap.

The application takes unstructured document text, sends it to an AI model, extracts specific information, converts the response into structured JSON, and validates the result using Pydantic.

---

## Project Overview

Traditional applications expect structured data.

For example:

```text
Name: John Doe
Email: john@example.com
Company: Acme Corporation
Role: Senior Software Engineer
```

Real-world documents are often unstructured:

```text
John Doe works at Acme Corporation as a Senior Software Engineer.
His email is john@example.com and he lives in New York.
```

This project uses an AI model to transform the unstructured text into structured, validated data.

```text
Unstructured Document
        │
        ▼
   AI Extraction
        │
        ▼
      JSON
        │
        ▼
   Pydantic Validation
        │
        ▼
 Structured DocumentData
```

---

## Features

* 🤖 AI-powered information extraction
* 📄 Extract structured information from unstructured text
* 🧠 Prompt-based document extraction
* 📦 Pydantic data models
* ✅ Automatic data validation
* 📧 Email validation
* 🔍 Missing-field handling
* 🛡️ Invalid JSON handling
* 🛡️ Invalid structured-data handling
* 💻 Interactive command-line interface
* 🧪 Automated unit tests
* 🔌 Mocked API testing without real API calls
* 🔐 Environment-based API configuration

---

## Technologies

* **Python 3.13**
* **Groq API**
* **GPT-OSS 120B**
* **Requests**
* **Pydantic**
* **python-dotenv**
* **pytest**
* **Git / GitHub**

Groq provides an OpenAI-compatible API interface for chat completions, which this project accesses through the Chat Completions endpoint.

The `openai/gpt-oss-120b` model is currently available through Groq and supports large-context workloads suitable for document-processing applications.

---

## Project Structure

```text
02-ai-document-extractor/
│
├── src/
│   └── extractor/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── extract.py
│       └── models.py
│
├── tests/
│   └── test_extract.py
│
├── .env
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

The `.env` file contains secrets and is excluded from Git.

---

## Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │         CLI          │
                    │      main.py         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Extraction Service  │
                    │      extract.py      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Groq API        │
                    │   GPT-OSS 120B       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      JSON Output     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Pydantic Validation │
                    │       models.py      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Structured Data    │
                    │    DocumentData      │
                    └──────────────────────┘
```

---

# Data Model

The extracted information is represented using a Pydantic model:

```python
class DocumentData(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    role: str | None = None
    location: str | None = None
```

This gives the application a strict contract for AI-generated data.

For example:

```python
DocumentData(
    name="John Doe",
    email="john@example.com",
    phone="+1 555-123-4567",
    company="Acme Corporation",
    role="Senior Software Engineer",
    location="New York",
)
```

Pydantic validates the data before it enters the rest of the application.

---

# Why Pydantic?

AI output should not automatically be trusted.

An AI model might return:

```json
{
  "name": "John Doe",
  "email": "not-an-email"
}
```

The application needs to detect that invalid email address.

Pydantic provides this validation layer:

```text
AI Output
    │
    ▼
JSON Parsing
    │
    ▼
Pydantic
    │
    ├── Valid ──────► DocumentData
    │
    └── Invalid ────► Validation Error
```

This is one of the key concepts demonstrated by this project:

> **Use AI for extraction, but use deterministic application code to validate the result.**

---

# Environment Configuration

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

Never commit the real API key.

The `.gitignore` file contains:

```gitignore
.env
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/abeni-hub/Associate-AI-project.git
```

Navigate to the project:

```bash
cd "Associate-AI-project/02-ai-document-extractor"
```

## 2. Create a virtual environment

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Application

Start the CLI:

```powershell
python -m src.extractor.main
```

The application displays:

```text
AI Document Extractor
Paste your document text below.
Type END on a new line when finished.
```

Paste a document such as:

```text
John Doe
Senior Software Engineer at Acme Corporation
Email: john@example.com
Phone: +1 555-123-4567
Location: New York
END
```

The application extracts the information and returns:

```text
Extracted Information:
Name: John Doe
Email: john@example.com
Phone: +1 555-123-4567
Company: Acme Corporation
Role: Senior Software Engineer
Location: New York
```

---

# Extraction Pipeline

The core extraction process works like this:

### 1. Receive document text

```python
text = "John Doe works at Acme Corporation..."
```

### 2. Build an extraction prompt

The application tells the model exactly which fields to extract.

### 3. Send the request to Groq

The application sends the document and extraction instructions through the Groq Chat Completions API.

### 4. Receive JSON

The model returns structured JSON.

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": null,
  "company": "Acme Corporation",
  "role": "Senior Software Engineer",
  "location": "New York"
}
```

### 5. Parse JSON

Python converts the JSON string into a dictionary.

### 6. Validate with Pydantic

The dictionary is passed into:

```python
DocumentData(**extracted_data)
```

### 7. Return validated data

The application receives a `DocumentData` object instead of an untrusted dictionary.

---

# Error Handling

The application explicitly handles malformed AI output.

## Invalid JSON

If the AI returns:

```text
This is not valid JSON.
```

the application raises:

```text
Error: AI returned invalid JSON.
```

## Invalid structured data

If the AI returns an invalid email:

```json
{
  "name": "John Doe",
  "email": "not-an-email"
}
```

Pydantic validation catches the problem and the application raises:

```text
Error: AI returned invalid document data.
```

This prevents malformed AI output from silently entering the application.

---

# Testing

The project uses **pytest**.

Run:

```powershell
pytest -v
```

Current test suite:

```text
8 passed
```

## Test coverage

The tests cover:

### Pydantic validation

* Valid document data
* Invalid email addresses
* Optional fields

### AI extraction

* Successful extraction
* Invalid JSON
* Invalid structured data

### CLI

* Empty document input
* Successful CLI extraction

---

# Mocking External APIs

The extraction tests do not make real Groq API calls.

Instead, HTTP requests are mocked:

```python
monkeypatch.setattr(requests, "post", fake_post)
```

This provides several benefits:

* Faster tests
* No API usage
* No API costs
* No dependency on network availability
* Predictable test results
* Ability to simulate API failures

The test architecture is:

```text
pytest
   │
   ▼
Fake HTTP Response
   │
   ▼
JSON Parsing
   │
   ▼
Pydantic Validation
   │
   ▼
Test Result
```

---

# Example Test

A successful extraction test verifies that the result is a Pydantic object:

```python
result = extract.extract_document(
    "John Doe works at Acme Corporation."
)

assert isinstance(result, DocumentData)
assert result.name == "John Doe"
assert result.email == "john@example.com"
```

---

# Configuration

The application uses environment variables for configuration:

| Variable       | Purpose                    |
| -------------- | -------------------------- |
| `GROQ_API_KEY` | Authenticates API requests |
| `GROQ_MODEL`   | Specifies the AI model     |
| `GROQ_API_URL` | Specifies the API endpoint |

---

# What I Learned

This project introduced several important AI engineering concepts.

## 1. Structured AI output

Instead of asking an AI model for a natural-language response, we instruct it to produce data that our application can process.

## 2. Pydantic

Pydantic provides a reliable validation layer between AI-generated data and application logic.

## 3. Prompt engineering

The extraction prompt explicitly defines:

* What information to extract
* Which fields are expected
* How missing fields should be represented
* The required output format

## 4. JSON parsing

AI-generated JSON must be parsed before application code can use it.

## 5. Defensive AI engineering

AI output is probabilistic.

Application validation is deterministic.

Combining the two gives us:

```text
AI flexibility
      +
Application validation
      =
Reliable AI pipeline
```

## 6. Testing AI applications

External AI APIs should not be called for every unit test.

Mocking allows the extraction logic and validation layer to be tested independently.

## 7. CLI application design

The project separates:

* CLI interaction
* AI extraction
* configuration
* data models
* tests

This keeps the application maintainable as it grows.

---

# Project Status

**Status: Complete ✅**

### Completed

* [x] Python project structure
* [x] Virtual environment
* [x] Environment configuration
* [x] Groq API integration
* [x] AI extraction prompt
* [x] JSON parsing
* [x] Pydantic data model
* [x] Email validation
* [x] Missing-field handling
* [x] Invalid JSON handling
* [x] Invalid data handling
* [x] Interactive CLI
* [x] Automated tests
* [x] API mocking
* [x] End-to-end verification
* [x] 8 automated tests passing

---

# AI Engineering Roadmap

This project is **Project 2 of 10**.

1. ✅ AI CLI Assistant
2. ✅ AI Document Extractor
3. ⏳ Multi-Provider AI Gateway
4. ⏳ Streaming AI Chat API
5. ⏳ Semantic Search Engine
6. ⏳ Document Q&A / RAG API
7. ⏳ AI Customer Support Agent
8. ⏳ AI Business Assistant
9. ⏳ Production AI API
10. ⏳ Production AI Knowledge Platform

---

# Future Improvements

Potential future improvements include:

* Extracting additional document types
* PDF and DOCX ingestion
* Batch document processing
* Confidence scoring
* More advanced schemas
* Structured output APIs
* Multiple extraction schemas
* REST API support
* Persistent storage
* Document classification
* Human review workflows

These capabilities will be explored in later projects.

---

## Author

**Abeni**

Built as part of a hands-on Associate AI Engineering roadmap.
