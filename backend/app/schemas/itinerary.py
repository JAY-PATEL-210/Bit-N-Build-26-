# Owner: Member C
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HotelResponse(BaseModel):
    id: str
    itinerary_id: str
    hotel_name: str
    location: str
    check_in: datetime
    check_out: datetime
    booking_reference: Optional[str] = None
    price: Optional[float] = None
    currency: str = "INR"
    status: str

    model_config = {"from_attributes": True}


class SegmentResponse(BaseModel):
    id: str
    segment_type: str
    sequence_order: int
    booking_reference: Optional[str] = None

    model_config = {"from_attributes": True}


class ItineraryCreate(BaseModel):
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime


# ── Request models for API endpoints ────────────────────────────────────

class FlightInput(BaseModel):
    """Flight segment input for itinerary creation."""
    airline: str
    flight_number: str = Field(alias="flightNumber")
    origin: str
    destination: str
    scheduled_departure: datetime = Field(alias="scheduledDeparture")
    scheduled_arrival: datetime = Field(alias="scheduledArrival")
    terminal: Optional[str] = None
    gate: Optional[str] = None
    booking_reference: Optional[str] = Field(None, alias="bookingReference")

    model_config = {"populate_by_name": True}


class HotelInput(BaseModel):
    """Hotel booking input for itinerary creation."""
    hotel_name: str = Field(alias="hotelName")
    location: str
    check_in: datetime = Field(alias="checkIn")
    check_out: datetime = Field(alias="checkOut")
    booking_reference: Optional[str] = Field(None, alias="bookingReference")
    price: Optional[float] = None
    currency: str = "INR"

    model_config = {"populate_by_name": True}


class ItineraryCreateRequest(BaseModel):
    """Full itinerary creation request with nested flights and hotels."""
    user_id: str = Field(alias="userId")
    trip_name: str = Field(alias="tripName")
    start_date: datetime = Field(alias="startDate")
    end_date: datetime = Field(alias="endDate")
    flights: List[FlightInput] = []
    hotels: List[HotelInput] = []

    model_config = {"populate_by_name": True}


class ItineraryUpdateRequest(BaseModel):
    """Itinerary update request — currently supports status changes."""
    status: Optional[str] = None
    trip_name: Optional[str] = Field(None, alias="tripName")

    model_config = {"populate_by_name": True}


class ItineraryResponse(BaseModel):
    id: str
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime
    status: str

    model_config = {"from_attributes": True}


class ItineraryDetailResponse(BaseModel):
    """Full itinerary with nested flights and hotels."""
    id: str
    user_id: str
    trip_name: str
    start_date: datetime
    end_date: datetime
    status: str
    flights: List[dict] = []
    hotels: List[dict] = []

    model_config = {"from_attributes": True}
