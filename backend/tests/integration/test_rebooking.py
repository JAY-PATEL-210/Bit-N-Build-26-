from app.services.rebooking.rebooking_service import RebookingService

def test_idempotent_rebooking():
    service = RebookingService()
    key = "TEST-IDEM-001"
    res1 = service.execute_rebooking("DIS-1", "ALT-1", key)
    res2 = service.execute_rebooking("DIS-1", "ALT-1", key)
    assert res1["status"] == "CONFIRMED"
    assert res2["status"] == "EXISTING_BOOKING_RETURNED"
