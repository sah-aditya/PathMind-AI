from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill
from app.models.learning import (
    LearningPath, PathPhase, PathItem, PathAdaptation,
    PathStatus, PhaseStatus, ItemStatus
)
from app.services.skill_gap_engine import compute_skill_gap, GOALS_DATA
from app.services.path_generator import generate_path
from app.services.adaptive_engine import (
    evaluate_and_adapt, update_skill_level_from_score, calculate_path_progress
)

router = APIRouter(prefix="/learning-path", tags=["learning-path"])


# ─── Generate Path ───────────────────────────────────────────────────────────

@router.post("/generate")
def generate_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(LearnerProfile).filter(
        LearnerProfile.user_id == current_user.id
    ).first()

    if not profile or not profile.goal_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete onboarding and set a goal before generating a path.",
        )

    learner_skills_raw = db.query(LearnerSkill).filter(
        LearnerSkill.user_id == current_user.id
    ).all()
    learner_skills = {s.skill_id: s.level for s in learner_skills_raw}

    # Deactivate any existing active path
    existing = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.status == PathStatus.active,
    ).first()
    if existing:
        existing.status = PathStatus.paused

    # Compute skill gap
    gap_report = compute_skill_gap(
        goal_id=profile.goal_id,
        learner_skills=learner_skills,
        hours_per_week=profile.hours_per_week or 8,
    )

    # Generate path plan
    plan = generate_path(
        gap_report=gap_report,
        learner_skills=learner_skills,
        experience_level=profile.experience_level or "beginner",
        hours_per_week=profile.hours_per_week or 8,
        interests=profile.interests or [],
        learning_style=profile.learning_style or "mixed",
    )

    # Persist to DB
    db_path = LearningPath(
        user_id=current_user.id,
        goal_id=profile.goal_id,
        title=plan.title,
        total_weeks=plan.total_weeks,
        overall_progress=0.0,
    )
    db.add(db_path)
    db.flush()

    for phase_plan in plan.phases:
        db_phase = PathPhase(
            path_id=db_path.id,
            phase_number=phase_plan.phase_number,
            title=phase_plan.title,
            description=phase_plan.description,
            week_start=phase_plan.week_start,
            week_end=phase_plan.week_end,
            status=PhaseStatus.active if phase_plan.phase_number == 1 else PhaseStatus.locked,
        )
        db.add(db_phase)
        db.flush()

        for item_plan in phase_plan.items:
            db_item = PathItem(
                phase_id=db_phase.id,
                resource_id=item_plan.resource_id,
                order_index=item_plan.order_index,
                status=ItemStatus.pending,
                is_revision=item_plan.is_revision,
            )
            db.add(db_item)

    db.commit()
    db.refresh(db_path)

    return _serialize_path(db_path)


# ─── Get Active Path ──────────────────────────────────────────────────────────

@router.get("/active")
def get_active_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    path = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.status == PathStatus.active,
    ).first()

    if not path:
        return {"path": None}

    return {"path": _serialize_path(path)}


