from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.project import Project, ProjectStatus
from app.models.technology import Technology
from app.schemas.common import PaginatedResponse, ReorderRequest
from app.schemas.project import (
    ProjectAdminDetailResponse,
    ProjectAdminRead,
    ProjectCreate,
    ProjectUpdate,
)
from app.services.project_service import _unique_slug
from app.services.reorder_service import apply_reorder

router = APIRouter(prefix="/projects", tags=["Admin"])


def _get_project_or_404(db: Session, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def _set_technologies(db: Session, project: Project, technology_ids: list[int]) -> None:
    if not technology_ids:
        project.technologies = []
        return
    technologies = db.scalars(
        select(Technology).where(Technology.id.in_(technology_ids))
    ).all()
    if len(technologies) != len(set(technology_ids)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more technologies were not found",
        )
    project.technologies = list(technologies)


@router.post(
    "",
    response_model=ProjectAdminDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a project",
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    project = Project(
        title=payload.title,
        slug=_unique_slug(db, payload.title),
        short_description=payload.short_description,
        description=payload.description,
        thumbnail_url=payload.thumbnail_url,
        github_link=payload.github_link,
        live_link=payload.live_link,
        testing_email=payload.testing_email,
        testing_password=payload.testing_password,
        status=payload.status,
        is_featured=payload.is_featured,
        display_order=payload.display_order,
        meta_title=payload.meta_title,
        meta_description=payload.meta_description,
    )
    db.add(project)
    db.flush()
    _set_technologies(db, project, payload.technology_ids)
    db.commit()
    db.refresh(project)
    return project


@router.get(
    "",
    response_model=PaginatedResponse[ProjectAdminRead],
    summary="List all projects",
)
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: ProjectStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    base = select(Project)
    if status_filter is not None:
        base = base.where(Project.status == status_filter)

    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    items = (
        db.scalars(
            base.order_by(Project.display_order, Project.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
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


@router.put(
    "/reorder",
    response_model=list[ProjectAdminRead],
    summary="Bulk-reorder projects",
)
def reorder_projects(
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    apply_reorder(db, Project, payload)
    return db.scalars(
        select(Project)
        .order_by(Project.display_order, Project.id)
    ).all()


@router.get(
    "/{project_id}",
    response_model=ProjectAdminDetailResponse,
    summary="Get a project",
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return _get_project_or_404(db, project_id)


@router.put(
    "/{project_id}",
    response_model=ProjectAdminDetailResponse,
    summary="Update a project",
)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)

    data = payload.model_dump(exclude_unset=True)
    technology_ids = data.pop("technology_ids", None)

    if "title" in data and data["title"] != project.title:
        project.slug = _unique_slug(db, data["title"], exclude_id=project.id)

    for field, value in data.items():
        setattr(project, field, value)

    if technology_ids is not None:
        _set_technologies(db, project, technology_ids)

    db.commit()
    db.refresh(project)
    return project


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete a project",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    project.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.post(
    "/{project_id}/restore",
    response_model=ProjectAdminDetailResponse,
    summary="Restore a soft-deleted project",
)
def restore_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    project.deleted_at = None
    db.commit()
    db.refresh(project)
    return project