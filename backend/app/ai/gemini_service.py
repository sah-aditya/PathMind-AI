"""
Gemini AI Service
=================
Handles all LLM interactions:
1. Conversational profile building (multi-turn chat → structured profile)
2. Recommendation explanation generation
3. Adaptive change notifications
4. General Q&A assistant (with learner context)

Model: gemini-1.5-flash (free tier)
"""
import json
import re
from typing import Dict, List, Optional

import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
_model = genai.GenerativeModel("gemini-1.5-flash")

# ─────────────────────────────────────────────
# System Prompts
# ─────────────────────────────────────────────

_ONBOARDING_SYSTEM = """You are PathMind AI, a friendly and intelligent learning path advisor.
Your job is to help a learner discover their learning goal and build a profile through natural conversation.

You need to discover (in a conversational, not interrogative way):
1. Their primary learning goal (career aspiration)
2. Current experience level (beginner/intermediate/advanced)
3. Existing skills they already have (e.g., Python, SQL, JavaScript)
4. Any courses or resources they've completed
5. Hours available per week for learning
6. Specific interests or sub-domains they're excited about
7. Preferred learning style (videos, reading, hands-on projects, mixed)

RULES:
- Ask ONE question at a time, naturally woven into conversation
- Be encouraging and warm
- When you have collected enough info (at least goal + experience + 2 skills), 
  ALWAYS end your response with the JSON block: ```profile_ready\n{...}\n```
- The JSON must have keys: goal_text, experience_level (beginner/intermediate/advanced), 
  known_skills (list), hours_per_week (int), interests (list), learning_style (mixed/video/reading/project)
- goal_text should be the user's goal in their words
- If unsure about a field, use a sensible default

Current conversation context: ONBOARDING"""

_EXPLANATION_SYSTEM = """You are PathMind AI, an expert learning advisor.
Explain in 2-3 sentences (friendly, not technical jargon) WHY a specific learning resource 
was recommended to a learner, given their profile and goals.
Be specific: mention their goal, the skills it teaches, and why it fits their level."""

_QA_SYSTEM = """You are PathMind AI, a knowledgeable and supportive AI learning assistant.
You help learners understand their personalized learning path, explain concepts, 
and answer questions about their progress and recommendations.

You have access to the learner's profile and current path. Be concise, encouraging, and precise.
When explaining technical concepts, use simple analogies. 
When the learner struggles, identify the gap and suggest where to focus.
Never fabricate courses or resources not in their path."""

_ADAPTATION_SYSTEM = """You are PathMind AI. A learner just completed an assessment.
Generate a supportive, personalized message explaining how their learning path was adapted.
Be specific about what changed and why. Keep it under 100 words. Be encouraging."""


# ─────────────────────────────────────────────
# Onboarding Chat
# ─────────────────────────────────────────────

async def chat_onboarding(
    messages: List[Dict[str, str]],
    user_message: str,
) -> Dict:
    """
    Multi-turn onboarding conversation.
    Returns: {reply: str, profile_ready: bool, profile: dict|None}
    """
    # Build conversation history for Gemini
    history = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat = _model.start_chat(history=history)

    # Prepend system context to first message if no history
    if not history:
        prompt = f"{_ONBOARDING_SYSTEM}\n\nUser: {user_message}"
    else:
        prompt = user_message

    response = chat.send_message(prompt)
    reply = response.text

    # Check if profile is ready
    profile = None
    profile_ready = False

    if "```profile_ready" in reply:
        try:
            match = re.search(r"```profile_ready\s*\n(.*?)\n```", reply, re.DOTALL)
            if match:
                profile_json = match.group(1).strip()
                profile = json.loads(profile_json)
                profile_ready = True
                # Clean reply to not show raw JSON to user
                reply = reply[:reply.index("```profile_ready")].strip()
                reply += "\n\n✅ **I have everything I need to generate your personalized learning path!**"
        except (json.JSONDecodeError, Exception):
            pass

    return {
        "reply": reply,
        "profile_ready": profile_ready,
        "profile": profile,
    }


# ─────────────────────────────────────────────
# Recommendation Explanation
# ─────────────────────────────────────────────

