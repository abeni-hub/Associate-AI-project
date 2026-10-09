from resume_analyzer.models.analysis import JobDescription, JobRequirement
from resume_analyzer.models.resume import (
    Candidate,
    Project,
    Resume,
    WorkExperience,
)
from resume_analyzer.services.scoring import (
    build_resume_evidence,
    normalize_text,
    score_candidate,
    score_requirement,
)


def sample_job() -> JobDescription:
    return JobDescription(
        title="Python Backend Engineer",
        description="Develop backend APIs and work with SQL databases.",
        minimum_score=60,
        requirements=[
            JobRequirement(
                name="Python",
                description="Python programming",
                weight=40,
            ),
            JobRequirement(
                name="REST API",
                description="Building REST API services",
                weight=35,
            ),
            JobRequirement(
                name="SQL",
                description="SQL database experience",
                weight=25,
            ),
        ],
    )


def test_normalize_text_is_case_insensitive():
    assert normalize_text("  Python   REST APIs! ") == "python rest apis"


def test_build_resume_evidence_includes_skills_and_projects():
    resume = Resume(
        skills=["Python"],
        projects=[
            Project(
                name="API Service",
                description="A backend service",
                technologies=["FastAPI"],
            )
        ],
    )

    evidence = build_resume_evidence(resume)

    assert "Skill: Python" in evidence
    assert "Project: API Service" in evidence
    assert "Project technology: FastAPI" in evidence


def test_score_requirement_returns_evidence_for_direct_match():
    result = score_requirement(
        requirement_name="Python",
        requirement_description="Python programming",
        required=True,
        weight=40,
        resume_evidence=["Skill: Python", "Project technology: FastAPI"],
    )

    assert result.score == 100
    assert result.evidence_status == "supported"
    assert "Skill: Python" in result.evidence


def test_score_requirement_does_not_match_partial_word():
    result = score_requirement(
        requirement_name="SQL",
        requirement_description="SQL database experience",
        required=True,
        weight=25,
        resume_evidence=["Skill: NoSQL"],
    )

    assert result.score == 0
    assert result.evidence_status == "not_established"
    assert result.evidence == []


def test_score_requirement_reports_missing_evidence_carefully():
    result = score_requirement(
        requirement_name="Docker",
        requirement_description="Containerization experience",
        required=True,
        weight=10,
        resume_evidence=["Skill: Python"],
    )

    assert result.score == 0
    assert result.evidence_status == "not_established"
    assert "does not establish" in result.explanation


def test_score_candidate_calculates_weighted_score():
    resume = Resume(
        candidate=Candidate(name="Example Candidate"),
        skills=["Python", "REST API"],
    )

    result = score_candidate(resume, sample_job())

    # Python contributes 40 points; REST API contributes 35.
    assert result.overall_score == 75
    assert result.meets_minimum_score is True
    assert len(result.requirement_matches) == 3


def test_score_candidate_respects_minimum_score():
    job = JobDescription(
        title="Python Engineer",
        description="Use Python.",
        minimum_score=80,
        requirements=[
            JobRequirement(
                name="Python",
                description="Python programming",
                weight=100,
            )
        ],
    )

    resume = Resume(skills=["SQL"])
    result = score_candidate(resume, job)

    assert result.overall_score == 0
    assert result.meets_minimum_score is False


def test_score_candidate_handles_empty_resume_evidence():
    result = score_candidate(Resume(), sample_job())

    assert result.overall_score == 0
    assert all(
        item.evidence_status == "not_established"
        for item in result.requirement_matches
    )
    assert result.limitations
