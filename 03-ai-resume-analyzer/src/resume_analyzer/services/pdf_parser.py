
from io import BytesIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError


class PDFParserError(Exception):
    """Base exception for PDF parsing failures."""


class EmptyPDFError(PDFParserError):
    """Raised when the uploaded file contains no data."""


class InvalidPDFError(PDFParserError):
    """Raised when the uploaded file cannot be read as a PDF."""


class EncryptedPDFError(PDFParserError):
    """Raised when the PDF is password-protected."""


class NoExtractableTextError(PDFParserError):
    """Raised when no readable text can be extracted."""


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract embedded text from PDF bytes."""

    if not file_content:
        raise EmptyPDFError("The uploaded file is empty.")

    try:
        reader = PdfReader(BytesIO(file_content), strict=False)
    except (PdfReadError, ValueError, OSError) as exc:
        raise InvalidPDFError(
            "The uploaded file is not a valid readable PDF."
        ) from exc

    if reader.is_encrypted:
        raise EncryptedPDFError(
            "Password-protected PDFs are not supported."
        )

    extracted_pages = []

    try:
        for page in reader.pages:
            extracted_pages.append(page.extract_text() or "")
    except (PdfReadError, ValueError, OSError) as exc:
        raise InvalidPDFError(
            "An error occurred while reading the PDF pages."
        ) from exc

    text = "\n".join(extracted_pages).strip()

    if not text:
        raise NoExtractableTextError(
            "No extractable text was found. "
            "The PDF may be scanned and require OCR."
        )

    return text