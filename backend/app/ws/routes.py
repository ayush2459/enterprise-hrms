import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.auth.dependencies import get_current_user_ws
from app.db.session import get_db
from app.ws.manager import manager
from app.core.redis import redis_client

router = APIRouter()

@router.websocket("/ws")
async def ws_endpoint(
    websocket: WebSocket,
    token: str = Query(None),
    db=Depends(get_db),
):
    user = await get_current_user_ws(websocket, token, db)
    user_id = str(user.id)
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.psubscribe("user:*")
    async for msg in pubsub.listen():
        if msg["type"] != "pmessage":
            continue
        channel = msg["channel"]
        user_id = channel.split("user:", 1)[1]
        payload = json.loads(msg["data"])
        await manager.send_to_user(user_id, payload)
