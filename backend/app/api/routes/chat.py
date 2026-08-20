from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import ChatMessage
from app.ai.gemini_service import chat_onboarding, answer_question, match_goal_to_id
from app.models.profile import LearnerProfile, LearnerSkill

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
    # Load recent chat history
    history_rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(20)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in history_rows]

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


@router.get("/history")
def get_chat_history(
    phase: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if phase:
        query = query.filter(ChatMessage.msg_metadata["phase"].astext == phase)
    messages = query.order_by(ChatMessage.created_at.asc()).limit(limit).all()
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
    for skill_name in known_skills:
        # Normalize skill name to skill_id
        skill_id = skill_name.lower().replace(" ", "-")
        # Check if it exists in our taxonomy (fuzzy match)
        matched_id = None
        for sid, sdata in SKILL_BY_ID.items():
            if skill_id in sid or skill_id in sdata.get("name", "").lower():
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
                    level=0.70,  # Known skill = 70% mastery assumed
                    source="self_assessed",
                ))

    db.commit()
