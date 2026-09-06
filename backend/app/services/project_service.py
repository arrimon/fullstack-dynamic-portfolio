from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.utils.slugify import slugify


def _unique_slug(db: Session, title: str, exclude_id: int | None = None) -> str:
    base = slugify(title)
    candidate = base
    counter = 2
    while True:
        query = select(Project.id).where(Project.slug == candidate)
        if exclude_id is not None:
            query = query.where(Project.id != exclude_id)
        if db.scalar(query) is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1