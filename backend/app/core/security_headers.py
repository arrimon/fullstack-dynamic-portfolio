from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds sensible security response headers to every request.

    These headers mitigate common web attacks (MIME sniffing, clickjacking,
    drive-by script execution) and are expected by security scanners.
    """

    def __init__(self, app) -> None:
        super().__init__(app)
        self.headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-XSS-Protection": "0",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-origin",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "base-uri 'self'; "
                "img-src 'self' data: https:; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; "
                "connect-src 'self' https://cdn.jsdelivr.net; "
                "object-src 'none'; "
                "frame-ancestors 'none'"
            ),
            "Permissions-Policy": (
                "camera=(), microphone=(), geolocation=(), browsing-topics=()"
            ),
        }

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for name, value in self.headers.items():
            if name not in response.headers:
                response.headers[name] = value
        return response