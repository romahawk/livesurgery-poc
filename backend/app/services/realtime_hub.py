import asyncio
import base64
import hashlib
import hmac
import json
import os
import time
from collections import defaultdict
from dataclasses import dataclass

from fastapi import WebSocket

from app.core.errors import AppError


@dataclass
class RealtimeClaims:
    session_id: str
    user_id: str
    role: str
    exp: int


class RealtimeHub:
    def __init__(self):
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._secret = os.environ.get("WS_JWT_SECRET", "dev-ws-secret")
        self._token_ttl_seconds = int(os.environ.get("WS_TOKEN_TTL_SECONDS", "900"))

    def mint_token(self, session_id: str, user_id: str, role: str) -> str:
        claims = {
            "sessionId": session_id,
            "userId": user_id,
            "role": role,
            "exp": int(time.time()) + self._token_ttl_seconds,
        }
        payload = json.dumps(claims, separators=(",", ":")).encode("utf-8")
        sig = hmac.new(self._secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        return f"{base64.urlsafe_b64encode(payload).decode('utf-8')}.{sig}"

    def verify_token(self, token: str) -> RealtimeClaims:
        try:
            payload_b64, signature = token.split(".", 1)
            payload = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
            expected = hmac.new(self._secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected):
                raise AppError("INVALID_WS_TOKEN", "WebSocket token signature is invalid", 401)
            claims_raw = json.loads(payload.decode("utf-8"))
            exp = int(claims_raw["exp"])
            if exp < int(time.time()):
                raise AppError("EXPIRED_WS_TOKEN", "WebSocket token expired", 401)
            return RealtimeClaims(
                session_id=claims_raw["sessionId"],
                user_id=claims_raw["userId"],
                role=claims_raw["role"],
                exp=exp,
            )
        except AppError:
            raise
        except Exception as exc:
            raise AppError("INVALID_WS_TOKEN", "WebSocket token is invalid", 401) from exc

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections[session_id].add(websocket)

    async def disconnect(self, session_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            if session_id in self._connections:
                self._connections[session_id].discard(websocket)
                if not self._connections[session_id]:
                    self._connections.pop(session_id, None)

    async def broadcast(self, session_id: str, payload: dict) -> None:
        async with self._lock:
            sockets = list(self._connections.get(session_id, set()))
        if not sockets:
            return
        dead: list[WebSocket] = []
        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections.get(session_id, set()).discard(ws)

    async def count(self, session_id: str) -> int:
        async with self._lock:
            return len(self._connections.get(session_id, set()))


hub = RealtimeHub()
