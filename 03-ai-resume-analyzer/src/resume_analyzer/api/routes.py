from fastapi import APIRouter, File, HTTPException, UploadFile, status

from resume_analyzer.models.resume import Resume
from resume_analyzer.providers.base import AIProviderError
from resume_analyzer.providers.groq import GroqProvider
from resume_analyzer.services.pdf_parser import (
    EncryptedPDFError,
    EmptyPDFError,
    InvalidPDFError,
    NoExtractableTextError,
    extract_text_from_pdf,
)
from resume_analyzer.services.resume_extractor import (
    ResumeExtractionError,
    ResumeExtractor,
)

router = APIRouter(prefix="/api/v1/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
PDF_CONTENT_TYPE = "application/pdf"


@router.post(
    "/analyze",
    response_model=Resume,
    status_code=status.HTTP_200_OK,
)
async def analyze_resume(file: UploadFile = File(...)) -> Resume:
    """Extract and structure information from an uploaded PDF resume."""

    if file.content_type != PDF_CONTENT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are supported.",
        )

    try:
        file_content = await file.read(MAX_FILE_SIZE + 1)
    finally:
        await file.close()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            detail="The PDF exceeds the 5 MB upload limit.",
        )

    try:
        resume_text = extract_text_from_pdf(file_content)
    except EmptyPDFError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except EncryptedPDFError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except NoExtractableTextError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except InvalidPDFError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    try:
        extractor = ResumeExtractor(GroqProvider())
        return extractor.extract(resume_text)
    except ResumeExtractionError as exc:
        if isinstance(exc.__cause__, AIProviderError):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI provider failed to process the resume.",
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned an invalid resume structure.",
        ) from exc
