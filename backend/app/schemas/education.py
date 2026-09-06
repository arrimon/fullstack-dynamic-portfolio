from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class EducationCreate(BaseModel):
    institution: str = Field(min_length=1, max_length=255)
    degree: str = Field(min_length=1, max_length=255)
    field_of_study: str | None = Field(default=None, max_length=255)
    start_date: date
    end_date: date | None = None
    grade: str | None = Field(default=None, max_length=100)
    description: str | None = None
    display_order: int = 0


class EducationUpdate(BaseModel):
    institution: str | None = Field(default=None, min_length=1, max_length=255)
    degree: str | None = Field(default=None, min_length=1, max_length=255)
    field_of_study: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    grade: str | None = Field(default=None, max_length=100)
    description: str | None = None
    display_order: int | None = None


class EducationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    institution: str
    degree: str
    field_of_study: str | None = None
    start_date: date
    end_date: date | None = None
    grade: str | None = None
    description: str | None = None
    display_order: int