"""
Learning Path Generator
=======================
Takes scored resources + skill gap + goal phases and generates
a sequenced, phased learning path using topological sort on the skill graph.

Algorithm:
1. Select top resources from recommendation engine
2. Build a dependency graph of selected resources (based on prerequisite skills)
3. Topological sort to ensure prerequisites come first
4. Assign resources to weekly phases based on duration and hours/week
5. Return structured PathPlan with phases, items, and milestones
"""
import json
import os
import networkx as nx
from typing import Dict, List, Optional
from dataclasses import dataclass, field

from app.services.recommendation_engine import ScoredResource, score_resources, RESOURCES
from app.services.skill_gap_engine import SkillGapReport, GOALS_DATA

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _load_json(filename: str):
    with open(os.path.join(_DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


SKILL_GRAPH: Dict[str, dict] = _load_json("skill_graph.json")
ASSESSMENTS: List[dict] = _load_json("assessments.json")
ASSESSMENT_BY_RESOURCE: Dict[str, dict] = {
    a["resource_id"]: a for a in ASSESSMENTS
}


@dataclass
class PathItemPlan:
    resource_id: str
    title: str
    type: str
    difficulty: str
    duration_hours: int
    skills_taught: List[str]
    has_assessment: bool
    assessment_id: Optional[str]
    order_index: int
    is_revision: bool = False
    why_recommended: str = ""


@dataclass
class PhasePlan:
    phase_number: int
    title: str
    description: str
    week_start: int
    week_end: int
    items: List[PathItemPlan] = field(default_factory=list)
    skills_covered: List[str] = field(default_factory=list)


@dataclass
class PathPlan:
    goal_id: str
    goal_title: str
    title: str
    total_weeks: int
    phases: List[PhasePlan] = field(default_factory=list)
    total_resources: int = 0
    total_hours: int = 0


def generate_path(
    gap_report: SkillGapReport,
    learner_skills: Dict[str, float],
    experience_level: str = "beginner",
    hours_per_week: int = 8,
    interests: List[str] = None,
    learning_style: str = "mixed",
) -> PathPlan:
    """
    Generate a complete phased learning path for a learner.
    """
    if interests is None:
        interests = []

    goal_id = gap_report.goal_id
    gap_skill_ids = [sg.skill_id for sg in gap_report.skills_to_learn]

    # Step 1: Score and select resources
    scored = score_resources(
        goal_id=goal_id,
        learner_skills=learner_skills,
        gap_skill_ids=gap_skill_ids,
        experience_level=experience_level,
        interests=interests,
        learning_style=learning_style,
        limit=80,
    )

    # Step 2: Filter — only include resources that cover gap skills or are high-relevance
    selected = _select_relevant_resources(scored, gap_skill_ids, max_resources=30)

    # Step 3: Topological sort via skill dependency graph
    ordered = _topological_sort_resources(selected, learner_skills)

    # Step 4: Assign to phases
    goal = GOALS_DATA.get(goal_id, {})
    phase_titles = goal.get("phases", ["Foundation", "Core Skills", "Advanced", "Project"])
    phases = _assign_to_phases(ordered, phase_titles, hours_per_week, gap_report.estimated_weeks)

    total_hours = sum(
        item.duration_hours
        for phase in phases
        for item in phase.items
    )

    return PathPlan(
        goal_id=goal_id,
        goal_title=gap_report.goal_title,
        title=f"Your {gap_report.goal_title} Learning Path",
        total_weeks=phases[-1].week_end if phases else gap_report.estimated_weeks,
        phases=phases,
        total_resources=sum(len(p.items) for p in phases),
        total_hours=total_hours,
    )


def _select_relevant_resources(
    scored: List[ScoredResource],
    gap_skill_ids: List[str],
    max_resources: int = 30,
) -> List[ScoredResource]:
    """
    Select resources that cover the learner's gap skills.
    Ensures all gap skills are covered, then fills with top-scored remaining.
    """
    gap_skills_remaining = set(gap_skill_ids)
    selected = []
    selected_ids = set()

    # First pass: greedily cover gap skills
    for resource in scored:
        if not gap_skills_remaining:
            break
        covers = set(resource.skills_taught) & gap_skills_remaining
        if covers and resource.resource_id not in selected_ids:
            selected.append(resource)
            selected_ids.add(resource.resource_id)
            gap_skills_remaining -= covers

    # Second pass: add high-scoring projects and assessments
    for resource in scored:
        if len(selected) >= max_resources:
            break
        if resource.resource_id not in selected_ids and resource.score > 0.2:
            # Include projects and capstones for richness
            if resource.is_project or resource.has_assessment:
                selected.append(resource)
                selected_ids.add(resource.resource_id)

    # Third pass: fill with top-scored remaining
    for resource in scored:
        if len(selected) >= max_resources:
            break
        if resource.resource_id not in selected_ids and resource.score > 0.15:
            selected.append(resource)
            selected_ids.add(resource.resource_id)

    return selected


def _topological_sort_resources(
    resources: List[ScoredResource],
    learner_skills: Dict[str, float],
) -> List[ScoredResource]:
    """
    Sort resources so that prerequisites come before dependent resources.
    Uses networkx for topological sort.
    
    Algorithm:
    - Map each resource to the skills it teaches
    - If resource B requires skill X and resource A teaches skill X → A before B
    """
    # Build skill → teaching resource map
    skill_taught_by: Dict[str, str] = {}  # skill_id → resource_id
    for r in resources:
        for skill in r.skills_taught:
            if skill not in skill_taught_by:
                skill_taught_by[skill] = r.resource_id

    # Build directed graph
    G = nx.DiGraph()
    resource_map = {r.resource_id: r for r in resources}

    for r in resources:
        G.add_node(r.resource_id)

    for r in resources:
        for prereq_skill in r.prerequisite_skills:
            # If learner already has this skill, no dependency needed
            if learner_skills.get(prereq_skill, 0.0) >= 0.70:
                continue
            # If another resource in our set teaches this prereq skill
            if prereq_skill in skill_taught_by:
                teaching_resource_id = skill_taught_by[prereq_skill]
                if teaching_resource_id != r.resource_id:
                    G.add_edge(teaching_resource_id, r.resource_id)

    # Topological sort
    try:
        sorted_ids = list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        # Cycle detected (shouldn't happen with well-formed data) — fall back to score order
        sorted_ids = [r.resource_id for r in resources]

    # Map back to resources, preserving original order for any not in graph
    ordered = []
    seen = set()
    for rid in sorted_ids:
        if rid in resource_map and rid not in seen:
            ordered.append(resource_map[rid])
            seen.add(rid)

    # Add any remaining resources not in graph
    for r in resources:
        if r.resource_id not in seen:
            ordered.append(r)

    return ordered


def _assign_to_phases(
    resources: List[ScoredResource],
    phase_titles: List[str],
    hours_per_week: int,
    total_weeks: int,
) -> List[PhasePlan]:
    """
    Distribute resources into phases based on available weekly hours.
    The last phase is always a capstone project.
    """
    if not resources:
        return []

    n_phases = len(phase_titles)
    resources_per_phase = max(1, len(resources) // n_phases)
    phases = []
    current_week = 1
    order_counter = 0

    for i, title in enumerate(phase_titles):
        is_last = i == n_phases - 1
        # Assign resources to this phase
        start_idx = i * resources_per_phase
        if is_last:
            phase_resources = resources[start_idx:]  # Give rest to last phase
        else:
            phase_resources = resources[start_idx: start_idx + resources_per_phase]

        if not phase_resources and not is_last:
            continue

        phase_hours = sum(r.duration_hours for r in phase_resources)
        phase_weeks = max(1, round(phase_hours / hours_per_week))
        week_end = current_week + phase_weeks - 1

        items = []
        for r in phase_resources:
            assessment_id = None
            if r.has_assessment:
                asmt = ASSESSMENT_BY_RESOURCE.get(r.resource_id)
                if asmt:
                    assessment_id = asmt["id"]

            items.append(
                PathItemPlan(
                    resource_id=r.resource_id,
                    title=r.title,
                    type=r.type,
                    difficulty=r.difficulty,
                    duration_hours=r.duration_hours,
                    skills_taught=r.skills_taught,
                    has_assessment=r.has_assessment,
                    assessment_id=assessment_id,
                    order_index=order_counter,
                    is_revision=False,
                    why_recommended=_generate_why(r, i, n_phases),
                )
            )
            order_counter += 1

        skills_covered = list({
            skill for item in items for skill in item.skills_taught
        })

        phases.append(
            PhasePlan(
                phase_number=i + 1,
                title=title,
                description=_phase_description(title, i, n_phases, skills_covered),
                week_start=current_week,
                week_end=week_end,
                items=items,
                skills_covered=skills_covered,
            )
        )
        current_week = week_end + 1

    return phases


def _generate_why(resource: ScoredResource, phase_idx: int, total_phases: int) -> str:
    """Generate a brief static explanation for why this resource is here."""
    if resource.is_project:
        return f"Apply your knowledge from this phase in a real-world project."
    if phase_idx == 0:
        return f"Builds essential foundation skills required for later stages."
    if phase_idx == total_phases - 1:
        return f"Capstone work that integrates everything you've learned."
    skills_str = ", ".join(resource.skills_taught[:2])
    return f"Teaches {skills_str} which are directly required for your goal."


def _phase_description(title: str, idx: int, total: int, skills: List[str]) -> str:
    skills_preview = ", ".join(skills[:3]) + ("..." if len(skills) > 3 else "")
    if idx == 0:
        return f"Build a solid foundation in {skills_preview}."
    if idx == total - 1:
        return f"Consolidate all your learning through capstone projects and portfolio building."
    return f"Develop core competencies in {skills_preview}."


def insert_revision_item(
    phases: List[PhasePlan],
    current_phase_idx: int,
    skill_id: str,
    revision_resource: dict,
) -> bool:
    """
    Insert a revision resource at the beginning of the next phase.
    Called by the adaptive engine after a low-score assessment.
    Returns True if successfully inserted.
    """
    next_phase_idx = current_phase_idx + 1
    if next_phase_idx >= len(phases):
        return False

    next_phase = phases[next_phase_idx]
    asmt = ASSESSMENT_BY_RESOURCE.get(revision_resource["id"])

    revision_item = PathItemPlan(
        resource_id=revision_resource["id"],
        title=revision_resource["title"],
        type=revision_resource.get("type", "course"),
        difficulty=revision_resource.get("difficulty", "beginner"),
        duration_hours=revision_resource.get("duration_hours", 5),
        skills_taught=revision_resource.get("skills_taught", [skill_id]),
        has_assessment=revision_resource.get("has_assessment", True),
        assessment_id=asmt["id"] if asmt else None,
        order_index=0,
        is_revision=True,
        why_recommended=f"Added because your assessment revealed a gap in {skill_id.replace('-', ' ')}. Completing this reinforcement will prepare you for the next phase.",
    )

    # Re-index existing items
    for item in next_phase.items:
        item.order_index += 1

    next_phase.items.insert(0, revision_item)
    return True
