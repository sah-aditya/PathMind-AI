from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import re

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import ChatMessage
from app.ai.gemini_service import chat_onboarding, answer_question, match_goal_to_id
from app.models.profile import LearnerProfile, LearnerSkill

# Keywords that clearly indicate non-tech/non-CS career goals
_NON_TECH_KEYWORDS = [
    "pilot", "aviation", "flight", "cockpit", "airline",
    "doctor", "physician", "surgeon", "nurse", "medical",
    "lawyer", "attorney", "legal", "advocate",
    "chef", "cook", "culinary",
    "actor", "singer", "musician", "performer",
    "athlete", "football", "cricket", "basketball", "sports",
    "soldier", "army", "military", "navy", "airforce",
    "teacher", "professor", "educator",
    "accountant", "chartered accountant", "ca ",
    "fashion", "model", "modeling",
]

def _is_non_tech_goal(text: str) -> bool:
    low = text.lower()
    return any(kw in low for kw in _NON_TECH_KEYWORDS)

_NON_TECH_REPLY = (
    "That's a wonderful aspiration! ✈️ However, **PathMind AI specializes in "
    "tech and software career paths** — fields like Data Science, Web Development, "
    "DevOps, Mobile Development, UI/UX Design, and more.\n\n"
    "If you're interested in breaking into tech or adding technical skills alongside "
    "your other goals, I'd love to help! Otherwise, there are great resources outside "
    "PathMind for your specific path.\n\n"
    "Would you like to explore a tech career goal instead?"
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessageIn(BaseModel):
    message: str
    phase: str = "assistant"  # "onboarding" | "assistant"


@router.post("/message")
async def send_message(
    payload: ChatMessageIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ── Load phase-specific history safely ──────────────────────────────────
    # Fetch recent messages for the user ordered by creation time
    all_user_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    # Filter in Python by phase to avoid database dialect / JSON column issues
    target_phase = payload.phase or "assistant"
    filtered_rows = [
        m for m in all_user_messages
        if isinstance(m.msg_metadata, dict) and m.msg_metadata.get("phase") == target_phase
    ]

    # Limit to reasonable recent context
    limit_count = 30 if target_phase == "onboarding" else 12
    history_rows = filtered_rows[-limit_count:]

    history = [{"role": m.role, "content": m.content, "phase": target_phase} for m in history_rows]

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=payload.message,
        msg_metadata={"phase": payload.phase},
    )
    db.add(user_msg)
    db.flush()

    if payload.phase == "onboarding":
        # ── Non-tech goal detection ────────────────────────────────────────
        # Check the first user message for clearly non-tech goals
        first_user_turns = [m for m in history if m["role"] == "user"]
        if len(first_user_turns) == 0 and _is_non_tech_goal(payload.message):
            reply = _NON_TECH_REPLY
            profile_ready = False
            extracted_profile = None
        else:
            result = await chat_onboarding(
                messages=history,
                user_message=payload.message,
            )
            reply = result["reply"]
            profile_ready = result["profile_ready"]
            extracted_profile = result.get("profile")

            # If profile is ready, save it
            if profile_ready and extracted_profile:
                await _save_extracted_profile(
                    user_id=current_user.id,
                    extracted=extracted_profile,
                    db=db,
                )

    else:
        # Build learner context for Q&A
        profile = db.query(LearnerProfile).filter(
            LearnerProfile.user_id == current_user.id
        ).first()
        skills = db.query(LearnerSkill).filter(
            LearnerSkill.user_id == current_user.id
        ).all()
        learner_context = {
            "name": current_user.name,
            "goal": profile.goal_title if profile else "Unknown",
            "experience_level": profile.experience_level if profile else "beginner",
            "skills": {s.skill_id: s.level for s in skills},
            "hours_per_week": profile.hours_per_week if profile else 8,
        }
        reply = await answer_question(
            user_question=payload.message,
            chat_history=history,
            learner_context=learner_context,
        )
        profile_ready = False
        extracted_profile = None

    # Save assistant reply
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=reply,
        msg_metadata={"phase": payload.phase, "profile_ready": profile_ready},
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "reply": reply,
        "profile_ready": profile_ready,
        "profile": extracted_profile,
    }


@router.post("/reset")
def reset_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete ALL chat history for the current user.
    Called when the user navigates to Re-onboard to start fresh.
    """
    deleted = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"deleted": deleted, "message": "Chat history cleared. Starting fresh!"}


@router.get("/history")
def get_chat_history(
    phase: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    if phase:
        messages = [
            m for m in messages
            if isinstance(m.msg_metadata, dict) and m.msg_metadata.get("phase") == phase
        ]
    messages = messages[-limit:]
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


async def _save_extracted_profile(user_id: int, extracted: dict, db):
    """Save the AI-extracted profile to the database."""
    from app.services.skill_gap_engine import GOALS_DATA
    from app.services.skill_gap_engine import SKILL_BY_ID

    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user_id).first()
    if not profile:
        profile = LearnerProfile(user_id=user_id)
        db.add(profile)

    # Match goal text to our taxonomy
    goal_text = extracted.get("goal_text", "")
    if goal_text:
        goal_id = match_goal_to_id(goal_text, GOALS_DATA)
        profile.goal_id = goal_id
        profile.goal_title = GOALS_DATA.get(goal_id, {}).get("title", goal_text)
        profile.goal_description = goal_text

    profile.experience_level = extracted.get("experience_level", "beginner")
    profile.hours_per_week = int(extracted.get("hours_per_week", 8))
    profile.interests = extracted.get("interests", [])
    profile.learning_style = extracted.get("learning_style", "mixed")
    profile.onboarding_complete = True

    # Save known skills
    known_skills = extracted.get("known_skills", [])
    
    # Common shorthand mappings
    alias_map = {
        "python": "python-basics",
        "python basics": "python-basics",
        "sql": "sql-basics",
        "sql basics": "sql-basics",
        "js": "javascript-basics",
        "javascript": "javascript-basics",
        "git": "git-basics",
        "math": "linear-algebra",
        "calculus": "calculus",
        "statistics": "statistics",
        "html": "html-css",
        "css": "html-css",
    }

    for skill_name in known_skills:
        clean_name = str(skill_name).strip().lower()
        matched_id = alias_map.get(clean_name)
        
        if not matched_id:
            normalized = clean_name.replace(" ", "-")
            for sid, sdata in SKILL_BY_ID.items():
                if sid == normalized or normalized in sid or clean_name in sdata.get("name", "").lower():
                    matched_id = sid
                    break
                    
        if matched_id:
            existing = db.query(LearnerSkill).filter(
                LearnerSkill.user_id == user_id,
                LearnerSkill.skill_id == matched_id,
            ).first()
            if not existing:
                db.add(LearnerSkill(
                    user_id=user_id,
                    skill_id=matched_id,
                    level=0.75,  # Known skill = 75% mastery assumed
                    source="self_assessed",
                ))
            else:
                existing.level = max(existing.level, 0.75)
                existing.source = "self_assessed"

    db.commit()
