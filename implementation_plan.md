# AI-Powered Personalized Learning Path Recommender
## Complete Implementation Plan & Walkthrough

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | PathMind AI |
| **Tagline** | *Your goal. Your pace. Your path.* |
| **Core Promise** | From goal → skill gap → structured roadmap → adaptive guidance |

---

## 2. Exact User Journey (The "One Killer Flow")

```
[Landing Page]
      ↓
  User clicks "Start My Journey"
      ↓
[Chat Onboarding — AI builds profile conversationally]
  Q1: "What's your learning goal?"  → ML Engineer
  Q2: "Rate your Python comfort?"   → Intermediate
  Q3: "Have you taken any courses?" → Python Basics, SQL
  Q4: "How many hrs/week?"          → 8
  Q5: "Any specific interest?"      → Computer Vision
      ↓
[Skill Gap Analysis Page]
  Radar chart + gap bars
  "You need: Statistics, ML Fundamentals, Deep Learning, MLOps"
      ↓
[12-Week Learning Roadmap Generated]
  Phases → Weeks → Resources per week
      ↓
[User clicks into Week 1]
  Opens resource → marks complete → takes assessment
      ↓
[Assessment Score = 45%]
  System detects weak area (Statistics)
  Path adapts: adds revision module
      ↓
[Dashboard updates]
  Progress bar, skill levels, next action
      ↓
[AI Explains in Chat]
  "We added a Statistics revision because your score shows a gap..."
      ↓
[User continues → path evolves with them]
```

---

## 3. Features We Will Actually Build

### ✅ Must Have (MVP)
- [ ] Conversational onboarding (AI chat builds learner profile)
- [ ] Learner profile page (skills, goals, availability)
- [ ] Skill gap analysis + visualization
- [ ] Personalized 4–12 week roadmap generator
- [ ] Resource cards (course/project/assessment types)
- [ ] Progress tracking (mark complete, assessment scores)
- [ ] Adaptive path logic (weak area detection → path update)
- [ ] AI explanation for every recommendation
- [ ] Dashboard (progress, skills radar, next action)

### 🔶 Nice to Have (if time allows)
- [ ] Skill self-assessment quiz
- [ ] Multiple career goals support
- [ ] Resource bookmarking / notes
- [ ] Email-style weekly digest summary

### ❌ Out of Scope
- Real-time course scraping from external platforms
- Authentication with OAuth providers (Google, GitHub)
- Deep-learning trained recommender model (hybrid rule+LLM is enough)
- Payment / subscription
- Mobile app

---

## 4. Database Schema

### PostgreSQL (with pgvector for semantic search)

```sql
-- Users
users (id, email, name, created_at)

-- Learner Profile
learner_profiles (
  id, user_id, goal_title, goal_description,
  experience_level,       -- beginner | intermediate | advanced
  hours_per_week,
  target_weeks,
  learning_style,         -- video | reading | project | mixed
  interests[],            -- array of topic tags
  created_at, updated_at
)

-- Skills Taxonomy (master list)
skills (
  id, name, slug, category, description,
  parent_skill_id         -- for skill hierarchy
)

-- Learner Skills (current levels)
learner_skills (
  id, user_id, skill_id,
  level,                  -- 0.0 to 1.0
  source,                 -- self_assessed | assessment | course_completed
  updated_at
)

-- Learning Resources (our curated dataset)
resources (
  id, title, description, provider,
  type,                   -- course | video | article | project | assessment
  difficulty,             -- beginner | intermediate | advanced
  duration_hours,
  url,
  skills_taught[],        -- skill IDs
  prerequisite_skills[]   -- skill IDs
  embedding vector(1536)  -- for semantic search
)

-- Resource-Skill Map
resource_skills (resource_id, skill_id, relevance_score)

-- Skill Graph (prerequisite edges)
skill_prerequisites (
  skill_id, prerequisite_skill_id, importance -- required | recommended
)

-- Learning Paths
learning_paths (
  id, user_id, title,
  status,                 -- active | completed | paused
  total_weeks,
  current_week,
  overall_progress,       -- 0.0 to 1.0
  created_at, updated_at
)

-- Path Phases
path_phases (
  id, path_id, phase_number, title,
  description, week_start, week_end, status
)

-- Path Items (individual resources in a path)
path_items (
  id, phase_id, resource_id, order_index,
  status,                 -- pending | in_progress | completed | skipped
  score,                  -- assessment score if applicable
  completed_at
)

-- Assessments
assessments (
  id, resource_id, title, questions jsonb
)

-- Assessment Results
assessment_results (
  id, user_id, assessment_id, path_item_id,
  score, answers jsonb, taken_at
)

-- Adaptation Log (audit trail of path changes)
path_adaptations (
  id, path_id, trigger_event,  -- low_score | completed_early | skipped
  description, created_at
)

-- Chat Messages
chat_messages (
  id, user_id, role,           -- user | assistant
  content, metadata jsonb, created_at
)
```

