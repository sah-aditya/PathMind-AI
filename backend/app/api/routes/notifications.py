from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.admin import SystemSetting, SystemNotification, UserNotificationRead

router = APIRouter(prefix="", tags=["notifications"])


@router.get("/system/status")
def get_system_status(db: Session = Depends(get_db)):
    """
    Public endpoint to check if the platform is currently under maintenance.
    """
    m_mode = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
    m_msg = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_message").first()

    return {
        "maintenance": m_mode.value.lower() == "true" if m_mode else False,
        "message": m_msg.value if m_msg else "PathMind AI is undergoing scheduled maintenance.",
    }


@router.get("/notifications")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all active system notifications and include whether current user has read each one.
    """
    active_notifs = (
        db.query(SystemNotification)
        .filter(SystemNotification.is_active == True)
        .order_by(SystemNotification.created_at.desc())
        .limit(20)
        .all()
    )

    read_ids = {
        r.notification_id
        for r in db.query(UserNotificationRead)
        .filter(UserNotificationRead.user_id == current_user.id)
        .all()
    }

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "is_read": n.id in read_ids,
        }
        for n in active_notifs
    ]


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a notification as read by current user.
    """
    existing = (
        db.query(UserNotificationRead)
        .filter(
            UserNotificationRead.user_id == current_user.id,
            UserNotificationRead.notification_id == notification_id,
        )
        .first()
    )
    if not existing:
        record = UserNotificationRead(
            user_id=current_user.id,
            notification_id=notification_id,
        )
        db.add(record)
        db.commit()

    return {"status": "success", "notification_id": notification_id}
