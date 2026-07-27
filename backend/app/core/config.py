"""
ExamForge AI — Core Configuration

Centralized application configuration
using Pydantic Settings.
"""

from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from .env
    """

    # ======================================================
    # Application
    # ======================================================

    ENV: str = Field(default="development")

    PORT: int = Field(default=8000)

    HOST: str = Field(default="0.0.0.0")

    PROJECT_NAME: str = Field(
        default="ExamForge-AI-Backend"
    )

    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000"
    )

    SECRET_KEY: str = Field(
        default="mysecretkey"
    )

    DEBUG: bool = Field(
        default=True
    )


    # ======================================================
    # PostgreSQL
    # ======================================================

    DB_HOST: str = "127.0.0.1"

    DB_PORT: str = "5432"

    DB_NAME: str = "Exame_forgeDB"

    DB_USER: str = "aniket"

    DB_PASSWORD: str = "admin123"



    # ======================================================
    # Redis
    # ======================================================

    REDIS_HOST: str = "127.0.0.1"

    REDIS_PORT: int = 6379



    # ======================================================
    # Qdrant
    # ======================================================

    QDRANT_HOST: str = "127.0.0.1"

    QDRANT_PORT: int = 6333

    QDRANT_COLLECTION: str = (
        "examforge_resources"
    )


    # ======================================================
    # Ollama / AI Models
    # ======================================================

    OLLAMA_HOST: str = (
        "http://localhost:11434"
    )


    LLM_MODEL: str = (
        "qwen3:4b"
    )


    EMBEDDING_MODEL: str = (
        "nomic-embed-text"
    )


    EMBEDDING_DIMENSION: int = 768



    # ======================================================
    # Email
    # ======================================================

    MAIL_USERNAME: str = ""

    MAIL_PASSWORD: str = ""

    MAIL_FROM: str = ""

    MAIL_PORT: int = 587

    MAIL_SERVER: str = (
        "smtp.gmail.com"
    )



    # ======================================================
    # Helpers
    # ======================================================

    @property
    def origins_list(self) -> List[str]:

        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


    @property
    def database_url(self) -> str:

        return (
            f"postgresql://"
            f"{self.DB_USER}:"
            f"{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:"
            f"{self.DB_PORT}/"
            f"{self.DB_NAME}"
        )



    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# ======================================================
# Singleton
# ======================================================

settings = Settings()


# Backward compatibility imports
EMBEDDING_MODEL = settings.EMBEDDING_MODEL

EMBEDDING_DIMENSION = settings.EMBEDDING_DIMENSION

QDRANT_COLLECTION = settings.QDRANT_COLLECTION

LLM_MODEL = settings.LLM_MODEL