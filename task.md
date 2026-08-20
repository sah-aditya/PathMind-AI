# PathMind AI — Build Task List

## Phase 0 — Data & Schema
- [x] Lock all architectural decisions
- [ ] Create project folder structure
- [ ] Create skill taxonomy JSON (skills.json)
- [ ] Create skill prerequisite graph JSON (skill_graph.json)
- [ ] Create resource dataset JSON (resources.json, ~150 resources)
- [ ] Create scenario-based assessments JSON (assessments.json)
- [ ] Create career goals → required skills mapping (goals.json)
- [ ] Write SQLAlchemy models
- [ ] Write Alembic migrations
- [ ] Write DB seed script

## Phase 1 — Backend Intelligence
- [ ] FastAPI project setup + folder structure
- [ ] Auth system (register, login, JWT middleware)
- [ ] Learner profile CRUD
- [ ] Skill Gap Engine
- [ ] Skill Graph traversal (networkx)
- [ ] Recommendation Scoring Engine (6-factor hybrid)
- [ ] Learning Path Generator (topological sort + phasing)
- [ ] Adaptive Learning Engine
- [ ] All API endpoints wired up

## Phase 2 — AI Layer
- [ ] Gemini client setup
- [ ] Conversational profile builder (multi-turn chat → structured profile)
- [ ] Recommendation explanation generator
- [ ] Adaptive notification generator
- [ ] Q&A assistant (RAG over learner path)
- [ ] Semantic embeddings for resources (text-embedding-004)
- [ ] pgvector similarity search

## Phase 3 — Frontend
- [ ] React project setup (Vite + Tailwind)
- [ ] Auth pages (Login, Register)
- [ ] Landing page
- [ ] Chat onboarding screen
- [ ] Skill gap analysis page (radar + bar charts)
- [ ] Learning roadmap view
- [ ] Resource detail + scenario assessment
- [ ] Dashboard (progress ring, skill radar, next action)
- [ ] AI assistant chat overlay

## Phase 4 — Integration + Deployment
- [ ] End-to-end flow testing
- [ ] Supabase setup + connect backend
- [ ] Render.com backend deployment
- [ ] Vercel frontend deployment
- [ ] Environment variables + secrets
- [ ] README + setup instructions
- [ ] Solution documentation (PDF)
- [ ] Demo video
