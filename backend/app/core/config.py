"""
Centralized application configuration.

All settings are loaded from environment variables (see .env.example).
Never hardcode secrets here — this file only defines shape and defaults.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ---- Application ----
    APP_NAME: str = "Enterprise HR Portal API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ---- Security ----
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- Database ----
    DATABASE_URL: str
    POSTGRES_USER: str = "hrms_user"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "hrms_db"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    # ---- Redis ----
    REDIS_URL: str = "redis://redis:6379/0"

    # ---- CORS ----
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # ---- Auth / MFA / Brute-force protection ----
    MFA_ISSUER_NAME: str = "Enterprise HR Portal"
    LOGIN_MAX_FAILED_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15
    CAPTCHA_AFTER_ATTEMPTS: int = 3

    # ---- Email ----
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "Enterprise HR Portal <no-reply@example.com>"

    # ---- File uploads (Section 5.2: Documents) ----
    UPLOAD_ROOT: str = "/app/uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB, matches Section 7's validation cap
    ALLOWED_UPLOAD_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
    ]

    # ---- Data backups (System Admin "reset all data" tool) ----
    BACKUP_ROOT: str = "/app/backups"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — import this, not Settings() directly."""
    return Settings()


settings = get_settings()
