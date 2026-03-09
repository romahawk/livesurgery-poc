from fastapi import APIRouter
from app.services.video_stream import get_simulated_stream

router = APIRouter()

@router.get("/simulate")
def simulate_stream():
    """
    Return a simulated video stream URL (e.g. from OBS or a test feed).
    """
    return {"stream_url": get_simulated_stream()}
