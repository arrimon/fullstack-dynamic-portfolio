from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class CertificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    issuing_organization: str = Field(min_length=1, max_length=255)
    issue_date: date
    credential_url: str | None = Field(default=None, max_length=500)
    image_url: str | None = Field(default=None, max_length=500)


class CertificationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    issuing_organization: str | None = Field(default=None, min_length=1, max_length=255)
    issue_date: date | None = None
    credential_url: str | None = Field(default=None, max_length=500)
    image_url: str | None = Field(default=None, max_length=500)


class CertificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    issuing_organization: str
    issue_date: date
    credential_url: str | None = None
    image_url: str | None = None