---

## 5. Skill Taxonomy (Initial Domains)

We will curate ~150–200 resources across these domains:

```
ROOT
├── Programming
│   ├── Python
│   │   ├── Python Basics
│   │   ├── Python Intermediate
│   │   └── Python OOP
│   ├── SQL
│   └── JavaScript
│
├── Mathematics
│   ├── Linear Algebra
│   ├── Calculus
│   ├── Probability
│   └── Statistics
│
├── Data Science
│   ├── NumPy
│   ├── Pandas
│   ├── Data Visualization
│   └── EDA
│
├── Machine Learning
│   ├── ML Fundamentals
│   ├── Supervised Learning
│   │   ├── Regression
│   │   └── Classification
│   ├── Unsupervised Learning
│   │   └── Clustering
│   ├── Model Evaluation
│   └── Feature Engineering
│
├── Deep Learning
│   ├── Neural Networks
│   ├── CNN
│   ├── RNN / LSTM
│   └── Transformers
│
├── Generative AI
│   ├── Prompt Engineering
│   ├── LLMs
│   └── RAG
│
├── MLOps
│   ├── Docker
│   ├── APIs (FastAPI / Flask)
│   ├── Model Deployment
│   └── CI/CD for ML
│
├── Web Development
│   ├── HTML/CSS
│   ├── React
│   ├── Node.js
│   └── REST APIs
│
├── Cloud
│   ├── AWS Fundamentals
│   ├── GCP Fundamentals
│   └── Azure Fundamentals
│
└── Cybersecurity
    ├── Networking Basics
    ├── Linux Fundamentals
    └── Ethical Hacking Basics
```

---

## 6. Recommendation Algorithm

### Scoring Formula

```
Final Score = w1 * Goal_Relevance
            + w2 * Skill_Gap_Coverage
            + w3 * Prerequisite_Readiness
            + w4 * Difficulty_Fit
            + w5 * Interest_Alignment
            + w6 * Semantic_Similarity

Where:
  w1 = 0.30  (most important: does this help reach the goal?)
  w2 = 0.25  (does this close an identified skill gap?)
  w3 = 0.20  (are prerequisites already met?)
  w4 = 0.10  (is difficulty appropriate?)
  w5 = 0.10  (does this match learner interests?)
  w6 = 0.05  (semantic match to goal description via embeddings)
```

### How Each Score is Computed

| Factor | Method |
|---|---|
| **Goal Relevance** | Skills taught ∩ skills required for goal → Jaccard similarity |
| **Skill Gap Coverage** | Fraction of gap skills this resource teaches |
| **Prerequisite Readiness** | Learner's mastery of all prerequisites (average) |
| **Difficulty Fit** | 1.0 if level matches learner level, 0.5 if adjacent |
| **Interest Alignment** | Overlap between resource tags and learner.interests[] |
| **Semantic Similarity** | cosine(embedding(resource.desc), embedding(goal)) |

