
from pydantic import ValidationError

from resume_analyzer.models.resume import Resume
from resume_analyzer.prompts.resume_extraction import (
    build_resume_extraction_prompt,
)
from resume_analyzer.providers.base import AIProvider, AIProviderError


class ResumeExtractionError(Exception):
    """Raised when a resume cannot be extracted into the required schema."""


class ResumeExtractor:
    """Convert resume text into a validated Resume model."""

    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    def extract(self, resume_text: str) -> Resume:
        if not resume_text or not resume_text.strip():
            raise ResumeExtractionError(
                "Resume text cannot be empty."
            )

        prompt = build_resume_extraction_prompt(resume_text)

        try:
            data = self.provider.generate_json(prompt)
            return Resume.model_validate(data)
        except AIProviderError as exc:
            raise ResumeExtractionError(
                "The AI provider failed to extract the resume."
            ) from exc
        except ValidationError as exc:
            raise ResumeExtractionError(
                "The AI response did not match the resume schema."
            ) from exc