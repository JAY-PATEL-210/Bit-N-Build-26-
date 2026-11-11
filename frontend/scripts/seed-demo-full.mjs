/**
 * Full Demo Seed Script — RoutePilot Hackathon Demo
 * Seeds rich data for BOTH Traveler and Airline Partner (COMPANY) views.
 * Run: node frontend/scripts/seed-demo-full.mjs
 */
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

// ─────────────────────────────────────────────
// USERS  (4 Travelers + 3 Airline Partners)
// ─────────────────────────────────────────────
const users = [
  // ── Travelers ──
  {
    id: "USR-TRV-A",
    name: "Aarav Shah",
    email: "traveler.ahmedabad@routepilot.com",
    username: "traveler.ahmedabad",
    role: "TRAVELER",
    phone: "+91-9825001001"
  },
  {
    id: "USR-TRV-B",
    name: "Meera Nair",
    email: "traveler.mumbai@routepilot.com",
    username: "traveler.mumbai",
    role: "TRAVELER",
    phone: "+91-9820002002"
  },
  {
    id: "USR-TRV-C",
    name: "Rohan Kapoor",
    email: "traveler.delhi@routepilot.com",
    username: "traveler.delhi",
    role: "TRAVELER",
    phone: "+91-9810003003"
  },
  {
    id: "USR-TRV-D",
    name: "Priya Menon",
    email: "traveler.bangalore@routepilot.com",
    username: "traveler.bangalore",
    role: "TRAVELER",
    phone: "+91-9880004004"
  },
  // ── Airline Partners (COMPANY) ──
  {
    id: "USR-AGENCY-A",
    name: "Vikram Sharma",
    email: "agency.alpha@routepilot.com",
    username: "agency.alpha",
    role: "COMPANY",
    companyName: "IndiGo Airlines",
    airlineCode: "6E"
  },
  {
    id: "USR-AGENCY-B",
    name: "Sonal Desai",
    email: "agency.beta@routepilot.com",
    username: "agency.beta",
    role: "COMPANY",
    companyName: "Air India",
    airlineCode: "AI"
  },
  {
    id: "USR-AGENCY-C",
    name: "Karan Mehta",
    email: "agency.gamma@routepilot.com",
    username: "agency.gamma",
    role: "COMPANY",
    companyName: "SpiceJet",
    airlineCode: "SG"
  }
];

// ─────────────────────────────────────────────
// TRAVEL PREFERENCES
// ─────────────────────────────────────────────
const preferences = [
  {
    id: "PREF-USR-TRV-A",
    userId: "USR-TRV-A",
    autonomousRebooking: true,
    autonomousHotelModification: true,
    preferredCabin: "BUSINESS",
    maxAdditionalFare: 25000,
    currency: "INR",
    minConnectionMinutes: 90
  },
  {
    id: "PREF-USR-TRV-B",
    userId: "USR-TRV-B",
    autonomousRebooking: true,
    autonomousHotelModification: true,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 15000,
    currency: "INR",
    minConnectionMinutes: 60
  },
  {
    id: "PREF-USR-TRV-C",
    userId: "USR-TRV-C",
    autonomousRebooking: false,
    autonomousHotelModification: true,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 20000,
    currency: "INR",
    minConnectionMinutes: 90
  },
  {
    id: "PREF-USR-TRV-D",
    userId: "USR-TRV-D",
    autonomousRebooking: true,
    autonomousHotelModification: false,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 10000,
    currency: "INR",
    minConnectionMinutes: 120
  }
];

// ─────────────────────────────────────────────
// ITINERARIES
// ─────────────────────────────────────────────
const itineraries = [
  {
    id: "TRIP-A",
    userId: "USR-TRV-A",
    tripName: "Ahmedabad → Delhi Business Trip",
    startDate: "2026-11-15T10:00:00Z",
    endDate: "2026-11-18T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-B",
    userId: "USR-TRV-B",
    tripName: "Mumbai → Bengaluru Tech Conference",
    startDate: "2026-11-15T07:00:00Z",
    endDate: "2026-11-17T20:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-C",
    userId: "USR-TRV-C",
    tripName: "Delhi → London Global Summit",
    startDate: "2026-11-16T22:00:00Z",
    endDate: "2026-11-22T18:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-D",
    userId: "USR-TRV-D",
    tripName: "Bengaluru → Mumbai Client Presentation",
    startDate: "2026-11-15T06:00:00Z",
    endDate: "2026-11-15T22:00:00Z",
    status: "ACTIVE"
  }
];

