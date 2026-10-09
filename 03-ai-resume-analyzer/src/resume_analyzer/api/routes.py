import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError

from resume_analyzer.models.analysis import CandidateRanking, JobDescription
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
from resume_analyzer.services.resume_analyzer import rank_candidates
from resume_analyzer.services.resume_extractor import (
    ResumeExtractionError,
    ResumeExtractor,
)

logger = logging.getLogger(__name__)

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
        await file.close()
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
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="The PDF exceeds the 5 MB upload limit.",
        )

    try:
        resume_text = extract_text_from_pdf(file_content)
    except (EmptyPDFError, EncryptedPDFError, InvalidPDFError) as exc:
        detail = (
            "Password-protected PDFs are not supported."
            if isinstance(exc, EncryptedPDFError)
            else str(exc)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        ) from exc
    except NoExtractableTextError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    try:
        extractor = ResumeExtractor(GroqProvider())
        return extractor.extract(resume_text)
    except ResumeExtractionError as exc:
        logger.exception("Resume extraction failed for /analyze")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=_extraction_error_detail(exc),
        ) from exc


@router.post(
    "/rank",
    response_model=CandidateRanking,
    status_code=status.HTTP_200_OK,
)
async def rank_resume_uploads(
    job: str = Form(...),
    files: list[UploadFile] = File(...),
) -> CandidateRanking:
    """Extract, score, and rank multiple PDF resumes for one job."""
    try:
        job_description = JobDescription.model_validate_json(job)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=(
                "The job description JSON is invalid or does not "
                "match the required schema."
            ),
        ) from exc

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload at least one PDF resume.",
        )

    if len(files) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A maximum of 20 resumes can be ranked per request.",
        )

    resume_texts: list[str] = []
    filenames: list[str] = []

    for file in files:
        filename = file.filename or "uploaded file"
        filenames.append(filename)

        try:
            if file.content_type != PDF_CONTENT_TYPE:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"{filename}: only PDF files are supported.",
                )

            file_content = await file.read(MAX_FILE_SIZE + 1)
        finally:
            await file.close()

        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{filename}: the uploaded file is empty.",
            )

        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail=f"{filename}: the PDF exceeds the 5 MB upload limit.",
            )

        try:
            resume_text = extract_text_from_pdf(file_content)
        except (EmptyPDFError, EncryptedPDFError, InvalidPDFError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{filename}: {exc}",
            ) from exc
        except NoExtractableTextError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"{filename}: {exc}",
            ) from exc

        resume_texts.append(resume_text)

    extractor = ResumeExtractor(GroqProvider())
    resumes: list[Resume] = []

    for index, resume_text in enumerate(resume_texts, start=1):
        filename = filenames[index - 1]

        logger.info(
            "Extracting resume %s of %s: %s",
            index,
            len(resume_texts),
            filename,
        )

        try:
            resume = extractor.extract(resume_text)
        except ResumeExtractionError as exc:
            logger.exception(
                "Resume extraction failed for uploaded resume %s (%s)",
                index,
                filename,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Resume extraction failed for uploaded resume {index}. "
                    "Check the server terminal for details."
                ),
            ) from exc

        resumes.append(resume)

        logger.info(
            "Successfully extracted resume %s of %s: %s",
            index,
            len(resume_texts),
            filename,
        )

    return rank_candidates(resumes, job_description)


def _extraction_error_detail(exc: ResumeExtractionError) -> str:
    """Return a safe error message without exposing provider internals."""
    if isinstance(exc.__cause__, AIProviderError):
        return "The AI provider failed to process a resume."

    return "The AI provider returned an invalid resume structure."

