from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.experience import Experience
from app.schemas.common import ReorderRequest
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceRead,
    ExperienceUpdate,
)
from app.services.reorder_service import apply_reorder

router = APIRouter(prefix="/experience", tags=["Admin"])


def _get_experience_or_404(db: Session, experience_id: int) -> Experience:
    experience = db.get(Experience, experience_id)
    if experience is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
    return experience


@router.get(
    "",
    response_model=list[ExperienceRead],
    summary="List all experience records",
)
def list_experience(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(
        select(Experience).order_by(Experience.display_order, Experience.id)
    ).all()


@router.put(
    "/reorder",
    response_model=list[ExperienceRead],
    summary="Bulk-reorder experience records",
)
def reorder_experience(
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    apply_reorder(db, Experience, payload)
    return db.scalars(
        select(Experience).order_by(Experience.display_order, Experience.id)
    ).all()


@router.post(
    "",
    response_model=ExperienceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an experience record",
)
def create_experience(
    payload: ExperienceCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    experience = Experience(**payload.model_dump())
    db.add(experience)
    db.commit()
    db.refresh(experience)
    return experience


@router.put(
    "/{experience_id}",
    response_model=ExperienceRead,
    summary="Update an experience record",
)
def update_experience(
    experience_id: int,
    payload: ExperienceUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    experience = _get_experience_or_404(db, experience_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(experience, field, value)
    db.commit()
    db.refresh(experience)
    return experience


@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an experience record",
)
def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    experience = _get_experience_or_404(db, experience_id)
    db.delete(experience)
    db.commit()