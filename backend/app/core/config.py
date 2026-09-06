from functools import lru_cache
from secrets import token_urlsafe

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_JWT_PLACEHOLDER = "change-this-in-production-please-use-a-long-random-secret"


class Settings(BaseSettings):
    app_name: str = "Portfolio API"
    app_env: str = "development"
    debug: bool = True

    # Credentials are NEVER hardcoded here. They must be provided through a
    # `.env` file or environment variables at runtime. An empty value raises a
    # clear error on startup instead of silently connecting to a default host.
    database_url: str = ""

    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    mail_host: str = "smtp.gmail.com"
    mail_port: int = 587
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_to: str = ""
    mail_tls: bool = True

    upload_dir: str = "uploads"
    max_image_size_mb: int = 5
    max_resume_size_mb: int = 5

    admin_name: str = "Admin"
    admin_email: str = "admin@example.com"
    admin_password: str = ""

    contact_rate_limit: str = "1/minute"

    storage_driver: str = "local"

    keep_alive_enabled: bool = False
    keep_alive_url: str = "https://fullstack-dynamic-portfolio-tai9.onrender.com/health"
    keep_alive_interval: int = 300
    keep_alive_timeout: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def _validate_database_url(cls, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise ValueError(
                "DATABASE_URL is not set. Configure it in your .env file or environment "
                "(e.g. DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname)."
            )
        return value

    @field_validator("jwt_secret_key", mode="before")
    @classmethod
    def _validate_jwt_secret(cls, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise ValueError(
                "JWT_SECRET_KEY is not set. Generate a strong secret and set it in your "
                ".env file (e.g. python -c \"import secrets; print(secrets.token_urlsafe(64))\")."
            )
        if value == DEV_JWT_PLACEHOLDER:
            raise ValueError(
                "JWT_SECRET_KEY still uses the insecure placeholder value. Generate a "
                "strong random secret before running the server."
            )
        return value

    @model_validator(mode="after")
    def _validate_non_debug_secrets(self) -> "Settings":
        if self.app_env.lower() != "production":
            return self
        if self.mail_username and not self.mail_password:
            raise ValueError("MAIL_PASSWORD is required when MAIL_USERNAME is set.")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_image_size_bytes(self) -> int:
        return self.max_image_size_mb * 1024 * 1024

    @property
    def max_resume_size_bytes(self) -> int:
        return self.max_resume_size_mb * 1024 * 1024

    @classmethod
    def generate_secret(cls) -> str:
        """Helper to produce a strong JWT secret for .env files."""
        return token_urlsafe(64)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()