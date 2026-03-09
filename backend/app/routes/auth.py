import time
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, field_validator

from app.core.auth import _normalize_role, _upsert_user, mint_api_token

router = APIRouter(prefix="/auth", tags=["Auth"])


class TokenRequest(BaseModel):
    userId: str
    role: str

    @field_validator("userId")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            return f"dev-{int(time.time())}"
        return stripped


class TokenResponse(BaseModel):
    token: str
    userId: str
    role: str
    expiresAt: str


@router.post("/token", response_model=TokenResponse)
def create_token(body: TokenRequest):
    """
    Dev-mode token endpoint. Accepts userId + role, returns a signed HMAC API token.

    This endpoint is intentionally unauthenticated — it is the entry point for
    acquiring credentials. In production, replace the body with an OIDC authorization
    code or a verified ID token from your IdP.

    See docs/AUTH_MIGRATION.md for the step-by-step migration plan.
    """
    role = _normalize_role(body.role)
    _upsert_user(body.userId, role)
    token, exp = mint_api_token(body.userId, role.value)
    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc).isoformat()
    return TokenResponse(
        token=token,
        userId=body.userId,
        role=role.value,
        expiresAt=expires_at,
    )
