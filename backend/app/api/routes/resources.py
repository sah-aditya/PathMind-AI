from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from app.core.security import get_current_user
from app.models.user import User
from app.services.recommendation_engine import RESOURCES, RESOURCE_BY_ID
from app.ai.gemini_service import generate_explanation

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("/")
def list_resources(
    skill: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
):
    results = RESOURCES
    if skill:
        results = [r for r in results if skill in r.get("skills_taught", [])]
    if difficulty:
        results = [r for r in results if r.get("difficulty") == difficulty]
    if type:
        results = [r for r in results if r.get("type") == type]
    return results[:limit]


@router.get("/{resource_id}")
def get_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
):
    resource = RESOURCE_BY_ID.get(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.get("/{resource_id}/explain")
def explain_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
):
    """Generate AI explanation for why this resource was recommended."""
    from app.db.database import SessionLocal
    from app.models.profile import LearnerProfile

    resource = RESOURCE_BY_ID.get(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db = SessionLocal()
    try:
        profile = db.query(LearnerProfile).filter(
            LearnerProfile.user_id == current_user.id
        ).first()
    finally:
        db.close()

    explanation = generate_explanation(
        resource_title=resource["title"],
        resource_description=resource["description"],
        skills_taught=resource.get("skills_taught", []),
        goal_title=profile.goal_title if profile else "your career goal",
        learner_experience=profile.experience_level if profile else "beginner",
        score_breakdown={},
    )
    return {"explanation": explanation}
