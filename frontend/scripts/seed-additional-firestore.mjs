import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBiVJD488-syt7E2l0KkYBSmGEsR1Xl7XU",
  authDomain: "pankti-56227.firebaseapp.com",
  projectId: "pankti-56227",
  storageBucket: "pankti-56227.firebasestorage.app",
  messagingSenderId: "785216937663",
  appId: "1:785216937663:web:ff426660538f5759e7b00a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notifications = [
  {
    id: 'NOTIF-001',
    title: 'Flight Cancelled & Autonomous Rebooking Initiated',
    message: 'Your Mumbai (BOM) → Delhi (DEL) flight AI101 was cancelled. Autonomous concierge is actively resolving your connection.',
    timestamp: '2026-09-19T08:00:15Z',
    read: false,
    type: 'CRITICAL_DISRUPTION',
    reason: 'Technical maintenance on Boeing 787 aircraft at BOM terminal.',
    whatHappened: 'Flight AI101 (Mumbai BOM → Delhi DEL) status changed to CANCELLED.',
    whatSystemDid: 'Analyzed downstream itinerary, detected missed London connection (AI203), and searched 4 eligible replacement routes.',
    currentStatus: 'Selected optimal alternative AI203 within ₹20,000 corporate budget.',
    whatUserMustDo: 'No manual action needed. Autonomous rebooking is executing.',
    itineraryId: 'TRIP-A',
    disruptionId: 'DISRUPT-001',
    comments: [
      'Traveler support inquiry: Will our checked luggage be automatically transferred to the replacement aircraft? — Concierge: Yes, baggage tags are automatically mapped.',
    ],
  },
  {
    id: 'NOTIF-002',
    title: 'Rebooking Confirmed & Hotel Check-in Adjusted',
    message: 'Rebooking complete on Flight AI203. Hotel check-in at Hilton Delhi adjusted.',
    timestamp: '2026-09-19T08:05:30Z',
    read: false,
    type: 'REBOOKING_SUCCESS',
    whatHappened: 'Original connection was rescheduled to Air India AI203 departing 20:30.',
    whatSystemDid: 'Executed booking API with idempotency key and updated hotel arrival time.',
    currentStatus: 'Confirmed. E-ticket issued and hotel informed.',
    whatUserMustDo: 'Check new boarding gate upon arrival at Terminal 3.',
    newFlightDetails: 'Air India AI203 • Dep: 20:30 DEL → Arr: 05:45 +1d LHR',
    hotelChanges: 'Hilton Delhi: Check-in adjusted with no penalty',
    additionalCost: '₹8,500 (Covered under corporate disruption policy)',
    confirmationNumber: 'PNR-AI-994812',
    itineraryId: 'TRIP-A',
    disruptionId: 'DISRUPT-001',
    comments: [],
  },
  {
    id: 'NOTIF-003',
    title: 'Travel Policy Threshold Alert',
    message: 'Alternative flight EK501 exceeds the ₹20,000 corporate limit. Requires manager or traveler approval.',
    timestamp: '2026-09-19T08:03:00Z',
    read: true,
    type: 'POLICY_EXCEPTION',
    whatHappened: 'Emirates EK501 offers alternative route via Dubai but costs +₹24,500.',
    whatSystemDid: 'Blocked autonomous execution due to hard budget constraint (Max additional fare ₹20,000).',
    currentStatus: 'Awaiting human authorization.',
    whatUserMustDo: 'Approve fare exception or choose primary recommended alternative AI203.',
    itineraryId: 'TRIP-B',
    disruptionId: 'DISRUPT-002',
    comments: [],
  },
];

