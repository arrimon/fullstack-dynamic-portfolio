from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.technology import Technology
from app.schemas.common import ReorderRequest
from app.schemas.technology import (
    TechnologyCreate,
    TechnologyRead,
    TechnologyUpdate,
)
from app.services import file_service
from app.services.reorder_service import apply_reorder

router = APIRouter(prefix="/technologies", tags=["Admin"])


def _get_technology_or_404(db: Session, technology_id: int) -> Technology:
    technology = db.get(Technology, technology_id)
    if technology is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found",
        )
    return technology


@router.get(
    "",
    response_model=list[TechnologyRead],
    summary="List technologies",
)
def list_technologies(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(
        select(Technology).order_by(Technology.display_order, Technology.name)
    ).all()


@router.put(
    "/reorder",
    response_model=list[TechnologyRead],
    summary="Bulk-reorder technologies",
)
def reorder_technologies(
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    apply_reorder(db, Technology, payload)
    return db.scalars(
        select(Technology).order_by(Technology.display_order, Technology.name)
    ).all()


@router.post(
    "",
    response_model=TechnologyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a technology",
)
def create_technology(
    payload: TechnologyCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    if db.scalar(select(Technology).where(Technology.name == payload.name)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Technology already exists",
        )
    technology = Technology(**payload.model_dump())
    db.add(technology)
    db.commit()
    db.refresh(technology)
    return technology


@router.put(
    "/{technology_id}",
    response_model=TechnologyRead,
    summary="Update a technology",
)
def update_technology(
    technology_id: int,
    payload: TechnologyUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    technology = _get_technology_or_404(db, technology_id)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        existing = db.scalar(
            select(Technology).where(
                Technology.name == data["name"], Technology.id != technology_id
            )
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Technology already exists",
            )
    for field, value in data.items():
        setattr(technology, field, value)
    db.commit()
    db.refresh(technology)
    return technology


@router.delete(
    "/{technology_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a technology",
)
def delete_technology(
    technology_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    technology = _get_technology_or_404(db, technology_id)
    db.delete(technology)
    db.commit()


@router.post(
    "/{technology_id}/icon",
    response_model=TechnologyRead,
    summary="Upload a technology icon",
)
async def upload_technology_icon(
    technology_id: int,
    icon: UploadFile,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    technology = _get_technology_or_404(db, technology_id)
    url = await file_service.save_image(icon, "technologies")
    technology.icon_url = url
    db.commit()
    db.refresh(technology)
    return technology