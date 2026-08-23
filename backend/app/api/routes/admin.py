from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_admin_user, hash_password
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill
from app.models.learning import LearningPath, PathPhase, PathItem, PathAdaptation, AssessmentResult, ChatMessage
from app.models.admin import SystemSetting, SystemNotification, UserNotificationRead
from app.models.support import SupportTicket, TicketMessage

import os
import json
import time
from collections import Counter
import google.generativeai as genai
from app.core.config import settings
from app.services.recommendation_engine import RESOURCE_BY_ID, RESOURCES

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

class CreateResourceIn(BaseModel):
    title: str
    description: str
    provider: Optional[str] = "PathMind Academy"
    type: Optional[str] = "course"  # "course", "project", "assessment"
    difficulty: Optional[str] = "beginner"  # "beginner", "intermediate", "advanced"
    duration_hours: Optional[int] = 8
    url: Optional[str] = "https://learn.pathmind.ai"
    skills_taught: List[str] = []
    prerequisite_skills: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    rating: Optional[float] = 4.8
    is_project: Optional[bool] = False
    has_assessment: Optional[bool] = False


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
    
    try:
        user_email = target_user.email

        # 1. Clean up user notification reads
        db.query(UserNotificationRead).filter(UserNotificationRead.user_id == user_id).delete(synchronize_session=False)

        # 2. Clean up messages sent by this user in support tickets
        db.query(TicketMessage).filter(TicketMessage.sender_id == user_id).delete(synchronize_session=False)

        # 3. Clean up support tickets created by this user and their messages
        user_tickets = db.query(SupportTicket).filter(SupportTicket.user_id == user_id).all()
        for t in user_tickets:
            db.query(TicketMessage).filter(TicketMessage.ticket_id == t.id).delete(synchronize_session=False)
            db.delete(t)

        # 4. Clean up chat messages
        db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete(synchronize_session=False)

        # 5. Clean up assessment results
        db.query(AssessmentResult).filter(AssessmentResult.user_id == user_id).delete(synchronize_session=False)

        # 6. Clean up learning paths, phases, items, adaptations
        user_paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).all()
        for lp in user_paths:
            db.query(PathAdaptation).filter(PathAdaptation.path_id == lp.id).delete(synchronize_session=False)
            phases = db.query(PathPhase).filter(PathPhase.path_id == lp.id).all()
            for phase in phases:
                db.query(PathItem).filter(PathItem.phase_id == phase.id).delete(synchronize_session=False)
                db.delete(phase)
            db.delete(lp)

        # 7. Clean up learner skills
        db.query(LearnerSkill).filter(LearnerSkill.user_id == user_id).delete(synchronize_session=False)

        # 8. Clean up learner profile
        db.query(LearnerProfile).filter(LearnerProfile.user_id == user_id).delete(synchronize_session=False)

        # 9. Delete the user
        db.delete(target_user)
        db.commit()
        return {"status": "success", "message": f"User {user_email} and all associated records permanently deleted."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


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


# ── 1. Learner Roadmap Inspection Endpoint ───────────────────────────────────

@router.get("/users/{user_id}/roadmap")
def get_learner_roadmap_inspect(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user_id).first()
    skills = db.query(LearnerSkill).filter(LearnerSkill.user_id == user_id).all()
    active_path = db.query(LearningPath).filter(
        LearningPath.user_id == user_id
    ).order_by(LearningPath.created_at.desc()).first()

    roadmap_data = None
    if active_path:
        phases_data = []
        for p in active_path.phases:
            items_data = []
            for item in p.items:
                res_meta = RESOURCE_BY_ID.get(item.resource_id, {})
                items_data.append({
                    "id": item.id,
                    "resource_id": item.resource_id,
                    "title": res_meta.get("title", f"Unit #{item.order_index}"),
                    "description": res_meta.get("description", ""),
                    "type": res_meta.get("type", "course"),
                    "difficulty": res_meta.get("difficulty", "intermediate"),
                    "duration_hours": res_meta.get("duration_hours", 4),
                    "url": res_meta.get("url", ""),
                    "skills_taught": res_meta.get("skills_taught", []),
                    "order_index": item.order_index,
                    "status": item.status.value if hasattr(item.status, "value") else str(item.status),
                    "score": item.score,
                    "is_revision": item.is_revision,
                    "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                })

            phases_data.append({
                "id": p.id,
                "phase_number": p.phase_number,
                "title": p.title,
                "description": p.description,
                "week_start": p.week_start,
                "week_end": p.week_end,
                "status": p.status.value if hasattr(p.status, "value") else str(p.status),
                "items": items_data,
            })

        adaptations_data = [
            {
                "id": a.id,
                "trigger_event": a.trigger_event,
                "trigger_score": a.trigger_score,
                "description": a.description,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in active_path.adaptations
        ]

        roadmap_data = {
            "id": active_path.id,
            "goal_id": active_path.goal_id,
            "title": active_path.title,
            "status": active_path.status.value if hasattr(active_path.status, "value") else str(active_path.status),
            "total_weeks": active_path.total_weeks,
            "current_week": active_path.current_week,
            "overall_progress": active_path.overall_progress,
            "created_at": active_path.created_at.isoformat() if active_path.created_at else None,
            "phases": phases_data,
            "adaptations": adaptations_data,
        }

    return {
        "user": {
            "id": target_user.id,
            "name": target_user.name,
            "email": target_user.email,
            "role": target_user.role,
            "is_active": target_user.is_active,
            "created_at": target_user.created_at.isoformat() if target_user.created_at else None,
        },
        "profile": {
            "goal_id": profile.goal_id if profile else None,
            "goal_title": profile.goal_title if profile else "No Goal Set",
            "goal_description": profile.goal_description if profile else "",
            "experience_level": profile.experience_level.value if profile and hasattr(profile.experience_level, "value") else (profile.experience_level if profile else "beginner"),
            "hours_per_week": profile.hours_per_week if profile else 8,
            "target_weeks": profile.target_weeks if profile else 12,
            "learning_style": profile.learning_style.value if profile and hasattr(profile.learning_style, "value") else (profile.learning_style if profile else "mixed"),
            "interests": profile.interests if profile else [],
            "onboarding_complete": profile.onboarding_complete if profile else False,
        },
        "skills": [
            {
                "id": s.id,
                "skill_id": s.skill_id,
                "level": s.level,
                "source": s.source,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            }
            for s in skills
        ],
        "roadmap": roadmap_data,
    }


# ── 2. AI Engine Health & Gemini Telemetry ────────────────────────────────────

@router.get("/ai/telemetry")
def get_ai_telemetry(
    admin: User = Depends(get_current_admin_user),
):
    api_key = settings.GEMINI_API_KEY
    has_key = bool(api_key and len(api_key) > 5)
    masked_key = f"{api_key[:4]}...{api_key[-4:]}" if has_key else "NOT CONFIGURED"

    return {
        "status": "online" if has_key else "missing_key",
        "api_key_configured": has_key,
        "masked_key": masked_key,
        "primary_model": "gemini-3.6-flash",
        "fallback_models": [
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-3.7-flash",
            "gemini-flash-latest",
        ],
        "temperature": 0.35,
        "safety_guardrails": "Strict Non-repetitive Charismatic Persona v3.1",
        "system_status": "All AI Curricula Generative Subsystems Operational",
    }


@router.post("/ai/ping")
def ping_ai_service(
    admin: User = Depends(get_current_admin_user),
):
    start_time = time.time()
    candidate_models = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]
    last_err = None
    
    for model_name in candidate_models:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                "Ping test: respond with 'PathMind AI Engine Online'",
                generation_config={"max_output_tokens": 12, "temperature": 0.0}
            )
            latency_ms = round((time.time() - start_time) * 1000, 1)

            return {
                "status": "success",
                "latency_ms": latency_ms,
                "model_used": model_name,
                "response": response.text.strip() if hasattr(response, "text") and response.text else "PathMind AI Engine Online",
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            last_err = str(e)
            continue
            
    latency_ms = round((time.time() - start_time) * 1000, 1)
    return {
        "status": "error",
        "latency_ms": latency_ms,
        "error_detail": last_err or "Unknown Gemini error",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── 3. Resource & Curriculum Manager ──────────────────────────────────────────

_DATA_RESOURCES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "resources.json")


def _read_all_resources() -> List[dict]:
    try:
        with open(_DATA_RESOURCES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return RESOURCES


def _write_all_resources(data: List[dict]):
    with open(_DATA_RESOURCES_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    # Sync in-memory global caches
    global RESOURCES, RESOURCE_BY_ID
    RESOURCES.clear()
    RESOURCES.extend(data)
    RESOURCE_BY_ID.clear()
    RESOURCE_BY_ID.update({r["id"]: r for r in data})


@router.get("/resources")
def get_all_resources(
    query: Optional[str] = None,
    difficulty: Optional[str] = None,
    type_filter: Optional[str] = None,
    admin: User = Depends(get_current_admin_user),
):
    items = _read_all_resources()
    if query:
        q = query.lower()
        items = [
            r for r in items
            if q in r.get("title", "").lower()
            or q in r.get("description", "").lower()
            or any(q in s.lower() for s in r.get("skills_taught", []))
            or any(q in t.lower() for t in r.get("tags", []))
        ]
    if difficulty and difficulty != "ALL":
        items = [r for r in items if r.get("difficulty") == difficulty]
    if type_filter and type_filter != "ALL":
        items = [r for r in items if r.get("type") == type_filter]

    return {
        "total": len(items),
        "resources": items,
    }


@router.post("/resources")
def create_new_resource(
    payload: CreateResourceIn,
    admin: User = Depends(get_current_admin_user),
):
    current = _read_all_resources()
    new_id = f"res-custom-{len(current) + 1:03d}"
    
    new_res = {
        "id": new_id,
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "provider": payload.provider.strip(),
        "type": payload.type,
        "difficulty": payload.difficulty,
        "duration_hours": payload.duration_hours,
        "url": payload.url.strip(),
        "skills_taught": payload.skills_taught,
        "prerequisite_skills": payload.prerequisite_skills or [],
        "tags": payload.tags or [],
        "rating": payload.rating or 4.8,
        "is_project": payload.is_project or (payload.type == "project"),
        "has_assessment": payload.has_assessment or False,
    }
    
    current.insert(0, new_res)
    _write_all_resources(current)

    return {
        "status": "success",
        "resource": new_res,
        "message": f"Learning unit '{new_res['title']}' created successfully.",
    }


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: str,
    admin: User = Depends(get_current_admin_user),
):
    current = _read_all_resources()
    filtered = [r for r in current if r.get("id") != resource_id]
    if len(filtered) == len(current):
        raise HTTPException(status_code=404, detail="Resource not found in catalog.")
    
    _write_all_resources(filtered)
    return {"status": "success", "message": f"Resource {resource_id} removed from catalog."}


# ── 4. Platform Analytics & Skill Distribution ───────────────────────────────

@router.get("/analytics")
def get_platform_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    # 1. Goal Distribution
    profiles = db.query(LearnerProfile).all()
    goals_counter = Counter([p.goal_title for p in profiles if p.goal_title])
    goals_dist = [{"goal": k, "count": v} for k, v in goals_counter.most_common(8)]

    # 2. Experience Levels
    exp_counter = Counter([p.experience_level.value if hasattr(p.experience_level, "value") else str(p.experience_level) for p in profiles])
    exp_dist = [{"level": k, "count": v} for k, v in exp_counter.items()]

    # 3. Learning Styles
    style_counter = Counter([p.learning_style.value if hasattr(p.learning_style, "value") else str(p.learning_style) for p in profiles])
    style_dist = [{"style": k, "count": v} for k, v in style_counter.items()]

    # 4. Roadmap Progress Distribution Buckets
    paths = db.query(LearningPath).all()
    buckets = {"0-25%": 0, "26-50%": 0, "51-75%": 0, "76-100%": 0}
    for path in paths:
        pct = (path.overall_progress or 0) * 100
        if pct <= 25:
            buckets["0-25%"] += 1
        elif pct <= 50:
            buckets["26-50%"] += 1
        elif pct <= 75:
            buckets["51-75%"] += 1
        else:
            buckets["76-100%"] += 1
    progress_dist = [{"bucket": k, "count": v} for k, v in buckets.items()]

    # 5. Top 10 Tracked Skills
    skills = db.query(LearnerSkill).all()
    skill_counter = Counter([s.skill_id for s in skills])
    top_skills = [{"skill": k, "count": v} for k, v in skill_counter.most_common(10)]

    # 6. Ticket Resolution Metrics
    total_tickets = db.query(SupportTicket).count()
    resolved_tickets = db.query(SupportTicket).filter(SupportTicket.status.in_(["resolved", "closed"])).count()
    resolution_rate = round((resolved_tickets / total_tickets * 100), 1) if total_tickets > 0 else 100.0

    # 7. Assessments completed count
    total_assessments = db.query(AssessmentResult).count()

    return {
        "goals_distribution": goals_dist,
        "experience_distribution": exp_dist,
        "styles_distribution": style_dist,
        "progress_distribution": progress_dist,
        "top_skills": top_skills,
        "tickets_metrics": {
            "total": total_tickets,
            "resolved": resolved_tickets,
            "resolution_rate_pct": resolution_rate,
        },
        "total_assessments_taken": total_assessments,
    }


# ── 5. Real-time System Audit Activity Stream ─────────────────────────────────

@router.get("/activity-stream")
def get_system_activity_stream(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    events = []

    # 1. User Signups
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(15).all()
    for u in recent_users:
        if u.created_at:
            events.append({
                "id": f"signup-{u.id}",
                "type": "signup",
                "title": f"New Learner Registered",
                "description": f"{u.name} ({u.email}) created an account.",
                "actor": u.email,
                "timestamp": u.created_at.isoformat(),
            })

    # 2. Learning Paths Generated
    recent_paths = db.query(LearningPath).order_by(LearningPath.created_at.desc()).limit(15).all()
    for lp in recent_paths:
        if lp.created_at:
            u = lp.user
            events.append({
                "id": f"path-{lp.id}",
                "type": "path_generated",
                "title": f"Curriculum Synthesized",
                "description": f"AI generated {lp.total_weeks}-week roadmap '{lp.title}' for {u.name if u else 'Learner'}.",
                "actor": u.email if u else "AI Engine",
                "timestamp": lp.created_at.isoformat(),
            })

    # 3. Assessment Submissions
    recent_assessments = db.query(AssessmentResult).order_by(AssessmentResult.taken_at.desc()).limit(15).all()
    for ar in recent_assessments:
        if ar.taken_at:
            u = ar.user
            score_pct = int(ar.score * 100)
            events.append({
                "id": f"assess-{ar.id}",
                "type": "assessment",
                "title": f"Skill Assessment Submitted",
                "description": f"{u.name if u else 'Learner'} scored {score_pct}% on '{ar.assessment_id}'.",
                "actor": u.email if u else "Learner",
                "timestamp": ar.taken_at.isoformat(),
            })

    # 4. Support Tickets
    recent_tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).limit(10).all()
    for t in recent_tickets:
        if t.created_at:
            u = t.user
            events.append({
                "id": f"ticket-{t.id}",
                "type": "ticket",
                "title": f"Support Ticket Opened",
                "description": f"[{t.priority.upper()}] '{t.subject}' filed by {u.name if u else 'Learner'}.",
                "actor": u.email if u else "Learner",
                "timestamp": t.created_at.isoformat(),
            })

    # Sort all events chronologically descending
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events[:35]

