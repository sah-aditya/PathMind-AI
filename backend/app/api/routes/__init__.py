from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.learning_path import router as learning_path_router
from app.api.routes.assessment import router as assessment_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.chat import router as chat_router
from app.api.routes.resources import router as resources_router

__all__ = [
    "auth_router", "profile_router", "learning_path_router",
    "assessment_router", "dashboard_router", "chat_router", "resources_router",
]
