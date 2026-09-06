from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project, ProjectStatus
from app.models.technology import Technology
from app.schemas.common import PaginatedResponse
from app.schemas.project import ProjectDetailResponse, ProjectListResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=PaginatedResponse[ProjectListResponse],
    summary="List published projects",
)
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    featured: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    base = select(Project).where(
        Project.status == ProjectStatus.published,
        Project.deleted_at.is_(None),
    )
    if featured is not None:
        base = base.where(Project.is_featured.is_(featured))

    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    items = (
        db.scalars(
            base.order_by(Project.display_order, Project.id).offset(
                (page - 1) * page_size
            ).limit(page_size)
        )
        .all()
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get(
    "/{slug}",
    response_model=ProjectDetailResponse,
    summary="Get a published project by slug",
)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    project = db.scalar(
        select(Project).where(
            Project.slug == slug,
            Project.status == ProjectStatus.published,
            Project.deleted_at.is_(None),
        )
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    project.technologies = [
        t for t in project.technologies if t.is_active
    ]
    return project