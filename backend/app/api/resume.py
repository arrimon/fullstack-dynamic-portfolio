from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.resume import Resume
from app.schemas.resume import ResumeRead

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.get(
    "",
    response_model=ResumeRead,
    summary="Get the active resume",
)
def get_active_resume(db: Session = Depends(get_db)):
    resume = db.scalar(select(Resume).where(Resume.is_active.is_(True)))
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active resume available",
        )
    return resume