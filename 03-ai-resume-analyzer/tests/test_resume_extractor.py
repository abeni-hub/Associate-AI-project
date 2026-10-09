
import pytest

from resume_analyzer.models.resume import Resume
from resume_analyzer.providers.base import AIProvider, AIProviderError
from resume_analyzer.services.resume_extractor import (
    ResumeExtractionError,
    ResumeExtractor,
)


class FakeProvider(AIProvider):
    def __init__(self, response: dict | None = None, error: Exception | None = None):
        self.response = response
        self.error = error
        self.last_prompt = None

    def generate_json(self, prompt: str) -> dict:
        self.last_prompt = prompt

        if self.error:
            raise self.error

        return self.response or {}


def test_extract_returns_validated_resume():
    provider = FakeProvider(
        response={
            "candidate": {
                "name": "Alex Morgan",
                "email": "alex@example.com",
            },
            "skills": ["Python", "FastAPI"],
        }
    )

    result = ResumeExtractor(provider).extract(
        "Alex Morgan is a Python developer."
    )

    assert isinstance(result, Resume)
    assert result.candidate.name == "Alex Morgan"
    assert result.skills == ["Python", "FastAPI"]
    assert "SOURCE RESUME TEXT" in provider.last_prompt


def test_extract_rejects_empty_text():
    extractor = ResumeExtractor(FakeProvider())

    with pytest.raises(ResumeExtractionError, match="cannot be empty"):
        extractor.extract("   ")


def test_extract_rejects_invalid_schema():
    provider = FakeProvider(
        response={"unexpected_field": "invalid"}
    )

    with pytest.raises(ResumeExtractionError, match="schema"):
        ResumeExtractor(provider).extract("Example resume text")


def test_extract_handles_provider_failure():
    provider = FakeProvider(
        error=AIProviderError("Provider unavailable")
    )

    with pytest.raises(ResumeExtractionError, match="provider failed"):
        ResumeExtractor(provider).extract("Example resume text")