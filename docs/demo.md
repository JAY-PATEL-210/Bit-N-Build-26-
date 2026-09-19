# Hackathon Demo Guide

## Recommended Presentation Flow
1. **Initial Itinerary**: Show traveler trip Mumbai (BOM) -> Delhi (DEL) -> London (LHR) + London Hotel.
2. **Trigger Disruption**: Click `[ Simulate Cancellation ]` on the Judge Demo Control Panel.
3. **Observation**:
   - Status changes to `ANALYZING`.
   - Downstream connection to London and hotel arrival detected as affected.
   - Alternatives evaluated against corporate travel policy (max ₹20,000 additional fare).
   - AI decision selects policy-compliant option with transparent rationale.
   - System rebooks with idempotency key and updates London hotel check-in.
   - Traveler notified and audit entry recorded.
