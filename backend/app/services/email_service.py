import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def _format_message(name: str, email: str, subject: str | None, message: str) -> str:
    return (
        f"New contact form submission\n"
        f"{'=' * 40}\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Subject: {subject or '(no subject)'}\n"
        f"Submitted at: {datetime.now().isoformat()}\n\n"
        f"Message:\n{message}"
    )


def send_contact_email(
    name: str, email: str, subject: str | None, message: str
) -> None:
    if not settings.mail_username or not settings.mail_password:
        logger.warning("SMTP credentials not configured; skipping email notification")
        return

    sender = settings.mail_from or settings.mail_username
    recipient = settings.mail_to or settings.mail_username

    msg = MIMEMultipart()
    msg["From"] = f"{name} <{sender}>"
    msg["To"] = recipient
    msg["Subject"] = f"Portfolio contact: {subject or 'New message'}"

    body = _format_message(name, email, subject, message)
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.mail_host, settings.mail_port, timeout=15) as server:
            if settings.mail_tls:
                server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(sender, [recipient], msg.as_string())
    except Exception:
        logger.exception("Failed to send contact notification email")