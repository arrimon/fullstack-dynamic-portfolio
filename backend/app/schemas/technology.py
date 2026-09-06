from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TechnologyCategory(str, Enum):
    frontend = "frontend"
    backend = "backend"
    database = "database"
    tools = "tools"


class TechnologyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon_url: str | None = Field(default=None, max_length=500)
    category: TechnologyCategory
    display_order: int = 0
    is_active: bool = True


class TechnologyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    icon_url: str | None = Field(default=None, max_length=500)
    category: TechnologyCategory | None = None
    display_order: int | None = None
    is_active: bool | None = None


class TechnologyCatalogItem(BaseModel):
    name: str
    slug: str
    category: TechnologyCategory
    icon_url: str


class TechnologyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon_url: str | None = None
    category: TechnologyCategory
    display_order: int = 0
    is_active: bool = True