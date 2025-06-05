from fastapi import FastAPI
from app.routes import video
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="Livesurgery PoC API",
    description="Backend API for Livesurgery PoC",
    version="0.1.0"
)

# Include routers
app.include_router(video.router, prefix="/video", tags=["Video Simulation"])

@app.get("/")
def root():
    return {"message": "Livesurgery backend is running"}

# Mount static video directory
app.mount("/videos", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../../videos")), name="videos")
