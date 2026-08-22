from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.support import SupportTicket, TicketMessage
from app.core.security import get_current_user

router = APIRouter(prefix="/support", tags=["Support"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class TicketCreateIn(BaseModel):
    subject: str
    category: str = "curriculum"  # "curriculum", "resource_issue", "account_access", "feature_request", "general"
    priority: str = "normal"  # "normal", "high", "urgent"
    initial_message: str


class TicketReplyIn(BaseModel):
    message: str


class TicketMessageOut(BaseModel):
    id: int
    sender_id: Optional[int]
    sender_role: str
    sender_name: str
    message: str
    created_at: str


class TicketSummaryOut(BaseModel):
    id: int
    subject: str
    category: str
    priority: str
    status: str
    created_at: str
    updated_at: str
    resolved_at: Optional[str]
    messages_count: int
    latest_message: Optional[str]
    last_sender_role: Optional[str]


class TicketDetailOut(BaseModel):
    id: int
    subject: str
    category: str
    priority: str
    status: str
    created_at: str
    updated_at: str
    resolved_at: Optional[str]
    resolved_by: Optional[str]
    messages: List[TicketMessageOut]


# ── Learner Support Endpoints ──────────────────────────────────────────────────

@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.subject.strip() or not payload.initial_message.strip():
        raise HTTPException(status_code=400, detail="Subject and message are required.")
    
    new_ticket = SupportTicket(
        user_id=current_user.id,
        subject=payload.subject.strip(),
        category=payload.category,
        priority=payload.priority,
        status="open",
    )
    db.add(new_ticket)
    db.flush()

    # Initial message
    msg = TicketMessage(
        ticket_id=new_ticket.id,
        sender_id=current_user.id,
        sender_role="user",
        sender_name=current_user.name,
        message=payload.initial_message.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(new_ticket)

    return {
        "status": "success",
        "ticket_id": new_ticket.id,
        "message": "Support ticket created successfully. Our team will review and reply shortly.",
    }


@router.get("/tickets")
def list_user_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.updated_at.desc()).all()

    result = []
    for t in tickets:
        msgs = t.messages
        latest_msg = msgs[-1].message if msgs else ""
        last_role = msgs[-1].sender_role if msgs else "user"

        result.append({
            "id": t.id,
            "subject": t.subject,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "messages_count": len(msgs),
            "latest_message": latest_msg,
            "last_sender_role": last_role,
        })
    return result


@router.get("/tickets/{ticket_id}")
def get_ticket_details(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    return {
        "id": ticket.id,
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


@router.post("/tickets/{ticket_id}/reply")
def reply_to_ticket(
    ticket_id: int,
    payload: TicketReplyIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Reply message cannot be empty.")

    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    # Reopen if user replies to a resolved ticket
    if ticket.status in ["resolved", "closed"]:
        ticket.status = "in_progress"
        ticket.resolved_at = None

    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_role="user",
        sender_name=current_user.name,
        message=payload.message.strip(),
    )
    db.add(msg)
    ticket.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "success", "message": "Reply posted successfully."}


@router.put("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    ticket.status = "resolved"
    ticket.resolved_at = datetime.utcnow()
    ticket.resolved_by = f"Learner ({current_user.name})"
    ticket.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "success", "message": "Ticket marked as resolved."}
