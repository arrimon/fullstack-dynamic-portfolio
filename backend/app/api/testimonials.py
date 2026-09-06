from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialRead

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get(
    "",
    response_model=list[TestimonialRead],
    summary="List active testimonials",
)
def list_testimonials(db: Session = Depends(get_db)):
    return db.scalars(
        select(Testimonial)
        .where(Testimonial.is_active.is_(True))
        .order_by(Testimonial.display_order, Testimonial.id)
    ).all()