// ─────────────────────────────────────────────
// FLIGHTS (linked to itineraries + airline operators)
// ─────────────────────────────────────────────
const flights = [
  // TRIP-A: Aarav AMD → DEL (CANCELLED — triggers disruption scenario)
  {
    id: "FLT-TRIP-A-1",
    itineraryId: "TRIP-A",
    airline: "IndiGo",
    airlineCode: "6E",
    operatorId: "USR-AGENCY-A",
    flightNumber: "6E101",
    origin: "AMD",
    destination: "DEL",
    scheduledDeparture: "2026-11-15T10:00:00Z",
    scheduledArrival: "2026-11-15T12:30:00Z",
    status: "CANCELLED",
    terminal: "T1",
    gate: "G10",
    totalSeats: 180,
    bookedSeats: 165
  },
  // TRIP-B: Meera BOM → BLR (DELAYED — triggers disruption)
  {
    id: "FLT-TRIP-B-1",
    itineraryId: "TRIP-B",
    airline: "IndiGo",
    airlineCode: "6E",
    operatorId: "USR-AGENCY-A",
    flightNumber: "6E202",
    origin: "BOM",
    destination: "BLR",
    scheduledDeparture: "2026-11-15T07:00:00Z",
    scheduledArrival: "2026-11-15T09:00:00Z",
    estimatedDeparture: "2026-11-15T10:00:00Z",
    estimatedArrival: "2026-11-15T12:00:00Z",
    status: "DELAYED",
    terminal: "T2",
    gate: "G22",
    totalSeats: 180,
    bookedSeats: 142
  },
  // TRIP-C: Rohan DEL → LHR (SCHEDULED — no disruption)
  {
    id: "FLT-TRIP-C-1",
    itineraryId: "TRIP-C",
    airline: "Air India",
    airlineCode: "AI",
    operatorId: "USR-AGENCY-B",
    flightNumber: "AI302",
    origin: "DEL",
    destination: "LHR",
    scheduledDeparture: "2026-11-16T22:00:00Z",
    scheduledArrival: "2026-11-17T05:30:00Z",
    status: "SCHEDULED",
    terminal: "T3",
    gate: "G48",
    totalSeats: 300,
    bookedSeats: 211
  },
  // TRIP-D: Priya BLR → BOM (BOARDING — smooth journey)
  {
    id: "FLT-TRIP-D-1",
    itineraryId: "TRIP-D",
    airline: "SpiceJet",
    airlineCode: "SG",
    operatorId: "USR-AGENCY-C",
    flightNumber: "SG505",
    origin: "BLR",
    destination: "BOM",
    scheduledDeparture: "2026-11-15T06:00:00Z",
    scheduledArrival: "2026-11-15T08:00:00Z",
    status: "BOARDING",
    terminal: "T1",
    gate: "G03",
    totalSeats: 150,
    bookedSeats: 148
  },
  // Extra flights operated by IndiGo (visible in COMPANY dashboard for 6E)
  {
    id: "FLT-6E-301",
    itineraryId: null,
    airline: "IndiGo",
    airlineCode: "6E",
    operatorId: "USR-AGENCY-A",
    flightNumber: "6E301",
    origin: "DEL",
    destination: "BOM",
    scheduledDeparture: "2026-11-15T14:00:00Z",
    scheduledArrival: "2026-11-15T16:00:00Z",
    status: "SCHEDULED",
    terminal: "T2",
    gate: "G31",
    totalSeats: 180,
    bookedSeats: 95
  },
  {
    id: "FLT-6E-402",
    itineraryId: null,
    airline: "IndiGo",
    airlineCode: "6E",
    operatorId: "USR-AGENCY-A",
    flightNumber: "6E402",
    origin: "BLR",
    destination: "HYD",
    scheduledDeparture: "2026-11-15T09:30:00Z",
    scheduledArrival: "2026-11-15T10:40:00Z",
    status: "DEPARTED",
    terminal: "T1",
    gate: "G07",
    totalSeats: 150,
    bookedSeats: 150
  },
  // Extra Air India flight
  {
    id: "FLT-AI-201",
    itineraryId: null,
    airline: "Air India",
    airlineCode: "AI",
    operatorId: "USR-AGENCY-B",
    flightNumber: "AI201",
    origin: "BOM",
    destination: "DEL",
    scheduledDeparture: "2026-11-15T08:00:00Z",
    scheduledArrival: "2026-11-15T10:15:00Z",
    status: "ARRIVED",
    terminal: "T2",
    gate: "G15",
    totalSeats: 300,
    bookedSeats: 278
  }
];

