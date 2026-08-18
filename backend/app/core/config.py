"""
ExamForge AI — Core Configuration

Centralized application configuration using Pydantic Settings.
Includes centralized OpenAI model configuration.
"""

import os
import logging
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


def is_running_in_docker() -> bool:
    """
    Returns True if executing inside a Docker container, False if running on local host OS.
    Checks:
    1. Presence of /.dockerenv file
    2. RUNNING_IN_DOCKER / DOCKER_CONTAINER environment variables
    3. Linux /proc/1/cgroup containing 'docker', 'kubepods', or 'containerd'
    """
    if os.path.exists("/.dockerenv"):
        return True
    if os.getenv("RUNNING_IN_DOCKER", "").lower() in ("true", "1", "yes"):
        return True
    if os.getenv("DOCKER_CONTAINER", "").lower() in ("true", "1", "yes"):
        return True
    try:
        if os.path.exists("/proc/1/cgroup"):
            with open("/proc/1/cgroup", "r") as f:
                content = f.read()
                if "docker" in content or "kubepods" in content or "containerd" in content:
                    return True
    except Exception:
        pass
    return False


class Settings(BaseSettings):
    """
    Application settings loaded from .env with dynamic Docker/Local host resolution.
    """

    # ======================================================
    # Environment Runtime Detection
    # ======================================================

    RUNNING_IN_DOCKER: bool = Field(default_factory=is_running_in_docker)

    # ======================================================
    # Application
    # ======================================================

    ENV: str = Field(default="development")

    PORT: int = Field(default=8000)

    HOST: str = Field(default="0.0.0.0")

    PROJECT_NAME: str = Field(default="ExamForge-AI-Backend")

    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000")

    SECRET_KEY: str = Field(default="mysecretkey")

    DEBUG: bool = Field(default=True)

    # ======================================================
    # Authentication & Security
    # ======================================================

    AUTH_MODE: str = Field(default="passwordless")  # 'password' or 'passwordless'
    JWT_SECRET_KEY: str = Field(default="examforge-jwt-secret-key-change-in-prod")
    JWT_REFRESH_SECRET_KEY: str = Field(default="examforge-jwt-refresh-secret-key-change-in-prod")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24)  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30)
    OTP_EXPIRE_MINUTES: int = Field(default=5)
    OTP_MAX_ATTEMPTS: int = Field(default=5)
    OTP_COOLDOWN_SECONDS: int = Field(default=60)


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

    # One canonical collection for both indexing and retrieval.
    QDRANT_COLLECTION: str = "examforge_documents"

    # ======================================================
    # OpenAI / AI Models
    # ======================================================

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4.1-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    AI_CHAT_CONTEXT_TOKENS: int = 1000
    AI_CHAT_HISTORY_TOKENS: int = 200
    AI_CHAT_OUTPUT_TOKENS: int = 900

    # Kept at 768 so existing Qdrant collection dimensions remain compatible.
    EMBEDDING_DIMENSION: int = 768

    # ======================================================
    # Email
    # ======================================================

    MAIL_USERNAME: str = ""

    MAIL_PASSWORD: str = ""

    MAIL_FROM: str = ""

    MAIL_PORT: int = 587

    MAIL_SERVER: str = "smtp.gmail.com"

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
# Singleton Instance
# ======================================================

settings = Settings()


# Backward compatibility imports
EMBEDDING_MODEL = settings.OPENAI_EMBEDDING_MODEL
EMBEDDING_DIMENSION = settings.EMBEDDING_DIMENSION
QDRANT_COLLECTION = settings.QDRANT_COLLECTION
LLM_MODEL = settings.OPENAI_MODEL
