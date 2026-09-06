from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.social_link import SocialLink
from app.schemas.social import SocialLinkRead

router = APIRouter(prefix="/social-links", tags=["Social Links"])


@router.get(
    "",
    response_model=list[SocialLinkRead],
    summary="List social links",
)
def list_social_links(db: Session = Depends(get_db)):
    return db.scalars(select(SocialLink).order_by(SocialLink.id)).all()