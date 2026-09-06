from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.technology import TechnologyRead


class ProjectStatus(str, Enum):
    draft = "draft"
    published = "published"


class ProjectImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    alt_text: str | None = None
    display_order: int = 0


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    short_description: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    github_link: str | None = Field(default=None, max_length=500)
    live_link: str | None = Field(default=None, max_length=500)
    testing_email: str | None = Field(default=None, max_length=255)
    testing_password: str | None = Field(default=None, max_length=255)
    status: ProjectStatus = ProjectStatus.draft
    is_featured: bool = False
    display_order: int = 0
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    technology_ids: list[int] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    short_description: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, min_length=1)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    github_link: str | None = Field(default=None, max_length=500)
    live_link: str | None = Field(default=None, max_length=500)
    testing_email: str | None = Field(default=None, max_length=255)
    testing_password: str | None = Field(default=None, max_length=255)
    status: ProjectStatus | None = None
    is_featured: bool | None = None
    display_order: int | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    technology_ids: list[int] | None = None

    @model_validator(mode="after")
    def clear_thumbnail(self) -> "ProjectUpdate":
        if self.thumbnail_url == "":
            self.thumbnail_url = None
        return self


class ProjectRead(BaseModel):
    """Public-safe project shape. Testing credentials are intentionally NOT exposed."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    short_description: str
    description: str
    thumbnail_url: str | None = None
    github_link: str | None = None
    live_link: str | None = None
    status: ProjectStatus
    is_featured: bool
    display_order: int
    meta_title: str | None = None
    meta_description: str | None = None
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    """Public-safe project list item (no testing credentials)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    short_description: str
    thumbnail_url: str | None = None
    github_link: str | None = None
    live_link: str | None = None
    status: ProjectStatus
    is_featured: bool
    display_order: int
    created_at: datetime


class ProjectDetailResponse(ProjectRead):
    """Public project detail with gallery + tech stack + visitor test credentials."""

    images: list[ProjectImageRead] = Field(default_factory=list)
    technologies: list[TechnologyRead] = Field(default_factory=list)
    testing_email: str | None = None
    testing_password: str | None = None


class ProjectAdminRead(ProjectRead):
    """Admin project shape including testing credentials and soft-delete state."""

    testing_email: str | None = None
    testing_password: str | None = None
    deleted_at: datetime | None = None


class ProjectAdminDetailResponse(ProjectAdminRead):
    images: list[ProjectImageRead] = Field(default_factory=list)
    technologies: list[TechnologyRead] = Field(default_factory=list)


class ProjectImageCreate(BaseModel):
    alt_text: str | None = Field(default=None, max_length=255)
    display_order: int = 0