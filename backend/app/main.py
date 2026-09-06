import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded

from app.api.router import api_router
from app.core.config import settings
from app.core.honeypot import HoneypotMiddleware
from app.core.logging import RequestLoggingMiddleware, configure_logging
from app.core.rate_limit import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.services.keep_alive import keep_alive_loop

logger = logging.getLogger("portfolio.app")

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    upload_dir = settings.upload_dir
    for folder in ("projects", "resumes", "technologies", "experience", "certifications"):
        os.makedirs(os.path.join(upload_dir, folder), exist_ok=True)
    logger.info("Portfolio API starting (env=%s)", settings.app_env)
    keep_alive_task = asyncio.create_task(keep_alive_loop())
    try:
        yield
    finally:
        keep_alive_task.cancel()
        try:
            await keep_alive_task
        except asyncio.CancelledError:
            pass
        logger.info("Portfolio API shutting down")


app = FastAPI(
    title=settings.app_name,
    description="Portfolio backend API with a secure admin panel.",
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.state.limiter = limiter

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(HoneypotMiddleware)


@app.exception_handler(RateLimitExceeded)
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(api_router)


@app.get("/", summary="Root endpoint", tags=["Meta"])
def root():
    return {"message": "Portfolio API is running"}


@app.get("/health", summary="Health check", tags=["Meta"])
def health():
    return {"status": "ok"}