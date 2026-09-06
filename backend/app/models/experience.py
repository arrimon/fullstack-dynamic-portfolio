import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EmploymentType(str, enum.Enum):
    full_time = "full-time"
    part_time = "part-time"
    freelance = "freelance"
    internship = "internship"


class Experience(Base):
    __tablename__ = "experience"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_name: Mapped[str] = mapped_column(String(255))
    company_logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    position: Mapped[str] = mapped_column(String(255))
    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType, name="employment_type", native_enum=False)
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )