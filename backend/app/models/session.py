from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoSession(BaseModel):
    session_id: str
    title: str
    surgeon: str
    start_time: datetime
    stream_url: str
    notes: Optional[str] = None
