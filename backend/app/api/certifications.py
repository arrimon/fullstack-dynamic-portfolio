from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.certification import Certification
from app.schemas.certification import CertificationRead

router = APIRouter(prefix="/certifications", tags=["Certifications"])


@router.get(
    "",
    response_model=list[CertificationRead],
    summary="List certifications",
)
def list_certifications(db: Session = Depends(get_db)):
    return db.scalars(
        select(Certification).order_by(Certification.issue_date.desc(), Certification.id)
    ).all()