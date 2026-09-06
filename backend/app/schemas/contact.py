from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=255)
    message: str = Field(min_length=1, max_length=5000)
    website: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def strip_message(self) -> "ContactCreate":
        self.message = self.message.strip()
        if not self.message:
            raise ValueError("message must not be empty")
        return self


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    subject: str | None = None
    message: str
    ip_address: str | None = None
    is_read: bool
    created_at: datetime


class ContactMessageUpdate(BaseModel):
    is_read: bool