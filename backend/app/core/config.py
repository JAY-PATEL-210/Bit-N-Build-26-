# Owner: Member C (Backend Lead / Core Services)
from pydantic_settings import BaseSettings
from typing import Optional


# Apply global fix for duffel_api bug where missing allowed_passenger_identity_document_types causes KeyError
try:
    from duffel_api.models.offer import Offer
    _orig_offer_from_json = Offer.from_json

    @classmethod
    def _safe_offer_from_json(cls, json_data: dict):
        if isinstance(json_data, dict) and "allowed_passenger_identity_document_types" not in json_data:
            json_data = dict(json_data)
            json_data["allowed_passenger_identity_document_types"] = []
        return _orig_offer_from_json(json_data)

    Offer.from_json = _safe_offer_from_json
except Exception:
    pass


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
    DUFFEL_API_KEY: Optional[str] = None

    model_config = {
        "case_sensitive": True,
        "env_file": [".env", "../.env"],
        "extra": "ignore",
    }

    def model_post_init(self, __context) -> None:
        super().model_post_init(__context)
        duffel_token = self.DUFFEL_API_KEY or (
            self.FLIGHT_API_KEY if self.FLIGHT_API_KEY and self.FLIGHT_API_KEY.startswith("duffel_") else None
        ) or (
            self.BOOKING_API_KEY if self.BOOKING_API_KEY and self.BOOKING_API_KEY.startswith("duffel_") else None
        )
        if duffel_token:
            if not self.DUFFEL_API_KEY:
                self.DUFFEL_API_KEY = duffel_token
            if not self.FLIGHT_API_KEY:
                self.FLIGHT_API_KEY = duffel_token
            if not self.BOOKING_API_KEY:
                self.BOOKING_API_KEY = duffel_token


settings = Settings()

