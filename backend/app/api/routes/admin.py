from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_admin_user, hash_password
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill
from app.models.learning import LearningPath
from app.models.admin import SystemSetting, SystemNotification, UserNotificationRead

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class UpdatePasswordIn(BaseModel):
    new_password: str

class UpdateRoleIn(BaseModel):
    role: str  # "user" | "admin"

class MaintenanceToggleIn(BaseModel):
    enabled: bool
    message: Optional[str] = "PathMind AI is temporarily undergoing scheduled maintenance. Please check back shortly."

class NotificationCreateIn(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"  # "info", "warning", "success", "alert"


# ── User Management ───────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    users = db.query(User).order_by(User.id.asc()).all()
    result = []
    for u in users:
        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == u.id).first()
        active_path = db.query(LearningPath).filter(
            LearningPath.user_id == u.id,
            LearningPath.status == "active"
        ).first()
        skills_count = db.query(LearnerSkill).filter(LearnerSkill.user_id == u.id).count()

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": getattr(u, "role", "user"),
            "raw_password": getattr(u, "raw_password", None) or "—",
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "goal_title": profile.goal_title if profile else "No Goal Set",
            "experience_level": profile.experience_level if profile else "beginner",
            "skills_count": skills_count,
            "overall_progress": active_path.overall_progress if active_path else 0.0,
            "path_title": active_path.title if active_path else None,
        })
    return result


@router.put("/users/{user_id}/password")
def update_user_password(
    user_id: int,
    payload: UpdatePasswordIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    target_user.hashed_password = hash_password(payload.new_password)
    target_user.raw_password = payload.new_password
    db.commit()
    return {"status": "success", "message": f"Password updated for {target_user.email}."}


@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    if target_user.email == "er.adityasah@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot deactivate master superadmin.")
    
    target_user.is_active = not target_user.is_active
    db.commit()
    return {
        "status": "success",
        "is_active": target_user.is_active,
        "message": f"User {target_user.email} {'activated' if target_user.is_active else 'suspended'}.",
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UpdateRoleIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if payload.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be either 'user' or 'admin'.")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Prevent demoting the master superadmin
    if target_user.email == "er.adityasah@gmail.com" and payload.role != "admin":
        raise HTTPException(status_code=400, detail="Cannot revoke superadmin privileges from primary owner.")
    
    target_user.role = payload.role
    db.commit()
    return {"status": "success", "message": f"Role updated to '{payload.role}' for {target_user.email}."}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if target_user.email == "er.adityasah@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot delete master superadmin account.")
    
    db.delete(target_user)
    db.commit()
    return {"status": "success", "message": f"User {target_user.email} permanently deleted."}


# ── System Maintenance Controls ──────────────────────────────────────────────

@router.get("/system/settings")
def get_system_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    m_mode = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
    m_msg = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_message").first()
    
    return {
        "maintenance_mode": m_mode.value.lower() == "true" if m_mode else False,
        "maintenance_message": m_msg.value if m_msg else "PathMind AI is undergoing maintenance.",
    }


@router.put("/system/maintenance")
def toggle_maintenance_mode(
    payload: MaintenanceToggleIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    m_mode = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
    if not m_mode:
        m_mode = SystemSetting(key="maintenance_mode", value=str(payload.enabled).lower())
        db.add(m_mode)
    else:
        m_mode.value = str(payload.enabled).lower()

    if payload.message:
        m_msg = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_message").first()
        if not m_msg:
            m_msg = SystemSetting(key="maintenance_message", value=payload.message)
            db.add(m_msg)
        else:
            m_msg.value = payload.message

    db.commit()
    return {
        "status": "success",
        "maintenance_mode": payload.enabled,
        "message": f"Maintenance mode {'ENABLED' if payload.enabled else 'DISABLED'}.",
    }


# ── System Broadcast Notifications ────────────────────────────────────────────

@router.get("/notifications")
def get_admin_notifications(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    notifs = db.query(SystemNotification).order_by(SystemNotification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_active": n.is_active,
            "created_by": n.created_by,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@router.post("/notifications")
def create_system_notification(
    payload: NotificationCreateIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    notif = SystemNotification(
        title=payload.title,
        message=payload.message,
        type=payload.type or "info",
        created_by=admin.email,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return {
        "status": "success",
        "notification": {
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "created_at": notif.created_at.isoformat() if notif.created_at else None,
        }
    }


@router.delete("/notifications/{notification_id}")
def delete_system_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    notif = db.query(SystemNotification).filter(SystemNotification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    
    db.delete(notif)
    db.commit()
    return {"status": "success", "message": "Notification deleted."}


# ── Stats Overview ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    total_users = db.query(User).count()
    active_paths = db.query(LearningPath).filter(LearningPath.status == "active").count()
    total_notifications = db.query(SystemNotification).count()
    m_mode = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
    is_maintenance = m_mode.value.lower() == "true" if m_mode else False

    return {
        "total_users": total_users,
        "active_paths": active_paths,
        "total_notifications": total_notifications,
        "is_maintenance": is_maintenance,
    }
