from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.site_setting import SiteSetting
from app.schemas.settings import SettingRead

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get(
    "",
    response_model=list[SettingRead],
    summary="Get public site settings",
)
def get_settings(db: Session = Depends(get_db)):
    return db.scalars(select(SiteSetting).order_by(SiteSetting.id)).all()