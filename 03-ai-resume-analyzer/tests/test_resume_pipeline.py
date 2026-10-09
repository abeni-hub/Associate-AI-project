from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from resume_analyzer.models.resume import Resume
from resume_analyzer.services.pdf_parser import extract_text_from_pdf
from resume_analyzer.services.resume_extractor import ResumeExtractor
from resume_analyzer.providers.groq import GroqProvider


def create_sample_resume_pdf() -> bytes:
    """Create a small PDF containing sample resume information."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    lines = [
        "Alex Morgan",
        "Email: alex.morgan@example.com",
        "Location: Addis Ababa, Ethiopia",
        "",
        "Professional Summary",
        "Backend developer experienced in building APIs.",
        "",
        "Skills",
        "Python, FastAPI, SQL, Git",
        "",
        "Work Experience",
        "Backend Developer at Example Technologies",
        "January 2023 - Present",
        "Built REST APIs using Python and FastAPI.",
        "",
        "Education",
        "Bachelor of Science in Computer Science",
        "Example University, 2022",
    ]

    y = 750
    for line in lines:
        pdf.drawString(72, y, line)
        y -= 24

    pdf.save()
    return buffer.getvalue()


def test_pdf_to_structured_resume():
    """Verify that a PDF can be parsed and converted into a Resume."""
    pdf_bytes = create_sample_resume_pdf()

    resume_text = extract_text_from_pdf(pdf_bytes)

    extractor = ResumeExtractor(GroqProvider())
    resume = extractor.extract(resume_text)

    assert isinstance(resume, Resume)
    assert resume.candidate.name is not None
    assert resume.candidate.name.lower() == "alex morgan"
    assert any(skill.lower() == "python" for skill in resume.skills)
    assert len(resume.work_experience) >= 1
