from fastapi import FastAPI
from app.routes import video

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
