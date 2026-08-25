from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    GEMINI_API_KEY: str
    BACKEND_CORS_ORIGINS: str = '["*"]'
    RENDER_API_KEY: str = ""
    RENDER_SERVICE_ID: str = ""
    VERCEL_API_TOKEN: str = ""
    VERCEL_PROJECT_ID: str = ""

    @property
    def cors_origins(self) -> List[str]:
        if not self.BACKEND_CORS_ORIGINS:
            return ["*"]
        try:
            val = json.loads(self.BACKEND_CORS_ORIGINS)
            return val if isinstance(val, list) else [val]
        except Exception:
            return [orig.strip() for orig in self.BACKEND_CORS_ORIGINS.split(",") if orig.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
