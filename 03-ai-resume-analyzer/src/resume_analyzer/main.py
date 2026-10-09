
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

app.openapi_version = "3.0.3"

app.include_router(resume_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    from fastapi.openapi.utils import get_openapi

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        openapi_version=app.openapi_version,
    )

    schemas = openapi_schema.get("components", {}).get("schemas", {})

    rank_body = schemas.get(
        "Body_rank_resume_uploads_api_v1_resumes_rank_post"
    )

    if rank_body:
        properties = rank_body.get("properties", {})
        files_schema = properties.get("files")

        if files_schema:
            files_schema["items"] = {
                "type": "string",
                "format": "binary",
            }

        analyze_body = schemas.get(
            "Body_analyze_resume_api_v1_resumes_analyze_post"
        )
        if analyze_body:
            file_schema = analyze_body.get("properties", {}).get("file")
            if file_schema:
                file_schema["format"] = "binary"

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Check whether the API process is running."""
    return {"status": "ok"}