// ─────────────────────────────────────────────
// HOTEL BOOKINGS
// ─────────────────────────────────────────────
const hotels = [
  {
    id: "HTL-TRIP-A",
    itineraryId: "TRIP-A",
    hotelName: "The Imperial New Delhi",
    location: "New Delhi, India",
    checkIn: "2026-11-15T14:00:00Z",
    checkOut: "2026-11-18T11:00:00Z",
    bookingReference: "IMP-2026-AARAV",
    price: 18500,
    currency: "INR",
    status: "MODIFIED",
    originalCheckIn: "2026-11-15T14:00:00Z",
    modifiedCheckIn: "2026-11-15T22:00:00Z",
    actionTaken: "MODIFY_CHECKIN"
  },
  {
    id: "HTL-TRIP-B",
    itineraryId: "TRIP-B",
    hotelName: "Taj MG Road Bengaluru",
    location: "Bengaluru, India",
    checkIn: "2026-11-15T13:00:00Z",
    checkOut: "2026-11-17T12:00:00Z",
    bookingReference: "TAJ-2026-MEERA",
    price: 12000,
    currency: "INR",
    status: "CONFIRMED",
    actionTaken: "NO_ACTION"
  },
  {
    id: "HTL-TRIP-C",
    itineraryId: "TRIP-C",
    hotelName: "The Ritz London",
    location: "London, UK",
    checkIn: "2026-11-17T15:00:00Z",
    checkOut: "2026-11-22T11:00:00Z",
    bookingReference: "RITZ-2026-ROHAN",
    price: 42000,
    currency: "INR",
    status: "CONFIRMED",
    actionTaken: "NO_ACTION"
  },
  {
    id: "HTL-TRIP-D",
    itineraryId: "TRIP-D",
    hotelName: "Trident Nariman Point",
    location: "Mumbai, India",
    checkIn: "2026-11-15T14:00:00Z",
    checkOut: "2026-11-15T23:00:00Z",
    bookingReference: "TRI-2026-PRIYA",
    price: 9500,
    currency: "INR",
    status: "CONFIRMED",
    actionTaken: "NO_ACTION"
  }
];

