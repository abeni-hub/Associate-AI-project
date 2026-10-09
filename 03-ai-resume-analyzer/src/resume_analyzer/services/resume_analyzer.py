from resume_analyzer.models.analysis import (
    CandidateRanking,
    JobDescription,
    RankedCandidate,
)
from resume_analyzer.models.resume import Resume
from resume_analyzer.services.scoring import score_candidate


def rank_candidates(
    resumes: list[Resume],
    job: JobDescription,
) -> CandidateRanking:
    """Score and rank resumes against one job description."""

    scored_candidates = [
        score_candidate(resume, job)
        for resume in resumes
    ]

    # Higher scores rank first. Original input order breaks ties
    # deterministically so repeated requests produce stable results.
    scored_candidates.sort(
        key=lambda match: match.overall_score,
        reverse=True,
    )

    ranked_candidates: list[RankedCandidate] = []
    previous_score: float | None = None
    current_rank = 0

    for index, match in enumerate(scored_candidates, start=1):
        if (
            previous_score is None
            or match.overall_score != previous_score
        ):
            current_rank = index

        ranked_candidates.append(
            RankedCandidate(
                rank=current_rank,
                match=match,
            )
        )
        previous_score = match.overall_score

    return CandidateRanking(
        job_title=job.title,
        candidates=ranked_candidates,
    )

