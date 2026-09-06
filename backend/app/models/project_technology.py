from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint

from app.core.database import Base

project_technology = Table(
    "project_technology",
    Base.metadata,
    Column("project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
    UniqueConstraint("project_id", "technology_id", name="uq_project_technology"),
)