// ─────────────────────────────────────────────
// DISRUPTIONS (3 scenarios)
// ─────────────────────────────────────────────
const disruptions = [
  // Disruption 1: CANCELLATION — Aarav's IndiGo flight cancelled
  {
    id: "DISRUPT-001",
    itineraryId: "TRIP-A",
    segmentId: "FLT-TRIP-A-1",
    type: "CANCELLATION",
    severity: "CRITICAL",
    description: "Flight 6E101 (AMD → DEL) has been CANCELLED due to sudden technical snag.",
    detectedAt: "2026-11-15T07:30:00Z",
    impact: "Traveler misses onward connection. Hotel check-in delayed by 8 hours.",
    status: "DECISION_READY",
    affectedFlightNumber: "6E101",
    affectedSegments: ["FLT-TRIP-A-1"],
    affectedHotelId: "HTL-TRIP-A",
    recommendedAlternativeId: "ALT-6E-R1",
    requiresApproval: false,
    airlineOperatorId: "USR-AGENCY-A"
  },
  // Disruption 2: DELAY — Meera's IndiGo flight delayed 3 hrs
  {
    id: "DISRUPT-002",
    itineraryId: "TRIP-B",
    segmentId: "FLT-TRIP-B-1",
    type: "DELAY",
    severity: "HIGH",
    description: "Flight 6E202 (BOM → BLR) delayed by 180 minutes due to ATC congestion at CSIA.",
    detectedAt: "2026-11-15T05:30:00Z",
    impact: "Conference check-in deadline at 10:00 may be missed. Hotel afternoon slot tight.",
    status: "SEARCHING_ALTERNATIVES",
    affectedFlightNumber: "6E202",
    affectedSegments: ["FLT-TRIP-B-1"],
    affectedHotelId: "HTL-TRIP-B",
    recommendedAlternativeId: "ALT-6E-R2",
    requiresApproval: false,
    airlineOperatorId: "USR-AGENCY-A"
  },
  // Disruption 3: MISSED_CONNECTION — policy exception required
  {
    id: "DISRUPT-003",
    itineraryId: "TRIP-C",
    segmentId: "FLT-TRIP-C-1",
    type: "CONNECTION_RISK",
    severity: "MEDIUM",
    description: "Potential gate change at DEL T3 reduces connection buffer to 55 minutes (<90 min policy).",
    detectedAt: "2026-11-16T18:00:00Z",
    impact: "Risk of missed boarding for AI302 to London if gate change is confirmed.",
    status: "MONITORING",
    affectedFlightNumber: "AI302",
    affectedSegments: ["FLT-TRIP-C-1"],
    affectedHotelId: "HTL-TRIP-C",
    recommendedAlternativeId: "ALT-AI-R1",
    requiresApproval: true,
    approvalReason: "Best alternative exceeds ₹20,000 fare cap by ₹4,500.",
    airlineOperatorId: "USR-AGENCY-B"
  }
];

