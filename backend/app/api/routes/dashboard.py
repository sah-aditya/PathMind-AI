from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill
from app.models.learning import LearningPath, PathItem, AssessmentResult, PathAdaptation, PathStatus, ItemStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(LearnerProfile).filter(
        LearnerProfile.user_id == current_user.id
    ).first()

    active_path = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.status == PathStatus.active,
    ).first()

    learner_skills = db.query(LearnerSkill).filter(
        LearnerSkill.user_id == current_user.id
    ).all()

    skills_map = {s.skill_id: s.level for s in learner_skills}

    # Skill categories summary
    from app.services.skill_gap_engine import SKILL_BY_ID, GOALS_DATA
    skill_by_category: dict = {}
    for skill_id, level in skills_map.items():
        info = SKILL_BY_ID.get(skill_id, {})
        category = info.get("category", "Other")
        if category not in skill_by_category:
            skill_by_category[category] = {"total": 0, "sum": 0.0, "skills": []}
        skill_by_category[category]["total"] += 1
        skill_by_category[category]["sum"] += level
        skill_by_category[category]["skills"].append({"id": skill_id, "name": info.get("name", skill_id), "level": level})

    skill_categories = [
        {
            "category": cat,
            "average_level": round(data["sum"] / data["total"], 3),
            "skills": sorted(data["skills"], key=lambda x: -x["level"]),
        }
        for cat, data in skill_by_category.items()
    ]

    # Path stats
    path_data = None
    next_action = None
    recent_adaptations = []

    if active_path:
        all_items = [item for phase in active_path.phases for item in phase.items]
        completed_items = [i for i in all_items if i.status == ItemStatus.completed]
        pending_items = [i for i in all_items if i.status == ItemStatus.pending]

        # Find the next pending item
        if pending_items:
            from app.services.recommendation_engine import RESOURCE_BY_ID
            next_item = sorted(pending_items, key=lambda x: x.order_index)[0]
            resource = RESOURCE_BY_ID.get(next_item.resource_id, {})
            phase_of_next = next(
                (ph for ph in active_path.phases for it in ph.items if it.id == next_item.id),
                None
            )
            next_action = {
                "item_id": next_item.id,
                "resource_id": next_item.resource_id,
                "title": resource.get("title", "Next Resource"),
                "type": resource.get("type", "course"),
                "duration_hours": resource.get("duration_hours", 0),
                "phase_title": phase_of_next.title if phase_of_next else "",
                "has_assessment": resource.get("has_assessment", False),
            }

        # Recent assessments
        recent_results = (
            db.query(AssessmentResult)
            .filter(AssessmentResult.user_id == current_user.id)
            .order_by(AssessmentResult.taken_at.desc())
            .limit(5)
            .all()
        )

        # Recent adaptations
        recent_adaptations = [
            {
                "id": a.id,
                "trigger": a.trigger_event,
                "description": a.description,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in sorted(active_path.adaptations or [], key=lambda x: x.created_at or 0, reverse=True)[:3]
        ]

        path_data = {
            "id": active_path.id,
            "title": active_path.title,
            "goal_id": active_path.goal_id,
            "goal_title": GOALS_DATA.get(active_path.goal_id, {}).get("title", active_path.goal_id),
            "overall_progress": active_path.overall_progress,
            "current_week": active_path.current_week,
            "total_weeks": active_path.total_weeks,
            "resources_completed": len(completed_items),
            "resources_total": len(all_items),
            "assessments_taken": len(
                db.query(AssessmentResult)
                .filter(AssessmentResult.user_id == current_user.id)
                .all()
            ),
        }

    return {
        "user": {"name": current_user.name, "email": current_user.email},
        "onboarding_complete": profile.onboarding_complete if profile else False,
        "active_path": path_data,
        "next_action": next_action,
        "skill_categories": skill_categories,
        "skills_map": skills_map,
        "recent_adaptations": recent_adaptations,
    }
