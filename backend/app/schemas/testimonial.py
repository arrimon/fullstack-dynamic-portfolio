from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TestimonialCreate(BaseModel):
    client_name: str = Field(min_length=1, max_length=255)
    client_role: str | None = Field(default=None, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    client_image: str | None = Field(default=None, max_length=500)
    review_text: str = Field(min_length=1)
    rating: int = Field(default=5, ge=1, le=5)
    display_order: int = 0
    is_active: bool = True


class TestimonialUpdate(BaseModel):
    client_name: str | None = Field(default=None, min_length=1, max_length=255)
    client_role: str | None = Field(default=None, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    client_image: str | None = Field(default=None, max_length=500)
    review_text: str | None = Field(default=None, min_length=1)
    rating: int | None = Field(default=None, ge=1, le=5)
    display_order: int | None = None
    is_active: bool | None = None


class TestimonialRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_name: str
    client_role: str | None = None
    company_name: str | None = None
    client_image: str | None = None
    review_text: str
    rating: int
    display_order: int
    is_active: bool = True
    created_at: datetime
    updated_at: datetime