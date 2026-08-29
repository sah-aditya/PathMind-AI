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
from app.services.skill_gap_engine import SkillGapReport, GOALS_DATA, SKILL_BY_ID

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
    Select high-impact resources that directly cover the learner's gap skills across all key pillars.
    Guarantees balanced coverage: Foundations -> Core ML -> Advanced/DL -> MLOps -> 1 Capstone.
    Excludes adaptive revision units from initial path generation.
    """
    valid_scored = [
        r for r in scored
        if r.score > 0.0 and "revision" not in r.title.lower() and "checkpoint" not in r.title.lower()
    ]
    if not valid_scored:
        valid_scored = [r for r in scored if "revision" not in r.title.lower()]

    selected = []
    selected_ids = set()

    # Step 1: Select 1-2 core courses from each skill category present in the gap skills
    category_order = [
        "Mathematics", "Programming", "Web Development", "Data Science",
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Generative AI", "MLOps"
    ]
    
    for cat in category_order:
        cat_skills = [
            sid for sid in gap_skill_ids
            if SKILL_BY_ID.get(sid, {}).get("category") == cat
        ]
        if not cat_skills:
            continue
        
        # Pick top 1-2 non-project courses teaching skills in this category
        cat_count = 0
        for r in valid_scored:
            if r.resource_id not in selected_ids and not r.is_project:
                if any(s in r.skills_taught for s in cat_skills):
                    selected.append(r)
                    selected_ids.add(r.resource_id)
                    cat_count += 1
                    if cat_count >= 2:
                        break

    # Step 2: Add exactly ONE high-impact Capstone / Portfolio project at the end
    best_project = None
    for r in valid_scored:
        if r.is_project and r.resource_id not in selected_ids:
            if "capstone" in r.title.lower() or "end-to-end" in r.title.lower() or "portfolio" in r.title.lower():
                best_project = r
                break
            elif not best_project:
                best_project = r
    if best_project:
        selected.append(best_project)
        selected_ids.add(best_project.resource_id)

    # Step 3: Backfill any remaining essential gap skills up to max_resources
    for sid in gap_skill_ids:
        if len(selected) >= max_resources:
            break
        for r in valid_scored:
            if r.resource_id not in selected_ids and not r.is_project and sid in r.skills_taught:
                selected.append(r)
                selected_ids.add(r.resource_id)
                break

    return selected


CATEGORY_TIER = {
    "Mathematics": 1,
    "Programming": 1,
    "Web Development": 2,
    "Data Science": 2,
    "Machine Learning": 3,
    "Deep Learning": 4,
    "NLP": 4,
    "Computer Vision": 4,
    "Generative AI": 4,
    "MLOps": 5,
    "Cloud": 5,
}

def _get_resource_tier(r: ScoredResource) -> int:
    """Returns the pedagogical tier (1=foundations to 6=capstone)."""
    if r.is_project:
        return 6
    tiers = []
    for skill_id in r.skills_taught:
        skill_info = SKILL_BY_ID.get(skill_id, {})
        cat = skill_info.get("category", "General")
        if cat in CATEGORY_TIER:
            tiers.append(CATEGORY_TIER[cat])
    if tiers:
        base_tier = max(tiers)
    else:
        base_tier = 1 if r.difficulty == "beginner" else 3 if r.difficulty == "intermediate" else 5
    return base_tier


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

    # 1. Add strict prerequisite dependency edges
    for r in resources:
        for prereq_skill in r.prerequisite_skills:
            if learner_skills.get(prereq_skill, 0.0) >= 0.70:
                continue
            if prereq_skill in skill_taught_by:
                teaching_resource_id = skill_taught_by[prereq_skill]
                if teaching_resource_id != r.resource_id:
                    G.add_edge(teaching_resource_id, r.resource_id)

    # 2. Add pedagogical tier ordering edges (lower tier -> higher tier)
    for r1 in resources:
        t1 = _get_resource_tier(r1)
        for r2 in resources:
            if r1.resource_id != r2.resource_id:
                t2 = _get_resource_tier(r2)
                if t1 < t2:
                    if not nx.has_path(G, r2.resource_id, r1.resource_id):
                        G.add_edge(r1.resource_id, r2.resource_id)

    # Topological sort
    try:
        sorted_ids = list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        # Fall back to tier + difficulty + score order if cycle detected
        sorted_ids = [
            r.resource_id for r in sorted(
                resources,
                key=lambda x: (
                    _get_resource_tier(x),
                    0 if x.difficulty == "beginner" else 1 if x.difficulty == "intermediate" else 2,
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
    Distribute topologically sorted resources evenly across the roadmap phases.
    Preserves strict prerequisite ordering (foundations -> core -> advanced -> capstone)
    while ensuring every phase has a balanced 2–3 unit workload.
    """
    if not resources:
        return []

    n_phases = len(phase_titles)
    total_weeks = max(n_phases, min(16, total_weeks))
    base_weeks = total_weeks // n_phases
    extra = total_weeks % n_phases
    phase_week_lengths = [base_weeks + (1 if i < extra else 0) for i in range(n_phases)]

    # Separate capstone project from preparatory coursework
    courses = [r for r in resources if not r.is_project]
    projects = [r for r in resources if r.is_project]

    phase_buckets: List[List[ScoredResource]] = [[] for _ in range(n_phases)]

    # Distribute courses across all phases in strict topological order
    # (Final phase gets fewer courses to leave room for the capstone project)
    num_courses = len(courses)
    if n_phases > 1:
        # Target sizes for course distribution
        target_sizes = [0] * n_phases
        remaining = num_courses
        
        # Give roughly equal share, with slightly fewer courses in the final capstone phase
        for i in range(n_phases - 1):
            share = max(1, round(remaining / (n_phases - i)))
            target_sizes[i] = share
            remaining -= share
        target_sizes[-1] = max(0, remaining)

        # Distribute sequentially from topologically ordered list
        c_idx = 0
        for p_idx, size in enumerate(target_sizes):
            for _ in range(size):
                if c_idx < num_courses:
                    phase_buckets[p_idx].append(courses[c_idx])
                    c_idx += 1

        # Put projects in the final phase (or penultimate if multiple)
        for proj in projects:
            phase_buckets[-1].append(proj)
    else:
        phase_buckets[0] = list(resources)

    # Ensure no empty phase by moving an item from the largest phase if needed
    for p_idx in range(n_phases):
        if not phase_buckets[p_idx]:
            # Find largest phase
            largest_idx = max(range(n_phases), key=lambda idx: len(phase_buckets[idx]))
            if len(phase_buckets[largest_idx]) > 1:
                # If moving forward, take from front; if moving backward, take from end
                if largest_idx > p_idx:
                    phase_buckets[p_idx].append(phase_buckets[largest_idx].pop(0))
                else:
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

        # Within phase sort: beginner courses first, intermediate, then advanced/projects
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
