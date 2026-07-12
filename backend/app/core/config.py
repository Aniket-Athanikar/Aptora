"""
ExamForge AI — Core Configuration
Centralized, validated configuration using Pydantic Settings.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Application ──────────────────────────────
    ENV: str = Field(default="development")
    PORT: int = Field(default=8000)
    HOST: str = Field(default="0.0.0.0")
    PROJECT_NAME: str = Field(default="ExamForge-AI-Backend")
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")
    SECRET_KEY: str = Field(default="mysecretkey")
    DEBUG: bool = Field(default=True)

    # ── Database (PostgreSQL) ────────────────────
    DB_HOST: str = Field(default="127.0.0.1")
    DB_PORT: str = Field(default="5432")
    DB_NAME: str = Field(default="Exame_forgeDB")
    DB_USER: str = Field(default="aniket")
    DB_PASSWORD: str = Field(default="admin123")

    # ── Redis ────────────────────────────────────
    REDIS_HOST: str = Field(default="127.0.0.1")
    REDIS_PORT: int = Field(default=6379)

    # ── Qdrant Vector DB ─────────────────────────
    QDRANT_HOST: str = Field(default="127.0.0.1")
    QDRANT_PORT: int = Field(default=6333)

    # ── Email (SMTP) ─────────────────────────────
    MAIL_USERNAME: str = Field(default="")
    MAIL_PASSWORD: str = Field(default="")
    MAIL_FROM: str = Field(default="")
    MAIL_PORT: int = Field(default=587)
    MAIL_SERVER: str = Field(default="smtp.gmail.com")

    @property
    def origins_list(self) -> List[str]:
        """Parse comma-separated origins string into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def database_url(self) -> str:
        """Construct the PostgreSQL connection URL."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
