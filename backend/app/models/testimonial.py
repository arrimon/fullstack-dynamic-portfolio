from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Testimonial(Base):
    __tablename__ = "testimonials"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_name: Mapped[str] = mapped_column(String(255))
    client_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    review_text: Mapped[str] = mapped_column(Text)
    rating: Mapped[int] = mapped_column(
        Integer, default=5, server_default="5"
    )
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )