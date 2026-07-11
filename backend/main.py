from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import (
    auth_router,
    brands_router,
    chat_router,
    responses_router,
    refresh_router,
)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix=settings.API_V1_STR)
    app.include_router(brands_router, prefix=settings.API_V1_STR)
    app.include_router(responses_router, prefix=settings.API_V1_STR)
    app.include_router(chat_router, prefix=settings.API_V1_STR)
    app.include_router(refresh_router, prefix=settings.API_V1_STR)
    return app


app = create_app()
