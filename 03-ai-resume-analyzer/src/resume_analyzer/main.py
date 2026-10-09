from fastapi import FastAPI

from resume_analyzer.api.routes import router as resume_router

app = FastAPI(
    title="AI Resume Analyzer",
    description=(
        "Extract structured candidate information "
        "from PDF resumes using AI."
    ),
    version="0.1.0",
)

app.include_router(resume_router)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Check whether the API process is running."""
    return {"status": "ok"}

