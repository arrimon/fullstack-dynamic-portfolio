from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SocialLink(Base):
    __tablename__ = "social_links"

    id: Mapped[int] = mapped_column(primary_key=True)
    platform: Mapped[str] = mapped_column(String(100))
    url: Mapped[str] = mapped_column(String(500))
    icon: Mapped[str | None] = mapped_column(String(255), nullable=True)