// ─────────────────────────────────────────────
// ALTERNATIVE FLIGHTS
// ─────────────────────────────────────────────
const alternatives = [
  // For DISRUPT-001 (cancellation of 6E101)
  {
    id: "ALT-6E-R1",
    disruptionId: "DISRUPT-001",
    airline: "IndiGo",
    flightNumber: "6E301",
    origin: "AMD",
    destination: "DEL",
    departureTime: "2026-11-15T14:00:00Z",
    arrivalTime: "2026-11-15T16:15:00Z",
    duration: "2h 15m",
    stops: 0,
    price: 7500,
    currency: "INR",
    policyCompliant: true,
    policyViolations: [],
    recommended: true,
    explanation: "Next available IndiGo direct flight. Traveler reaches Delhi by 16:15 — hotel modified accordingly.",
    carbonFootprint: "118 kg CO2",
    score: 94
  },
  {
    id: "ALT-6E-R1-B",
    disruptionId: "DISRUPT-001",
    airline: "Air India",
    flightNumber: "AI203",
    origin: "AMD",
    destination: "DEL",
    departureTime: "2026-11-15T16:30:00Z",
    arrivalTime: "2026-11-15T18:40:00Z",
    duration: "2h 10m",
    stops: 0,
    price: 9200,
    currency: "INR",
    policyCompliant: true,
    policyViolations: [],
    recommended: false,
    explanation: "Air India backup — departs later but slightly cheaper than SpiceJet option.",
    carbonFootprint: "115 kg CO2",
    score: 81
  },
  // For DISRUPT-002 (delay of 6E202)
  {
    id: "ALT-6E-R2",
    disruptionId: "DISRUPT-002",
    airline: "IndiGo",
    flightNumber: "6E350",
    origin: "BOM",
    destination: "BLR",
    departureTime: "2026-11-15T07:30:00Z",
    arrivalTime: "2026-11-15T09:30:00Z",
    duration: "2h 00m",
    stops: 0,
    price: 5500,
    currency: "INR",
    policyCompliant: true,
    policyViolations: [],
    recommended: true,
    explanation: "Earlier IndiGo service gets Meera to Bengaluru before conference check-in deadline.",
    carbonFootprint: "112 kg CO2",
    score: 91
  },
  // For DISRUPT-003 (connection risk on AI302)
  {
    id: "ALT-AI-R1",
    disruptionId: "DISRUPT-003",
    airline: "Air India",
    flightNumber: "AI301",
    origin: "DEL",
    destination: "LHR",
    departureTime: "2026-11-17T00:30:00Z",
    arrivalTime: "2026-11-17T07:00:00Z",
    duration: "9h 30m",
    stops: 0,
    price: 24500,
    currency: "INR",
    policyCompliant: false,
    policyViolations: ["Exceeds max additional fare of ₹20,000 by ₹4,500"],
    recommended: true,
    explanation: "Safest option to reach London on time — requires fare exception approval.",
    carbonFootprint: "238 kg CO2",
    score: 87
  }
];

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
const notifications = [
  // Traveler A — CRITICAL DISRUPTION
  {
    id: "NOTIF-001",
    userId: "USR-TRV-A",
    title: "✈️ Flight 6E101 Cancelled — Concierge Activated",
    message: "Your Ahmedabad → Delhi flight 6E101 was cancelled. RoutePilot AI is autonomously re-routing you.",
    timestamp: "2026-11-15T07:31:00Z",
    read: false,
    type: "CRITICAL_DISRUPTION",
    reason: "Technical snag on aircraft. Airline confirmed AOGTM (Aircraft on Ground – Technical Maintenance).",
    whatHappened: "IndiGo 6E101 (AMD → DEL, dep 10:00) status changed to CANCELLED at 07:30 IST.",
    whatSystemDid: "Scanned 6 alternative routes. Identified 6E301 (14:00 dep) as optimal — policy-compliant, direct, within ₹25,000 fare cap.",
    currentStatus: "Autonomous rebooking executing. Hotel check-in updated to 22:00.",
    whatUserMustDo: "No action needed. Confirm new boarding time: Terminal 1, Gate G10, 14:00 dep.",
    itineraryId: "TRIP-A",
    disruptionId: "DISRUPT-001",
    comments: [
      "Concierge: Baggage tags auto-transferred to 6E301. No re-check needed."
    ]
  },
  // Traveler A — REBOOKING SUCCESS
  {
    id: "NOTIF-002",
    userId: "USR-TRV-A",
    title: "✅ Rebooking Confirmed on 6E301",
    message: "New booking confirmed: 6E301 AMD→DEL, dep 14:00. Hotel check-in adjusted to 22:00.",
    timestamp: "2026-11-15T07:38:00Z",
    read: false,
    type: "REBOOKING_SUCCESS",
    whatHappened: "6E101 cancelled. System rebooked onto 6E301 without traveler intervention.",
    whatSystemDid: "Called IndiGo booking API with idempotency key. E-ticket reissued. Hotel notified via API.",
    currentStatus: "Confirmed. Boarding pass issued for 6E301.",
    whatUserMustDo: "Arrive at AMD Terminal 1 by 13:00. Gate G10.",
    newFlightDetails: "IndiGo 6E301 • AMD → DEL • Dep 14:00, Arr 16:15",
    hotelChanges: "The Imperial Delhi: Check-in moved 14:00 → 22:00 (no penalty applied)",
    additionalCost: "₹7,500 (within ₹25,000 corporate disruption policy)",
    confirmationNumber: "PNR-6E-882901",
    itineraryId: "TRIP-A",
    disruptionId: "DISRUPT-001",
    comments: []
  },
  // Traveler B — DELAY ALERT
  {
    id: "NOTIF-003",
    userId: "USR-TRV-B",
    title: "⚠️ Flight 6E202 Delayed 3 Hours — Alternatives Found",
    message: "Your Mumbai → Bengaluru flight 6E202 is delayed by 180 min. Conference check-in at risk.",
    timestamp: "2026-11-15T05:31:00Z",
    read: false,
    type: "CRITICAL_DISRUPTION",
    reason: "ATC holds and congestion at CSIA runway 27. Expected ground delay: 3 hrs.",
    whatHappened: "6E202 (BOM → BLR, dep 07:00) now estimated to depart at 10:00.",
    whatSystemDid: "Detected 60-min conference check-in deadline conflict. Identified earlier 6E350 (07:30 dep) as alternative.",
    currentStatus: "Recommendation ready. Awaiting traveler confirmation (autonomous rebooking enabled).",
    whatUserMustDo: "Confirm switch to 6E350 or the system will auto-rebook in 15 minutes.",
    itineraryId: "TRIP-B",
    disruptionId: "DISRUPT-002",
    comments: []
  },
  // Traveler C — POLICY EXCEPTION ALERT
  {
    id: "NOTIF-004",
    userId: "USR-TRV-C",
    title: "🔔 Policy Exception Required — London Flight",
    message: "Best alternative AI301 to London exceeds ₹20,000 cap by ₹4,500. Manual approval needed.",
    timestamp: "2026-11-16T18:05:00Z",
    read: false,
    type: "POLICY_EXCEPTION",
    whatHappened: "Gate change at DEL T3 reduces connection buffer to 55 min (<90 min minimum).",
    whatSystemDid: "Blocked autonomous rebooking — cost exceeds hard fare cap. Flagged for human approval.",
    currentStatus: "Awaiting manager or traveler approval for ₹24,500 fare.",
    whatUserMustDo: "Approve the ₹4,500 exception or choose to monitor current flight AI302.",
    itineraryId: "TRIP-C",
    disruptionId: "DISRUPT-003",
    comments: []
  },
  // Traveler D — SMOOTH JOURNEY
  {
    id: "NOTIF-005",
    userId: "USR-TRV-D",
    title: "🛫 Boarding Now — SG505 Bengaluru → Mumbai",
    message: "Your SpiceJet SG505 is boarding at Gate G03. Have a smooth flight, Priya!",
    timestamp: "2026-11-15T05:30:00Z",
    read: true,
    type: "REBOOKING_SUCCESS",
    whatHappened: "Flight SG505 is on-time and boarding.",
    whatSystemDid: "No disruption detected. Journey proceeding as planned.",
    currentStatus: "Boarding in progress. Estimated departure: 06:00 IST.",
    whatUserMustDo: "Proceed to Gate G03, Terminal 1, Bengaluru Airport.",
    itineraryId: "TRIP-D",
    comments: []
  }
];

