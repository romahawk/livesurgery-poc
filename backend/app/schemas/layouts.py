from typing import Any

from pydantic import BaseModel


class LayoutResponse(BaseModel):
    version: int
    layout: dict[str, Any]


class PublishLayoutRequest(BaseModel):
    baseVersion: int
    layout: dict[str, Any]
