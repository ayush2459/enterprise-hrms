import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, set[WebSocket]] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: str, ws: WebSocket):
        conns = self.active.get(user_id)
        if conns:
            conns.discard(ws)
            if not conns:
                self.active.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict):
        for ws in list(self.active.get(user_id, set())):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                self.disconnect(user_id, ws)

    async def broadcast(self, message: dict):
        for user_id in list(self.active.keys()):
            await self.send_to_user(user_id, message)


manager = ConnectionManager()
