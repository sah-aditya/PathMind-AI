"""
Gemini AI Service
=================
Handles all LLM interactions:
1. Conversational profile building (multi-turn chat -> structured profile)
2. Recommendation explanation generation
3. Adaptive change notifications
4. General Q&A assistant (with learner context)

Uses a resilient multi-model cascade (gemini-flash-lite-latest, gemini-3.1-flash-lite, etc.)
with smart fallbacks to handle free-tier rate limits gracefully.
"""
import json
import re
import logging
from typing import Dict, List, Optional

import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)

# Cascade of available Gemini models (verified from API list)
CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",  # Fastest, lowest latency
    "gemini-3.6-flash",       # Stronger reasoning
    "gemini-flash-lite-latest",  # Latest lite alias
    "gemini-2.5-flash-lite",  # Fallback
    "gemini-2.5-flash",       # Heavy fallback
]

# ─────────────────────────────────────────────
# System Prompts
# ─────────────────────────────────────────────

_ONBOARDING_SYSTEM = """You are PathMind AI, a friendly AI learning path advisor running a structured ONBOARDING flow.

Your ONLY job right now is to collect information to build the learner's profile. 
DO NOT give learning advice, roadmaps, tutorials, or course recommendations during this phase.
DO NOT say "Welcome back". DO NOT jump to teaching content.

You need to discover (through natural friendly conversation, NOT an interrogation):
1. Their primary learning goal (career aspiration or skill they want)
2. Current experience level (beginner / intermediate / advanced)
3. Existing skills they already have (e.g., Python, SQL, HTML)
4. Hours available per week for studying
5. Specific interests or sub-domains they're excited about
6. Preferred learning style (videos, reading, hands-on projects, or mixed)

CRITICAL RULES — follow these exactly:
- Ask EXACTLY ONE question per response. Never ask two questions at once.
- Keep responses SHORT — 2-4 sentences max until profile_ready.
- Be warm, encouraging, and conversational.
- After receiving the user's FIRST message, acknowledge their goal warmly and ask about their experience level.
- After ~4 exchanges (once you have goal + experience + skills + hours), emit the profile_ready JSON block.
- When you have enough info, end your FINAL response with this EXACT block:

```profile_ready
{
  "goal_text": "<user's goal in their words>",
  "experience_level": "<beginner|intermediate|advanced>",
  "known_skills": ["<skill-id-1>", "<skill-id-2>"],
  "hours_per_week": <int>,
  "interests": ["<interest-1>", "<interest-2>"],
  "learning_style": "<mixed|video|reading|project>"
}
```

If unsure about a field, use a sensible default. Use snake_case hyphenated skill IDs like: python-basics, sql, javascript, machine-learning, deep-learning, data-science, web-development, etc.

Current phase: ONBOARDING — profile collection only."""

_EXPLANATION_SYSTEM = """You are PathMind AI, an expert learning advisor.
Explain in 2-3 sentences (friendly, not technical jargon) WHY a specific learning resource 
was recommended to a learner, given their profile and goals.
Be specific: mention their goal, the skills it teaches, and why it fits their level."""

_QA_SYSTEM = """You are PathMind AI, a knowledgeable and supportive AI learning assistant.
You help learners understand their personalized learning path, explain concepts, 
and answer questions about their progress and recommendations.

Formatting rules:
- Use **bold** for key terms, skill names, and important phrases.
- Use bullet lists for multi-step explanations or comparisons.
- Use `inline code` for technical terms, commands, or file names.
- Keep responses concise — 3-6 sentences for simple questions, up to 10 for complex ones.
- If suggesting resources, ONLY refer to those in the learner's current path.
- Be warm, encouraging, and precise.

When the learner struggles with a concept, identify the root gap and suggest the specific
phase or resource in their roadmap to revisit."""

_ADAPTATION_SYSTEM = """You are PathMind AI. A learner just completed an assessment.
Generate a supportive, personalized message explaining how their learning path was adapted.
Be specific about what changed and why. Keep it under 100 words. Be encouraging."""