### Ordering (Learning Path Sequence)

After scoring, we topological-sort resources based on:
1. Prerequisite graph (hard constraint — must come after its prerequisites)
2. Score (soft constraint — higher-scored resources in earlier weeks)
3. Difficulty (easier first within a phase)

---

## 7. AI / LLM Role

We use an LLM (Gemini or OpenAI GPT-4o) for four specific tasks:

| Task | Prompt Strategy | Output |
|---|---|---|
| **Profile Building** | Multi-turn conversation with structured extraction | JSON learner profile |
| **Explanation Generation** | "Given this learner profile and path, explain why resource X was recommended" | Natural language explanation |
| **Adaptation Notification** | "Learner scored 42% on assessment Y. Generate a friendly adaptive message." | Notification + revised plan description |
| **Q&A Assistant** | RAG over learner's path + resources | Contextual answers |

> **Important**: LLM is NOT the recommendation engine.  
> LLM explains + converses. The algorithm recommends + sequences.  
> This is a stronger AI/ML story than pure "LLM returns courses."

---

## 8. Adaptive Learning Logic

```python
def adapt_path(path_item, assessment_result):
    score = assessment_result.score

    if score < 0.50:
        # WEAK: Insert revision module before next phase
        action = "insert_revision"
        revision = find_revision_resource(path_item.skill)
        insert_before_next_phase(path, revision)
        notify_learner("low_score", score, revision)

    elif score >= 0.85:
        # STRONG: Skip optional review items
        action = "skip_review"
        skip_optional_items_in_next_phase(path)
        notify_learner("high_score", score)

    else:
        # NORMAL: Continue as planned
        action = "continue"

    log_adaptation(path.id, action, score)
```

Triggers for adaptation:
- Assessment score < 50% → add revision
- Assessment score > 85% → compress/skip review content  
- User marks 3+ items as "too easy" → elevate difficulty
- User marks 3+ items as "too hard" → insert bridge resources
- User falls behind schedule → reduce weekly load / extend timeline

---

## 9. Frontend Screens

### Screen 1: Landing Page
- Hero: "What do you want to learn?"
- CTA: "Start My Journey"
- Brief feature highlights

### Screen 2: Chat Onboarding
- Full-screen chat interface
- AI progressively builds profile
- Side panel shows profile being built in real time
- After 5–7 exchanges → "Generate My Learning Path" button

### Screen 3: Skill Gap Analysis
- Radar chart: Required skills vs Current skills
- Horizontal bar chart: Gap percentage per skill
- "Skills you already have ✓" section
- "Skills to develop" with priority rank
- CTA: "Build My Roadmap"

### Screen 4: Learning Roadmap
- Timeline/Kanban view of phases
- Each phase: title, weeks, resources
- Each resource: type badge, duration, difficulty, skills taught
- Click resource → opens detail panel
- Progress indicators on completed items

### Screen 5: Resource Detail
- Title, description, provider, duration
- Skills this teaches
- "Why this is in your path" (AI explanation)
- Assessment (if applicable)
- Mark complete button

### Screen 6: Dashboard
- Overall progress ring (% complete)
- Current phase + next action card
- Skill radar chart (before vs now)
- Recent adaptations ("Your path was updated because...")
- Quick stats: weeks elapsed, resources completed, assessments taken
- AI chat button (floating)

### Screen 7: AI Assistant (Chat Overlay)
- Available from any screen
- Knows learner context (profile, path, progress)
- Can answer: "Why am I learning this?", "What comes next?", "I'm struggling with statistics"

---

## 10. Backend API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/profile
PUT    /api/profile

POST   /api/chat/message          ← LLM chat
GET    /api/chat/history

POST   /api/onboarding/complete   ← Save profile from chat
GET    /api/skill-gap             ← Compute gap for current user
POST   /api/learning-path/generate ← Run recommendation + sequencing
GET    /api/learning-path/:id
GET    /api/learning-path/:id/phases
GET    /api/learning-path/:id/items

