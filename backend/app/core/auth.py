import base64
import hashlib
import hmac
import json
import os
import time
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


# ─── API token helpers ────────────────────────────────────────────────────────
# Uses the same HMAC-SHA256 mechanism as the realtime WS tokens (see
# realtime_hub.py) but with kind="api" claim and a longer default TTL (1h).
# Replace mint_api_token / _verify_api_token with OIDC JWT validation when
# integrating a real IdP — see docs/AUTH_MIGRATION.md.

_API_TOKEN_TTL = int(os.environ.get("API_TOKEN_TTL_SECONDS", "3600"))


def mint_api_token(user_id: str, role: str) -> tuple[str, int]:
    """Mint a signed REST API token. Returns (token, expiry_unix_ts)."""
    secret = os.environ.get("WS_JWT_SECRET", "dev-ws-secret")
    exp = int(time.time()) + _API_TOKEN_TTL
    claims = {"userId": user_id, "role": role, "exp": exp, "kind": "api"}
    payload = json.dumps(claims, separators=(",", ":")).encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    token = f"{base64.urlsafe_b64encode(payload).decode('utf-8')}.{sig}"
    return token, exp


def _verify_api_token(token: str) -> dict | None:
    """Verify a token minted by mint_api_token(). Returns claims dict or None."""
    try:
        secret = os.environ.get("WS_JWT_SECRET", "dev-ws-secret")
        payload_b64, sig = token.split(".", 1)
        payload = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
        expected = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        claims = json.loads(payload.decode("utf-8"))
        if int(claims.get("exp", 0)) < int(time.time()):
            return None
        if claims.get("kind") != "api":
            return None
        return claims
    except Exception:
        return None


# ─── FastAPI dependencies ─────────────────────────────────────────────────────


def get_current_principal(
    authorization: str | None = Header(default=None),
    x_dev_user_id: str | None = Header(default=None),
    x_dev_role: str | None = Header(default=None),
) -> Principal:
    # 1. Bearer token — primary auth path (minted by POST /auth/token).
    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization.removeprefix("Bearer ").strip()
        claims = _verify_api_token(raw_token)
        if not claims:
            raise AppError("INVALID_TOKEN", "Bearer token is invalid or expired", 401)
        user_id = claims["userId"]
        role = _normalize_role(claims["role"])
        _upsert_user(user_id, role)
        return Principal(user_id=user_id, role=role)

    # 2. Dev header fallback — temporary scaffold. Replace with OIDC validation.
    #    See docs/AUTH_MIGRATION.md for the step-by-step migration plan.
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
