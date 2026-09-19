# TravelSync (Autonomous Travel-Disruption Concierge)

**TravelSync** is a proactive, intelligent travel operations agent that autonomously detects travel disruptions and coordinates the necessary actions on behalf of the traveler. Built as a prototype for the Bit N Build hackathon, it shifts the burden of managing cancellations and missed connections from the traveler to an intelligent agentic system.

Instead of simply displaying "Your flight has been cancelled," TravelSync understands the cascading impact across the itinerary, finds valid alternatives, evaluates them against travel policies, executes rebooking, adjusts hotel reservations, and informs the traveler with a complete audit trail.

---

## 🚀 Key Features

*   **Live Travel Monitoring:** Continuously tracks flight status across active itineraries.
*   **Intelligent Disruption Detection:** Identifies cascading downstream consequences (e.g., a delayed flight making a connecting flight infeasible).
*   **Autonomous Decision Engine:**
    *   **Safe to Automate:** Autonomously rebooks flights when options exist within policy limits.
    *   **Requires Approval:** Escalates to human approval for fare increases, major itinerary changes, or out-of-policy alternatives.
*   **Explainable AI Decisions:** AI agent recommendations are strictly structured, deterministic, and validated by backend business rules. Every decision includes a clear human-readable explanation.
*   **Hotel Synchronization:** Automatically adjusts hotel check-in/out dates or cancels reservations based on new flight arrival times.
*   **Comprehensive Audit Logging:** Every autonomous action, API request, and state change is securely logged for tracing and accountability.

---

## 🛠️ System Architecture

The application is built on a 5-layer autonomous engineering principle:
1. **Perception**: Detect disruptions.
2. **Reasoning**: Understand impact & find alternatives.
3. **Policy**: Determine what is allowed (Budget, Stops, Time).
4. **Action**: Execute flight bookings and hotel changes.
5. **Verification**: Confirm changes, notify users, and record audits.

### Technology Stack

**Frontend**
*   **Framework:** Next.js / React (TypeScript)
*   **Styling:** Tailwind CSS
*   **Icons & Animation:** Lucide React, Framer Motion
*   **State & Real-time:** Standard React Hooks, polling/WebSockets for live status updates

**Backend**
*   **Framework:** FastAPI (Python)
*   **Database:** SQLite / SQLAlchemy (ORM)
*   **Validation:** Pydantic
*   **Integrations Layer:** Duffel API (Flights), Amadeus API (Hotels), Mock APIs for Simulation

**AI & Orchestration Layer**
*   **Design:** A multi-agent orchestration pattern (Context Agent, Flight Agent, Policy Agent, Decision Agent).
*   **Guardrails:** AI never directly executes transactions. AI proposes structured decisions `->` Backend Rules Validate `->` Adapters Execute.

---

## 📂 Project Structure

```text
autonomous-travel-concierge/
│
├── frontend/
│   ├── app/                # Next.js App Router (Dashboard, Trips, Disruptions, Login, etc.)
│   ├── components/         # Reusable UI (Navbar, Alternative Cards, Timelines, Modals)
│   ├── hooks/              # Custom React hooks (useDisruption, useRebooking, etc.)
│   ├── services/           # Frontend API Clients
│   └── types/              # Canonical TypeScript interfaces matching backend models
│
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI Route Endpoints
│   │   ├── models/         # SQLAlchemy Database Models (Single source of truth)
│   │   ├── schemas/        # Pydantic Schemas for Data Validation
│   │   ├── services/       # Core Business Logic (Monitoring, Policies, Hotels, Audit)
│   │   ├── agents/         # AI Orchestration & Decision Agents
│   │   └── integrations/   # External API Adapters (Duffel, Amadeus)
│   ├── main.py             # FastAPI Entry Point
│   └── requirements.txt    # Python dependencies
│
└── docs/                   # System Requirement Specifications (SRS) & API Contracts
```

---

## 🚦 Getting Started

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Run the FastAPI development server:
```bash
python main.py
```
*(The backend will run on `http://localhost:8000`. On startup, it automatically creates the local SQLite database `concierge.db` and provisions demo data if `DEMO_MODE` is active).*

### 2. Frontend Setup (Next.js)
Navigate to the frontend directory and install the Node modules:
```bash
cd frontend
npm install
```
Start the Next.js development server:
```bash
npm run dev
```
*(The frontend will run on `http://localhost:3000`).*

---

## 🔒 Security & Constraints
*   **Rule Engine Precedence:** AI **cannot** override the deterministic policy engine.
*   **API Agnosticism:** The system interacts with airline and hotel APIs via an adapter interface (e.g. `FlightProviderInterface`), allowing mock and real implementations to be swapped without changing core business logic. 
*   **Idempotency:** Rebooking workflows rely on strict idempotency keys to prevent duplicate transactions.

---

## 👥 Roles
*   **Traveler:** Can view itineraries, approve/reject escalated actions, configure travel policies, and monitor live disruption status.
*   **Airline / Company Ops:** Dedicated dashboard to view system-wide disruptions, agent performance, and manual overrides.