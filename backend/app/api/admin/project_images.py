from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.project_image import ProjectImage
from app.schemas.project import ProjectImageRead
from app.services import file_service

router = APIRouter(tags=["Admin"])


@router.post(
    "/projects/{project_id}/images",
    response_model=list[ProjectImageRead],
    status_code=status.HTTP_201_CREATED,
    summary="Upload images for a project",
)
async def upload_project_images(
    project_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
    images: list[UploadFile] = File(...),
    alt_text: str | None = Form(default=None),
):
    from app.models.project import Project

    if db.get(Project, project_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    if not images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No images provided",
        )

    next_order = db.scalar(
        select(func.coalesce(func.max(ProjectImage.display_order), 0) + 1).where(
            ProjectImage.project_id == project_id
        )
    ) or 1

    created: list[ProjectImage] = []
    for index, image in enumerate(images):
        url = await file_service.save_image(image, "projects")
        record = ProjectImage(
            project_id=project_id,
            image_url=url,
            alt_text=alt_text,
            display_order=next_order + index,
        )
        db.add(record)
        created.append(record)

    db.commit()
    for record in created:
        db.refresh(record)
    return created


@router.delete(
    "/project-images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project image",
)
def delete_project_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    image = db.get(ProjectImage, image_id)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project image not found",
        )
    file_service.delete_file(image.image_url)
    db.delete(image)
    db.commit()