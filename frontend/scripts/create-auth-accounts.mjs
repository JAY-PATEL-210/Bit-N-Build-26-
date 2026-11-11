/**
 * Creates Firebase Auth accounts for ALL demo users.
 * Run: node frontend/scripts/create-auth-accounts.mjs
 */
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

const demoAccounts = [
  // ── Travelers ──
  {
    firestoreId: "USR-TRV-A",
    email: "traveler.ahmedabad@routepilot.com",
    password: "Travel@123",
    name: "Aarav Shah",
    role: "TRAVELER",
    phone: "+91-9825001001"
  },
  {
    firestoreId: "USR-TRV-B",
    email: "traveler.mumbai@routepilot.com",
    password: "Travel@456",
    name: "Meera Nair",
    role: "TRAVELER",
    phone: "+91-9820002002"
  },
  {
    firestoreId: "USR-TRV-C",
    email: "traveler.delhi@routepilot.com",
    password: "Travel@789",
    name: "Rohan Kapoor",
    role: "TRAVELER",
    phone: "+91-9810003003"
  },
  {
    firestoreId: "USR-TRV-D",
    email: "traveler.bangalore@routepilot.com",
    password: "Travel@321",
    name: "Priya Menon",
    role: "TRAVELER",
    phone: "+91-9880004004"
  },
  // ── Airline Partners ──
  {
    firestoreId: "USR-AGENCY-A",
    email: "agency.alpha@routepilot.com",
    password: "Agency@123",
    name: "Vikram Sharma",
    role: "COMPANY",
    companyName: "IndiGo Airlines",
    airlineCode: "6E"
  },
  {
    firestoreId: "USR-AGENCY-B",
    email: "agency.beta@routepilot.com",
    password: "Agency@456",
    name: "Sonal Desai",
    role: "COMPANY",
    companyName: "Air India",
    airlineCode: "AI"
  },
  {
    firestoreId: "USR-AGENCY-C",
    email: "agency.gamma@routepilot.com",
    password: "Agency@789",
    name: "Karan Mehta",
    role: "COMPANY",
    companyName: "SpiceJet",
    airlineCode: "SG"
  }
];

async function createAccounts() {
  console.log('\n🔐 Creating Firebase Auth accounts for all demo users...\n');

  for (const account of demoAccounts) {
    try {
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const fbUser = cred.user;

      // Set display name
      await updateProfile(fbUser, { displayName: account.name });

      // Build Firestore user doc (strip undefined)
      const userDoc = {
        id: fbUser.uid,
        email: account.email,
        name: account.name,
        role: account.role,
        ...(account.phone      ? { phone: account.phone }           : {}),
        ...(account.companyName ? { companyName: account.companyName } : {}),
        ...(account.airlineCode ? { airlineCode: account.airlineCode } : {}),
      };

      // Write to Firestore with the Firebase UID
      await setDoc(doc(db, 'users', fbUser.uid), userDoc, { merge: true });

      // Also keep the original Firestore ID doc pointing to this UID (for backwards compat)
      await setDoc(doc(db, 'users', account.firestoreId), {
        ...userDoc,
        id: account.firestoreId,
        authUid: fbUser.uid,
      }, { merge: true });

      console.log(`   ✅ ${account.email} — created (UID: ${fbUser.uid})`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`   ⏭️  ${account.email} — already exists (skipped)`);
      } else {
        console.error(`   ❌ ${account.email} — ERROR: ${err.message}`);
      }
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('🎯 All demo accounts ready! Login credentials:\n');
  console.log('  TRAVELERS:');
  console.log('  traveler.ahmedabad@routepilot.com  / Travel@123  → Flight CANCELLED, auto-rebooked');
  console.log('  traveler.mumbai@routepilot.com     / Travel@456  → Flight DELAYED, alternatives ready');
  console.log('  traveler.delhi@routepilot.com      / Travel@789  → Connection risk, approval needed');
  console.log('  traveler.bangalore@routepilot.com  / Travel@321  → Smooth journey, boarding now');
  console.log('');
  console.log('  AIRLINE PARTNERS:');
  console.log('  agency.alpha@routepilot.com        / Agency@123  → IndiGo (4 flights, 2 disruptions)');
  console.log('  agency.beta@routepilot.com         / Agency@456  → Air India (2 flights, 1 disruption)');
  console.log('  agency.gamma@routepilot.com        / Agency@789  → SpiceJet (1 smooth flight)');
  console.log('──────────────────────────────────────────────\n');
  process.exit(0);
}

createAccounts().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

