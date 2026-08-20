"""
Skill Gap Engine
================
Computes the gap between a learner's current skills and those required for their goal.
Returns a prioritized list of skills to learn, with gap percentages.
"""
import json
import os
from typing import Dict, List, Tuple
from dataclasses import dataclass

# Load data files once at module level
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _load_json(filename: str) -> dict | list:
    with open(os.path.join(_DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


SKILLS_DATA: List[dict] = _load_json("skills.json")
GOALS_DATA: Dict[str, dict] = _load_json("goals.json")
SKILL_GRAPH: Dict[str, dict] = _load_json("skill_graph.json")

# Build lookup maps
SKILL_BY_ID: Dict[str, dict] = {s["id"]: s for s in SKILLS_DATA}


@dataclass
class SkillGap:
    skill_id: str
    skill_name: str
    category: str
    current_level: float        # 0.0 to 1.0 (learner's current mastery)
    required_level: float       # 0.0 to 1.0 (minimum needed, usually 0.7)
    gap: float                  # required_level - current_level (0.0 if no gap)
    priority: int               # 1 = highest priority
    is_prerequisite: bool       # Is this a direct prerequisite for another gap skill?


@dataclass
class SkillGapReport:
    goal_id: str
    goal_title: str
    total_required_skills: int
    skills_already_met: List[str]
    skills_to_learn: List[SkillGap]
    overall_readiness: float    # 0.0 to 1.0 (fraction of goal already met)
    estimated_weeks: int


def compute_skill_gap(
    goal_id: str,
    learner_skills: Dict[str, float],  # {skill_id: mastery_level 0.0-1.0}
    hours_per_week: int = 8,
) -> SkillGapReport:
    """
    Compute skill gaps for a given goal.
    
    Args:
        goal_id: One of the keys in goals.json
        learner_skills: Dictionary mapping skill_id to current mastery (0.0-1.0)
        hours_per_week: Used to estimate learning timeline
    
    Returns:
        SkillGapReport with prioritized gaps
    """
    if goal_id not in GOALS_DATA:
        raise ValueError(f"Unknown goal: {goal_id}")

    goal = GOALS_DATA[goal_id]
    required_skills: List[str] = goal["required_skills"]
    min_mastery = 0.70  # 70% mastery = "sufficient" for a skill

    skills_met = []
    skills_to_learn = []

    for skill_id in required_skills:
        current = learner_skills.get(skill_id, 0.0)
        if current >= min_mastery:
            skills_met.append(skill_id)
        else:
            gap = min_mastery - current
            skill_info = SKILL_BY_ID.get(skill_id, {})
            skills_to_learn.append(
                SkillGap(
                    skill_id=skill_id,
                    skill_name=skill_info.get("name", skill_id),
                    category=skill_info.get("category", "General"),
                    current_level=current,
                    required_level=min_mastery,
                    gap=round(gap, 3),
                    priority=0,  # Will be set by prioritization below
                    is_prerequisite=False,
                )
            )

    # Prioritize by: (1) prerequisite depth, (2) gap size
    _prioritize_gaps(skills_to_learn, required_skills)

    # Estimate weeks based on total gap and hours per week
    avg_hours_per_skill = 12  # Average resource duration
    total_hours_needed = sum(
        avg_hours_per_skill * (1 - sg.current_level / 0.7)
        for sg in skills_to_learn
    )
    estimated_weeks = max(4, min(24, int(total_hours_needed / hours_per_week) + 2))

    overall_readiness = len(skills_met) / len(required_skills) if required_skills else 1.0

    return SkillGapReport(
        goal_id=goal_id,
        goal_title=goal["title"],
        total_required_skills=len(required_skills),
        skills_already_met=skills_met,
        skills_to_learn=skills_to_learn,
        overall_readiness=round(overall_readiness, 3),
        estimated_weeks=estimated_weeks,
    )


def _prioritize_gaps(gaps: List[SkillGap], required_skills: List[str]) -> None:
    """
    Set priority on each gap based on:
    1. Whether it's a prerequisite for other gap skills (high priority)
    2. Gap size (larger gap = higher priority = learn first)
    """
    gap_skill_ids = {g.skill_id for g in gaps}

    # Mark prerequisites
    for gap in gaps:
        deps = SKILL_GRAPH.get(gap.skill_id, {}).get("prerequisites", [])
        # If any of this skill's prerequisites are also in the gap, it's downstream
        # The prerequisites themselves should be higher priority
        for dep in deps:
            if dep in gap_skill_ids:
                # Find the dep gap and mark it as a prerequisite (higher priority)
                for other in gaps:
                    if other.skill_id == dep:
                        other.is_prerequisite = True

    # Assign priority: prerequisites first, then by gap size
    sorted_gaps = sorted(gaps, key=lambda g: (-int(g.is_prerequisite), -g.gap))
    for i, gap in enumerate(sorted_gaps):
        gap.priority = i + 1

    # Re-sort the original list in place
    gaps.sort(key=lambda g: g.priority)


def get_skill_prerequisites_chain(skill_id: str, depth: int = 0, max_depth: int = 5) -> List[str]:
    """
    Return the full prerequisite chain for a skill (BFS).
    """
    if depth >= max_depth:
        return []
    
    prereqs = SKILL_GRAPH.get(skill_id, {}).get("prerequisites", [])
    chain = list(prereqs)
    for prereq in prereqs:
        chain.extend(get_skill_prerequisites_chain(prereq, depth + 1, max_depth))
    return list(dict.fromkeys(chain))  # Deduplicate preserving order


def suggest_goal_from_interests(interests: List[str]) -> List[Tuple[str, float]]:
    """
    Suggest possible career goals based on learner interests.
    Returns list of (goal_id, relevance_score) sorted by relevance.
    """
    scores = {}
    for goal_id, goal in GOALS_DATA.items():
        goal_tags = set()
        for skill_id in goal["required_skills"]:
            skill = SKILL_BY_ID.get(skill_id, {})
            goal_tags.add(skill.get("category", "").lower())
            goal_tags.add(skill_id.replace("-", " "))

        interest_set = {i.lower() for i in interests}
        overlap = len(goal_tags & interest_set)
        if overlap > 0:
            scores[goal_id] = overlap / len(goal_tags)

    return sorted(scores.items(), key=lambda x: -x[1])
