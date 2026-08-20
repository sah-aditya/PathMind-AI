"""
Recommendation Engine
=====================
Scores and ranks learning resources for a learner using a 6-factor hybrid approach:
  1. Goal Relevance (30%)   — skills taught ∩ required skills (Jaccard)
  2. Skill Gap Coverage (25%) — fraction of gap skills this resource teaches
  3. Prerequisite Readiness (20%) — learner already has the prerequisites
  4. Difficulty Fit (10%)   — difficulty matches learner experience level
  5. Interest Alignment (10%) — resource tags match learner interests
  6. Type Preference (5%)   — matches learning style preference
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
import json
import os

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
    limit: int = 60,
) -> List[ScoredResource]:
    """
    Score and rank all resources for a learner. Returns top `limit` resources.
    """
    if interests is None:
        interests = []
    if exclude_resource_ids is None:
        exclude_resource_ids = []

    goal = GOALS_DATA.get(goal_id, {})
    required_skills = set(goal.get("required_skills", []))
    gap_skills = set(gap_skill_ids)
    learner_exp = EXPERIENCE_MAP.get(experience_level, 0)
    interest_set = {i.lower().replace(" ", "-") for i in interests}

    scored = []
    for resource in RESOURCES:
        if resource["id"] in exclude_resource_ids:
            continue

        skills_taught = set(resource.get("skills_taught", []))
        prereqs = set(resource.get("prerequisite_skills", []))
        tags = set(resource.get("tags", []))
        r_difficulty = resource.get("difficulty", "beginner")
        r_exp = DIFFICULTY_MAP.get(r_difficulty, 0)

        # --- Factor 1: Goal Relevance (Jaccard similarity) ---
        if required_skills:
            intersection = skills_taught & required_skills
            union = skills_taught | required_skills
            goal_relevance = len(intersection) / len(union) if union else 0.0
        else:
            goal_relevance = 0.0

        # --- Factor 2: Skill Gap Coverage ---
        if gap_skills:
            gap_covered = skills_taught & gap_skills
            gap_coverage = len(gap_covered) / len(gap_skills)
        else:
            gap_coverage = 0.0

        # --- Factor 3: Prerequisite Readiness ---
        if prereqs:
            mastery_sum = sum(learner_skills.get(p, 0.0) for p in prereqs)
            prereq_readiness = mastery_sum / len(prereqs)
        else:
            prereq_readiness = 1.0  # No prerequisites = fully ready

        # --- Factor 4: Difficulty Fit ---
        level_diff = abs(r_exp - learner_exp)
        if level_diff == 0:
            difficulty_fit = 1.0
        elif level_diff == 1:
            difficulty_fit = 0.6
        else:
            difficulty_fit = 0.2

        # --- Factor 5: Interest Alignment ---
        if interest_set:
            tag_overlap = tags & interest_set
            # Also check skill names
            skill_overlap = {s for s in skills_taught if any(i in s for i in interest_set)}
            interest_alignment = min(1.0, (len(tag_overlap) + len(skill_overlap)) / max(1, len(interest_set)))
        else:
            interest_alignment = 0.5  # Neutral when no interests specified

        # --- Factor 6: Type/Style Preference ---
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

        # --- Weighted Final Score ---
        final_score = (
            0.30 * goal_relevance
            + 0.25 * gap_coverage
            + 0.20 * prereq_readiness
            + 0.10 * difficulty_fit
            + 0.10 * interest_alignment
            + 0.05 * type_pref
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
                    "goal_relevance": round(goal_relevance, 3),
                    "gap_coverage": round(gap_coverage, 3),
                    "prereq_readiness": round(prereq_readiness, 3),
                    "difficulty_fit": round(difficulty_fit, 3),
                    "interest_alignment": round(interest_alignment, 3),
                    "type_preference": round(type_pref, 3),
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
        if ("revision" in tags or "reinforcement" in tags) and skill_id in skills_taught:
            return resource
    # Fallback: any course teaching this skill with beginner difficulty
    for resource in RESOURCES:
        if skill_id in resource.get("skills_taught", []) and resource.get("difficulty") == "beginner":
            return resource
    return None
