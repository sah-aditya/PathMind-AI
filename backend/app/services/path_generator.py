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
    bloom_level: str = "understand"   # remember | understand | apply | analyze | evaluate | create
    bloom_tier: int = 2               # 1 to 6
    ksa_category: str = "knowledge"   # knowledge | skill | attitude


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
    Calibrated to a realistic student horizon (4–16 weeks max, default 8–12 weeks).
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

    # Step 2: Curate high-impact core units (8–14 units max to keep roadmap realistic & digestible)
    selected = _select_relevant_resources(scored, gap_skill_ids, experience_level, max_resources=12)

    # Step 3: Topological sort via skill dependency graph (foundations first)
    ordered = _topological_sort_resources(selected, learner_skills, experience_level)

    # Step 4: Assign to phases with Smart Horizon Budgeting (4–16 weeks)
    goal = GOALS_DATA.get(goal_id, {})
    phase_titles = goal.get("phases", ["Foundation", "Core Skills", "Advanced Application", "Capstone Project"])
    
    # Target weeks bounded to student reality
    target_weeks = max(4, min(16, gap_report.estimated_weeks or 12))
    phases = _assign_to_phases(ordered, phase_titles, hours_per_week, target_weeks, experience_level)

    total_hours = sum(
        item.duration_hours
        for phase in phases
        for item in phase.items
    )

    return PathPlan(
        goal_id=goal_id,
        goal_title=gap_report.goal_title,
        title=f"Your {gap_report.goal_title} Learning Path",
        total_weeks=phases[-1].week_end if phases else target_weeks,
        phases=phases,
        total_resources=sum(len(p.items) for p in phases),
        total_hours=total_hours,
    )


def _select_relevant_resources(
    scored: List[ScoredResource],
    gap_skill_ids: List[str],
    experience_level: str = "beginner",
    max_resources: int = 12,
) -> List[ScoredResource]:
    """
    Select high-impact resources that cover the learner's gap skills.
    Ensures a balanced mix of foundational lessons, practical exercises, and capstones.
    Only selects resources with positive relevance (score > 0) to avoid unrelated subjects.
    """
    valid_scored = [r for r in scored if r.score > 0.0]
    if not valid_scored:
        valid_scored = scored[:max_resources]

    gap_skills_remaining = set(gap_skill_ids)
    selected = []
    selected_ids = set()

    # Pass 1: Prioritize foundational beginner courses
    for resource in valid_scored:
        if resource.difficulty == "beginner" and not resource.is_project:
            covers = set(resource.skills_taught) & gap_skills_remaining
            if covers and resource.resource_id not in selected_ids:
                selected.append(resource)
                selected_ids.add(resource.resource_id)
                gap_skills_remaining -= covers

    # Pass 2: Greedily cover remaining gap skills with intermediate/advanced units
    for resource in valid_scored:
        if not gap_skills_remaining or len(selected) >= max_resources - 2:
            break
        covers = set(resource.skills_taught) & gap_skills_remaining
        if covers and resource.resource_id not in selected_ids:
            selected.append(resource)
            selected_ids.add(resource.resource_id)
            gap_skills_remaining -= covers

    # Pass 3: Add relevant capstone/portfolio project
    for resource in valid_scored:
        if len(selected) >= max_resources - 1:
            break
        if resource.resource_id not in selected_ids and resource.is_project:
            selected.append(resource)
            selected_ids.add(resource.resource_id)
            break

    # Pass 4: Fill remaining slots with top-scored items from valid pool
    for resource in valid_scored:
        if len(selected) >= max_resources:
            break
        if resource.resource_id not in selected_ids:
            selected.append(resource)
            selected_ids.add(resource.resource_id)

    return selected


def _topological_sort_resources(
    resources: List[ScoredResource],
    learner_skills: Dict[str, float],
    experience_level: str = "beginner",
) -> List[ScoredResource]:
    """
    Sort resources so that prerequisites come before dependent resources.
    Guarantees beginner foundations appear first, followed by intermediate frameworks,
    followed by production deployment and capstone projects.
    """
    # Build skill → teaching resource map
    skill_taught_by: Dict[str, str] = {}
    for r in resources:
        for skill in r.skills_taught:
            if skill not in skill_taught_by:
                skill_taught_by[skill] = r.resource_id

    # Build directed graph
    G = nx.DiGraph()
    resource_map = {r.resource_id: r for r in resources}

    for r in resources:
        G.add_node(r.resource_id)

    # Add prerequisite dependency edges
    for r in resources:
        for prereq_skill in r.prerequisite_skills:
            if learner_skills.get(prereq_skill, 0.0) >= 0.70:
                continue
            if prereq_skill in skill_taught_by:
                teaching_resource_id = skill_taught_by[prereq_skill]
                if teaching_resource_id != r.resource_id:
                    G.add_edge(teaching_resource_id, r.resource_id)

    # Add difficulty & project tier ordering edges
    for r1 in resources:
        for r2 in resources:
            if r1.resource_id != r2.resource_id:
                # Beginner courses precede Advanced projects/courses
                if r1.difficulty == "beginner" and not r1.is_project and r2.is_project:
                    if not nx.has_path(G, r2.resource_id, r1.resource_id):
                        G.add_edge(r1.resource_id, r2.resource_id)

    # Topological sort
    try:
        sorted_ids = list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        # Fall back to difficulty + score order if cycle detected
        sorted_ids = [
            r.resource_id for r in sorted(
                resources,
                key=lambda x: (
                    0 if x.difficulty == "beginner" and not x.is_project else 1 if x.difficulty == "intermediate" and not x.is_project else 2,
                    -x.score
                )
            )
        ]

    ordered = []
    seen = set()
    for rid in sorted_ids:
        if rid in resource_map and rid not in seen:
            ordered.append(resource_map[rid])
            seen.add(rid)

    for r in resources:
        if r.resource_id not in seen:
            ordered.append(r)

    return ordered


