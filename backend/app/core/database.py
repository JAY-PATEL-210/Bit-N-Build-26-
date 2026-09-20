# Owner: Member C (Backend Lead / Core Services)
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# ── Engine ──────────────────────────────────────────────────────────────────
_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
    echo=False,
)

# Enable WAL mode + foreign keys for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

# ── Session ─────────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Declarative Base ────────────────────────────────────────────────────────
Base = declarative_base()


# ── Dependency ──────────────────────────────────────────────────────────────
def get_db():
    """FastAPI dependency that yields a DB session and auto-closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from sqlalchemy import text


# ── Table Creation ──────────────────────────────────────────────────────────
def create_tables():
    """Create all tables defined by models that extend Base."""
    # Import all model modules so they register with Base.metadata
    import app.models.itinerary  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Automatically ensure new columns exist in SQLite without manual migration
    if settings.DATABASE_URL.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                cursor = conn.execute(text("PRAGMA table_info(users)"))
                cols = [row[1] for row in cursor.fetchall()]
                if "role" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'TRAVELER'"))
                if "company_name" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN company_name VARCHAR"))
                if "airline_code" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN airline_code VARCHAR"))
                if "password_hash" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
                conn.commit()
        except Exception:
            pass