// ─────────────────────────────────────────────
// REBOOKING REQUESTS
// ─────────────────────────────────────────────
const rebookingRequests = [
  {
    id: "RBK-001",
    disruptionId: "DISRUPT-001",
    alternativeId: "ALT-6E-R1",
    idempotencyKey: "RBK-6E101-to-6E301-TRVA-20261115",
    status: "CONFIRMED",
    requiresApproval: false,
    createdAt: "2026-11-15T07:32:00Z",
    confirmedAt: "2026-11-15T07:38:00Z",
    hotelAction: "MODIFY_CHECKIN",
    hotelStatus: "MODIFIED"
  },
  {
    id: "RBK-002",
    disruptionId: "DISRUPT-002",
    alternativeId: "ALT-6E-R2",
    idempotencyKey: "RBK-6E202-to-6E350-TRVB-20261115",
    status: "PENDING",
    requiresApproval: false,
    createdAt: "2026-11-15T05:32:00Z",
    hotelAction: "NO_ACTION",
    hotelStatus: "UNCHANGED"
  },
  {
    id: "RBK-003",
    disruptionId: "DISRUPT-003",
    alternativeId: "ALT-AI-R1",
    idempotencyKey: "RBK-AI302-TRVC-20261116",
    status: "APPROVAL_REQUIRED",
    requiresApproval: true,
    approvalReason: "Alternative fare ₹24,500 exceeds ₹20,000 policy cap by ₹4,500.",
    createdAt: "2026-11-16T18:00:00Z",
    hotelAction: "NO_ACTION",
    hotelStatus: "UNCHANGED"
  }
];

