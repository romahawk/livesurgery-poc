import base64
import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Query, status

from app.core.auth import Principal, Role, get_current_principal, require_roles
from app.core.database import get_conn
from app.core.errors import AppError
from app.schemas.sessions import (
    CreateSessionRequest,
    ListSessionsResponse,
    SessionItem,
    UpdateParticipantRoleRequest,
)

router = APIRouter(prefix="/v1/sessions", tags=["Sessions"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _encode_cursor(offset: int) -> str:
    payload = json.dumps({"offset": offset}).encode("utf-8")
    return base64.urlsafe_b64encode(payload).decode("utf-8")


def _decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    try:
        data = base64.urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8")
        return max(0, int(json.loads(data).get("offset", 0)))
    except Exception as exc:
        raise AppError("INVALID_CURSOR", "Cursor is not valid", 400) from exc


def _get_session_or_404(session_id: str) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            """
            select id, title, visibility, status, created_by, created_at, updated_at
            from sessions
            where id = ?
            """,
            (session_id,),
        ).fetchone()
    if not row:
        raise AppError("SESSION_NOT_FOUND", "Session not found", 404)
    return dict(row)


def _to_item(row: dict) -> SessionItem:
    return SessionItem(
        id=row["id"],
        title=row["title"],
        status=row["status"],
        createdAt=row.get("created_at"),
        updatedAt=row.get("updated_at"),
        createdBy=row.get("created_by"),
        visibility=row.get("visibility"),
    )


@router.post("", response_model=SessionItem, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: CreateSessionRequest,
    principal: Principal = Depends(require_roles(Role.SURGEON, Role.ADMIN)),
):
    session_id = str(uuid4())
    now = _now_iso()
    with get_conn() as conn:
        conn.execute(
            """
            insert into sessions (id, title, visibility, status, created_by, created_at, updated_at)
            values (?, ?, ?, 'DRAFT', ?, ?, ?)
            """,
            (session_id, payload.title.strip(), payload.visibility, principal.user_id, now, now),
        )
        conn.execute(
            """
            insert into session_participants (session_id, user_id, role, joined_at, left_at)
            values (?, ?, ?, ?, null)
            on conflict(session_id, user_id) do update set role = excluded.role, joined_at = excluded.joined_at
            """,
            (session_id, principal.user_id, principal.role.value, now),
        )
    return SessionItem(
        id=session_id,
        title=payload.title.strip(),
        status="DRAFT",
        createdAt=now,
        updatedAt=now,
        createdBy=principal.user_id,
        visibility=payload.visibility,
    )


@router.get("", response_model=ListSessionsResponse)
def list_sessions(
    limit: int = Query(default=20, ge=1, le=100),
    cursor: str | None = Query(default=None),
    principal: Principal = Depends(get_current_principal),
):
    offset = _decode_cursor(cursor)
    with get_conn() as conn:
        rows = conn.execute(
            """
            select s.id, s.title, s.visibility, s.status, s.created_by, s.created_at, s.updated_at
            from sessions s
            join session_participants sp on sp.session_id = s.id and sp.user_id = ?
            order by s.updated_at desc
            limit ? offset ?
            """,
            (principal.user_id, limit + 1, offset),
        ).fetchall()
    has_more = len(rows) > limit
    page_rows = rows[:limit]
    items = [_to_item(dict(r)) for r in page_rows]
    next_cursor = _encode_cursor(offset + limit) if has_more else None
    return ListSessionsResponse(items=items, nextCursor=next_cursor)


@router.get("/{session_id}", response_model=SessionItem)
def get_session(
    session_id: str,
    principal: Principal = Depends(get_current_principal),
):
    with get_conn() as conn:
        membership = conn.execute(
            """
            select 1 from session_participants
            where session_id = ? and user_id = ?
            """,
            (session_id, principal.user_id),
        ).fetchone()
    if not membership:
        raise AppError("SESSION_NOT_FOUND", "Session not found", 404)
    return _to_item(_get_session_or_404(session_id))


def _set_status(session_id: str, new_status: str, principal: Principal) -> SessionItem:
    row = _get_session_or_404(session_id)
    if principal.role not in {Role.ADMIN, Role.SURGEON}:
        raise AppError("FORBIDDEN", "Insufficient role for this operation", 403)
    if principal.role == Role.SURGEON and row["created_by"] != principal.user_id:
        raise AppError("FORBIDDEN", "Only the owner surgeon can change status", 403)

    now = _now_iso()
    with get_conn() as conn:
        conn.execute(
            "update sessions set status = ?, updated_at = ? where id = ?",
            (new_status, now, session_id),
        )
    row["status"] = new_status
    row["updated_at"] = now
    return _to_item(row)


@router.post("/{session_id}/start", response_model=SessionItem)
def start_session(
    session_id: str,
    principal: Principal = Depends(get_current_principal),
):
    return _set_status(session_id, "LIVE", principal)


@router.post("/{session_id}/end", response_model=SessionItem)
def end_session(
    session_id: str,
    principal: Principal = Depends(get_current_principal),
):
    return _set_status(session_id, "ENDED", principal)


@router.post("/{session_id}/participants:join")
def join_session(
    session_id: str,
    principal: Principal = Depends(get_current_principal),
):
    _get_session_or_404(session_id)
    now = _now_iso()
    with get_conn() as conn:
        conn.execute(
            """
            insert into session_participants (session_id, user_id, role, joined_at, left_at)
            values (?, ?, ?, ?, null)
            on conflict(session_id, user_id) do update set
              role = excluded.role,
              joined_at = excluded.joined_at,
              left_at = null
            """,
            (session_id, principal.user_id, principal.role.value, now),
        )

    return {
        "participant": {"userId": principal.user_id, "role": principal.role.value},
        "realtime": {"wsUrl": None, "token": None},
        "media": {"sfuUrl": None, "token": None},
    }


@router.patch("/{session_id}/participants/{user_id}")
def update_participant_role(
    session_id: str,
    user_id: str,
    payload: UpdateParticipantRoleRequest,
    principal: Principal = Depends(require_roles(Role.ADMIN)),
):
    _get_session_or_404(session_id)
    with get_conn() as conn:
        existing = conn.execute(
            """
            select 1 from session_participants
            where session_id = ? and user_id = ?
            """,
            (session_id, user_id),
        ).fetchone()
        if not existing:
            raise AppError("PARTICIPANT_NOT_FOUND", "Participant not found", 404)
        conn.execute(
            """
            update session_participants set role = ?
            where session_id = ? and user_id = ?
            """,
            (payload.role, session_id, user_id),
        )
    return {"participant": {"userId": user_id, "role": payload.role}}
