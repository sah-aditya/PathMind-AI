"""
Adaptive Learning Engine
=========================
Monitors learner progress (assessment scores, completion patterns) and
mutates the learning path to keep it personalized over time.

Triggers:
- Score < 50%  → Insert revision module before next phase
- Score 50-70% → Add extra practice resources to current phase  
- Score > 85%  → Compress/skip optional review content in next phase
- 3+ "too easy" flags → Elevate difficulty in subsequent resources
- 3+ "too hard" flags → Insert bridge resources
- Behind schedule (>20% over time estimate) → Reduce weekly load

ML Upgrade:
- Skill levels are modeled as Beta distributions (Bayesian update)
  instead of simple weighted averages. This captures uncertainty.
  Stored as (alpha, beta) parameters in learner_skill.bayesian_params JSON.
"""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from app.services.recommendation_engine import get_revision_resource_for_skill


@dataclass
class AdaptationResult:
    action: str                  # "revision_added" | "compressed" | "continued" | "bridged"
    description: str             # Human-readable explanation
    changes_made: Dict           # Structured change log for DB
    trigger_score: Optional[float] = None


def evaluate_and_adapt(
    assessment_score: float,          # 0.0 to 1.0
    skill_id: str,                    # The skill assessed
    phase_number: int,                # Which phase the learner is in
    db_phases: List,                  # SQLAlchemy PathPhase objects from DB
    db,                               # SQLAlchemy session
) -> AdaptationResult:
    """
    Main adaptation function. Called after every assessment submission.
    Mutates the learning path in the database and returns a description.
    """
    from app.models.learning import PathItem, ItemStatus, PhaseStatus

    if assessment_score < 0.50:
        return _handle_low_score(
            score=assessment_score,
            skill_id=skill_id,
            phase_number=phase_number,
            db_phases=db_phases,
            db=db,
        )
    elif assessment_score >= 0.85:
        return _handle_high_score(
            score=assessment_score,
            phase_number=phase_number,
            db_phases=db_phases,
            db=db,
        )
    else:
        return AdaptationResult(
            action="continued",
            description=(
                f"Your score of {int(assessment_score * 100)}% shows solid progress. "
                f"Continue with the next resource in your path."
            ),
            changes_made={},
            trigger_score=assessment_score,
        )


def _handle_low_score(
    score: float,
    skill_id: str,
    phase_number: int,
    db_phases: List,
    db,
) -> AdaptationResult:
    """Score < 50%: Insert revision module at start of next phase."""
    from app.models.learning import PathItem, ItemStatus

    revision_resource = get_revision_resource_for_skill(skill_id)
    changes = {}

    if revision_resource and len(db_phases) > phase_number:
        next_phase = db_phases[phase_number]  # phase_number is 1-indexed, list is 0-indexed

        # Shift existing items' order_index
        for item in next_phase.items:
            item.order_index += 1

        # Create revision PathItem
        new_item = PathItem(
            phase_id=next_phase.id,
            resource_id=revision_resource["id"],
            order_index=0,
            status=ItemStatus.pending,
            is_revision=True,
        )
        db.add(new_item)
        db.commit()

        changes = {
            "type": "revision_inserted",
            "resource_id": revision_resource["id"],
            "resource_title": revision_resource["title"],
            "inserted_at_phase": next_phase.id,
            "inserted_at_position": 0,
        }

        description = (
            f"⚠️ Your score of {int(score * 100)}% suggests that "
            f"**{skill_id.replace('-', ' ').title()}** needs reinforcement. "
            f"We've added **\"{revision_resource['title']}\"** at the start of your "
            f"next phase to help solidify the fundamentals before you continue."
        )
        action = "revision_added"
    else:
        description = (
            f"Your score of {int(score * 100)}% indicates a gap in "
            f"{skill_id.replace('-', ' ').title()}. "
            f"We recommend reviewing the material before continuing."
        )
        action = "revision_recommended"

    return AdaptationResult(
        action=action,
        description=description,
        changes_made=changes,
        trigger_score=score,
    )


