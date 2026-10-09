import pytest
from pydantic import ValidationError
from resume_analyzer.models.resume import Candidate, Resume
from resume_analyzer.services.resume_analyzer import rank_candidates

from resume_analyzer.models.analysis import (
    CandidateMatch,
    CandidateRanking,
    JobDescription,
    JobRequirement,
    RankedCandidate,
    RequirementMatch,
)


def sample_job() -> JobDescription:
    return JobDescription(
        title="Backend AI Engineer",
        description="Build and maintain Python APIs.",
        requirements=[
            JobRequirement(
                name="Python",
                description="Practical Python development experience",
                weight=40,
            ),
            JobRequirement(
                name="REST APIs",
                description="Experience building REST APIs",
                weight=35,
            ),
            JobRequirement(
                name="SQL",
                description="Experience with relational databases",
                weight=25,
            ),
        ],
    )


def test_valid_job_description():
    job = sample_job()

    assert job.title == "Backend AI Engineer"
    assert len(job.requirements) == 3
    assert sum(item.weight for item in job.requirements) == 100


def test_job_rejects_weights_not_adding_to_100():
    with pytest.raises(ValidationError, match="add up to 100"):
        JobDescription(
            title="Backend Engineer",
            description="Build APIs.",
            requirements=[
                JobRequirement(
                    name="Python",
                    description="Python experience",
                    weight=60,
                ),
                JobRequirement(
                    name="SQL",
                    description="Database experience",
                    weight=30,
                ),
            ],
        )


def test_job_rejects_duplicate_requirement_names():
    with pytest.raises(ValidationError, match="must be unique"):
        JobDescription(
            title="Backend Engineer",
            description="Build APIs.",
            requirements=[
                JobRequirement(
                    name="Python",
                    description="Python experience",
                    weight=50,
                ),
                JobRequirement(
                    name="python",
                    description="Another Python criterion",
                    weight=50,
                ),
            ],
        )


def test_requirement_rejects_zero_weight():
    with pytest.raises(ValidationError):
        JobRequirement(
            name="Python",
            description="Python experience",
            weight=0,
        )


def test_requirement_match_accepts_missing_evidence_status():
    match = RequirementMatch(
        requirement_name="Cloud deployment",
        required=True,
        weight=10,
        score=0,
        evidence=[],
        explanation="The resume does not establish this experience.",
        evidence_status="not_established",
    )

    assert match.evidence_status == "not_established"
    assert match.score == 0


def test_requirement_match_rejects_unknown_evidence_status():
    with pytest.raises(ValidationError, match="evidence_status"):
        RequirementMatch(
            requirement_name="Python",
            required=True,
            weight=100,
            score=50,
            evidence=["Python listed under skills"],
            explanation="Some evidence was found.",
            evidence_status="unknown",
        )


def test_candidate_match_accepts_valid_scores():
    match = CandidateMatch(
        candidate_name="Example Candidate",
        overall_score=82.5,
        meets_minimum_score=True,
        requirement_matches=[],
        summary="Several job-related criteria are supported by the resume.",
    )

    assert match.overall_score == 82.5
    assert match.meets_minimum_score is True


def test_candidate_match_rejects_score_above_100():
    with pytest.raises(ValidationError):
        CandidateMatch(
            overall_score=101,
            meets_minimum_score=True,
            summary="Invalid score.",
        )


def test_candidate_ranking_structure():
    match = CandidateMatch(
        candidate_name="Example Candidate",
        overall_score=80,
        meets_minimum_score=True,
        summary="Relevant experience is documented.",
    )

    ranking = CandidateRanking(
        job_title="Backend Engineer",
        candidates=[
            RankedCandidate(rank=1, match=match),
        ],
    )

    assert ranking.candidates[0].rank == 1
    assert ranking.candidates[0].match.overall_score == 80


def test_rank_candidates_orders_highest_score_first():
    job = JobDescription(
        title="Python Engineer",
        description="Python development",
        requirements=[
            JobRequirement(
                name="Python",
                description="Python programming",
                weight=100,
            )
        ],
    )

    resumes = [
        Resume(
            candidate=Candidate(name="SQL Candidate"),
            skills=["SQL"],
        ),
        Resume(
            candidate=Candidate(name="Python Candidate"),
            skills=["Python"],
        ),
        Resume(
            candidate=Candidate(name="Another Python Candidate"),
            skills=["Python"],
        ),
    ]

    result = rank_candidates(resumes, job)

    assert [item.match.candidate_name for item in result.candidates] == [
        "Python Candidate",
        "Another Python Candidate",
        "SQL Candidate",
    ]
    assert [item.rank for item in result.candidates] == [1, 1, 3]


def test_rank_candidates_returns_empty_list_for_no_candidates():
    job = JobDescription(
        title="Python Engineer",
        description="Python development",
        requirements=[
            JobRequirement(
                name="Python",
                description="Python programming",
                weight=100,
            )
        ],
    )

    result = rank_candidates([], job)

    assert result.job_title == "Python Engineer"
    assert result.candidates == []


def test_rank_candidates_preserves_candidate_evidence():
    job = JobDescription(
        title="Python Engineer",
        description="Python development",
        requirements=[
            JobRequirement(
                name="Python",
                description="Python programming",
                weight=100,
            )
        ],
    )

    resume = Resume(
        candidate=Candidate(name="Example Candidate"),
        skills=["Python"],
    )

    result = rank_candidates([resume], job)

    ranked_match = result.candidates[0].match
    assert ranked_match.overall_score == 100
    assert ranked_match.requirement_matches[0].evidence == [
        "Skill: Python"
    ]

