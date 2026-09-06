from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.site_setting import SiteSetting
from app.schemas.settings import SettingsUpdateRequest
from app.services.file_service import save_image

router = APIRouter(prefix="/settings", tags=["Admin"])

ALLOWED_IMAGE_KEYS = {"logo", "profile_picture"}


@router.put(
    "",
    response_model=dict[str, str],
    summary="Upsert site settings",
    description="Accepts a dictionary of key/value pairs. Existing keys are updated, "
    "new keys are created.",
)
def update_settings(
    payload: SettingsUpdateRequest,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    if not payload.settings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings provided",
        )
    for key, value in payload.settings.items():
        setting = db.scalar(select(SiteSetting).where(SiteSetting.key == key))
        if setting is None:
            setting = SiteSetting(key=key, value=value)
            db.add(setting)
        else:
            setting.value = value
    db.commit()
    return payload.settings


@router.post(
    "/upload-image",
    summary="Upload a site setting image (logo or profile picture)",
    description="Uploads an image and stores its URL under the given setting key "
    "(logo or profile_picture). Replaces any previously stored image.",
)
async def upload_setting_image(
    file: UploadFile = File(...),
    key: str = Form("logo"),
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    if key not in ALLOWED_IMAGE_KEYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid setting key. Allowed: logo, profile_picture.",
        )

    filename = await save_image(file, "settings")

    setting = db.scalar(select(SiteSetting).where(SiteSetting.key == key))
    if setting is None:
        setting = SiteSetting(key=key, value=filename)
        db.add(setting)
    else:
        setting.value = filename
    db.commit()

    return {"key": key, "url": filename, "filename": Path(filename).name}