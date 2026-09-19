# System Architecture & Flow

```
┌──────────────────┐
│     TRAVELER     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│     FRONTEND     │  (Next.js, React, TypeScript, Tailwind CSS)
│   Member A + B   │
└────────┬─────────┘
         │ REST / WebSocket
         ↓
┌────────────────────────┐
│      BACKEND API       │  (Python, FastAPI)
│        Member C        │
└───────────┬────────────┘
            │
  ┌─────────┼──────────────┐
  ↓         ↓              ↓
┌─────────┐ ┌────────────┐ ┌─────────────┐
│Itinerary│ │ Disruption │ │   Policy    │
│ Service │ │   Engine   │ │   Engine    │
└─────────┘ └─────┬──────┘ └─────┬───────┘
                  │              │
                  └──────┬───────┘
                         ↓
            ┌────────────────────────┐
            │    AI ORCHESTRATOR     │  (Member D)
            │  Context / Evaluations │
            └────────────┬───────────┘
                         │ Structured JSON Decision
                         ↓
            ┌────────────────────────┐
            │   DETERMINISTIC RULES  │  (Member C Validation)
            │       VALIDATION       │
            └────────────┬───────────┘
                         │
                         ↓
            ┌────────────────────────┐
            │     ACTION ENGINE      │  (Execution Service)
            └────────────┬───────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   Flight Provider   Hotel Provider   Notification
   (Mock / Real)     (Mock / Real)     Service
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                  ┌─────────────┐
                  │ PostgreSQL  │  (Itineraries, Disruptions, Audit Trail)
                  └─────────────┘
```

### 5-Layer Engineering Principles
1. **Perception**: Detect flight schedule changes and cancellations.
2. **Reasoning**: Graph-based cascade analysis on downstream segments and alternative search.
3. **Policy**: Strict, deterministic business and travel policy constraint enforcement.
4. **Action**: Rebooking and hotel adjustment API execution with idempotency.
5. **Verification**: Outcome validation, traveler notification dispatch, and audit logging.
