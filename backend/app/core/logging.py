# Owner: Member C (Backend Lead / Core Services)
import logging
import sys

# ── Formatter ───────────────────────────────────────────────────────────────
_FMT = "[%(asctime)s] %(levelname)-8s %(name)s  %(message)s"
_DATE_FMT = "%Y-%m-%d %H:%M:%S"

_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(logging.Formatter(_FMT, datefmt=_DATE_FMT))

# ── Root Logger ─────────────────────────────────────────────────────────────
logger = logging.getLogger("concierge")
logger.addHandler(_handler)
logger.setLevel(logging.INFO)

# Silence noisy libraries
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
