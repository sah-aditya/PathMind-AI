from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from pydantic import BaseModel

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import (
    PathItem, PathPhase, LearningPath, AssessmentResult,
    PathAdaptation, ItemStatus
)
from app.services.adaptive_engine import evaluate_and_adapt, update_skill_level_from_score
from app.ai.gemini_service import generate_adaptation_message

router = APIRouter(prefix="/assessments", tags=["assessments"])


class AssessmentSubmit(BaseModel):
    assessment_id: str
    path_item_id: int
    answers: Dict[str, int]  # {question_id: selected_option_index}


@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return assessment questions (without correct answers)."""
    from app.data_helpers import get_assessment_by_id
    asmt = get_assessment_by_id(assessment_id)
    if not asmt:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Strip correct_index before sending to client
    safe_questions = []
    for q in asmt.get("questions", []):
        safe_questions.append({
            "id": q["id"],
            "type": q["type"],
            "scenario": q.get("scenario", ""),
            "question": q["question"],
            "options": q["options"],
            "difficulty": q.get("difficulty", "medium"),
        })

    return {
        "id": asmt["id"],
        "title": asmt["title"],
        "skill": asmt["skill"],
        "passing_score": asmt["passing_score"],
        "time_limit_minutes": asmt.get("time_limit_minutes", 30),
        "questions": safe_questions,
    }


@router.post("/submit")
def submit_assessment(
    payload: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Score an assessment, update skill level, and trigger path adaptation."""
    from app.data_helpers import get_assessment_by_id

    asmt = get_assessment_by_id(payload.assessment_id)
    if not asmt:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Score the answers
    questions = asmt["questions"]
    total = len(questions)
    correct = 0
    feedback_items = []

    for q in questions:
        selected = payload.answers.get(q["id"])
        is_correct = selected == q["correct_index"]
        if is_correct:
            correct += 1
        feedback_items.append({
            "question_id": q["id"],
            "selected": selected,
            "correct_index": q["correct_index"],
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    score = round(correct / total, 3) if total > 0 else 0.0
    skill_id = asmt["skill"]

    # Update learner skill level
    new_skill_level = update_skill_level_from_score(
        user_id=current_user.id,
        skill_id=skill_id,
        assessment_score=score,
        db=db,
    )

    # Save assessment result
    result = AssessmentResult(
        user_id=current_user.id,
        assessment_id=payload.assessment_id,
        path_item_id=payload.path_item_id,
        score=score,
        answers=payload.answers,
    )
    db.add(result)
    db.flush()

    # Mark path item as completed with score
    path_item = db.query(PathItem).filter(PathItem.id == payload.path_item_id).first()
    adaptation_result = None
    adaptation_message = None

    if path_item:
        path_item.status = ItemStatus.completed
        path_item.score = score

        # Get path and phases for adaptation
        phase = path_item.phase
        path = phase.path

        if path.user_id == current_user.id:
            # Get sorted phases for adaptive engine
            db_phases = sorted(path.phases, key=lambda p: p.phase_number)
            current_phase_idx = next(
                (i for i, p in enumerate(db_phases) if p.id == phase.id), 0
            )

            # Run adaptation engine
            adaptation_result = evaluate_and_adapt(
                assessment_score=score,
                skill_id=skill_id,
                phase_number=current_phase_idx + 1,
                db_phases=db_phases,
                db=db,
            )

            # Save adaptation log if changes were made
            if adaptation_result.changes_made:
                adaptation_msg = generate_adaptation_message(
                    score=score,
                    action=adaptation_result.action,
                    skill_id=skill_id,
                    changes_description=adaptation_result.description,
                    goal_title=path.goal_id,
                )
                log = PathAdaptation(
                    path_id=path.id,
                    trigger_event=adaptation_result.action,
                    trigger_score=score,
                    description=adaptation_msg,
                    changes_made=adaptation_result.changes_made,
                )
                db.add(log)
                adaptation_message = adaptation_msg

    db.commit()

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "passed": score >= asmt["passing_score"],
        "passing_score": asmt["passing_score"],
        "new_skill_level": new_skill_level,
        "feedback": feedback_items,
        "adaptation": {
            "action": adaptation_result.action if adaptation_result else "none",
            "message": adaptation_message or (adaptation_result.description if adaptation_result else ""),
        },
    }
