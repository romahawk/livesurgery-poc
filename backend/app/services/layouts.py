import json
from datetime import datetime, timezone

from app.core.database import get_conn
from app.core.errors import AppError


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def default_layout() -> dict:
    return {
        "panels": [
            {"id": "p1", "streamId": None},
            {"id": "p2", "streamId": None},
            {"id": "p3", "streamId": None},
            {"id": "p4", "streamId": None},
        ]
    }


def get_latest_layout(session_id: str) -> tuple[int, dict]:
    with get_conn() as conn:
        row = conn.execute(
            """
            select version, layout_json
            from session_layouts
            where session_id = ?
            order by version desc
            limit 1
            """,
            (session_id,),
        ).fetchone()
    if not row:
        return 0, default_layout()
    return int(row["version"]), json.loads(row["layout_json"])


def publish_layout(session_id: str, base_version: int, layout: dict, updated_by: str) -> int:
    latest_version, latest_layout = get_latest_layout(session_id)
    if base_version != latest_version:
        raise AppError("LAYOUT_VERSION_CONFLICT", "Layout baseVersion is stale", 409)
    new_version = latest_version + 1
    with get_conn() as conn:
        conn.execute(
            """
            insert into session_layouts (session_id, version, layout_json, updated_by, updated_at)
            values (?, ?, ?, ?, ?)
            """,
            (session_id, new_version, json.dumps(layout), updated_by, now_iso()),
        )
    return new_version
