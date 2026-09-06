from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.certification import Certification
from app.schemas.certification import (
    CertificationCreate,
    CertificationRead,
    CertificationUpdate,
)

router = APIRouter(prefix="/certifications", tags=["Admin"])


def _get_certification_or_404(db: Session, certification_id: int) -> Certification:
    certification = db.get(Certification, certification_id)
    if certification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )
    return certification


@router.get(
    "",
    response_model=list[CertificationRead],
    summary="List all certifications",
)
def list_certifications(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(
        select(Certification).order_by(Certification.issue_date.desc(), Certification.id)
    ).all()


@router.post(
    "",
    response_model=CertificationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a certification",
)
def create_certification(
    payload: CertificationCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    certification = Certification(**payload.model_dump())
    db.add(certification)
    db.commit()
    db.refresh(certification)
    return certification


@router.put(
    "/{certification_id}",
    response_model=CertificationRead,
    summary="Update a certification",
)
def update_certification(
    certification_id: int,
    payload: CertificationUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    certification = _get_certification_or_404(db, certification_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(certification, field, value)
    db.commit()
    db.refresh(certification)
    return certification


@router.delete(
    "/{certification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a certification",
)
def delete_certification(
    certification_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    certification = _get_certification_or_404(db, certification_id)
    db.delete(certification)
    db.commit()