const disruptions = [
  {
    id: 'DISRUPT-001',
    itineraryId: 'TRIP-A',
    segmentId: 'SEG-TRIP-A-1',
    type: 'CANCELLATION',
    severity: 'CRITICAL',
    description: 'Flight AI101 (AMD → DEL) has been CANCELLED due to technical issues.',
    detectedAt: '2026-09-19T08:00:00Z',
    impact: 'Feeder flight cancelled. Downstream meetings require schedule adjustment.',
    status: 'DECISION_READY',
    affectedFlightNumber: 'AI101',
    affectedSegments: ['SEG-TRIP-A-1'],
    affectedHotelId: 'HTL-TRIP-A',
    recommendedAlternativeId: 'ALT-102',
    requiresApproval: false,
  },
  {
    id: 'DISRUPT-002',
    itineraryId: 'TRIP-B',
    segmentId: 'SEG-TRIP-B-1',
    type: 'DELAY',
    severity: 'HIGH',
    description: 'Flight 6E202 (BOM → BLR) delayed by 180 minutes.',
    detectedAt: '2026-09-19T08:00:00Z',
    impact: 'Connection buffer reduced to 15 minutes (< 90 min minimum requirement).',
    status: 'SEARCHING_ALTERNATIVES',
    affectedFlightNumber: '6E202',
    affectedSegments: ['SEG-TRIP-B-1'],
    affectedHotelId: 'HTL-TRIP-B',
    recommendedAlternativeId: 'ALT-102',
    requiresApproval: false,
  },
];

const alternatives = [
  {
    id: 'ALT-102',
    disruptionId: 'DISRUPT-001',
    airline: 'Air India',
    flightNumber: 'AI203',
    origin: 'DEL',
    destination: 'LHR',
    departureTime: '20:30',
    arrivalTime: '05:45',
    duration: '9h 45m',
    stops: 0,
    price: 8500,
    currency: 'INR',
    policyCompliant: true,
    policyViolations: [],
    recommended: true,
    explanation: 'Selected AI203 because it provides the earliest policy-compliant arrival while remaining within the ₹20,000 corporate limit.',
    carbonFootprint: '240 kg CO2',
    score: 95,
  },
  {
    id: 'ALT-103',
    disruptionId: 'DISRUPT-001',
    airline: 'Vistara',
    flightNumber: 'UK994',
    origin: 'DEL',
    destination: 'LHR',
    departureTime: '22:15',
    arrivalTime: '07:30',
    duration: '10h 45m',
    stops: 1,
    price: 12500,
    currency: 'INR',
    policyCompliant: true,
    policyViolations: [],
    recommended: false,
    explanation: 'Valid backup alternative but requires a 1-stop connection.',
    carbonFootprint: '290 kg CO2',
    score: 82,
  },
];

const auditLogs = [
  {
    id: 'AUD-001',
    event: 'DISRUPTION_DETECTED',
    actor: 'SYSTEM',
    itineraryId: 'TRIP-A',
    action: 'FLIGHT_STATUS_UPDATE',
    decision: 'CLASSIFY_DISRUPTION',
    reason: 'Flight AI101 received CANCELLED broadcast from airline provider API.',
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:00:00Z',
    metadata: {
      flightNumber: 'AI101',
      route: 'AMD -> DEL',
    },
  },
  {
    id: 'AUD-002',
    event: 'AI_REASONING_EVALUATION',
    actor: 'AI_AGENT',
    itineraryId: 'TRIP-A',
    decisionId: 'DEC-009',
    action: 'EVALUATE_ALTERNATIVES',
    decision: 'REBOOK_ALTERNATIVE',
    reason: 'Selected AI203 because it provides the earliest policy-compliant arrival within the ₹20,000 autonomous rebooking limit.',
    reasonCodes: ['WITHIN_FARE_LIMIT', 'EARLIEST_ELIGIBLE_ARRIVAL', 'VALID_CONNECTION'],
    confidence: 0.95,
    result: 'SUCCESS',
    timestamp: '2026-09-19T08:02:45Z',
  },
];

async function seedAdditional() {
  console.log('Seeding notifications...');
  for (const n of notifications) {
    await setDoc(doc(db, 'notifications', n.id), n);
  }
  console.log('Seeding disruptions...');
  for (const d of disruptions) {
    await setDoc(doc(db, 'disruptions', d.id), d);
  }
  console.log('Seeding alternatives...');
  for (const a of alternatives) {
    await setDoc(doc(db, 'alternative_flights', a.id), a);
  }
  console.log('Seeding audit logs...');
  for (const l of auditLogs) {
    await setDoc(doc(db, 'audit_logs', l.id), l);
  }
  console.log('Additional collections seeded successfully!');
  process.exit(0);
}

seedAdditional().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