// ─────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────
const auditLogs = [
  {
    id: "AUD-001",
    event: "DISRUPTION_DETECTED",
    actor: "SYSTEM",
    itineraryId: "TRIP-A",
    action: "FLIGHT_STATUS_UPDATE",
    decision: "CLASSIFY_DISRUPTION",
    reason: "IndiGo 6E101 received CANCELLED broadcast from airline live API at 07:30 IST.",
    result: "SUCCESS",
    timestamp: "2026-11-15T07:30:00Z",
    metadata: { flightNumber: "6E101", route: "AMD → DEL", cancellationCode: "AOGTM" }
  },
  {
    id: "AUD-002",
    event: "AI_REASONING_EVALUATION",
    actor: "AI_AGENT",
    itineraryId: "TRIP-A",
    decisionId: "DEC-001",
    action: "EVALUATE_ALTERNATIVES",
    decision: "REBOOK_ALTERNATIVE",
    reason: "Selected 6E301 — earliest policy-compliant direct flight within ₹25,000 fare cap. Score: 94/100.",
    reasonCodes: ["WITHIN_FARE_LIMIT", "EARLIEST_ELIGIBLE_ARRIVAL", "DIRECT_ROUTE", "SAME_AIRLINE"],
    confidence: 0.94,
    result: "SUCCESS",
    timestamp: "2026-11-15T07:31:30Z"
  },
  {
    id: "AUD-003",
    event: "BOOKING_EXECUTED",
    actor: "AI_AGENT",
    itineraryId: "TRIP-A",
    decisionId: "DEC-001",
    action: "CREATE_BOOKING",
    decision: "CONFIRM_REBOOKING",
    reason: "Idempotent booking call to IndiGo API succeeded. PNR PNR-6E-882901 issued.",
    result: "SUCCESS",
    timestamp: "2026-11-15T07:38:00Z",
    metadata: { pnr: "PNR-6E-882901", flightNumber: "6E301", confirmationNumber: "CNF-IND-20261115" }
  },
  {
    id: "AUD-004",
    event: "HOTEL_MODIFICATION",
    actor: "AI_AGENT",
    itineraryId: "TRIP-A",
    action: "MODIFY_HOTEL_CHECKIN",
    decision: "ADJUST_CHECKIN",
    reason: "Hotel check-in adjusted from 14:00 to 22:00 to match new flight arrival. No penalty applied.",
    result: "SUCCESS",
    timestamp: "2026-11-15T07:39:00Z",
    metadata: { hotelId: "HTL-TRIP-A", originalCheckIn: "14:00", newCheckIn: "22:00", penalty: 0 }
  },
  {
    id: "AUD-005",
    event: "DISRUPTION_DETECTED",
    actor: "SYSTEM",
    itineraryId: "TRIP-B",
    action: "FLIGHT_STATUS_UPDATE",
    decision: "CLASSIFY_DISRUPTION",
    reason: "6E202 delay of 180 min detected. Conference deadline at risk — escalated to AI concierge.",
    result: "SUCCESS",
    timestamp: "2026-11-15T05:30:00Z",
    metadata: { flightNumber: "6E202", delay: "180 min", cause: "ATC_CONGESTION" }
  },
  {
    id: "AUD-006",
    event: "POLICY_EXCEPTION_FLAGGED",
    actor: "AI_AGENT",
    itineraryId: "TRIP-C",
    decisionId: "DEC-003",
    action: "EVALUATE_ALTERNATIVES",
    decision: "ESCALATE_APPROVAL",
    reason: "Best alternative AI301 costs ₹24,500 — exceeds policy cap by ₹4,500. Autonomous execution blocked.",
    reasonCodes: ["FARE_EXCEEDS_POLICY", "REQUIRES_HUMAN_APPROVAL"],
    confidence: 0.88,
    result: "PENDING_APPROVAL",
    timestamp: "2026-11-16T18:03:00Z"
  }
];