# ─────────────────────────────────────────────
# Helper: Resilient Multi-Model Generation
# ─────────────────────────────────────────────

def _generate_with_fallback(prompt: str) -> str:
    """Try candidate models in sequence until one succeeds."""
    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning("Model %s failed: %s", model_name, e)
            last_error = e

    logger.error("All Gemini models failed: %s", last_error)
    raise last_error or RuntimeError("Failed to generate content from any model")


# ─────────────────────────────────────────────
# Onboarding Chat
# ─────────────────────────────────────────────

async def chat_onboarding(
    messages: List[Dict[str, str]],
    user_message: str,
) -> Dict:
    """
    Multi-turn onboarding conversation with multi-model cascade & resilient fallbacks.
    Returns: {reply: str, profile_ready: bool, profile: dict|None}

    FIX: system_instruction is now passed as a proper GenerativeModel parameter
    instead of being injected inline into the user message (which Gemini ignores).
    """
    # Build strictly alternating conversation history for Gemini start_chat:
    # Gemini requires: user -> model -> user -> model ...
    # And the current user_message must NOT be in history (it will be passed to send_message).
    history = []
    
    # Exclude the current message if it's already in messages list
    prior_messages = [m for m in messages if m.get("content") != user_message]
    
    if prior_messages:
        # Prime the conversation start
        history.append({
            "role": "user",
            "parts": ["Hi, I want to start my personalized learning onboarding."],
        })
        for msg in prior_messages:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "").strip()
            if not content:
                continue
            # Avoid consecutive duplicate roles
            if history and history[-1]["role"] == role:
                history[-1]["parts"][0] += f"\n\n{content}"
            else:
                history.append({"role": role, "parts": [content]})
        
        # Ensure the last item in history is a 'model' turn so the next message from user is expected
        if history and history[-1]["role"] == "user":
            history.append({
                "role": "model",
                "parts": ["Understood. Tell me more so I can tailor your roadmap."]
            })

    reply = None
    for model_name in CANDIDATE_MODELS:
        try:
            # ✅ FIXED: system_instruction is the proper way to set persistent context
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=_ONBOARDING_SYSTEM,
            )
            chat = model.start_chat(history=history)
            response = chat.send_message(user_message)
            if response and response.text:
                reply = response.text
                break
        except Exception as e:
            logger.warning("Onboarding chat with %s failed: %s", model_name, e)

    # Smart fallback if all API calls hit temporary quotas
    if not reply:
        reply = _heuristic_onboarding_reply(messages, user_message)

    # ── Profile ready detection ──────────────────────────────────────────
    # Require at least 3 prior user turns before accepting profile_ready.
    # This prevents the model from short-circuiting the onboarding flow on
    # the very first message even when the user mentions their skills upfront.
    MIN_USER_TURNS_BEFORE_READY = 3
    prior_user_turns = len([m for m in messages if m.get("role") == "user"])

    profile = None
    profile_ready = False

    if "```profile_ready" in reply and prior_user_turns >= MIN_USER_TURNS_BEFORE_READY:
        try:
            match = re.search(r"```profile_ready\s*\n(.*?)\n```", reply, re.DOTALL)
            if match:
                profile_json = match.group(1).strip()
                profile = json.loads(profile_json)
                profile_ready = True
                # Strip raw JSON block from the visible reply
                reply = reply[:reply.index("```profile_ready")].strip()
                reply += "\n\n✅ **I have everything I need to generate your personalized learning path!**"
        except (json.JSONDecodeError, Exception):
            pass
    elif "```profile_ready" in reply and prior_user_turns < MIN_USER_TURNS_BEFORE_READY:
        # Too early — strip the profile block and ask the next missing question instead
        reply = reply[:reply.index("```profile_ready")].strip()
        reply += "\n\n" + _heuristic_onboarding_reply(messages, user_message)

    return {
        "reply": reply,
        "profile_ready": profile_ready,
        "profile": profile,
    }


