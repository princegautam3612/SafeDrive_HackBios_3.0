import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeDrive Kinetic Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "safedrive-super-secret-production-jwt-key-38910")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./safedrive.db")
    CORS_ORIGINS: list[str] = [
        "*",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://safepod.app",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
