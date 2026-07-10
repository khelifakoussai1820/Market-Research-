import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Market Research API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list[str] = ["*"]  # For development, change in production
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
