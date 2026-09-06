from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Education(Base):
    __tablename__ = "education"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution: Mapped[str] = mapped_column(String(255))
    degree: Mapped[str] = mapped_column(String(255))
    field_of_study: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    grade: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )