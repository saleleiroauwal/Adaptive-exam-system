import os
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "adaptive_exam.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Adaptive Examination System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-adaptive-exam-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default, anchored to project root, easily switchable to PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
