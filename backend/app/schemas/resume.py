from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_url: str
    version_label: str | None = None
    is_active: bool
    uploaded_at: datetime