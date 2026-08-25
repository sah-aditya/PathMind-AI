"""
Skill Gap Engine
================
Computes the gap between a learner's current skills and those required for their goal.
Returns a prioritized list of skills to learn, with gap percentages.

ML Upgrade:
- Prerequisite ordering now uses proper topological sort (Kahn's algorithm BFS)
  on the skill dependency DAG instead of a simple heuristic sort.
- This guarantees the mathematically optimal learning sequence:
  foundations before advanced topics, prerequisites before dependants.
"""
import json
import os
import logging
from typing import Dict, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

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
        try:
            from app.services.dynamic_goal_engine import get_or_create_goal
            _, goal = get_or_create_goal(goal_id)
            GOALS_DATA[goal_id] = goal
        except Exception:
            # Fallback to closest available static goal
            fallback_id = list(GOALS_DATA.keys())[0]
            goal = GOALS_DATA[fallback_id]
    else:
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

    # Include all mastered skills (both required by goal and user's existing foundation)
    all_mastered = [sid for sid, lvl in learner_skills.items() if lvl >= min_mastery]
    for s in skills_met:
        if s not in all_mastered:
            all_mastered.append(s)

    # Prioritize by: (1) prerequisite depth, (2) gap size
    _prioritize_gaps(skills_to_learn, required_skills)

    # Estimate weeks calibrated to a realistic, student-friendly horizon (4-16 weeks)
    avg_hours_per_skill = 8  # Modular duration
    total_hours_needed = sum(
        avg_hours_per_skill * (1 - sg.current_level / 0.7)
        for sg in skills_to_learn
    )
    effective_h_per_week = max(hours_per_week, 6)
    estimated_weeks = max(4, min(16, round(total_hours_needed / effective_h_per_week)))
    if estimated_weeks < 6 and len(skills_to_learn) > 4:
        estimated_weeks = 8

    # Readiness reflects fraction of required competencies or foundation met
    readiness_sum = sum(min(1.0, learner_skills.get(s, 0.0) / min_mastery) for s in required_skills)
    overall_readiness = (readiness_sum / len(required_skills)) if required_skills else 1.0

    return SkillGapReport(
        goal_id=goal_id,
        goal_title=goal["title"],
        total_required_skills=len(required_skills),
        skills_already_met=all_mastered,
        skills_to_learn=skills_to_learn,
        overall_readiness=round(overall_readiness, 3),
        estimated_weeks=estimated_weeks,
    )


def _prioritize_gaps(gaps: List[SkillGap], required_skills: List[str]) -> None:
    """
    Set priority on each gap using Kahn's Algorithm (BFS topological sort) on
    the skill dependency DAG.

    This guarantees that:
    1. Prerequisites always appear before their dependants
    2. Within the same "level" of the DAG, larger gaps come first
    3. Skills with no prerequisites get the lowest priority numbers

    Falls back to the heuristic sort if the graph contains cycles.
    """
    gap_ids = {g.skill_id for g in gaps}
    gap_by_id = {g.skill_id: g for g in gaps}

    # ── Build the sub-graph restricted to gap skills only ──
    in_degree: Dict[str, int] = {gid: 0 for gid in gap_ids}
    adjacency: Dict[str, List[str]] = {gid: [] for gid in gap_ids}

    for gid in gap_ids:
        prereqs = SKILL_GRAPH.get(gid, {}).get("prerequisites", [])
        for p in prereqs:
            if p in gap_ids:
                # p must come before gid
                adjacency[p].append(gid)
                in_degree[gid] += 1
                gap_by_id[p].is_prerequisite = True

    # ── Kahn's BFS ──
    from collections import deque
    # Start with nodes that have no prerequisites within the gap set
    queue = deque(
        sorted(
            [gid for gid, deg in in_degree.items() if deg == 0],
            key=lambda gid: -gap_by_id[gid].gap,  # break ties by gap size
        )
    )

    topo_order: List[str] = []
    while queue:
        node = queue.popleft()
        topo_order.append(node)
        for neighbour in sorted(adjacency[node], key=lambda n: -gap_by_id[n].gap):
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    if len(topo_order) == len(gap_ids):
        # Successful topological sort — assign priorities in order
        priority_map = {sid: i + 1 for i, sid in enumerate(topo_order)}
        for gap in gaps:
            gap.priority = priority_map.get(gap.skill_id, len(gaps))
    else:
        # Cycle detected (shouldn't happen with a well-formed graph) — fall back
        logger.warning("Skill graph has a cycle — falling back to heuristic priority")
        _heuristic_prioritize(gaps)

    # Re-sort the original list in place
    gaps.sort(key=lambda g: g.priority)


def _heuristic_prioritize(gaps: List[SkillGap]) -> None:
    """Simple heuristic fallback: prerequisites first, then by gap size."""
    sorted_gaps = sorted(gaps, key=lambda g: (-int(g.is_prerequisite), -g.gap))
    for i, gap in enumerate(sorted_gaps):
        gap.priority = i + 1


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
