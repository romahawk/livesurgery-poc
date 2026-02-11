from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid

from app.core.database import init_db
from app.core.errors import AppError
from app.routes import sessions, video

app = FastAPI(
    title="Livesurgery PoC API",
    description="Backend API for Livesurgery PoC",
    version="0.2.0"
)

# CORS (dev-friendly defaults, tighten in production).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(video.router, prefix="/video", tags=["Video Simulation"])
app.include_router(sessions.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or f"req_{uuid.uuid4().hex[:12]}"
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "requestId": getattr(request.state, "request_id", None),
            }
        },
    )

@app.get("/")
def root():
    return {"message": "Livesurgery backend is running"}

# Mount static video directory
videos_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../videos"))
if os.path.isdir(videos_dir):
    app.mount("/videos", StaticFiles(directory=videos_dir), name="videos")
