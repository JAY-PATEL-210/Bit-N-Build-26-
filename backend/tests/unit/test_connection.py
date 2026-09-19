# Owner: Member C — Unit tests for connection margin calculations
from datetime import datetime
from app.utils.time import minutes_between


class TestConnectionMargins:
    """Verify minimum connection time validation."""

    def test_sufficient_connection(self):
        arrival = datetime(2025, 6, 10, 12, 30)
        departure = datetime(2025, 6, 10, 15, 0)
        gap = minutes_between(arrival, departure)
        assert gap == 150
        assert gap >= 90

    def test_tight_connection(self):
        arrival = datetime(2025, 6, 10, 14, 0)
        departure = datetime(2025, 6, 10, 15, 0)
        gap = minutes_between(arrival, departure)
        assert gap == 60
        assert gap < 90  # Below minimum

    def test_missed_connection(self):
        arrival = datetime(2025, 6, 10, 15, 30)
        departure = datetime(2025, 6, 10, 15, 0)
        gap = minutes_between(arrival, departure)
        assert gap == -30  # Negative = missed

    def test_exact_minimum(self):
        arrival = datetime(2025, 6, 10, 13, 30)
        departure = datetime(2025, 6, 10, 15, 0)
        gap = minutes_between(arrival, departure)
        assert gap == 90  # Exactly at minimum
