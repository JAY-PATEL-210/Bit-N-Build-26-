from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Travel-Disruption Concierge"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/travel_concierge"
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
