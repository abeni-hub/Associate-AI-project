
from io import BytesIO

import pytest
from reportlab.pdfgen import canvas

from resume_analyzer.services.pdf_parser import (
    EmptyPDFError,
    EncryptedPDFError,
    InvalidPDFError,
    NoExtractableTextError,
    extract_text_from_pdf,
)


def create_pdf(text: str | None = None) -> bytes:
    """Create a synthetic PDF for testing."""

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)

    if text:
        pdf.drawString(72, 750, text)

    pdf.save()
    return buffer.getvalue()


def test_extracts_text_from_pdf():
    pdf_bytes = create_pdf("Python developer with FastAPI experience")

    text = extract_text_from_pdf(pdf_bytes)

    assert "Python developer" in text
    assert "FastAPI" in text


def test_rejects_empty_file():
    with pytest.raises(EmptyPDFError):
        extract_text_from_pdf(b"")


def test_rejects_invalid_pdf():
    with pytest.raises(InvalidPDFError):
        extract_text_from_pdf(b"This is not a PDF")


def test_rejects_pdf_without_extractable_text():
    pdf_bytes = create_pdf()

    with pytest.raises(NoExtractableTextError):
        extract_text_from_pdf(pdf_bytes)


def test_extracts_text_from_multiple_pages():
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)

    pdf.drawString(72, 750, "First page: Python")
    pdf.showPage()

    pdf.drawString(72, 750, "Second page: FastAPI")
    pdf.save()

    text = extract_text_from_pdf(buffer.getvalue())

    assert "First page: Python" in text
    assert "Second page: FastAPI" in text