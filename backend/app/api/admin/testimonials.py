from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.testimonial import Testimonial
from app.schemas.common import ReorderRequest
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialRead,
    TestimonialUpdate,
)
from app.services import file_service
from app.services.reorder_service import apply_reorder

router = APIRouter(prefix="/testimonials", tags=["Admin"])


def _get_testimonial_or_404(db: Session, testimonial_id: int) -> Testimonial:
    testimonial = db.get(Testimonial, testimonial_id)
    if testimonial is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found",
        )
    return testimonial


@router.get(
    "",
    response_model=list[TestimonialRead],
    summary="List all testimonials",
)
def list_testimonials(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return db.scalars(
        select(Testimonial).order_by(Testimonial.display_order, Testimonial.id)
    ).all()


@router.put(
    "/reorder",
    response_model=list[TestimonialRead],
    summary="Bulk-reorder testimonials",
)
def reorder_testimonials(
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    apply_reorder(db, Testimonial, payload)
    return db.scalars(
        select(Testimonial).order_by(Testimonial.display_order, Testimonial.id)
    ).all()


@router.post(
    "",
    response_model=TestimonialRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a testimonial",
)
def create_testimonial(
    payload: TestimonialCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    testimonial = Testimonial(**payload.model_dump())
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.get(
    "/{testimonial_id}",
    response_model=TestimonialRead,
    summary="Get a testimonial",
)
def get_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return _get_testimonial_or_404(db, testimonial_id)


@router.put(
    "/{testimonial_id}",
    response_model=TestimonialRead,
    summary="Update a testimonial",
)
def update_testimonial(
    testimonial_id: int,
    payload: TestimonialUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    testimonial = _get_testimonial_or_404(db, testimonial_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(testimonial, field, value)
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.delete(
    "/{testimonial_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a testimonial",
)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    testimonial = _get_testimonial_or_404(db, testimonial_id)
    if testimonial.client_image:
        file_service.delete_file(testimonial.client_image)
    db.delete(testimonial)
    db.commit()


@router.post(
    "/{testimonial_id}/image",
    response_model=TestimonialRead,
    summary="Upload a testimonial client image",
)
async def upload_testimonial_image(
    testimonial_id: int,
    image: UploadFile,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    testimonial = _get_testimonial_or_404(db, testimonial_id)
    url = await file_service.save_image(image, "testimonials")
    if testimonial.client_image:
        file_service.delete_file(testimonial.client_image)
    testimonial.client_image = url
    db.commit()
    db.refresh(testimonial)
    return testimonial