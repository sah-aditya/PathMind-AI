# PathMind AI — Full Upgrade Plan
## Light-Theme Professional UI + Proper ML Recommendation Engine

---

## Overview

Two major parallel upgrades:
1. **ML/AI Upgrade** — Replace the current heuristic scoring engine with proper ML algorithms
2. **UI Redesign** — Full light-theme professional redesign (inspired by the HirePrice dashboard reference)

---

## Part A: ML Recommendation Engine Upgrades

### What currently exists (heuristics only):
- A 6-factor weighted score: Goal Relevance (Jaccard), Skill Gap, Prerequisite Readiness, Difficulty Fit, Interest Alignment, Type Preference
- Adaptive engine: simple threshold rules (score < 50% → insert revision)
- Skill gap: simple set subtraction

### What we'll add (real ML):

#### 1. TF-IDF Cosine Similarity (Content-Based Filtering)
**Where:** `recommendation_engine.py`
- Encode each resource's title + description + tags into a TF-IDF vector
- Encode the learner's goal text + interests into the same vector space
- Add cosine similarity as a 7th scoring factor (weight: 15%)
- This means resources whose *language* matches the learner's goal language score higher

#### 2. Collaborative Filtering via Matrix Factorization (SVD)
**Where:** New `ml_engine.py`
- Build a user-resource interaction matrix from `PathItem` completion data in the DB
- Apply Truncated SVD (from scikit-learn, already installed) to decompose the matrix
- Compute latent factor similarities to find "learners like you also completed X"
- Added as an 8th scoring factor (weight: 10%), falls back gracefully to 0 if insufficient data

#### 3. Learning Curve / Bayesian Skill Estimation (ELO-style)
**Where:** `adaptive_engine.py`
- Replace the simple `0.6 * old + 0.4 * new` weighted average with a proper Bayesian update:
  - Model skill mastery as a Beta distribution (α, β parameters stored per skill)
  - Update α on correct answers, β on incorrect answers
  - Skill confidence = α / (α + β), uncertainty = 1 / (α + β)
  - Use uncertainty to prioritize which skills to assess next

#### 4. Knowledge Graph Prerequisite Pathfinding (BFS/Topological Sort)
**Where:** `skill_gap_engine.py`
- Already has a skill graph; we'll add proper **topological ordering** of the dependency DAG
- Use BFS from the learner's current skills to find the **shortest prerequisite path** to all gap skills
- This gives a mathematically optimal learning sequence vs current heuristic priority

#### 5. Exploration vs Exploitation (ε-greedy Bandit for Recommendations)
**Where:** `recommendation_engine.py` scoring
- 80% of the time: exploit top-scoring resources (current behavior)
- 20% of the time: inject a random high-potential resource the learner hasn't seen
- Increases diversity and reduces filter bubble in the roadmap

---

## Part B: UI Redesign — Light Theme Professional

### Design System Changes
Inspired by the reference image (HirePrice dashboard):
- **Color Palette:** Clean white/very light grey (#F8F9FC) backgrounds, white cards, with one accent color (indigo #4F46E5)
- **Sidebar:** Narrow icon-only sidebar (left, with tooltips) or slim sidebar like the reference
- **Top Bar:** Full-width header with greeting, nav tabs (Dashboard | Roadmap | Skills | Chat), notification icon, user avatar
- **Cards:** White background, subtle `box-shadow`, 16px border-radius — no glassmorphism
- **Typography:** Inter font (already there), darker text (#1E293B primary, #64748B secondary)
- **Charts:** Light-themed Recharts (no dark tooltips, use light stroke colors)
- **Animations:** Subtle entrance animations (no dramatic glow/blob effects)

### Files to Modify

#### `tailwind.config.js`
- Add a full light palette: `slate`, `indigo`, `white`
- Replace current dark surface colors with light equivalents

#### `src/index.css`
- Full rewrite: light theme, white cards, new button styles, new form styles
- Keep utility classes (`.card`, `.btn-primary`, etc.) but redesign them for light mode

#### `src/components/AppLayout.jsx`  
- Redesign sidebar: slim (64px), icon + label, white background with subtle border
- Add a proper top header bar (greeting + nav tabs + notifications + avatar)
- Remove dark blob backgrounds

#### `src/pages/Landing.jsx`
- Light hero: white/near-white background with a strong indigo CTA
- Clean cards, real screenshots/mockups in hero section
- Professional copywriting layout (3-column feature grid)

#### `src/pages/Dashboard.jsx`
- 4 stat cards at top (like reference: Total Courses, Active Path, Skills Mastered, Days Streak)
- Progress area chart (learning velocity over time) using area chart instead of radar only
- Skills radar chart remains but with light colors
- "Up Next" card with course thumbnail placeholder
- Recent activity feed on the right side

#### `src/pages/Roadmap.jsx`
- Timeline view: Vertical timeline with phase milestones
- Cards use light theme with color-coded status chips

#### `src/pages/SkillGap.jsx`
- Professional skill gap bars (horizontal, with percentage labels)
- Readiness score prominently displayed

#### `src/pages/Login.jsx` & `Register.jsx`
- Split-screen layout: form on left, graphic/feature list on right
- Clean white form, indigo buttons

---

## Files Changed Summary

### Backend (ML Engine)
| File | Change |
|------|--------|
| `backend/app/services/recommendation_engine.py` | Add TF-IDF cosine similarity + ε-greedy exploration |
| `backend/app/services/ml_engine.py` [NEW] | SVD collaborative filtering + TF-IDF vectorizer |
| `backend/app/services/adaptive_engine.py` | Bayesian Beta skill estimation |
| `backend/app/services/skill_gap_engine.py` | Topological sort for optimal learning sequence |

### Frontend (UI Redesign)
| File | Change |
|------|--------|
| `frontend/tailwind.config.js` | Light theme palette |
| `frontend/src/index.css` | Full light theme CSS rewrite |
| `frontend/src/components/AppLayout.jsx` | New sidebar + top header |
| `frontend/src/pages/Dashboard.jsx` | 4-stat cards + charts + activity feed |
| `frontend/src/pages/Landing.jsx` | Light hero + professional layout |
| `frontend/src/pages/Roadmap.jsx` | Timeline layout |
| `frontend/src/pages/SkillGap.jsx` | Professional skill bars |
| `frontend/src/pages/Login.jsx` | Split-screen auth |
| `frontend/src/pages/Register.jsx` | Split-screen auth |
| `frontend/src/components/ChatOverlay.jsx` | Light theme chat |

---

## Verification Plan

1. Start backend → confirm no import errors
2. Check `/docs` (FastAPI swagger) for API health
3. Navigate frontend → confirm light theme renders
4. Register a test user → go through onboarding → verify dashboard shows ML-scored recommendations
5. Complete a resource → verify Bayesian skill update in skill-gap page
