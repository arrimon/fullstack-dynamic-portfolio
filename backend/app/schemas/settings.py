from pydantic import BaseModel, Field


class SettingRead(BaseModel):
    model_config = {"from_attributes": True}

    key: str
    value: str


class SettingsUpdateRequest(BaseModel):
    settings: dict[str, str] = Field(default_factory=dict)