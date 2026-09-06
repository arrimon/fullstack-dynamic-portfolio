from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactCreate
from app.services.email_service import send_contact_email

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post(
    "",
    status_code=201,
    summary="Submit a contact message",
    description="Saves the message and sends a Gmail notification to the site owner.",
)
@limiter.limit(settings.contact_rate_limit)
def submit_contact(
    request: Request,
    payload: ContactCreate,
    db: Session = Depends(get_db),
):
    if payload.website:
        return {"status": "ok", "message": "Message sent successfully"}

    client_ip = request.client.host if request.client else None
    message = ContactMessage(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        ip_address=client_ip,
    )
    db.add(message)
    db.commit()

    send_contact_email(payload.name, payload.email, payload.subject, payload.message)

    return {"status": "ok", "message": "Message sent successfully"}