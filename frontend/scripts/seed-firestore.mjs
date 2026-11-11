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

const users = [
  {
    id: "USR-AGENCY-A",
    name: "Agency Alpha",
    email: "agency.alpha@routepilot.com",
    username: "agency.alpha",
    role: "COMPANY",
    companyName: "Alpha Travels",
    airlineCode: "AA"
  },
  {
    id: "USR-AGENCY-B",
    name: "Agency Beta",
    email: "agency.beta@routepilot.com",
    username: "agency.beta",
    role: "COMPANY",
    companyName: "Beta Travels",
    airlineCode: "BB"
  },
  {
    id: "USR-TRV-A",
    name: "Traveler A",
    email: "traveler.ahmedabad@routepilot.com",
    username: "traveler.ahmedabad",
    role: "TRAVELER"
  },
  {
    id: "USR-TRV-B",
    name: "Traveler B",
    email: "traveler.mumbai@routepilot.com",
    username: "traveler.mumbai",
    role: "TRAVELER"
  },
  {
    id: "USR-TRV-C",
    name: "Traveler C",
    email: "traveler.delhi@routepilot.com",
    username: "traveler.delhi",
    role: "TRAVELER"
  },
  {
    id: "USR-TRV-D",
    name: "Traveler D",
    email: "traveler.bangalore@routepilot.com",
    username: "traveler.bangalore",
    role: "TRAVELER"
  }
];

const preferences = [
  {
    id: "PREF-USR-TRV-A",
    userId: "USR-TRV-A",
    autonomousRebooking: true,
    autonomousHotelModification: true,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 20000,
    currency: "INR",
    minConnectionMinutes: 90
  },
  {
    id: "PREF-USR-TRV-B",
    userId: "USR-TRV-B",
    autonomousRebooking: true,
    autonomousHotelModification: true,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 20000,
    currency: "INR",
    minConnectionMinutes: 90
  },
  {
    id: "PREF-USR-TRV-C",
    userId: "USR-TRV-C",
    autonomousRebooking: true,
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
    autonomousHotelModification: true,
    preferredCabin: "ECONOMY",
    maxAdditionalFare: 20000,
    currency: "INR",
    minConnectionMinutes: 90
  }
];

const itineraries = [
  {
    id: "TRIP-A",
    userId: "USR-TRV-A",
    tripName: "Ahmedabad to Delhi Business Trip",
    startDate: "2026-09-22T10:00:00Z",
    endDate: "2026-09-25T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-B",
    userId: "USR-TRV-B",
    tripName: "Mumbai to Bengaluru Conf",
    startDate: "2026-09-22T10:00:00Z",
    endDate: "2026-09-25T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-C",
    userId: "USR-TRV-C",
    tripName: "Delhi to London Summit",
    startDate: "2026-09-22T10:00:00Z",
    endDate: "2026-09-25T10:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "TRIP-D",
    userId: "USR-TRV-D",
    tripName: "Bengaluru to Mumbai Client Meet",
    startDate: "2026-09-22T10:00:00Z",
    endDate: "2026-09-25T10:00:00Z",
    status: "ACTIVE"
  }
];

const flights = [
  {
    id: "FLT-TRIP-A-1",
    itineraryId: "TRIP-A",
    airline: "Demo Airlines",
    flightNumber: "AI101",
    origin: "AMD",
    destination: "DEL",
    scheduledDeparture: "2026-09-22T10:00:00Z",
    scheduledArrival: "2026-09-22T12:30:00Z",
    status: "SCHEDULED",
    terminal: "T1",
    gate: "G10"
  },
  {
    id: "FLT-TRIP-B-1",
    itineraryId: "TRIP-B",
    airline: "Demo Airlines",
    flightNumber: "6E202",
    origin: "BOM",
    destination: "BLR",
    scheduledDeparture: "2026-09-22T10:00:00Z",
    scheduledArrival: "2026-09-22T12:30:00Z",
    status: "SCHEDULED",
    terminal: "T1",
    gate: "G10"
  },
  {
    id: "FLT-TRIP-C-1",
    itineraryId: "TRIP-C",
    airline: "Demo Airlines",
    flightNumber: "BA303",
    origin: "DEL",
    destination: "LHR",
    scheduledDeparture: "2026-09-22T10:00:00Z",
    scheduledArrival: "2026-09-22T12:30:00Z",
    status: "SCHEDULED",
    terminal: "T1",
    gate: "G10"
  },
  {
    id: "FLT-TRIP-D-1",
    itineraryId: "TRIP-D",
    airline: "Demo Airlines",
    flightNumber: "QP404",
    origin: "BLR",
    destination: "BOM",
    scheduledDeparture: "2026-09-22T10:00:00Z",
    scheduledArrival: "2026-09-22T12:30:00Z",
    status: "SCHEDULED",
    terminal: "T1",
    gate: "G10"
  }
];

const hotels = [
  {
    id: "HTL-TRIP-A",
    itineraryId: "TRIP-A",
    hotelName: "Hilton Delhi",
    location: "New Delhi, India",
    checkIn: "2026-09-22T14:00:00Z",
    checkOut: "2026-09-25T10:00:00Z",
    bookingReference: "HTL-TRIP-AX",
    price: 15000,
    currency: "INR",
    status: "CONFIRMED"
  },
  {
    id: "HTL-TRIP-B",
    itineraryId: "TRIP-B",
    hotelName: "Taj West End",
    location: "Bengaluru, India",
    checkIn: "2026-09-22T14:00:00Z",
    checkOut: "2026-09-25T10:00:00Z",
    bookingReference: "HTL-TRIP-BX",
    price: 15000,
    currency: "INR",
    status: "CONFIRMED"
  },
  {
    id: "HTL-TRIP-C",
    itineraryId: "TRIP-C",
    hotelName: "The Ritz London",
    location: "London, UK",
    checkIn: "2026-09-22T14:00:00Z",
    checkOut: "2026-09-25T10:00:00Z",
    bookingReference: "HTL-TRIP-CX",
    price: 15000,
    currency: "INR",
    status: "CONFIRMED"
  },
  {
    id: "HTL-TRIP-D",
    itineraryId: "TRIP-D",
    hotelName: "Oberoi Mumbai",
    location: "Mumbai, India",
    checkIn: "2026-09-22T14:00:00Z",
    checkOut: "2026-09-25T10:00:00Z",
    bookingReference: "HTL-TRIP-DX",
    price: 15000,
    currency: "INR",
    status: "CONFIRMED"
  }
];

async function seed() {
  console.log('Seeding users...');
  for (const u of users) {
    await setDoc(doc(db, 'users', u.id), u);
  }
  console.log('Seeding preferences...');
  for (const p of preferences) {
    await setDoc(doc(db, 'travel_preferences', p.id), p);
  }
  console.log('Seeding itineraries...');
  for (const itin of itineraries) {
    await setDoc(doc(db, 'itineraries', itin.id), itin);
  }
  console.log('Seeding flights...');
  for (const f of flights) {
    await setDoc(doc(db, 'flights', f.id), f);
  }
  console.log('Seeding hotels...');
  for (const h of hotels) {
    await setDoc(doc(db, 'hotel_bookings', h.id), h);
  }
  console.log('All collections seeded into Firebase Firestore successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
