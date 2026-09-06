import logging
import logging.config
import sys
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings

LOGGING_CONFIG: dict = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S%z",
        },
        "access": {
            "format": "%(asctime)s | %(levelname)-8s | %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S%z",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
        },
        "access": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "access",
        },
    },
    "loggers": {
        "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
        "portfolio": {"handlers": ["console"], "level": "DEBUG" if settings.debug else "INFO", "propagate": False},
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}


def configure_logging() -> None:
    logging.config.dictConfig(LOGGING_CONFIG)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs each request with method, status, and duration."""

    def __init__(self, app) -> None:
        super().__init__(app)
        self.logger = logging.getLogger("portfolio.access")

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        self.logger.info(
            "%s %s -> %s  %.1fms",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response