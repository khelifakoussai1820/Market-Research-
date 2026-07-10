from fastapi import FastAPI

from app.api.v1 import (
    brands_router,
    chat_router,
    competitors_router,
    decisions_router,
    forms_router,
    responses_router,
    uploads_router,
)


def create_app() -> FastAPI:
    app = FastAPI(title="BrandOS API")
    app.include_router(brands_router, prefix="/api/v1")
    app.include_router(forms_router, prefix="/api/v1")
    app.include_router(responses_router, prefix="/api/v1")
    app.include_router(competitors_router, prefix="/api/v1")
    app.include_router(decisions_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(uploads_router, prefix="/api/v1")
    return app


app = create_app()
