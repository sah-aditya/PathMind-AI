from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import auth, profile, learning_path, assessment, dashboard, chat, resources, admin, notifications, support, certificates

from contextlib import asynccontextmanager
import logging

from app.db.database import engine, Base, SessionLocal
from app.models import user, profile as prof_model, learning, admin as admin_models, support as support_models, certificate as certificate_models
from app.core.security import hash_password

from app.core.log_buffer import log_buffer
import time
import sys

logger = logging.getLogger("app")


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
            if getattr(admin_user, "can_change_name", None) is None:
                admin_user.can_change_name = True
            if getattr(admin_user, "can_change_password", None) is None:
                admin_user.can_change_password = True
            logger.info("Superadmin %s verified and updated.", admin_email)
        else:
            new_admin = user.User(
                email=admin_email,
                name="Aditya Sah",
                hashed_password=hash_password(admin_pwd),
                raw_password=admin_pwd,
                role="admin",
                is_active=True,
                can_change_name=True,
                can_change_password=True,
            )
            db.add(new_admin)

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
    # Auto-create tables & execute startup schema migrations
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            # Ensure users.role, raw_password, can_change_name, and can_change_password columns exist in PostgreSQL
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS can_change_name BOOLEAN DEFAULT TRUE;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS can_change_password BOOLEAN DEFAULT TRUE;"))
            
            # Ensure path_items.resource_id supports longer resource IDs up to VARCHAR(100)
            conn.execute(text("ALTER TABLE path_items ALTER COLUMN resource_id TYPE VARCHAR(100);"))

            # Ensure certificates table exists in PostgreSQL
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS certificates (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    path_id INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
                    code VARCHAR(20) UNIQUE,
                    recipient_name VARCHAR(255) NOT NULL,
                    path_title VARCHAR(255) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending',
                    rejection_reason TEXT,
                    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    approved_at TIMESTAMPTZ,
                    completion_stats JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_certificates_code ON certificates(code);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_certificates_user_id ON certificates(user_id);"))
        
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables and columns initialized successfully.")
    except Exception as e:
        logger.warning("Database table creation warning: %s", e)
    
    # Auto-seed master superadmin account
    try:
        _seed_superadmin()
    except Exception as e:
        logger.warning("Superadmin seeding warning: %s", e)

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
        or path.startswith("/api/system/service-flags")
        or path.startswith("/api/certificates/verify")
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


@app.middleware("http")
async def live_log_http_middleware(request: Request, call_next):
    path = request.url.path
    # Avoid logging log polling itself to prevent recursion
    if path.startswith("/api/admin/logs/live") or path == "/api/health" or path == "/":
        return await call_next(request)
    
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 1)

    log_level = "INFO"
    if response.status_code >= 500:
        log_level = "ERROR"
    elif response.status_code >= 400:
        log_level = "WARN"

    log_msg = f"{request.method} {path} -> {response.status_code} ({duration_ms}ms)"
    log_buffer.add_custom_log(
        level=log_level,
        category="HTTP",
        module="fastapi.access",
        message=log_msg,
    )
    return response


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
app.include_router(support.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "app": "PathMind AI", "version": "1.0.0"}


@app.get("/api/health")
def api_health():
    return {"status": "ok"}


@app.get("/api/system/service-flags")
def get_system_service_flags():
    from app.models.admin import SystemSetting
    from app.api.routes.admin import DEFAULT_SERVICE_FLAGS
    import json
    db = SessionLocal()
    try:
        setting = db.query(SystemSetting).filter(SystemSetting.key == "service_flags").first()
        if not setting or not setting.value:
            return DEFAULT_SERVICE_FLAGS
        try:
            stored = json.loads(setting.value)
            return {**DEFAULT_SERVICE_FLAGS, **stored}
        except Exception:
            return DEFAULT_SERVICE_FLAGS
    finally:
        db.close()
