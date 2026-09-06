from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.experience import Experience
from app.schemas.experience import ExperienceRead

router = APIRouter(prefix="/experience", tags=["Experience"])


@router.get(
    "",
    response_model=list[ExperienceRead],
    summary="List experience records",
)
def list_experience(db: Session = Depends(get_db)):
    return db.scalars(
        select(Experience).order_by(Experience.display_order, Experience.id)
    ).all()