from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, profile, learning_path, assessment, dashboard, chat, resources

app = FastAPI(
    title="PathMind AI",
    description="AI-Powered Personalized Learning Path Recommender",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(learning_path.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(resources.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "app": "PathMind AI", "version": "1.0.0"}


@app.get("/api/health")
def api_health():
    return {"status": "ok"}
