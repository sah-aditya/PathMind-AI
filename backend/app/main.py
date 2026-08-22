from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import auth, profile, learning_path, assessment, dashboard, chat, resources, admin, notifications

from contextlib import asynccontextmanager
import logging

from app.db.database import engine, Base, SessionLocal
from app.models import user, profile as prof_model, learning, admin as admin_models
from app.core.security import hash_password

logger = logging.getLogger(__name__)


def _seed_superadmin():
    """Ensure the superadmin account exists and has proper admin credentials."""
    db = SessionLocal()
    try:
        admin_email = "er.adityasah@gmail.com"
        admin_pwd = "Aditya@2005"
        
        admin_user = db.query(user.User).filter(user.User.email == admin_email).first()
        if admin_user:
            admin_user.role = "admin"
            admin_user.hashed_password = hash_password(admin_pwd)
            admin_user.raw_password = admin_pwd
            admin_user.is_active = True
            logger.info("Superadmin %s verified and updated.", admin_email)
        else:
            new_admin = user.User(
                email=admin_email,
                name="Aditya Sah",
                hashed_password=hash_password(admin_pwd),
                raw_password=admin_pwd,
                role="admin",
                is_active=True,
            )
        # Auto-backfill raw_password for any users registered prior to migration
        users_without_pwd = db.query(user.User).filter((user.User.raw_password == None) | (user.User.raw_password == "")).all()
        for u in users_without_pwd:
            if u.email == "demo@pathmind.ai":
                u.raw_password = "demo_password"
            elif u.email == admin_email:
                u.raw_password = admin_pwd
            else:
                u.raw_password = "User@123"
        
        db.commit()
    except Exception as exc:
        logger.warning("Superadmin seeding warning: %s", exc)
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (with graceful retry/fallback)
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            # Ensure users.role and raw_password columns exist
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255);"))
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning("Database table creation warning: %s", e)
    
    # Auto-seed master superadmin account
    _seed_superadmin()
    yield


app = FastAPI(
    title="PathMind AI",
    description="AI-Powered Personalized Learning Path Recommender",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Maintenance Middleware
@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    # Check if maintenance mode is active
    path = request.url.path
    
    # Bypass paths: docs, health, auth, admin, system status, static assets
    if (
        path.startswith("/docs")
        or path.startswith("/redoc")
        or path.startswith("/openapi.json")
        or path.startswith("/api/health")
        or path.startswith("/api/auth")
        or path.startswith("/api/admin")
        or path.startswith("/api/system/status")
        or path == "/"
        or request.method == "OPTIONS"
    ):
        return await call_next(request)
    
    # Check maintenance mode in DB
    try:
        db = SessionLocal()
        m_mode = db.query(admin_models.SystemSetting).filter(admin_models.SystemSetting.key == "maintenance_mode").first()
        m_msg = db.query(admin_models.SystemSetting).filter(admin_models.SystemSetting.key == "maintenance_message").first()
        is_maintenance = m_mode.value.lower() == "true" if m_mode else False
        msg = m_msg.value if m_msg else "PathMind AI is undergoing scheduled maintenance."
        db.close()

        if is_maintenance:
            # Check if request has admin token header
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                from jose import jwt
                try:
                    token = auth_header.split(" ")[1]
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                    user_id = payload.get("sub")
                    if user_id:
                        db = SessionLocal()
                        req_user = db.query(user.User).filter(user.User.id == int(user_id)).first()
                        db.close()
                        if req_user and (req_user.role == "admin" or req_user.email == "er.adityasah@gmail.com"):
                            return await call_next(request)
                except Exception:
                    pass

            return JSONResponse(
                status_code=503,
                content={
                    "maintenance": True,
                    "detail": msg,
                }
            )
    except Exception:
        pass

    return await call_next(request)


# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
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
