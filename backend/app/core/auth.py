from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable
from uuid import uuid4

from fastapi import Depends, Header

from app.core.database import get_conn
from app.core.errors import AppError


class Role(str, Enum):
    SURGEON = "SURGEON"
    OBSERVER = "OBSERVER"
    ADMIN = "ADMIN"


@dataclass
class Principal:
    user_id: str
    role: Role


def _normalize_role(value: str) -> Role:
    raw = (value or "").strip().upper()
    if raw == "VIEWER":
        raw = "OBSERVER"
    try:
        return Role(raw)
    except ValueError as exc:
        raise AppError("INVALID_ROLE", f"Unsupported role '{value}'", 400) from exc


def _upsert_user(user_id: str, role: Role) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        conn.execute(
            """
            insert into users (id, email, display_name, role, created_at)
            values (?, null, ?, ?, ?)
            on conflict(id) do update set
              role = excluded.role,
              display_name = excluded.display_name
            """,
            (user_id, user_id, role.value, now),
        )


def get_current_principal(
    x_dev_user_id: str | None = Header(default=None),
    x_dev_role: str | None = Header(default=None),
) -> Principal:
    # Temporary auth scaffold for MVP foundation. Replace with OIDC/JWT validation.
    user_id = (x_dev_user_id or "").strip() or f"dev-user-{uuid4().hex[:8]}"
    role = _normalize_role(x_dev_role or "SURGEON")
    _upsert_user(user_id, role)
    return Principal(user_id=user_id, role=role)


def require_roles(*allowed: Role) -> Callable[[Principal], Principal]:
    allowed_set = {r.value for r in allowed}

    def _dep(principal: Principal = Depends(get_current_principal)) -> Principal:
        if principal.role.value not in allowed_set:
            raise AppError("FORBIDDEN", "Insufficient role for this operation", 403)
        return principal

    return _dep
