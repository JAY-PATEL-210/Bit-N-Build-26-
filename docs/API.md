# Backend API Contract & Standards

## Standard Response Structure
All responses must adhere to the standard envelope:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```
Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "Flight could not be found."
  }
}
```

## API Endpoints

### Itineraries
- `GET /api/itineraries` - Retrieve active traveler itineraries
- `GET /api/itineraries/{id}` - Retrieve detailed itinerary with flight & hotel segments
- `POST /api/itineraries` - Create new itinerary
- `PATCH /api/itineraries/{id}` - Update itinerary details

### Flights
- `GET /api/flights/{id}` - Get flight information
- `GET /api/flights/{id}/status` - Live flight status

### Disruptions
- `GET /api/disruptions` - List active disruptions
- `GET /api/disruptions/{id}` - Disruption details and impact assessment
- `POST /api/disruptions/simulate` - Simulate disruption event (e.g. cancellation)

### Alternatives
- `GET /api/disruptions/{id}/alternatives` - List discovered and ranked flight alternatives

### Rebooking
- `POST /api/rebooking/preview` - Preview rebooking options and fare comparison
- `POST /api/rebooking` - Initiate rebooking action
- `POST /api/rebooking/{id}/approve` - User approves alternative requiring confirmation
- `POST /api/rebooking/{id}/reject` - User rejects proposed rebooking
- `GET /api/rebooking/{id}` - Status of rebooking action

### Hotels
- `GET /api/itineraries/{id}/hotels` - Associated hotel booking details
- `POST /api/hotels/{id}/modify` - Modify check-in/check-out dates

### Notifications & Audit
- `GET /api/notifications` - Retrieve traveler notification alerts
- `PATCH /api/notifications/{id}/read` - Mark notification as read
- `GET /api/itineraries/{id}/audit` - Complete audit trail of system events and decisions

## Canonical Enums
- **Flight Status**: `SCHEDULED`, `DELAYED`, `BOARDING`, `DEPARTED`, `ARRIVED`, `CANCELLED`
- **Disruption Type**: `NONE`, `DELAY`, `CANCELLATION`, `MISSED_CONNECTION`, `CONNECTION_RISK`, `AIRPORT_CHANGE`
- **Disruption Severity**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Rebooking Status**: `PENDING`, `ANALYZING`, `APPROVAL_REQUIRED`, `APPROVED`, `REJECTED`, `PROCESSING`, `CONFIRMED`, `FAILED`, `CANCELLED`
- **Hotel Action**: `NO_ACTION`, `MODIFY_CHECKIN`, `MODIFY_CHECKOUT`, `CANCEL`, `REBOOK`, `APPROVAL_REQUIRED`
