# Software Requirements Specification (SRS)
## PS-8: Autonomous Travel-Disruption Concierge

### 1. Executive Summary
An agentic travel disruption management system designed to monitor itineraries, detect disruptions (flight delays, cancellations, missed connections), analyze cascading downstream impacts, evaluate valid alternatives according to traveler and corporate policies, execute rebooking autonomously or through escalation, modify associated hotel reservations, and notify the traveler with explainable rationales and audit trails.

### 2. Core Functional Requirements
- **FR-01 User Management**: Traveler profile, preferences, and autonomous action thresholds.
- **FR-02 Itinerary Management**: Multi-leg flight segments, hotel bookings, and real-time status.
- **FR-03 Flight Monitoring**: Live flight status updates and polling/events.
- **FR-04 Disruption Detection**: Real-time detection of cancellations, major delays, and missed-connection risks.
- **FR-05 Disruption Classification**: Classification into NONE, DELAY, CANCELLATION, MISSED_CONNECTION, CONNECTION_RISK, AIRPORT_CHANGE.
- **FR-06 Alternative Flight Search**: Multi-criteria search for viable alternate flights.
- **FR-07 Alternative Ranking**: Deterministic scoring based on arrival time, connection reliability, policy, cost, and preferences.
- **FR-08 Policy Evaluation**: Deterministic checking against corporate spending, connection margins, and cabin limits.
- **FR-09 Autonomous Rebooking**: Automated booking execution when within policy limits.
- **FR-10 Human Approval**: Escalation trigger when exceeding policy or high uncertainty.
- **FR-11 Hotel Management**: Automatic arrival date recalculation and check-in adjustment.
- **FR-12 Notification**: Formatted real-time alerts to the traveler.
- **FR-13 Audit Trail**: Structured event and decision logging.

### 3. Core Demonstration Scenario
**Route:** Mumbai (BOM) → Delhi (DEL) → London (LHR) + London Hotel.
**Event:** AI101 (BOM → DEL) Cancelled.
**Action:** Detect cancellation ➔ Identify London connection broken ➔ Search 4 alternatives ➔ Filter 2 policy violations ➔ AI evaluates best choice ➔ Validation verifies policy ➔ Rebooking confirmed ➔ London hotel modified ➔ Traveler alerted ➔ Audit logged.