def _heuristic_onboarding_reply(messages: List[Dict[str, str]], user_msg: str) -> str:
    """Fallback conversation logic if rate-limited."""
    user_turns = [m.get("content", "") for m in messages if m.get("role") == "user"]
    first_goal = user_turns[0] if user_turns else user_msg
    user_turn_count = len(user_turns) + 1

    if user_turn_count == 1:
        return (
            f"That's a fantastic goal! 🚀\n\n"
            f"To help me tailor the right path for you, how would you describe your current experience level? "
            f"(Complete beginner, some basics, or intermediate?)"
        )
    elif user_turn_count == 2:
        return (
            "Got it! What skills, background, or tools do you currently have some familiarity with, if any?"
        )
    elif user_turn_count == 3:
        return (
            "Awesome! How many hours per week can you realistically dedicate to learning?"
        )
    else:
        # Ready to generate
        clean_goal = first_goal.replace('"', '').strip()
        return (
            f"Perfect! I have enough information to build your personalized roadmap for **{clean_goal}**.\n\n"
            f"```profile_ready\n"
            f'{{\n'
            f'  "goal_text": "{clean_goal}",\n'
            f'  "experience_level": "beginner",\n'
            f'  "known_skills": [],\n'
            f'  "hours_per_week": 8,\n'
            f'  "interests": [],\n'
            f'  "learning_style": "mixed"\n'
            f'}}\n'
            f"```"
        )


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
        top_factor = max(score_breakdown, key=score_breakdown.get) if score_breakdown else "goal_relevance"
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

    try:
        return _generate_with_fallback(prompt)
    except Exception:
        skills_str = ", ".join(skills_taught[:3]) if skills_taught else "core concepts"
        return (
            f"This resource is recommended because it focuses on {skills_str}, "
            f"which directly bridges one of your primary skill gaps for {goal_title}."
        )


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
    try:
        return _generate_with_fallback(prompt)
    except Exception:
        return (
            f"Based on your score of {score_pct}% in {skill_id.replace('-', ' ').title()}, "
            f"we've adjusted your roadmap to help reinforce key concepts and ensure continuous progress."
        )


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
    History is trimmed to the last 6 Q&A exchanges only — onboarding
    messages are excluded to prevent context bleed.
    """
    context_str = json.dumps(learner_context, indent=2)

    # Build system_instruction that includes learner context
    system_with_context = (
        f"{_QA_SYSTEM}\n\n"
        f"=== LEARNER CONTEXT ===\n{context_str}\n===================="
    )

    # Only keep the last 6 Q&A turns (not onboarding history)
    # Filter out any messages that look like onboarding (profile_ready, etc.)
    qa_history = [
        msg for msg in chat_history
        if "profile_ready" not in msg.get("content", "")
        and "I have everything I need" not in msg.get("content", "")
        and msg.get("phase", "assistant") in ("assistant", "qa", None, "")
    ][-12:]  # Last 12 messages = 6 exchanges

    history = []
    for msg in qa_history:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    for model_name in CANDIDATE_MODELS:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_with_context,
            )
            chat = model.start_chat(history=history)
            response = chat.send_message(user_question)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning("Q&A with %s failed: %s", model_name, e)

    return (
        "I'm here to support your learning journey! Based on your goal, focus on the next "
        "step in your roadmap and take the knowledge checks to reinforce your understanding."
    )


# ─────────────────────────────────────────────
# Profile Extraction from Natural Language
# ─────────────────────────────────────────────

def extract_profile_from_text(user_description: str) -> Dict:
    """
    Fallback: extract structured profile from a free-text description.
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

    try:
        text = _generate_with_fallback(prompt)
        text = re.sub(r"```json\s*|\s*```", "", text).strip()
        return json.loads(text)
    except Exception:
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

    try:
        text = _generate_with_fallback(prompt)
        matched = text.strip().strip('"').strip("'")
        if matched in available_goals:
            return matched
    except Exception:
        pass

    # Keyword match fallback
    goal_lower = goal_text.lower()
    for gid in available_goals:
        if any(w in goal_lower for w in gid.split("-")):
            return gid

    return list(available_goals.keys())[0]
