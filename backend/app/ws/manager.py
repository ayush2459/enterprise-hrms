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
        for ws in self.active.get(user_id, set()):
            await ws.send_text(json.dumps(message))

manager = ConnectionManager()