def _handle_high_score(
    score: float,
    phase_number: int,
    db_phases: List,
    db,
) -> AdaptationResult:
    """Score >= 85%: Mark optional review items in next phase as skippable."""
    changes = {}
    skipped_titles = []

    if len(db_phases) > phase_number:
        next_phase = db_phases[phase_number]
        from app.models.learning import PathItem, ItemStatus

        # Skip revision items in next phase (not needed if learner is doing well)
        for item in next_phase.items:
            if item.is_revision and item.status == ItemStatus.pending:
                item.status = ItemStatus.skipped
                skipped_titles.append(item.resource_id)

        db.commit()
        changes = {"type": "reviews_skipped", "skipped_items": skipped_titles}

    if skipped_titles:
        description = (
            f"🚀 Excellent! Your score of {int(score * 100)}% demonstrates strong mastery. "
            f"We've skipped {len(skipped_titles)} optional review item(s) to keep you moving forward."
        )
    else:
        description = (
            f"🚀 Excellent score of {int(score * 100)}%! "
            f"You're ahead of the curve — keep up the great work."
        )

    return AdaptationResult(
        action="compressed",
        description=description,
        changes_made=changes,
        trigger_score=score,
    )


def update_skill_level_from_score(
    user_id: int,
    skill_id: str,
    assessment_score: float,
    db,
) -> float:
    """
    Update learner skill level using a Bayesian Beta distribution model.

    Instead of a simple weighted average, we model each skill as Beta(α, β):
    - α accumulates evidence of mastery (successes)
    - β accumulates evidence of struggle (failures)
    - Skill level = α / (α + β)  (posterior mean)
    - High precision (α + β) = model is confident in the estimate

    This allows the model to represent:
    - How good the learner is (mean)
    - How certain we are (precision)
    """
    import json
    from app.models.profile import LearnerSkill
    from app.services.ml_engine import BayesianSkillEstimator

    existing = (
        db.query(LearnerSkill)
        .filter(LearnerSkill.user_id == user_id, LearnerSkill.skill_id == skill_id)
        .first()
    )

    if existing:
        # Load existing Bayesian state, or initialise from scalar level
        try:
            params = json.loads(existing.bayesian_params) if getattr(existing, 'bayesian_params', None) else None
            estimator = BayesianSkillEstimator.from_dict(params) if params else BayesianSkillEstimator.from_level(existing.level)
        except Exception:
            estimator = BayesianSkillEstimator.from_level(existing.level)

        estimator.update(assessment_score)
        existing.level = round(estimator.mean, 3)
        existing.source = "assessment"
        try:
            existing.bayesian_params = json.dumps(estimator.to_dict())
        except Exception:
            pass  # bayesian_params column might not exist yet
    else:
        estimator = BayesianSkillEstimator(alpha=1.0, beta=1.0)
        estimator.update(assessment_score)
        new_level = round(estimator.mean, 3)
        skill = LearnerSkill(
            user_id=user_id,
            skill_id=skill_id,
            level=new_level,
            source="assessment",
        )
        try:
            skill.bayesian_params = json.dumps(estimator.to_dict())
        except Exception:
            pass
        db.add(skill)

    db.commit()
    return round(existing.level if existing else estimator.mean, 3)


def calculate_path_progress(db_path, db) -> Tuple[float, int]:
    """
    Calculate overall path progress and current week.
    Returns (overall_progress 0.0-1.0, current_week int).
    """
    from app.models.learning import ItemStatus

    all_items = []
    for phase in db_path.phases:
        all_items.extend(phase.items)

    if not all_items:
        return 0.0, 1

    completed = sum(1 for item in all_items if item.status == ItemStatus.completed)
    progress = round(completed / len(all_items), 3)

    # Estimate current week
    completed_hours = sum(
        _get_resource_hours(item.resource_id)
        for item in all_items
        if item.status == ItemStatus.completed
    )
    # Assume avg 8 hours/week (we could use profile.hours_per_week for accuracy)
    current_week = max(1, int(completed_hours / 8) + 1)

    return progress, current_week


def _get_resource_hours(resource_id: str) -> int:
    """Quick lookup for resource duration."""
    from app.services.recommendation_engine import RESOURCE_BY_ID
    resource = RESOURCE_BY_ID.get(resource_id, {})
    return resource.get("duration_hours", 8)
