"""
Recommendation Engine
=====================
Scores and ranks learning resources for a learner using a hybrid ML approach:

  Heuristic Factors:
  1. Goal Relevance (22%)     — skills taught ∩ required skills (Jaccard)
  2. Skill Gap Coverage (25%) — fraction of gap skills this resource teaches  ← BOOSTED
  3. Prerequisite Readiness (20%) — learner already has the prerequisites      ← BOOSTED
  4. Difficulty Fit (10%)     — difficulty matches learner experience level
  5. Interest Alignment (5%)  — resource tags match learner interests
  6. Type Preference (3%)     — matches learning style preference
  7. Rating Boost (5%)        — high-rated resources get a small boost          ← NEW

  ML Factors:
  8. TF-IDF Cosine Similarity (12%) — semantic match between resource text and goal
  9. SVD Collaborative Score (3%)   — "learners like you completed this" signal

  + ε-greedy Exploration (20% of final list randomly sampled for diversity)
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
import json
import os
import logging

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _load_json(filename: str):
    with open(os.path.join(_DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


RESOURCES: List[dict] = _load_json("resources.json")
GOALS_DATA: Dict[str, dict] = _load_json("goals.json")
RESOURCE_BY_ID: Dict[str, dict] = {r["id"]: r for r in RESOURCES}

DIFFICULTY_MAP = {"beginner": 0, "intermediate": 1, "advanced": 2}
EXPERIENCE_MAP = {"beginner": 0, "intermediate": 1, "advanced": 2}
TYPE_WEIGHT = {"course": 1.0, "project": 0.9, "assessment": 0.8}


@dataclass
class ScoredResource:
    resource_id: str
    title: str
    type: str
    difficulty: str
    duration_hours: int
    skills_taught: List[str]
    prerequisite_skills: List[str]
    score: float
    score_breakdown: Dict[str, float]
    is_project: bool
    has_assessment: bool
    provider: str
    description: str
    tags: List[str]
    rating: float


def score_resources(
    goal_id: str,
    learner_skills: Dict[str, float],     # {skill_id: mastery}
    gap_skill_ids: List[str],             # skills that need to be learned
    experience_level: str = "beginner",
    interests: List[str] = None,
    learning_style: str = "mixed",
    exclude_resource_ids: List[str] = None,
    goal_text: str = "",                  # learner's free-text goal description
    user_id: Optional[int] = None,       # for collaborative filtering
    limit: int = 60,
    enable_exploration: bool = True,     # ε-greedy diversity
) -> List[ScoredResource]:
    """
    Score and rank all resources for a learner using hybrid ML + heuristic approach.
    Returns top `limit` resources.
    """
    # Import ML engine lazily to avoid circular imports at module load time
    try:
        from app.services.ml_engine import TFIDF_ENGINE, SVD_FILTER, apply_epsilon_greedy
        tfidf_scores = TFIDF_ENGINE.score_all(goal_text or goal_id, interests) if TFIDF_ENGINE else {}
    except Exception as exc:
        logger.warning("ML engine import failed: %s", exc)
        tfidf_scores = {}
        apply_epsilon_greedy = None
        SVD_FILTER = None

    if interests is None:
        interests = []
    if exclude_resource_ids is None:
        exclude_resource_ids = []

    goal = GOALS_DATA.get(goal_id, {})
    required_skills = set(goal.get("required_skills", []))
    gap_skills = set(gap_skill_ids)
    learner_exp = EXPERIENCE_MAP.get(experience_level, 0)
    interest_set = {i.lower().replace(" ", "-") for i in interests}

    # Batch SVD predictions for all resources
    all_resource_ids = [r["id"] for r in RESOURCES if r["id"] not in exclude_resource_ids]
    svd_scores: Dict[str, float] = {}
    if SVD_FILTER is not None and user_id is not None:
        try:
            svd_scores = SVD_FILTER.predict(user_id, all_resource_ids)
        except Exception as exc:
            logger.warning("SVD prediction failed: %s", exc)

    scored = []
    for resource in RESOURCES:
        if resource["id"] in exclude_resource_ids:
            continue

        skills_taught = set(resource.get("skills_taught", []))
        prereqs = set(resource.get("prerequisite_skills", []))
        tags = set(resource.get("tags", []))
        r_difficulty = resource.get("difficulty", "beginner")
        r_exp = DIFFICULTY_MAP.get(r_difficulty, 0)

        # ── Factor 1: Goal Relevance (Jaccard) — 25% ──
        if required_skills:
            intersection = skills_taught & required_skills
            union = skills_taught | required_skills
            goal_relevance = len(intersection) / len(union) if union else 0.0
        else:
            goal_relevance = 0.0

        # ── Factor 2: Skill Gap Coverage — 20% ──
        if gap_skills:
            gap_covered = skills_taught & gap_skills
            gap_coverage = len(gap_covered) / len(gap_skills)
        else:
            gap_coverage = 0.0

        # ── Factor 3: Prerequisite Readiness — 15% ──
        if prereqs:
            mastery_sum = sum(learner_skills.get(p, 0.0) for p in prereqs)
            prereq_readiness = mastery_sum / len(prereqs)
        else:
            prereq_readiness = 1.0  # No prerequisites = fully ready

        # ── Factor 4: Difficulty Fit — 10% ──
        level_diff = abs(r_exp - learner_exp)
        if level_diff == 0:
            difficulty_fit = 1.0
        elif level_diff == 1:
            difficulty_fit = 0.6
        else:
            difficulty_fit = 0.2

        # ── Factor 5: Interest Alignment — 5% ──
        if interest_set:
            tag_overlap = tags & interest_set
            skill_overlap = {s for s in skills_taught if any(i in s for i in interest_set)}
            interest_alignment = min(1.0, (len(tag_overlap) + len(skill_overlap)) / max(1, len(interest_set)))
        else:
            interest_alignment = 0.5  # Neutral

        # ── Factor 6: Type/Style Preference — 5% ──
        r_type = resource.get("type", "course")
        if learning_style == "video" and r_type == "course":
            type_pref = 1.0
        elif learning_style == "project" and r_type == "project":
            type_pref = 1.0
        elif learning_style == "mixed":
            type_pref = 0.8
        elif r_type == "assessment":
            type_pref = 0.7
        else:
            type_pref = 0.6

        # ── Factor 7: Rating Boost — 5% ──
        # Normalize rating 0-5 to 0-1, default 0.9 for unrated
        raw_rating = resource.get("rating") or 4.5
        rating_boost = min(1.0, max(0.0, (raw_rating - 3.0) / 2.0))

        # ── Factor 8: TF-IDF Cosine Similarity — 12% ──
        tfidf_score = tfidf_scores.get(resource["id"], 0.0)

        # ── Factor 9: SVD Collaborative — 3% ──
        svd_score = svd_scores.get(resource["id"], 0.0)

        # ── Weighted Final Score ──
        final_score = (
            0.22 * goal_relevance
            + 0.25 * gap_coverage        # Prioritize gap closure
            + 0.20 * prereq_readiness    # Ensure readiness
            + 0.10 * difficulty_fit
            + 0.05 * interest_alignment
            + 0.03 * type_pref
            + 0.05 * rating_boost        # Quality signal
            + 0.12 * tfidf_score
            + 0.03 * svd_score
        )

        scored.append(
            ScoredResource(
                resource_id=resource["id"],
                title=resource["title"],
                type=r_type,
                difficulty=r_difficulty,
                duration_hours=resource.get("duration_hours", 8),
                skills_taught=list(skills_taught),
                prerequisite_skills=list(prereqs),
                score=round(final_score, 4),
                score_breakdown={
                    "goal_relevance":    round(goal_relevance, 3),
                    "gap_coverage":      round(gap_coverage, 3),
                    "prereq_readiness":  round(prereq_readiness, 3),
                    "difficulty_fit":    round(difficulty_fit, 3),
                    "interest_alignment":round(interest_alignment, 3),
                    "type_preference":   round(type_pref, 3),
                    "rating_boost":      round(rating_boost, 3),
                    "tfidf_similarity":  round(tfidf_score, 3),
                    "collab_filter":     round(svd_score, 3),
                },
                is_project=resource.get("is_project", False),
                has_assessment=resource.get("has_assessment", False),
                provider=resource.get("provider", "PathMind Academy"),
                description=resource.get("description", ""),
                tags=list(tags),
                rating=resource.get("rating", 4.5),
            )
        )

    # Sort by score descending
    scored.sort(key=lambda r: -r.score)

    # Apply ε-greedy exploration for diversity (20% random high-potential picks)
    if enable_exploration and apply_epsilon_greedy is not None and len(scored) > 10:
        try:
            scored = apply_epsilon_greedy(scored, epsilon=0.20)
        except Exception as exc:
            logger.warning("Epsilon-greedy exploration failed: %s", exc)

    return scored[:limit]


def get_resource_by_id(resource_id: str) -> Optional[dict]:
    return RESOURCE_BY_ID.get(resource_id)


def get_revision_resource_for_skill(skill_id: str) -> Optional[dict]:
    """
    Find the best revision/reinforcement resource for a given skill.
    Prefers resources tagged 'revision' or 'reinforcement'.
    """
    for resource in RESOURCES:
        tags = resource.get("tags", [])
        skills_taught = resource.get("skills_taught", [])
        if (("revision" in tags or "reinforcement" in tags) and skill_id in skills_taught):
            return resource
    # Fallback: any course teaching this skill with beginner difficulty
    for resource in RESOURCES:
        if skill_id in resource.get("skills_taught", []) and resource.get("difficulty") == "beginner":
            return resource
    return None
