from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SessionStatus = Literal["DRAFT", "LIVE", "ENDED", "ARCHIVED"]
Visibility = Literal["PRIVATE", "PUBLIC"]


class CreateSessionRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    visibility: Visibility = "PRIVATE"


class SessionItem(BaseModel):
    id: str
    title: str
    status: SessionStatus
    createdAt: datetime | None = None
    updatedAt: datetime | None = None
    createdBy: str | None = None
    visibility: Visibility | None = None


class ListSessionsResponse(BaseModel):
    items: list[SessionItem]
    nextCursor: str | None = None


class UpdateParticipantRoleRequest(BaseModel):
    role: Literal["SURGEON", "OBSERVER", "ADMIN"]
