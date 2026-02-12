from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.database import get_conn
from app.core.errors import AppError
from app.services.layouts import get_latest_layout, publish_layout
from app.services.realtime_hub import hub

router = APIRouter(tags=["Realtime"])


def _is_session_member(session_id: str, user_id: str) -> bool:
    with get_conn() as conn:
        membership = conn.execute(
            """
            select 1 from session_participants
            where session_id = ? and user_id = ?
            """,
            (session_id, user_id),
        ).fetchone()
    return bool(membership)


@router.websocket("/ws/sessions/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str, token: str):
    await websocket.accept()
    try:
        claims = hub.verify_token(token)
        if claims.session_id != session_id:
            await websocket.send_json({"type": "error", "payload": {"code": "INVALID_WS_TOKEN"}})
            await websocket.close(code=4401)
            return
        if not _is_session_member(session_id, claims.user_id):
            await websocket.send_json({"type": "error", "payload": {"code": "SESSION_NOT_FOUND"}})
            await websocket.close(code=4404)
            return

        await hub.connect(session_id, websocket)
        current_version, current_layout = get_latest_layout(session_id)
        await websocket.send_json(
            {
                "type": "layout.snapshot",
                "payload": {"version": current_version, "layout": current_layout},
            }
        )
        participants = await hub.count(session_id)
        await hub.broadcast(
            session_id,
            {
                "type": "presence.updated",
                "payload": {"participants": participants},
            },
        )

        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")
            if msg_type == "layout.update":
                if claims.role not in {"SURGEON", "ADMIN"}:
                    await websocket.send_json(
                        {"type": "error", "payload": {"code": "FORBIDDEN", "message": "Role cannot edit layout"}}
                    )
                    continue
                payload = message.get("payload") or {}
                base_version = int(payload.get("baseVersion", -1))
                layout = payload.get("layout") or {}
                try:
                    new_version = publish_layout(
                        session_id=session_id,
                        base_version=base_version,
                        layout=layout,
                        updated_by=claims.user_id,
                    )
                    await hub.broadcast(
                        session_id,
                        {
                            "type": "layout.updated",
                            "payload": {
                                "version": new_version,
                                "layout": layout,
                                "updatedBy": claims.user_id,
                            },
                        },
                    )
                except AppError as exc:
                    if exc.code == "LAYOUT_VERSION_CONFLICT":
                        latest_version, latest_layout = get_latest_layout(session_id)
                        await websocket.send_json(
                            {
                                "type": "layout.conflict",
                                "payload": {
                                    "code": "LAYOUT_VERSION_CONFLICT",
                                    "version": latest_version,
                                    "layout": latest_layout,
                                },
                            }
                        )
                    else:
                        await websocket.send_json(
                            {"type": "error", "payload": {"code": exc.code, "message": exc.message}}
                        )
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    except AppError:
        await websocket.close(code=4401)
    except WebSocketDisconnect:
        pass
    finally:
        await hub.disconnect(session_id, websocket)
        participants = await hub.count(session_id)
        await hub.broadcast(
            session_id,
            {
                "type": "presence.updated",
                "payload": {"participants": participants},
            },
        )