def generate_explanation(
    resource_title: str,
    resource_description: str,
    skills_taught: List[str],
    goal_title: str,
    learner_experience: str,
    score_breakdown: Dict[str, float],
    is_revision: bool = False,
) -> str:
    """
    Generate a human-readable explanation for why a resource was recommended.
    """
    if is_revision:
        prompt = (
            f"The learner scored below 50% on an assessment and needs reinforcement. "
            f"Explain in 2 sentences why '{resource_title}' was added to their path as a revision module. "
            f"Be supportive, not discouraging."
        )
    else:
        top_factor = max(score_breakdown, key=score_breakdown.get)
        factor_names = {
            "goal_relevance": "directly contributes to their goal",
            "gap_coverage": "covers a key skill gap",
            "prereq_readiness": "they are ready to tackle it now",
            "difficulty_fit": "matches their current level",
            "interest_alignment": "aligns with their specific interests",
        }
        top_reason = factor_names.get(top_factor, "fits their learning profile")

        prompt = (
            f"{_EXPLANATION_SYSTEM}\n\n"
            f"Learner goal: {goal_title}\n"
            f"Experience level: {learner_experience}\n"
            f"Resource: {resource_title}\n"
            f"Description: {resource_description}\n"
            f"Skills taught: {', '.join(skills_taught)}\n"
            f"Primary recommendation reason: {top_reason}\n\n"
            f"Write a 2-3 sentence explanation for the learner."
        )

    response = _model.generate_content(prompt)
    return response.text.strip()


# ─────────────────────────────────────────────
# Adaptive Notification
# ─────────────────────────────────────────────

def generate_adaptation_message(
    score: float,
    action: str,
    skill_id: str,
    changes_description: str,
    goal_title: str,
) -> str:
    """
    Generate a personalized message for a path adaptation event.
    """
    score_pct = int(score * 100)
    prompt = (
        f"{_ADAPTATION_SYSTEM}\n\n"
        f"Learner goal: {goal_title}\n"
        f"Assessment score: {score_pct}%\n"
        f"Skill assessed: {skill_id.replace('-', ' ').title()}\n"
        f"Adaptation made: {action}\n"
        f"Details: {changes_description}\n\n"
        f"Write a brief, encouraging message (under 100 words) explaining the change."
    )
    response = _model.generate_content(prompt)
    return response.text.strip()


# ─────────────────────────────────────────────
# Q&A Assistant
# ─────────────────────────────────────────────

async def answer_question(
    user_question: str,
    chat_history: List[Dict[str, str]],
    learner_context: Dict,
) -> str:
    """
    Answer learner questions using their profile and path as context.
    """
    context_str = json.dumps(learner_context, indent=2)

    history = []
    for msg in chat_history[-10:]:  # Last 10 messages for context
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat = _model.start_chat(history=history)

    prompt = (
        f"{_QA_SYSTEM}\n\n"
        f"Learner Context:\n{context_str}\n\n"
        f"Question: {user_question}"
    )

    response = chat.send_message(prompt)
    return response.text.strip()


# ─────────────────────────────────────────────
# Profile Extraction from Natural Language
# ─────────────────────────────────────────────

def extract_profile_from_text(user_description: str) -> Dict:
    """
    Fallback: extract structured profile from a free-text description.
    Used if the user pastes a long bio instead of chatting.
    """
    prompt = f"""Extract a learner profile from this text and return ONLY valid JSON.

Text: "{user_description}"

Return JSON with these exact keys:
{{
  "goal_text": "string - what they want to achieve",
  "experience_level": "beginner|intermediate|advanced",
  "known_skills": ["list", "of", "skills"],
  "hours_per_week": 8,
  "interests": ["list", "of", "interests"],
  "learning_style": "mixed|video|reading|project"
}}

If a field is unknown, use a sensible default. Return ONLY the JSON, no other text."""

    response = _model.generate_content(prompt)
    try:
        text = response.text.strip()
        # Remove markdown code blocks if present
        text = re.sub(r"```json\s*|\s*```", "", text).strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "goal_text": user_description[:200],
            "experience_level": "beginner",
            "known_skills": [],
            "hours_per_week": 8,
            "interests": [],
            "learning_style": "mixed",
        }


def match_goal_to_id(goal_text: str, available_goals: Dict) -> str:
    """
    Use Gemini to match a user's free-text goal to our goal taxonomy.
    """
    goals_list = "\n".join([f"- {k}: {v['title']}" for k, v in available_goals.items()])
    prompt = f"""Match this learning goal to the closest option from the list below.
Return ONLY the exact key (e.g., "machine-learning-engineer"), nothing else.

User goal: "{goal_text}"

Available goals:
{goals_list}

Return only the key of the best match."""

    response = _model.generate_content(prompt)
    matched = response.text.strip().strip('"').strip("'")
    if matched in available_goals:
        return matched
    # Fallback: return first goal
    return list(available_goals.keys())[0]
