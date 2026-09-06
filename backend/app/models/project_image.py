from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectImage(Base):
    __tablename__ = "project_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500))
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )

    project: Mapped["Project"] = relationship(back_populates="images")


from app.models.project import Project  # noqa: E402