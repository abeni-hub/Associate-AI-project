
from pydantic import Field, field_validator, model_validator

from resume_analyzer.models.resume import StrictModel


class JobRequirement(StrictModel):
    """A single, job-related criterion used to evaluate a resume."""

    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    required: bool = True
    weight: float = Field(gt=0, le=100)

    @field_validator("name", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class JobDescription(StrictModel):
    """Job criteria and scoring configuration for candidate matching."""

    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=5000)
    requirements: list[JobRequirement] = Field(min_length=1)
    minimum_score: float = Field(default=0, ge=0, le=100)

    @field_validator("title", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @model_validator(mode="after")
    def validate_requirements(self):
        names = [item.name.casefold() for item in self.requirements]
        if len(names) != len(set(names)):
            raise ValueError("Requirement names must be unique.")

        total_weight = sum(item.weight for item in self.requirements)
        if abs(total_weight - 100) > 0.01:
            raise ValueError("Requirement weights must add up to 100.")

        return self


class RequirementMatch(StrictModel):
    """Evidence-based assessment of one requirement against a resume."""

    requirement_name: str
    required: bool
    weight: float = Field(gt=0, le=100)
    score: float = Field(ge=0, le=100)
    evidence: list[str] = Field(default_factory=list)
    explanation: str = Field(min_length=1, max_length=1000)
    evidence_status: str

    @field_validator("evidence_status")
    @classmethod
    def validate_evidence_status(cls, value: str) -> str:
        allowed = {"supported", "partial", "not_established"}
        if value not in allowed:
            raise ValueError(
                f"evidence_status must be one of {sorted(allowed)}."
            )
        return value


class CandidateMatch(StrictModel):
    """Overall match results for one extracted resume."""

    candidate_name: str | None = None
    overall_score: float = Field(ge=0, le=100)
    meets_minimum_score: bool
    requirement_matches: list[RequirementMatch] = Field(
        default_factory=list
    )
    summary: str = Field(min_length=1, max_length=2000)
    limitations: list[str] = Field(default_factory=list)


class RankedCandidate(StrictModel):
    """One candidate's position in a job-specific ranking."""

    rank: int = Field(ge=1)
    match: CandidateMatch


class CandidateRanking(StrictModel):
    """Ranked results for a group of candidates and one job."""

    job_title: str
    candidates: list[RankedCandidate] = Field(default_factory=list)
