from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.education import Education
from app.schemas.education import EducationRead

router = APIRouter(prefix="/education", tags=["Education"])


@router.get(
    "",
    response_model=list[EducationRead],
    summary="List education records",
)
def list_education(db: Session = Depends(get_db)):
    return db.scalars(
        select(Education).order_by(Education.display_order, Education.id)
    ).all()