import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    short_description: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    live_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    testing_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    testing_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status", native_enum=False),
        default=ProjectStatus.draft,
        index=True,
    )
    is_featured: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", index=True
    )
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", index=True
    )
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    images: Mapped[list["ProjectImage"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectImage.display_order",
    )
    technologies: Mapped[list["Technology"]] = relationship(
        secondary="project_technology",
        back_populates="projects",
        order_by="Technology.name",
    )


from app.models.project_image import ProjectImage  # noqa: E402
from app.models.technology import Technology  # noqa: E402