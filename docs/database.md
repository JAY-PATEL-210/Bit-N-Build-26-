# Database Schema & Models

## Core Tables
1. `users`: Traveler identity and credentials.
2. `travel_preferences`: Autonomous rebooking limits, preferred cabin, connection buffers.
3. `itineraries`: Master trip container.
4. `travel_segments`: Individual travel legs (flights, trains).
5. `flights`: Detailed flight schedules and live statuses.
6. `hotel_bookings`: Hotel reservations attached to the itinerary.
7. `disruptions`: Detected cancellations, delays, and downstream consequences.
8. `alternatives`: Discovered alternative flights and compliance ratings.
9. `rebookings`: Rebooking transaction history protected by unique idempotency keys.
10. `audit_logs`: Immutable ledger of every system event and action.
11. `agent_decisions`: Structured decision logs with AI confidence and reason codes.
