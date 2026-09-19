# Owner: Member C (Backend Lead / Core Services)
# ──────────────────────────────────────────────────────────────────────────────
# Application Entry Point  —  FastAPI server with auto-setup
# ──────────────────────────────────────────────────────────────────────────────
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.database import create_tables, SessionLocal
from app.core.config import settings
from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + seed demo data."""
    logger.info("=" * 60)
    logger.info("  %s", settings.PROJECT_NAME)
    logger.info("  Database: %s", settings.DATABASE_URL[:50])
    logger.info("=" * 60)

    # Create all tables
    create_tables()
    logger.info("DATABASE  Tables created / verified.")

    # Seed demo data if DEMO_MODE is enabled
    if settings.DEMO_MODE:
        from app.core.seed import seed_demo_data
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()

    yield  # App runs here

    logger.info("Shutting down …")


app = FastAPI(
    title="Autonomous Travel-Disruption Concierge API",
    description=(
        "Agentic travel disruption management system. "
        "Detects disruptions, analyzes cascading impacts, evaluates alternatives "
        "against policy, executes rebooking autonomously, modifies hotels, "
        "and maintains a complete audit trail."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/health",
        "api_v1": "/api",
        "frontend": "http://localhost:3000",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
