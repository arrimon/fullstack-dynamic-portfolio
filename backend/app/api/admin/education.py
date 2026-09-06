from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.education import Education
from app.schemas.common import ReorderRequest
from app.schemas.education import EducationCreate, EducationRead, EducationUpdate
from app.services.reorder_service import apply_reorder

router = APIRouter(prefix="/education", tags=["Admin"])


def _get_education_or_404(db: Session, education_id: int) -> Education:
    education = db.get(Education, education_id)
    if education is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education not found",
        )
    return education


@router.get(
    "",
    response_model=list[EducationRead],
    summary="List all education records",
)
def list_education(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(
        select(Education).order_by(Education.display_order, Education.id)
    ).all()


@router.put(
    "/reorder",
    response_model=list[EducationRead],
    summary="Bulk-reorder education records",
)
def reorder_education(
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    apply_reorder(db, Education, payload)
    return db.scalars(
        select(Education).order_by(Education.display_order, Education.id)
    ).all()


@router.post(
    "",
    response_model=EducationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an education record",
)
def create_education(
    payload: EducationCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    education = Education(**payload.model_dump())
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@router.put(
    "/{education_id}",
    response_model=EducationRead,
    summary="Update an education record",
)
def update_education(
    education_id: int,
    payload: EducationUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    education = _get_education_or_404(db, education_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(education, field, value)
    db.commit()
    db.refresh(education)
    return education


@router.delete(
    "/{education_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an education record",
)
def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    education = _get_education_or_404(db, education_id)
    db.delete(education)
    db.commit()