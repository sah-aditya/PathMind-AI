from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill
from app.services.skill_gap_engine import compute_skill_gap, GOALS_DATA

router = APIRouter(prefix="/profile", tags=["profile"])


class SkillInput(BaseModel):
    skill_id: str
    level: float  # 0.0 to 1.0


class ProfileUpdate(BaseModel):
    goal_id: str = None
    goal_title: str = None
    goal_description: str = None
    experience_level: str = None
    hours_per_week: int = None
    target_weeks: int = None
    learning_style: str = None
    interests: List[str] = None
    skills: List[SkillInput] = None
    onboarding_complete: bool = None


@router.get("/")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(LearnerProfile).filter(
        LearnerProfile.user_id == current_user.id
    ).first()

    learner_skills = db.query(LearnerSkill).filter(
        LearnerSkill.user_id == current_user.id
    ).all()

    skills_dict = {s.skill_id: s.level for s in learner_skills}

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
        },
        "profile": {
            "goal_id": profile.goal_id if profile else None,
            "goal_title": profile.goal_title if profile else None,
            "goal_description": profile.goal_description if profile else None,
            "experience_level": profile.experience_level if profile else "beginner",
            "hours_per_week": profile.hours_per_week if profile else 8,
            "learning_style": profile.learning_style if profile else "mixed",
            "interests": profile.interests if profile else [],
            "onboarding_complete": profile.onboarding_complete if profile else False,
        },
        "skills": skills_dict,
    }


@router.put("/")
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(LearnerProfile).filter(
        LearnerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)

    # Update profile fields
    for field, value in payload.dict(exclude_none=True, exclude={"skills"}).items():
        if hasattr(profile, field) and value is not None:
            setattr(profile, field, value)

    # Update skills
    if payload.skills:
        for skill_input in payload.skills:
            existing = db.query(LearnerSkill).filter(
                LearnerSkill.user_id == current_user.id,
                LearnerSkill.skill_id == skill_input.skill_id,
            ).first()
            if existing:
                existing.level = skill_input.level
                existing.source = "self_assessed"
            else:
                db.add(LearnerSkill(
                    user_id=current_user.id,
                    skill_id=skill_input.skill_id,
                    level=skill_input.level,
                    source="self_assessed",
                ))

    db.commit()
    return {"message": "Profile updated successfully"}


@router.get("/goals")
def get_goals():
    """Return all available career goal options."""
    return [
        {
            "id": goal_id,
            "title": goal["title"],
            "description": goal["description"],
            "typical_weeks": goal["typical_path_weeks"],
        }
        for goal_id, goal in GOALS_DATA.items()
    ]


class UpdateNameRequest(BaseModel):
    name: str


@router.put("/name")
def update_name(
    payload: UpdateNameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if getattr(current_user, "can_change_name", True) is False:
        raise HTTPException(
            status_code=403,
            detail="Name changes are locked for your account by the administrator.",
        )

    clean_name = payload.name.strip()
    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters.")

    current_user.name = clean_name
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Name updated successfully",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": getattr(current_user, "role", "user"),
            "can_change_name": getattr(current_user, "can_change_name", True),
            "can_change_password": getattr(current_user, "can_change_password", True),
        }
    }


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.put("/password")
def update_password(
    payload: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.core.security import verify_password, hash_password

    if getattr(current_user, "can_change_password", True) is False:
        raise HTTPException(
            status_code=403,
            detail="Password changes are locked for your account by the administrator.",
        )

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.raw_password = payload.new_password
    db.commit()

    return {"message": "Password changed successfully"}

