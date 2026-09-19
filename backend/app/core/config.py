# Owner: Member C (Backend Lead / Core Services)
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Travel-Disruption Concierge"
    API_V1_STR: str = "/api"

    # Database -- SQLite by default for hackathon, override with DATABASE_URL for PostgreSQL
    DATABASE_URL: str = "sqlite:///./concierge.db"

    # CORS
    CORS_ORIGINS: str = "*"

    # AI / LLM (Member D configures these)
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o"

    # Demo mode -- auto-seed sample data on startup
    DEMO_MODE: bool = True

    # External Provider APIs
    FLIGHT_API_KEY: Optional[str] = None
    HOTEL_API_KEY: Optional[str] = None
    BOOKING_API_KEY: Optional[str] = None

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()
