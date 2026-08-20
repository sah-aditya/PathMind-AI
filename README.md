# PathMind AI 🧠
### AI-Powered Personalized Learning Path Recommender

> Your goal. Your pace. Your path.

PathMind AI uses **Gemini AI** + a custom **6-factor recommendation engine** to generate adaptive, personalized learning roadmaps based on your skills, goals, and learning style — then continuously adapts as you progress.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Onboarding** | Conversational profile builder via Gemini AI |
| 🎯 **Skill Gap Analysis** | Radar chart visualization of current vs required skills |
| 🗺️ **Smart Roadmap** | Week-by-week path with topological prerequisite ordering |
| 🔄 **Adaptive Learning** | Path mutates in real-time based on assessment scores |
| 📊 **Dashboard** | Progress ring, skill radar, next action card |
| 💬 **AI Assistant** | Context-aware Q&A chat overlay |

---

## 🏗️ Architecture

```
frontend (React + Vite + Tailwind)
    ↕ REST API (FastAPI)
backend (Python + FastAPI)
    ├── Gemini AI service         ← Conversational intelligence
    ├── Skill Gap Engine          ← Gap analysis + prioritization
    ├── Recommendation Engine     ← 6-factor hybrid scoring
    ├── Path Generator            ← NetworkX topological sort
    └── Adaptive Engine           ← Real-time path mutation
    ↕ PostgreSQL (Supabase)
```

---

## 🚀 Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your values
python seed.py               # Create tables + demo user
uvicorn app.main:app --reload
```

**Required `.env` values:**
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `GEMINI_API_KEY` — Free at [ai.google.dev](https://ai.google.dev)
- `SECRET_KEY` — Any random 32-char string

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

**Demo credentials:** `demo@pathmind.ai` / `Demo@1234`

---

## ☁️ Deployment (Free Tier)

| Service | What it hosts | Free tier |
|---|---|---|
| **Supabase** | PostgreSQL database | 500MB, unlimited API calls |
| **Render.com** | FastAPI backend | 750hrs/month |
| **Vercel** | React frontend | Unlimited static |

### Deploy Backend (Render.com)
1. Connect your GitHub repo to Render
2. Set `Root Directory` = `backend`
3. Set `Build Command` = `pip install -r requirements.txt && python seed.py`
4. Set `Start Command` = `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars from `.env.example`

### Deploy Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set `Root Directory` = `frontend`
3. Set `Build Command` = `npm run build`
4. Update `vercel.json` with your Render backend URL

---

## 🧠 Recommendation Algorithm

The 6-factor hybrid scoring assigns weights to:
1. **Goal Relevance (30%)** — Jaccard similarity to required skills
2. **Skill Gap Coverage (25%)** — Fraction of gaps this resource teaches
3. **Prerequisite Readiness (20%)** — Learner already has prerequisites
4. **Difficulty Fit (10%)** — Difficulty matches experience level
5. **Interest Alignment (10%)** — Tags match learner interests
6. **Style Preference (5%)** — Matches video/reading/project preference

Resources are then topologically sorted using **NetworkX** to ensure prerequisites always come before dependent content.

---

## 📁 Project Structure

```
Learning Path Gen/
├── backend/
│   ├── app/
│   │   ├── ai/                ← Gemini service
│   │   ├── api/routes/        ← FastAPI routes
│   │   ├── core/              ← Config + security
│   │   ├── db/                ← SQLAlchemy setup
│   │   ├── models/            ← DB models
│   │   ├── schemas/           ← Pydantic schemas
│   │   └── services/          ← Intelligence engines
│   ├── data/                  ← JSON datasets
│   └── seed.py
└── frontend/
    └── src/
        ├── components/        ← AppLayout, ChatOverlay
        ├── pages/             ← All 8 pages
        ├── services/          ← API layer
        └── store/             ← Zustand auth store
```

---

*Built with ❤️ using FastAPI, React, Gemini AI, and free-tier cloud services.*
