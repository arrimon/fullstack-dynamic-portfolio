import enum

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TechnologyCategory(str, enum.Enum):
    frontend = "frontend"
    backend = "backend"
    database = "database"
    tools = "tools"


class Technology(Base):
    __tablename__ = "technologies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[TechnologyCategory] = mapped_column(
        Enum(TechnologyCategory, name="technology_category", native_enum=False)
    )
    display_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )

    projects: Mapped[list["Project"]] = relationship(
        secondary="project_technology",
        back_populates="technologies",
    )


from app.models.project import Project  # noqa: E402