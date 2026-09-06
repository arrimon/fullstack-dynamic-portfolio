from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.contact_message import ContactMessage
from app.schemas.common import PaginatedResponse
from app.schemas.contact import ContactMessageRead, ContactMessageUpdate

router = APIRouter(prefix="/contact-messages", tags=["Admin"])


@router.get(
    "",
    response_model=PaginatedResponse[ContactMessageRead],
    summary="List contact messages",
)
def list_contact_messages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_read: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    base = select(ContactMessage)
    if is_read is not None:
        base = base.where(ContactMessage.is_read.is_(is_read))

    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    items = (
        db.scalars(
            base.order_by(ContactMessage.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .all()
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.patch(
    "/{message_id}",
    response_model=ContactMessageRead,
    summary="Mark a contact message as read/unread",
)
def update_contact_message(
    message_id: int,
    payload: ContactMessageUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found",
        )
    message.is_read = payload.is_read
    db.commit()
    db.refresh(message)
    return message


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a contact message",
)
def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found",
        )
    db.delete(message)
    db.commit()