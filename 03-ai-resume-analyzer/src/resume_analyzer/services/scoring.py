import re

from resume_analyzer.models.analysis import (
    CandidateMatch,
    JobDescription,
    RequirementMatch,
)
from resume_analyzer.models.resume import Resume


def normalize_text(value: str) -> str:
    """Normalize text for straightforward, case-insensitive matching."""
    value = value.casefold()
    value = re.sub(r"[^a-z0-9+#.]+", " ", value)
    return " ".join(value.split())


def build_resume_evidence(resume: Resume) -> list[str]:
    """Collect relevant text from a resume without inventing facts."""
    evidence: list[str] = []

    evidence.extend(f"Skill: {skill}" for skill in resume.skills)

    if resume.professional_summary:
        evidence.append(
            f"Professional summary: {resume.professional_summary}"
        )

    for experience in resume.work_experience:
        if experience.job_title:
            evidence.append(f"Job title: {experience.job_title}")

        if experience.company:
            evidence.append(f"Company: {experience.company}")

        evidence.extend(
            f"Responsibility: {item}"
            for item in experience.responsibilities
        )
        evidence.extend(
            f"Achievement: {item}"
            for item in experience.achievements
        )

    for project in resume.projects:
        if project.name:
            evidence.append(f"Project: {project.name}")

        if project.description:
            evidence.append(f"Project description: {project.description}")

        evidence.extend(
            f"Project technology: {technology}"
            for technology in project.technologies
        )

    return evidence


def score_requirement(
    requirement_name: str,
    requirement_description: str,
    required: bool,
    weight: float,
    resume_evidence: list[str],
) -> RequirementMatch:
    """Score one requirement using transparent phrase matching."""
    requirement_terms = {
        normalize_text(term)
        for term in (requirement_name, requirement_description)
        if normalize_text(term)
    }

    matched_evidence: list[str] = []

    for item in resume_evidence:
        normalized_item = normalize_text(item)

        if any(
            re.search(
                rf"(?<![a-z0-9+#.]){re.escape(term)}(?![a-z0-9+#.])",
                normalized_item,
            )
            for term in requirement_terms
        ):
            matched_evidence.append(item)

    if matched_evidence:
        score = 100.0
        status = "supported"
        explanation = (
            "The resume contains text matching the requirement. "
            "Review the evidence to confirm its relevance and depth."
        )
    else:
        score = 0.0
        status = "not_established"
        explanation = (
            "The resume did not contain a direct phrase match. "
            "This does not establish that the candidate lacks the skill "
            "or experience."
        )

    return RequirementMatch(
        requirement_name=requirement_name,
        required=required,
        weight=weight,
        score=score,
        evidence=matched_evidence,
        explanation=explanation,
        evidence_status=status,
    )


def score_candidate(
    resume: Resume,
    job: JobDescription,
) -> CandidateMatch:
    """Calculate a weighted match score for one resume and one job."""
    resume_evidence = build_resume_evidence(resume)

    requirement_matches = [
        score_requirement(
            requirement_name=requirement.name,
            requirement_description=requirement.description,
            required=requirement.required,
            weight=requirement.weight,
            resume_evidence=resume_evidence,
        )
        for requirement in job.requirements
    ]

    overall_score = sum(
        match.score * match.weight / 100
        for match in requirement_matches
    )

    candidate_name = resume.candidate.name

    supported = sum(
        match.evidence_status == "supported"
        for match in requirement_matches
    )
    total = len(requirement_matches)

    summary = (
        f"Direct phrase matches were found for {supported} of "
        f"{total} job requirements. The weighted score is "
        f"{overall_score:.1f}/100. This is a preliminary screening "
        f"signal, not a hiring recommendation."
    )

    limitations = [
        "Phrase matching can miss synonyms and equivalent experience.",
        "A phrase match does not verify proficiency or achievement.",
        "A missing phrase does not prove the candidate lacks a skill.",
        "A human reviewer must assess the evidence and job relevance.",
    ]

    return CandidateMatch(
        candidate_name=candidate_name,
        overall_score=round(overall_score, 2),
        meets_minimum_score=overall_score >= job.minimum_score,
        requirement_matches=requirement_matches,
        summary=summary,
        limitations=limitations,
    )

