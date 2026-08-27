from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, title: str, body: str | None,
                      category: str = "general", reference_type: str | None = None,
                      reference_id: int | None = None) -> Notification:
        notif = Notification(
            user_id=user_id, title=title, body=body, category=category,
            reference_type=reference_type, reference_id=reference_id,
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        return notif

    async def list_for_user(self, user_id: int, unread_only: bool = False) -> list[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.is_read.is_(False))
        stmt = stmt.order_by(Notification.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def mark_read(self, notification_id: int, user_id: int) -> None:
        await self.db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        await self.db.commit()
