from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid

from app.core.database import init_db, get_conn
from app.core.errors import AppError
from app.routes import realtime, sessions, video
from app.routes import auth as auth_routes

app = FastAPI(
    title="Livesurgery PoC API", description="Backend API for Livesurgery PoC", version="0.2.0"
)

# CORS — read allowed origins from env; default to localhost dev origin.
# Set ALLOWED_ORIGINS=https://livesurgery.vercel.app (comma-separated) in production.
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(video.router, prefix="/video", tags=["Video Simulation"])
app.include_router(sessions.router)
app.include_router(realtime.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    # Guard: prevent deploying with the default dev WS secret.
    ws_secret = os.environ.get("WS_JWT_SECRET", "dev-ws-secret")
    app_env = os.environ.get("APP_ENV", "development").lower()
    if ws_secret == "dev-ws-secret" and app_env == "production":
        raise RuntimeError(
            "WS_JWT_SECRET must be overridden in production. "
            "Set a strong random value via the WS_JWT_SECRET environment variable."
        )


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


@app.get("/healthz", tags=["Health"])
def healthz():
    """Liveness + readiness check. Returns 503 if the database is unreachable."""
    try:
        with get_conn() as conn:
            conn.execute("SELECT 1").fetchone()
        db_status = "connected"
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "version": app.version, "db": "disconnected"},
        )
    return {"status": "ok", "version": app.version, "db": db_status}


# Mount static video directory
videos_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../videos"))
if os.path.isdir(videos_dir):
    app.mount("/videos", StaticFiles(directory=videos_dir), name="videos")