PUT    /api/path-item/:id/status  ← Mark complete/skip
POST   /api/assessment/:id/submit ← Submit answers, trigger adaptation

GET    /api/dashboard             ← Aggregated progress data
GET    /api/resources/search      ← Semantic search
GET    /api/resources/:id
GET    /api/resources/:id/explanation ← LLM explanation
```

---

## 11. Resource Dataset Structure

We'll create a JSON seed file (`resources.json`) with ~150–200 resources:

```json
{
  "id": "res_001",
  "title": "Python for Data Science",
  "description": "A comprehensive course covering Python fundamentals, data structures, and libraries for data analysis.",
  "provider": "Coursera",
  "type": "course",
  "difficulty": "beginner",
  "duration_hours": 20,
  "url": "https://coursera.org/...",
  "skills_taught": ["python-basics", "python-intermediate", "numpy", "pandas"],
  "prerequisite_skills": [],
  "tags": ["python", "data-science", "beginner-friendly"],
  "rating": 4.7
}
```

And a skill graph JSON (`skill_graph.json`):

```json
{
  "python-intermediate": {
    "prerequisites": ["python-basics"],
    "importance": "required"
  },
  "machine-learning": {
    "prerequisites": ["python-intermediate", "statistics", "numpy", "pandas"],
    "importance": "required"
  },
  "deep-learning": {
    "prerequisites": ["machine-learning", "linear-algebra"],
    "importance": "required"
  }
}
```

---

## 12. Tech Stack (Final Decision)

| Layer | Technology | Cost | Why |
|---|---|---|---|
| **Frontend** | React + Tailwind CSS | Free | Fast, component-based, great for dashboards |
| **Charts** | Recharts | Free | Radar, bar, timeline charts |
| **Backend** | Python + FastAPI | Free | Async, fast, great for AI APIs |
| **Database** | Supabase (PostgreSQL + pgvector) | **Free** | 500MB free, pgvector built-in, instant setup |
| **ORM** | SQLAlchemy + Alembic | Free | Migrations + typed queries |
| **LLM** | Gemini 1.5 Flash | **Free** | 15 RPM / 1M tokens/day free tier |
| **Embeddings** | Gemini text-embedding-004 | **Free** | Semantic search for resources |
| **Recommendation** | Custom Python (NumPy + networkx) | Free | Transparent, explainable scoring |
| **Auth** | JWT (python-jose) + bcrypt | Free | Proper auth with hashed passwords |
| **Backend Deploy** | Render.com (Web Service) | **Free** | Auto-deploy from GitHub |
| **Frontend Deploy** | Vercel | **Free** | Auto-deploy from GitHub |

---

## 13. System Architecture Diagram

```
                        ┌─────────────────────────────────┐
                        │          React Frontend          │
                        │  Chat | Roadmap | Dashboard      │
                        └──────────────┬──────────────────┘
                                       │ HTTP / REST
                        ┌──────────────▼──────────────────┐
                        │         FastAPI Backend          │
                        │                                   │
                        │  ┌──────────┐  ┌─────────────┐  │
                        │  │ Learner  │  │  AI Layer   │  │
                        │  │ Profiler │  │  (Gemini)   │  │
                        │  └────┬─────┘  └──────┬──────┘  │
                        │       │                │          │
                        │  ┌────▼─────────────────▼─────┐  │
                        │  │      Skill Gap Engine       │  │
                        │  └──────────────┬──────────────┘  │
                        │                 │                  │
                        │  ┌──────────────▼──────────────┐  │
                        │  │    Skill Graph (networkx)   │  │
                        │  └──────────────┬──────────────┘  │
                        │                 │                  │
                        │  ┌──────────────▼──────────────┐  │
                        │  │   Recommendation Engine     │  │
                        │  │   (scoring + ranking)       │  │
                        │  └──────────────┬──────────────┘  │
                        │                 │                  │
                        │  ┌──────────────▼──────────────┐  │
                        │  │   Learning Path Generator   │  │
                        │  │   (topological sort)        │  │
                        │  └──────────────┬──────────────┘  │
                        │                 │                  │
                        │  ┌──────────────▼──────────────┐  │
                        │  │  Adaptive Learning Engine   │  │
                        │  └──────────────┬──────────────┘  │
                        │                                   │
                        └──────────────┬──────────────────┘
                                       │
                        ┌──────────────▼──────────────────┐
                        │     PostgreSQL + pgvector        │
                        │  users | skills | resources      │
                        │  paths | progress | chat         │
                        └─────────────────────────────────┘
