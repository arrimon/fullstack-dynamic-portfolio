from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EmploymentType(str, Enum):
    full_time = "full-time"
    part_time = "part-time"
    freelance = "freelance"
    internship = "internship"


class ExperienceCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    company_logo: str | None = Field(default=None, max_length=500)
    position: str = Field(min_length=1, max_length=255)
    employment_type: EmploymentType
    location: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=1)
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    display_order: int = 0

    @model_validator(mode="after")
    def validate_dates(self) -> "ExperienceCreate":
        if self.is_current:
            self.end_date = None
        return self


class ExperienceUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    company_logo: str | None = Field(default=None, max_length=500)
    position: str | None = Field(default=None, min_length=1, max_length=255)
    employment_type: EmploymentType | None = None
    location: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    display_order: int | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "ExperienceUpdate":
        if self.is_current:
            self.end_date = None
        return self


class ExperienceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    company_logo: str | None = None
    position: str
    employment_type: EmploymentType
    location: str | None = None
    description: str
    start_date: date
    end_date: date | None = None
    is_current: bool
    display_order: int