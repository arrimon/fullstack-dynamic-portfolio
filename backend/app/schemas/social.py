from pydantic import BaseModel, ConfigDict, Field


class SocialLinkCreate(BaseModel):
    platform: str = Field(min_length=1, max_length=100)
    url: str = Field(min_length=1, max_length=500)
    icon: str | None = Field(default=None, max_length=255)


class SocialLinkUpdate(BaseModel):
    platform: str | None = Field(default=None, min_length=1, max_length=100)
    url: str | None = Field(default=None, min_length=1, max_length=500)
    icon: str | None = Field(default=None, max_length=255)


class SocialLinkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    platform: str
    url: str
    icon: str | None = None