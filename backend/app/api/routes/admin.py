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
from app.models.support import SupportTicket, TicketMessage

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class UpdateNameIn(BaseModel):
    name: str

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


@router.put("/users/{user_id}/name")
def update_user_name(
    user_id: int,
    payload: UpdateNameIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    clean_name = payload.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be blank.")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    target_user.name = clean_name
    db.commit()
    return {"status": "success", "name": target_user.name, "message": f"Name updated to {clean_name}."}


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


# ── Support Helpdesk Management ────────────────────────────────────────────────

class AdminTicketReplyIn(BaseModel):
    message: str
    status: Optional[str] = "in_progress"  # "in_progress", "resolved", "closed"

class AdminTicketStatusIn(BaseModel):
    status: str  # "open", "in_progress", "resolved", "closed"


@router.get("/support/tickets")
def get_all_support_tickets(
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    query = db.query(SupportTicket)
    if status_filter and status_filter != "ALL":
        query = query.filter(SupportTicket.status == status_filter)
    if category_filter and category_filter != "ALL":
        query = query.filter(SupportTicket.category == category_filter)
    
    tickets = query.order_by(SupportTicket.updated_at.desc()).all()
    result = []
    for t in tickets:
        u = t.user
        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == t.user_id).first()
        msgs = t.messages
        latest_msg = msgs[-1].message if msgs else ""
        last_role = msgs[-1].sender_role if msgs else "user"

        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": u.name if u else "Deleted User",
            "user_email": u.email if u else "—",
            "user_goal": profile.goal_title if profile else "No Goal Set",
            "subject": t.subject,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "resolved_by": t.resolved_by,
            "messages_count": len(msgs),
            "latest_message": latest_msg,
            "last_sender_role": last_role,
        })
    return result


@router.get("/support/tickets/{ticket_id}")
def get_admin_ticket_detail(
    ticket_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    u = ticket.user
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == ticket.user_id).first()

    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "user_name": u.name if u else "Deleted User",
        "user_email": u.email if u else "—",
        "user_goal": profile.goal_title if profile else "No Goal Set",
        "subject": ticket.subject,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
        "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
        "resolved_by": ticket.resolved_by,
        "messages": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "sender_role": m.sender_role,
                "sender_name": m.sender_name,
                "message": m.message,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in ticket.messages
        ],
    }


@router.post("/support/tickets/{ticket_id}/reply")
def admin_reply_to_ticket(
    ticket_id: int,
    payload: AdminTicketReplyIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Reply message cannot be empty.")
    
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    # Add message
    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=admin.id,
        sender_role="admin",
        sender_name="PathMind Support",
        message=payload.message.strip(),
    )
    db.add(msg)
    
    # Update status
    target_status = payload.status or "in_progress"
    ticket.status = target_status
    ticket.updated_at = datetime.utcnow()
    if target_status == "resolved":
        ticket.resolved_at = datetime.utcnow()
        ticket.resolved_by = f"Superadmin ({admin.email})"
    
    db.commit()
    return {"status": "success", "message": "Support reply dispatched to user."}


@router.put("/support/tickets/{ticket_id}/status")
def admin_update_ticket_status(
    ticket_id: int,
    payload: AdminTicketStatusIn,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    ticket.status = payload.status
    ticket.updated_at = datetime.utcnow()
    if payload.status == "resolved":
        ticket.resolved_at = datetime.utcnow()
        ticket.resolved_by = f"Superadmin ({admin.email})"
    elif payload.status in ["open", "in_progress"]:
        ticket.resolved_at = None
        ticket.resolved_by = None
    
    db.commit()
    return {"status": "success", "message": f"Ticket status changed to {payload.status}."}


@router.delete("/support/tickets/{ticket_id}")
def admin_delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    
    db.delete(ticket)
    db.commit()
    return {"status": "success", "message": "Ticket disposed and deleted."}


# ── Stats Overview ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    total_users = db.query(User).count()
    active_paths = db.query(LearningPath).filter(LearningPath.status == "active").count()
    total_notifications = db.query(SystemNotification).count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status.in_(["open", "in_progress"])).count()
    total_tickets = db.query(SupportTicket).count()
    m_mode = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
    is_maintenance = m_mode.value.lower() == "true" if m_mode else False

    return {
        "total_users": total_users,
        "active_paths": active_paths,
        "total_notifications": total_notifications,
        "open_tickets": open_tickets,
        "total_tickets": total_tickets,
        "is_maintenance": is_maintenance,
    }
