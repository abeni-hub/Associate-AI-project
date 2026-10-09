from io import BytesIO
import json

from resume_analyzer.models.analysis import JobRequirement
from fastapi.testclient import TestClient
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from resume_analyzer.main import app
from resume_analyzer.api import routes
from resume_analyzer.models.resume import Resume
from pypdf import PdfWriter

client = TestClient(app)


def create_pdf() -> bytes:
    """Create a small text-based PDF for upload tests."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    lines = [
        "Alex Morgan",
        "Email: alex.morgan@example.com",
        "Skills: Python, FastAPI",
        "Backend Developer at Example Technologies",
    ]

    y = 750
    for line in lines:
        pdf.drawString(72, y, line)
        y -= 24

    pdf.save()
    return buffer.getvalue()


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_rejects_non_pdf_upload():
    response = client.post(
        "/api/v1/resumes/analyze",
        files={
            "file": (
                "resume.txt",
                b"This is not a PDF",
                "text/plain",
            )
        },
    )

    assert response.status_code == 415
    assert response.json()["detail"] == "Only PDF files are supported."


def test_analyze_pdf_returns_structured_resume(monkeypatch):
    """Verify PDF parsing and API response without calling Groq."""

    expected_resume = Resume.model_validate(
        {
            "candidate": {
                "name": "Alex Morgan",
                "email": "alex.morgan@example.com",
            },
            "skills": ["Python", "FastAPI"],
            "work_experience": [
                {
                    "company": "Example Technologies",
                    "job_title": "Backend Developer",
                    "responsibilities": [],
                    "achievements": [],
                }
            ],
        }
    )

    class FakeExtractor:
        def __init__(self, provider):
            pass

        def extract(self, resume_text):
            assert "Alex Morgan" in resume_text
            assert "Example Technologies" in resume_text
            return expected_resume

    monkeypatch.setattr(routes, "ResumeExtractor", FakeExtractor)
    monkeypatch.setattr(routes, "GroqProvider", lambda: object())

    response = client.post(
        "/api/v1/resumes/analyze",
        files={
            "file": (
                "resume.pdf",
                create_pdf(),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["candidate"]["name"] == "Alex Morgan"
    assert data["candidate"]["email"] == "alex.morgan@example.com"
    assert data["skills"] == ["Python", "FastAPI"]
    assert data["work_experience"][0]["company"] == "Example Technologies"


def test_rejects_invalid_pdf_content():
    response = client.post(
        "/api/v1/resumes/analyze",
        files={
            "file": (
                "broken.pdf",
                b"This is not actually a PDF",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400


def test_rejects_pdf_larger_than_limit():
    oversized_content = b"x" * (5 * 1024 * 1024 + 1)

    response = client.post(
        "/api/v1/resumes/analyze",
        files={
            "file": (
                "large.pdf",
                oversized_content,
                "application/pdf",
            )
        },
    )

    assert response.status_code == 413
    assert response.json()["detail"] == (
        "The PDF exceeds the 5 MB upload limit."
    )


def test_rejects_encrypted_pdf():
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.encrypt("test-password")

    buffer = BytesIO()
    writer.write(buffer)

    response = client.post(
        "/api/v1/resumes/analyze",
        files={
            "file": (
                "encrypted.pdf",
                buffer.getvalue(),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Password-protected PDFs are not supported."
    )


def test_rank_resumes_returns_ranked_candidates(monkeypatch):
    """Test ranking through the API without making a Groq request."""

    class FakeExtractor:
        def __init__(self, provider):
            pass

        def extract(self, resume_text):
            assert "Alex Morgan" in resume_text
            return Resume.model_validate(
                {
                    "candidate": {"name": "Alex Morgan"},
                    "skills": ["Python", "FastAPI"],
                }
            )

    monkeypatch.setattr(routes, "ResumeExtractor", FakeExtractor)
    monkeypatch.setattr(routes, "GroqProvider", lambda: object())

    job = {
        "title": "Python Backend Engineer",
        "description": "Build backend services.",
        "minimum_score": 50,
        "requirements": [
            {
                "name": "Python",
                "description": "Python programming",
                "required": True,
                "weight": 100,
            }
        ],
    }

    response = client.post(
        "/api/v1/resumes/rank",
        data={"job": json.dumps(job)},
        files=[
            (
                "files",
                ("resume.pdf", create_pdf(), "application/pdf"),
            )
        ],
    )

    assert response.status_code == 200

    data = response.json()
    assert data["job_title"] == "Python Backend Engineer"
    assert len(data["candidates"]) == 1
    assert data["candidates"][0]["rank"] == 1
    assert data["candidates"][0]["match"]["candidate_name"] == "Alex Morgan"
    assert data["candidates"][0]["match"]["overall_score"] == 100
    assert (
        data["candidates"][0]["match"]["requirement_matches"][0]["evidence_status"]
        == "supported"
    )


def test_rank_resumes_rejects_invalid_job_json():
    response = client.post(
        "/api/v1/resumes/rank",
        data={"job": '{"title":'},
        files=[
            (
                "files",
                ("resume.pdf", create_pdf(), "application/pdf"),
            )
        ],
    )

    assert response.status_code == 422