// ─────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────
async function seedAll() {
  console.log('\n🌱 RoutePilot — Full Demo Seed Starting...\n');

  console.log('👤 Seeding users...');
  for (const u of users) {
    await setDoc(doc(db, 'users', u.id), u);
    console.log(`   ✓ ${u.id} — ${u.name} (${u.role}${u.companyName ? ' · ' + u.companyName : ''})`);
  }

  console.log('\n⚙️  Seeding travel preferences...');
  for (const p of preferences) {
    await setDoc(doc(db, 'travel_preferences', p.id), p);
    console.log(`   ✓ ${p.id}`);
  }

  console.log('\n📋 Seeding itineraries...');
  for (const itin of itineraries) {
    await setDoc(doc(db, 'itineraries', itin.id), itin);
    console.log(`   ✓ ${itin.id} — ${itin.tripName}`);
  }

  console.log('\n✈️  Seeding flights...');
  for (const f of flights) {
    await setDoc(doc(db, 'flights', f.id), f);
    console.log(`   ✓ ${f.id} — ${f.flightNumber} ${f.origin}→${f.destination} [${f.status}]`);
  }

  console.log('\n🏨 Seeding hotel bookings...');
  for (const h of hotels) {
    await setDoc(doc(db, 'hotel_bookings', h.id), h);
    console.log(`   ✓ ${h.id} — ${h.hotelName}`);
  }

  console.log('\n⚡ Seeding disruptions...');
  for (const d of disruptions) {
    await setDoc(doc(db, 'disruptions', d.id), d);
    console.log(`   ✓ ${d.id} — ${d.type} [${d.severity}]`);
  }

  console.log('\n🔀 Seeding alternative flights...');
  for (const a of alternatives) {
    await setDoc(doc(db, 'alternative_flights', a.id), a);
    console.log(`   ✓ ${a.id} — ${a.flightNumber} (score: ${a.score})`);
  }

  console.log('\n🔔 Seeding notifications...');
  for (const n of notifications) {
    await setDoc(doc(db, 'notifications', n.id), n);
    console.log(`   ✓ ${n.id} — ${n.title}`);
  }

  console.log('\n📝 Seeding rebooking requests...');
  for (const r of rebookingRequests) {
    await setDoc(doc(db, 'rebooking_requests', r.id), r);
    console.log(`   ✓ ${r.id} — [${r.status}]`);
  }

  console.log('\n📊 Seeding audit logs...');
  for (const l of auditLogs) {
    await setDoc(doc(db, 'audit_logs', l.id), l);
    console.log(`   ✓ ${l.id} — ${l.event}`);
  }

  console.log('\n✅ All collections seeded successfully into Firebase Firestore!\n');
  console.log('─────────────────────────────────────────────');
  console.log('🎯 DEMO LOGIN ACCOUNTS:');
  console.log('');
  console.log('  TRAVELERS:');
  console.log('  traveler.ahmedabad@routepilot.com / Travel@123  (Flight CANCELLED → auto-rebooked)');
  console.log('  traveler.mumbai@routepilot.com    / Travel@456  (Flight DELAYED → alternatives ready)');
  console.log('  traveler.delhi@routepilot.com     / Travel@789  (Connection risk → approval needed)');
  console.log('  traveler.bangalore@routepilot.com / Travel@321  (Smooth journey — boarding now)');
  console.log('');
  console.log('  AIRLINE PARTNERS (COMPANY):');
  console.log('  agency.alpha@routepilot.com       / Agency@123  (IndiGo — 4 flights, 2 disruptions)');
  console.log('  agency.beta@routepilot.com        / Agency@456  (Air India — 2 flights, 1 disruption)');
  console.log('  agency.gamma@routepilot.com       / Agency@789  (SpiceJet — 1 smooth flight)');
  console.log('─────────────────────────────────────────────\n');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

