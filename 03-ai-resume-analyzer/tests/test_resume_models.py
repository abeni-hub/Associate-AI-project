
import pytest
from pydantic import ValidationError

from resume_analyzer.models.resume import Resume


def test_resume_accepts_candidate_and_skills():
    resume = Resume(
        candidate={
            "name": "Alex Morgan",
            "email": "alex@example.com",
        },
        skills=["Python", "FastAPI"],
    )

    assert resume.candidate.name == "Alex Morgan"
    assert str(resume.candidate.email) == "alex@example.com"
    assert resume.skills == ["Python", "FastAPI"]


def test_resume_allows_missing_optional_information():
    resume = Resume()

    assert resume.candidate.name is None
    assert resume.work_experience == []
    assert resume.education == []
    assert resume.skills == []


def test_resume_validates_email():
    with pytest.raises(ValidationError):
        Resume(candidate={"email": "not-an-email"})


def test_resume_rejects_unknown_fields():
    with pytest.raises(ValidationError):
        Resume(unexpected_field="not allowed")


def test_work_experience_preserves_achievements():
    resume = Resume(
        work_experience=[
            {
                "company": "Example Tech",
                "job_title": "Backend Developer",
                "responsibilities": ["Built REST APIs"],
                "achievements": ["Reduced response time by 30%"],
            }
        ]
    )

    experience = resume.work_experience[0]

    assert experience.company == "Example Tech"
    assert experience.responsibilities == ["Built REST APIs"]
    assert experience.achievements == ["Reduced response time by 30%"]