def _infer_bloom_and_ksa(r) -> tuple:
    """Infers Bloom's Taxonomy Cognitive Tier (g1-g6) and KSA Category based on research paper specs."""
    is_proj = getattr(r, "is_project", False)
    diff = getattr(r, "difficulty", "beginner")
    title = getattr(r, "title", "").lower()

    if is_proj:
        if any(w in title for w in ["capstone", "full-stack", "portfolio", "saas", "e-commerce"]):
            return "create", 6, "attitude"
        elif "deploy" in title or "evaluat" in title:
            return "evaluate", 5, "skill"
        return "create", 6, "skill"

    if diff == "advanced":
        if any(w in title for w in ["system design", "audit", "architect", "tuning", "optimization"]):
            return "evaluate", 5, "skill"
        return "analyze", 4, "skill"

    if diff == "intermediate":
        if any(w in title for w in ["deep dive", "analysis", "testing", "evaluation", "internals", "eda"]):
            return "analyze", 4, "skill"
        return "apply", 3, "skill"

    # Beginner
    if any(w in title for w in ["fundamentals", "basics", "introduction", "getting started"]):
        return "remember", 1, "knowledge"
    return "understand", 2, "knowledge"


def _score_resource_for_phase(r: ScoredResource, phase_title: str, phase_idx: int, total_phases: int) -> float:
    """Scores how well a resource fits a specific phase title."""
    title_lower = phase_title.lower()
    text = (r.title + " " + " ".join(r.skills_taught) + " " + " ".join(r.tags)).lower()
    score = 0.0

    # Capstone / Project phase
    if "capstone" in title_lower or ("project" in title_lower and phase_idx == total_phases - 1):
        if r.is_project:
            return 10.0
        elif phase_idx == total_phases - 1:
            return 3.0

    # Foundations / Basics
    if any(w in title_lower for w in ["basic", "foundation", "intro", "start", "fundamentals"]):
        if r.difficulty == "beginner" and not r.is_project:
            score += 5.0

    # Keywords in phase title matching skills or titles
    keywords = [
        k for k in title_lower.replace("(", " ").replace(")", " ").replace("/", " ").replace("-", " ").split()
        if len(k) > 2 and k not in ["the", "and", "for", "with", "core", "skills"]
    ]
    for kw in keywords:
        if kw in text:
            score += 4.0

    return score


def _assign_to_phases(
    resources: List[ScoredResource],
    phase_titles: List[str],
    hours_per_week: int,
    total_weeks: int,
    experience_level: str = "beginner",
) -> List[PhasePlan]:
    """
    Distribute resources into phases using Semantic Matching + Topological Ordering.
    Ensures HTML/CSS/Basics land in Foundation phases, frameworks land in Core phases,
    and Projects/Deployment land in final phases.
    """
    if not resources:
        return []

    n_phases = len(phase_titles)
    total_weeks = max(n_phases, min(16, total_weeks))
    base_weeks = total_weeks // n_phases
    extra = total_weeks % n_phases
    phase_week_lengths = [base_weeks + (1 if i < extra else 0) for i in range(n_phases)]

    # 1. Try semantic placement first
    phase_buckets: List[List[ScoredResource]] = [[] for _ in range(n_phases)]
    assigned_ids = set()

    # Pass A: Best semantic phase for each resource
    for r in resources:
        best_phase = 0
        best_score = -1.0
        for p_idx, p_title in enumerate(phase_titles):
            sc = _score_resource_for_phase(r, p_title, p_idx, n_phases)
            if sc > best_score:
                best_score = sc
                best_phase = p_idx
        if best_score > 0.0:
            phase_buckets[best_phase].append(r)
            assigned_ids.add(r.resource_id)

    # Pass B: Unassigned resources distributed topologically across empty/underfilled phases
    unassigned = [r for r in resources if r.resource_id not in assigned_ids]
    if unassigned:
        for r in unassigned:
            # Place in first bucket with space
            min_phase = min(range(n_phases), key=lambda idx: len(phase_buckets[idx]))
            phase_buckets[min_phase].append(r)

    # Pass C: Ensure no empty phases (borrow from largest phase if needed)
    for p_idx in range(n_phases):
        if not phase_buckets[p_idx]:
            # Find largest bucket with > 1 item
            largest_idx = max(range(n_phases), key=lambda idx: len(phase_buckets[idx]))
            if len(phase_buckets[largest_idx]) > 1:
                phase_buckets[p_idx].append(phase_buckets[largest_idx].pop())

    # Build final phases
    phases = []
    current_week = 1
    order_counter = 0

    for i, title in enumerate(phase_titles):
        bucket_resources = phase_buckets[i]
        if not bucket_resources and i != n_phases - 1:
            continue

        phase_weeks = max(1, phase_week_lengths[i] if i < len(phase_week_lengths) else 2)
        week_end = current_week + phase_weeks - 1

        # Sort within phase: beginner courses first, then advanced, then projects
        bucket_resources = sorted(
            bucket_resources,
            key=lambda r: (1 if r.is_project else 0, 0 if r.difficulty == "beginner" else 1 if r.difficulty == "intermediate" else 2)
        )

        items = []
        for r in bucket_resources:
            assessment_id = None
            if r.has_assessment:
                asmt = ASSESSMENT_BY_RESOURCE.get(r.resource_id)
                if asmt:
                    assessment_id = asmt["id"]

            bloom_lvl, bloom_t, ksa_cat = _infer_bloom_and_ksa(r)

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
                    bloom_level=bloom_lvl,
                    bloom_tier=bloom_t,
                    ksa_category=ksa_cat,
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
