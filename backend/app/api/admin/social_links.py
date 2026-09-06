from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.social_link import SocialLink
from app.schemas.social import SocialLinkCreate, SocialLinkRead, SocialLinkUpdate

router = APIRouter(prefix="/social-links", tags=["Admin"])


def _get_social_link_or_404(db: Session, link_id: int) -> SocialLink:
    link = db.get(SocialLink, link_id)
    if link is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Social link not found",
        )
    return link


@router.get(
    "",
    response_model=list[SocialLinkRead],
    summary="List social links",
)
def list_social_links(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(select(SocialLink).order_by(SocialLink.id)).all()


@router.post(
    "",
    response_model=SocialLinkRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a social link",
)
def create_social_link(
    payload: SocialLinkCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    link = SocialLink(**payload.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


@router.put(
    "/{link_id}",
    response_model=SocialLinkRead,
    summary="Update a social link",
)
def update_social_link(
    link_id: int,
    payload: SocialLinkUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    link = _get_social_link_or_404(db, link_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    db.commit()
    db.refresh(link)
    return link


@router.delete(
    "/{link_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a social link",
)
def delete_social_link(
    link_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    link = _get_social_link_or_404(db, link_id)
    db.delete(link)
    db.commit()