```

---

## 14. Build Phases & Timeline

### Phase 0 — Data & Schema (Day 1)
- [ ] Finalize skill taxonomy JSON
- [ ] Create resource dataset (150 resources across 6 domains)
- [ ] Create skill graph (prerequisites)
- [ ] Set up PostgreSQL + pgvector
- [ ] Run Alembic migrations
- [ ] Seed database

### Phase 1 — Backend Intelligence (Day 2–3)
- [ ] Skill Gap Engine
- [ ] Skill Graph traversal (networkx)
- [ ] Recommendation scoring engine
- [ ] Learning Path Generator (topological sort + phasing)
- [ ] Adaptive Learning Engine
- [ ] API endpoints

### Phase 2 — AI Layer (Day 3–4)
- [ ] Gemini integration (chat)
- [ ] Conversational profile extraction (structured output)
- [ ] Recommendation explanation generation
- [ ] Adaptive notification generation
- [ ] Semantic embeddings + pgvector search

### Phase 3 — Frontend (Day 4–6)
- [ ] Landing page
- [ ] Chat onboarding
- [ ] Skill gap visualization
- [ ] Learning roadmap view
- [ ] Resource detail + assessment
- [ ] Dashboard
- [ ] AI assistant overlay

### Phase 4 — Integration + Polish (Day 6–7)
- [ ] End-to-end flow testing
- [ ] Responsive design
- [ ] Error states
- [ ] Loading states
- [ ] Demo data / seed user

### Phase 5 — Delivery (Day 7–8)
- [ ] Deploy backend (Railway)
- [ ] Deploy frontend (Vercel)
- [ ] README
- [ ] Solution documentation (PDF)
- [ ] Demo video recording

---

## 15. Decisions Locked ✅

| Question | Decision |
|---|---|
| **Q1: LLM Provider** | **Google Gemini API (free tier)** — gemini-1.5-flash for chat/reasoning, text-embedding-004 for semantic search. Zero cost. |
| **Q2: Authentication** | **Full JWT auth** — email/password registration + login + protected routes. Proper auth. |
| **Q3: Resource Data** | **Fictional but realistic** — real metadata (titles, descriptions, skills, difficulty, duration) with placeholder URLs. |
| **Q4: Deployment** | **100% free public stack**: Supabase (PostgreSQL + pgvector), Render.com (FastAPI backend), Vercel (React frontend). |
| **Q5: Assessments** | **Scenario-based adaptive assessments** — contextual, multi-step questions. Score drives path adaptation. Best possible recommendation quality. |

---

## 16. What Makes This Submission Win

| Criterion | Our Differentiator |
|---|---|
| **Problem Understanding (20%)** | Skill graph + prerequisite-aware sequencing. Not just "recommend courses." |
| **Functionality (25%)** | All 6 required features implemented + adaptive loop |
| **AI/ML (20%)** | Hybrid: scoring algo + LLM + embeddings + adaptive engine = 4 AI techniques |
| **Innovation (15%)** | Real-time path adaptation + explainable recommendations |
| **UX (10%)** | Conversational onboarding, visual roadmap, skill radar |
| **Code Quality (10%)** | FastAPI + SQLAlchemy + modular services + typed schemas |

---

*Plan version: 1.0 | Created: 2026-08-19*
