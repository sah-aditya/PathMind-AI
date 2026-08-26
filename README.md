# PathMind AI: AI-Powered Personalized Learning Path Recommender

PathMind AI is an adaptive educational platform and intelligent curriculum recommendation engine. It leverages Natural Language Processing, Directed Acyclic Graph (DAG) topological sorting, and a multi-factor recommendation model to generate personalized, pedagogical learning paths tailored to an individual's background, career goals, and pace.

---

## 1. Platform Highlights & Core Engines

| Component / Subsystem | Description | Theoretical & Architecture Foundation |
|---|---|---|
| **Natural Language Onboarding** | Conversational goal and background profile extraction | Google Gemini 1.5 Flash with Few-Shot Instruction Tuning |
| **Skill Gap Diagnostics** | Baseline proficiency vs. target competency benchmark matrix | Vector Space Model with Radar Chart Analytics |
| **Phased Adaptive Roadmap** | Step-by-step weekly milestone scheduler | Directed Acyclic Graph (DAG) Topological Sorting |
| **Interactive Prerequisite Skill Tree** | Dependency node graph with SVG Bezier curves | NetworkX Graph Engine with Interactive Inspection |
| **Bloom's Cognitive Progression** | Cognitive tiers from Remember (g1) to Create (g6) | Li et al., MDPI Electronics 2026 Survey |
| **KSA Career Readiness Matrix** | Knowledge (K), Skill (S), and Attitude (A) benchmark | Phong et al., STDJ 2024 Hybrid Recommender |
| **AI Recommendation Explainability** | Transparent "Why Recommended?" justification | Feature vector similarity and prerequisite verification |
| **Closed-Loop Adaptive Engine** | Real-time path adaptation and revision injection | Global Optimal Planning (GOLPR) + Local Iterative Learning (LILPR) |
| **Verifiable Digital Credentials** | Cryptographic certificate with live QR verification | SHA-256 Hash Verification Registry |
| **Executive Accessibility Studio** | Global command palette (Ctrl+K), TTS synthesizer, and pacing | Web Speech API and WCAG-compliant design tokens |

---

## 2. System Architecture

```
[ Frontend Client: React 18 + Vite + TailwindCSS ]
                     |
                     | HTTPS / REST API / JWT Authentication
                     v
[ Application Core: FastAPI + Python 3.11 ]
    |-- Conversational NLP Context Engine (Gemini 1.5 Flash)
    |-- Skill Gap Diagnostics Engine
    |-- Multi-Objective Hybrid Recommendation Scorer (TF-IDF + SVD)
    |-- Topological DAG Path Generator (NetworkX)
    |-- Dynamic Closed-Loop Adaptive Feedback Handler
    |-- Enterprise Telemetry and Audit Logging
                     |
                     | SQLAlchemy ORM Connection Pool
                     v
[ Persistence Layer: PostgreSQL on Supabase ]
    |-- Users and Role-Based Access Control (RBAC)
    |-- Learner Profiles and Competency Mastery Vectors
    |-- Learning Paths, Structured Phases, and Milestone Items
    |-- Assessment Records, Submission Logs, and Certificates
```

---

## 3. Local Installation & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL database (or Supabase instance)

### Backend Configuration
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Required Environment Variables (`.env`):**
- `DATABASE_URL`: PostgreSQL connection URI
- `GEMINI_API_KEY`: Google Gemini API key
- `SECRET_KEY`: Cryptographic signing key for JWT tokens

### Frontend Configuration
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.  
**Default Demo Credentials:** `demo@pathmind.ai` / `Demo@1234`

---

## 4. Cloud Deployment Architecture

| Tier | Service Provider | Deployment Configuration |
|---|---|---|
| **Database** | Supabase Cloud | Managed PostgreSQL 15 Instance |
| **Backend API** | Render.com | Python 3.11 Web Service with Uvicorn ASGI |
| **Frontend UI** | Vercel | Single-Page Application (SPA) with Global Edge CDN |

---

## 5. Algorithmic Formulation

Candidate learning units are scored across eight weighted pedagogical and statistical factors:
$$\text{Score}(r) = 0.22 \cdot R_{\text{goal}} + 0.25 \cdot C_{\text{gap}} + 0.20 \cdot P_{\text{readiness}} + 0.10 \cdot D_{\text{fit}} + 0.05 \cdot I_{\text{align}} + 0.03 \cdot T_{\text{style}} + 0.05 \cdot Q_{\text{rating}} + 0.12 \cdot S_{\text{tfidf}} + 0.03 \cdot S_{\text{collab}}$$

Selected units are organized into a Directed Acyclic Graph $G = (V, E)$ and topologically ordered using Kahn's algorithm, ensuring absolute prerequisite compliance and Bloom's cognitive taxonomy progression.

---

## 6. Directory Structure

```
Learning Path Gen/
|-- .gitignore
|-- .python-version
|-- README.md
|-- SOLUTION_DOCUMENTATION.md
|-- backend/
|   |-- alembic/
|   |-- app/
|   |   |-- ai/
|   |   |-- api/routes/
|   |   |-- core/
|   |   |-- db/
|   |   |-- models/
|   |   |-- schemas/
|   |   `-- services/
|   |-- data/
|   |-- requirements.txt
|   `-- seed.py
`-- frontend/
    |-- public/
    |-- src/
    |   |-- components/
    |   |-- pages/
    |   |-- services/
    |   `-- store/
    |-- package.json
    |-- tailwind.config.js
    `-- vite.config.js
```
