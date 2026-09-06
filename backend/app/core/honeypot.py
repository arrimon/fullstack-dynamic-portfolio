import json
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("portfolio.honeypot")


class HoneypotMiddleware(BaseHTTPMiddleware):
    """Detects honeypot-filled submissions before the rate limiter runs.

    When the hidden ``website`` field is present in a POST to ``/api/contact``,
    we mark ``_rate_limiting_complete`` on the request state so slowapi skips
    its rate-limit check entirely — bots filling the honeypot never consume a
    real user's rate-limit slot.
    """

    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path == "/api/contact":
            try:
                body = await request.body()
                if body:
                    payload = json.loads(body)
                    if payload.get("website"):
                        request.state._rate_limiting_complete = True
                        request.state.view_rate_limit = None
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass
        return await call_next(request)
