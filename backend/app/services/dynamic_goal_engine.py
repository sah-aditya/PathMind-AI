"""
Dynamic Goal & Resource Engine
==============================
When a user chooses a career goal that is not in the static goals.json / resources.json dataset,
this engine uses Gemini to dynamically synthesize:
1. A structured Goal definition (title, description, required skills, phases)
2. Corresponding Skill definitions with prerequisite relationships
3. Rich Learning Resources (courses, hands-on projects, assessments)

This allows PathMind AI to generate high-quality learning roadmaps for ANY field
(e.g., Aviation/Pilot, Teaching/Education, Digital Marketing, Product Management,
Biotechnology, Finance, Design, Engineering, and more).
"""
import json
import re
import os
import logging
from typing import Dict, List, Tuple
from app.ai.gemini_service import _generate_with_fallback
from app.services.skill_gap_engine import GOALS_DATA, SKILLS_DATA, SKILL_BY_ID
from app.services.recommendation_engine import RESOURCES, RESOURCE_BY_ID

logger = logging.getLogger(__name__)

_DYNAMIC_GOALS_CACHE: Dict[str, dict] = {}
_DYNAMIC_RESOURCES_CACHE: Dict[str, dict] = {}


def get_or_create_goal(goal_text: str) -> Tuple[str, dict]:
    """
    Given a user's natural language goal text, either match an existing goal in GOALS_DATA,
    or dynamically generate and register a new goal with skills and resources using Gemini.
    """
    clean_goal = goal_text.strip().lower()
    
    # 1. Direct or partial match in static / cached goals
    for gid, gdata in {**GOALS_DATA, **_DYNAMIC_GOALS_CACHE}.items():
        title_low = gdata.get("title", "").lower()
        if clean_goal == gid or clean_goal == title_low or title_low in clean_goal or clean_goal in title_low:
            return gid, gdata

    # Check words similarity
    words = set(re.findall(r'\w+', clean_goal))
    for gid, gdata in {**GOALS_DATA, **_DYNAMIC_GOALS_CACHE}.items():
        g_words = set(re.findall(r'\w+', gdata.get("title", "").lower()))
        if len(words & g_words) >= 2:
            return gid, gdata

    # 2. Dynamically synthesize goal, skills, and resources via Gemini
    logger.info("Synthesizing dynamic goal for: %s", goal_text)
    try:
        dynamic_id, dynamic_goal, new_skills, new_resources = _synthesize_goal_with_gemini(goal_text)
        
        # Register in memory caches
        _DYNAMIC_GOALS_CACHE[dynamic_id] = dynamic_goal
        GOALS_DATA[dynamic_id] = dynamic_goal
        
        for sk in new_skills:
            if sk["id"] not in SKILL_BY_ID:
                SKILL_BY_ID[sk["id"]] = sk
                SKILLS_DATA.append(sk)
                
        for res in new_resources:
            if res["id"] not in RESOURCE_BY_ID:
                RESOURCE_BY_ID[res["id"]] = res
                RESOURCES.append(res)
                
        return dynamic_id, dynamic_goal
    except Exception as exc:
        logger.error("Failed to dynamically synthesize goal: %s", exc)
        # Fallback to closest or default
        fallback_id = list(GOALS_DATA.keys())[0]
        return fallback_id, GOALS_DATA[fallback_id]


def _synthesize_goal_with_gemini(goal_text: str) -> Tuple[str, dict, List[dict], List[dict]]:
    prompt = f"""You are PathMind AI's Curriculum Architect.
Generate a structured learning curriculum for the following career goal:
"{goal_text}"

Return ONLY valid JSON with this exact schema:
{{
  "goal_id": "slug-format-id (e.g. commercial-pilot, high-school-teacher)",
  "title": "Clean Professional Title (e.g. Commercial Pilot, High School Teacher)",
  "description": "2-sentence summary of this career path.",
  "typical_path_weeks": 12,
  "phases": [
    "Phase 1: Foundations & Core Concepts",
    "Phase 2: Practical Principles & Tools",
    "Phase 3: Advanced Applications",
    "Phase 4: Capstone Project & Portfolio"
  ],
  "skills": [
    {{
      "id": "skill-slug-1",
      "name": "Skill Name",
      "category": "Domain/Category",
      "parent": null,
      "description": "What this skill covers"
    }},
    {{
      "id": "skill-slug-2",
      "name": "Skill Name 2",
      "category": "Domain/Category",
      "parent": "skill-slug-1",
      "description": "What this skill covers"
    }}
  ],
  "resources": [
    {{
      "id": "dyn-res-1",
      "title": "Course/Project Title",
      "description": "Comprehensive description of what you learn and build.",
      "provider": "PathMind Academy",
      "type": "course",
      "difficulty": "beginner",
      "duration_hours": 8,
      "url": "https://learn.pathmind.ai/resource",
      "skills_taught": ["skill-slug-1"],
      "prerequisite_skills": [],
      "tags": ["tag1", "tag2"],
      "rating": 4.8,
      "is_project": false,
      "has_assessment": true
    }},
    {{
      "id": "dyn-res-2",
      "title": "Hands-on Project Title",
      "description": "Real-world project description.",
      "provider": "PathMind Projects",
      "type": "project",
      "difficulty": "intermediate",
      "duration_hours": 6,
      "url": "https://learn.pathmind.ai/project",
      "skills_taught": ["skill-slug-2"],
      "prerequisite_skills": ["skill-slug-1"],
      "tags": ["project", "hands-on"],
      "rating": 4.9,
      "is_project": true,
      "has_assessment": false
    }}
  ]
}}

PEDAGOGICAL RULES:
1. typical_path_weeks MUST be between 8 and 12 weeks (realistic student term).
2. Phase 1 resource MUST be beginner-friendly with zero prerequisites (introductory concepts first, never an upfront exam).
3. Generate 4-6 realistic skills and 6-8 corresponding modular learning resources (mix of conceptual lessons, hands-on projects, and checkpoint quizzes). Return ONLY JSON."""

    raw = _generate_with_fallback(prompt)
    clean_json = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    data = json.loads(clean_json)
    
    goal_id = data.get("goal_id") or re.sub(r'[^a-z0-9]+', '-', goal_text.lower()).strip('-')
    goal_obj = {
        "title": data.get("title", goal_text.title()),
        "description": data.get("description", f"Mastery path for {goal_text}"),
        "required_skills": [s["id"] for s in data.get("skills", [])],
        "optional_skills": [],
        "typical_path_weeks": data.get("typical_path_weeks", 12),
        "phases": data.get("phases", ["Foundations", "Core Principles", "Advanced Practice", "Capstone Application"]),
    }
    
    skills = data.get("skills", [])
    resources = data.get("resources", [])
    
    return goal_id, goal_obj, skills, resources
