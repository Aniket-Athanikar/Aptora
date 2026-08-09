import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import UserDb
from app.models.notification import NotificationDb
from app.schemas.notification import (
    NotificationItemResponse,
    NotificationCreatePayload,
    NotificationListResponse,
)
from app.core.websocket import ws_manager

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/notifications", tags=["notifications"])

DEFAULT_SEED_NOTIFICATIONS = [
    {
        "type": "study",
        "priority": "high",
        "message": "📚 Target revision session pending: Organic Chemistry & PYQs.",
    },
    {
        "type": "motivation",
        "priority": "medium",
        "message": "🔥 Continuous progress logged. Keep up your active study streak!",
    },
    {
        "type": "progress",
        "priority": "low",
        "message": "📈 Your focus accuracy & study efficiency improved this week.",
    },
    {
        "type": "warning",
        "priority": "high",
        "message": "⚠️ Quantitative Aptitude progress falling behind goal timeline.",
    },
]


def format_notif(n: NotificationDb) -> dict:
    return {
        "id": str(n.id),
        "type": n.type,
        "priority": n.priority,
        "message": n.message,
        "read": n.read,
        "createdAt": n.created_at.isoformat() if n.created_at else "",
    }


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    notifs = (
        db.query(NotificationDb)
        .filter(NotificationDb.user_id == current_user.id)
        .order_by(NotificationDb.created_at.desc())
        .all()
    )

    # Seed default notifications for new user if empty
    if not notifs:
        for seed in DEFAULT_SEED_NOTIFICATIONS:
            item = NotificationDb(
                user_id=current_user.id,
                type=seed["type"],
                priority=seed["priority"],
                message=seed["message"],
                read=False,
            )
            db.add(item)
        db.commit()

        notifs = (
            db.query(NotificationDb)
            .filter(NotificationDb.user_id == current_user.id)
            .order_by(NotificationDb.created_at.desc())
            .all()
        )

    formatted = [format_notif(n) for n in notifs]
    unread = sum(1 for n in notifs if not n.read)

    return NotificationListResponse(
        success=True,
        notifications=formatted,
        unreadCount=unread,
    )


@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_notification(
    payload: NotificationCreatePayload,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    notif = NotificationDb(
        user_id=current_user.id,
        type=payload.type,
        priority=payload.priority,
        message=payload.message.strip(),
        read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Broadcast notification to WebSocket
    await ws_manager.broadcast({
        "type": "realtime_update",
        "title": "New Notification",
        "description": notif.message,
        "badge": notif.type.capitalize(),
        "color": "indigo" if notif.priority == "medium" else ("emerald" if notif.priority == "low" else "purple")
    })

    return {"success": True, "notification": format_notif(notif)}


@router.patch("/read-all", response_model=Dict[str, Any])
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    db.query(NotificationDb).filter(
        NotificationDb.user_id == current_user.id,
        NotificationDb.read == False,
    ).update({"read": True}, synchronize_session=False)
    db.commit()

    return {"success": True, "message": "All notifications marked as read."}


@router.patch("/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    try:
        n_id = int(notification_id.replace("notif_", ""))
    except ValueError:
        n_id = -1

    notif = (
        db.query(NotificationDb)
        .filter(NotificationDb.id == n_id, NotificationDb.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notif.read = True
    db.commit()
    db.refresh(notif)

    return {"success": True, "notification": format_notif(notif)}


@router.delete("/clear-all", response_model=Dict[str, Any])
@router.delete("", response_model=Dict[str, Any])
async def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    db.query(NotificationDb).filter(NotificationDb.user_id == current_user.id).delete(
        synchronize_session=False
    )
    db.commit()
    return {"success": True, "message": "All notifications cleared."}


@router.delete("/{notification_id}", response_model=Dict[str, Any])
async def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    try:
        n_id = int(notification_id.replace("notif_", ""))
    except ValueError:
        n_id = -1

    notif = (
        db.query(NotificationDb)
        .filter(NotificationDb.id == n_id, NotificationDb.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(notif)
    db.commit()

    return {"success": True, "message": "Notification deleted."}