@router.get("/{path_id}")
def get_path(
    path_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    path = db.query(LearningPath).filter(
        LearningPath.id == path_id,
        LearningPath.user_id == current_user.id,
    ).first()
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    return _serialize_path(path)


# ─── Update Item Status ───────────────────────────────────────────────────────

class ItemStatusUpdate(BaseModel):
    status: str  # "in_progress" | "completed" | "skipped"


@router.put("/items/{item_id}/status")
def update_item_status(
    item_id: int,
    payload: ItemStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(PathItem).filter(PathItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Security: verify ownership
    phase = item.phase
    path = phase.path
    if path.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    item.status = ItemStatus(payload.status)
    if payload.status == "completed":
        item.completed_at = datetime.utcnow()
        # Update phase status if all items done
        all_done = all(i.status in (ItemStatus.completed, ItemStatus.skipped) for i in phase.items)
        if all_done:
            phase.status = PhaseStatus.completed
            # Unlock next phase
            next_phase = db.query(PathPhase).filter(
                PathPhase.path_id == path.id,
                PathPhase.phase_number == phase.phase_number + 1,
            ).first()
            if next_phase:
                next_phase.status = PhaseStatus.active

    # Recalculate overall progress
    progress, week = calculate_path_progress(path, db)
    path.overall_progress = progress
    path.current_week = week

    db.commit()
    return {"message": "Status updated", "overall_progress": progress}


# ─── Skill Gap ────────────────────────────────────────────────────────────────

@router.get("/skill-gap/report")
def get_skill_gap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(LearnerProfile).filter(
        LearnerProfile.user_id == current_user.id
    ).first()
    if not profile or not profile.goal_id:
        raise HTTPException(status_code=400, detail="Set a goal first")

    learner_skills_raw = db.query(LearnerSkill).filter(
        LearnerSkill.user_id == current_user.id
    ).all()
    learner_skills = {s.skill_id: s.level for s in learner_skills_raw}

    gap = compute_skill_gap(
        goal_id=profile.goal_id,
        learner_skills=learner_skills,
        hours_per_week=profile.hours_per_week or 8,
    )

    return {
        "goal_id": gap.goal_id,
        "goal_title": gap.goal_title,
        "overall_readiness": gap.overall_readiness,
        "estimated_weeks": gap.estimated_weeks,
        "skills_already_met": gap.skills_already_met,
        "skills_to_learn": [
            {
                "skill_id": sg.skill_id,
                "skill_name": sg.skill_name,
                "category": sg.category,
                "current_level": sg.current_level,
                "required_level": sg.required_level,
                "gap": sg.gap,
                "priority": sg.priority,
                "is_prerequisite": sg.is_prerequisite,
            }
            for sg in gap.skills_to_learn
        ],
    }


# ─── Serializer ───────────────────────────────────────────────────────────────

def _serialize_path(path: LearningPath) -> dict:
    from app.services.recommendation_engine import RESOURCE_BY_ID
    from app.services.skill_gap_engine import GOALS_DATA
    from app.data_helpers import get_assessment_for_resource

    phases = []
    for phase in path.phases:
        items = []
        for item in sorted(phase.items, key=lambda x: x.order_index):
            resource = RESOURCE_BY_ID.get(item.resource_id, {})
            asmt_data = get_assessment_for_resource(item.resource_id)
            items.append({
                "id": item.id,
                "resource_id": item.resource_id,
                "title": resource.get("title", "Unknown"),
                "type": resource.get("type", "course"),
                "difficulty": resource.get("difficulty", "beginner"),
                "duration_hours": resource.get("duration_hours", 0),
                "description": resource.get("description", ""),
                "provider": resource.get("provider", ""),
                "skills_taught": resource.get("skills_taught", []),
                "tags": resource.get("tags", []),
                "rating": resource.get("rating", 4.5),
                "is_project": resource.get("is_project", False),
                "has_assessment": resource.get("has_assessment", False),
                "assessment_id": asmt_data["id"] if asmt_data else None,
                "status": item.status.value,
                "score": item.score,
                "is_revision": item.is_revision,
                "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                "order_index": item.order_index,
            })
        phases.append({
            "id": phase.id,
            "phase_number": phase.phase_number,
            "title": phase.title,
            "description": phase.description,
            "week_start": phase.week_start,
            "week_end": phase.week_end,
            "status": phase.status.value,
            "items": items,
            "items_completed": sum(1 for i in items if i["status"] == "completed"),
            "items_total": len(items),
        })

    return {
        "id": path.id,
        "goal_id": path.goal_id,
        "goal_title": GOALS_DATA.get(path.goal_id, {}).get("title", path.goal_id),
        "title": path.title,
        "status": path.status.value,
        "total_weeks": path.total_weeks,
        "current_week": path.current_week,
        "overall_progress": path.overall_progress,
        "created_at": path.created_at.isoformat() if path.created_at else None,
        "phases": phases,
        "adaptations": [
            {
                "id": a.id,
                "trigger_event": a.trigger_event,
                "description": a.description,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in (path.adaptations or [])
        ],
    }
