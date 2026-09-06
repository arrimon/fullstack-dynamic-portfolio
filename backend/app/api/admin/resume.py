from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.resume import Resume
from app.schemas.resume import ResumeRead
from app.services import file_service

router = APIRouter(prefix="/resume", tags=["Admin"])


@router.post(
    "",
    response_model=ResumeRead,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new resume",
    description="Uploading a new resume deactivates the previously active resume.",
)
async def upload_resume(
    file: UploadFile,
    version_label: str | None = Form(default=None),
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    url = await file_service.save_resume(file, "resumes")

    db.execute(update(Resume).values(is_active=False))

    resume = Resume(
        file_url=url,
        version_label=version_label,
        is_active=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume