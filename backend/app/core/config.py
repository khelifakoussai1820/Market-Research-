import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Market Research API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Tavily
    TAVILY_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = "changeme-super-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # ChromaDB
    CHROMA_DB_PATH: str = "./chroma_db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
