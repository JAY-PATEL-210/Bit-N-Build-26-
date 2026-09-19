# Owner: Member C — Test fixtures and shared setup
import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import Base
from app.core.seed import seed_demo_data


@pytest.fixture
def db_session():
    """Create an in-memory SQLite DB for each test."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

    # Import models so they register with Base
    import app.models.itinerary  # noqa: F401

    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def seeded_db(db_session):
    """DB session pre-populated with demo data."""
    seed_demo_data(db_session)
    return db_session
