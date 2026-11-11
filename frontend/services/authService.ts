// Role-based Authentication Service: Firebase Authentication & Firestore
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, cleanFirestoreData } from '../lib/firebase';
import { ApiResponse, AuthResponse, LoginPayload, SignupPayload, User } from '../types';

const CURRENT_USER_KEY = 'concierge_current_user';

// Seeded user passwords for seamless first-time sync to Firebase Auth
const SEED_PASSWORDS: Record<string, string> = {
  'traveler.ahmedabad@routepilot.com': 'Travel@123',
  'traveler.mumbai@routepilot.com': 'Travel@456',
  'traveler.delhi@routepilot.com': 'Travel@789',
  'traveler.bangalore@routepilot.com': 'Travel@321',
  'agency.alpha@routepilot.com': 'Agency@123',
  'agency.beta@routepilot.com': 'Agency@456',
  'agency.gamma@routepilot.com': 'Agency@789',
};

function formatEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed.includes('@')) {
    return `${trimmed}@routepilot.com`;
  }
  return trimmed;
}

function saveUserToStorage(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors
  }
}

export const authService = {
  /**
   * Role-based signup for TRAVELER or COMPANY using Firebase Auth + Firestore
   */
  async signup(payload: SignupPayload): Promise<ApiResponse<AuthResponse>> {
    try {
      const email = formatEmail(payload.email);
      const password = payload.password || 'RoutePilot@2026';

      // 1. Create or retrieve account in Firebase Auth
      let fbUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = userCredential.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If already in Firebase Auth (e.g. from previous attempt), sign in with the provided password
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            fbUser = userCredential.user;
          } catch {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      if (payload.name) {
        try {
          await updateProfile(fbUser, { displayName: payload.name });
        } catch {
          // Ignore non-fatal display name update error
        }
      }

      // 2. Persist clean profile document to Firestore (omitting undefined fields)
      const newUser: User = {
        id: fbUser.uid,
        email: payload.email,
        role: payload.role,
        name: payload.name || (payload.role === 'COMPANY' ? 'Airline Partner' : 'Traveler'),
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.companyName ? { companyName: payload.companyName } : {}),
        ...(payload.airlineCode ? { airlineCode: payload.airlineCode } : {}),
      };

      const firestoreUserData = cleanFirestoreData({
        ...newUser,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'users', fbUser.uid), firestoreUserData, { merge: true });

      // 3. Create default travel preferences in Firestore for Travelers
      if (payload.role === 'TRAVELER') {
        const prefsData = cleanFirestoreData({
          id: `PREF-${fbUser.uid}`,
          userId: fbUser.uid,
          autonomousRebooking: true,
          autonomousHotelModification: true,
          preferredCabin: 'ECONOMY',
          maxAdditionalFare: 20000,
          currency: 'INR',
          minConnectionMinutes: 90,
          createdAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'travel_preferences', `PREF-${fbUser.uid}`), prefsData, { merge: true });
      }

      const token = await fbUser.getIdToken();
      saveUserToStorage(newUser);

      return {
        success: true,
        data: {
          user: newUser,
          token,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('Firebase Signup error:', err);
      let message = 'Signup failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.message) {
        message = err.message;
      }

      return {
        success: false,
        data: null,
        error: {
          code: err.code || 'SIGNUP_FAILED',
          message,
        },
      };
    }
  },

  /**
   * Role-agnostic login using Firebase Authentication & Firestore database
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    try {
      const email = formatEmail(payload.email);
      const password = payload.password || '';

      let fbUser;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        fbUser = userCredential.user;
      } catch (authErr: any) {
        // If account does not exist in Firebase Auth yet, check if it's one of the seeded demo accounts
        const seedPwd = SEED_PASSWORDS[email];
        if (seedPwd && (password === seedPwd || !password)) {
          // Provision in Firebase Auth with the seed password
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email, seedPwd);
            fbUser = newCred.user;
          } catch {
            const cred = await signInWithEmailAndPassword(auth, email, seedPwd);
            fbUser = cred.user;
          }
        } else {
          throw authErr;
        }
      }

      // Fetch user profile from Firestore
      let userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      let user: User;

      if (userDoc.exists()) {
        user = userDoc.data() as User;
      } else {
        // Look up by email or username in Firestore
        const qEmail = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(qEmail);

        if (!snap.empty) {
          user = snap.docs[0].data() as User;
          await setDoc(doc(db, 'users', fbUser.uid), cleanFirestoreData({ ...user, id: fbUser.uid }), { merge: true });
        } else {
          const username = payload.email.trim().toLowerCase();
          const qUser = query(collection(db, 'users'), where('username', '==', username));
          const snapUser = await getDocs(qUser);

          if (!snapUser.empty) {
            user = snapUser.docs[0].data() as User;
            await setDoc(doc(db, 'users', fbUser.uid), cleanFirestoreData({ ...user, id: fbUser.uid }), { merge: true });
          } else {
            user = {
              id: fbUser.uid,
              email: payload.email,
              role: payload.role || (payload.email.startsWith('agency') ? 'COMPANY' : 'TRAVELER'),
              name: fbUser.displayName || (payload.role === 'COMPANY' ? 'Airline Partner' : 'Traveler'),
            };
            await setDoc(doc(db, 'users', fbUser.uid), cleanFirestoreData(user), { merge: true });
          }
        }
      }

      const token = await fbUser.getIdToken();
      saveUserToStorage(user);

      return {
        success: true,
        data: {
          user,
          token,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('Firebase Login error:', err);
      let message = 'Access Denied: Invalid email or password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        message = err.message;
      }

      return {
        success: false,
        data: null,
        error: {
          code: err.code || 'INVALID_CREDENTIALS',
          message,
        },
      };
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {
      // Ignore signOut errors
    }
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {
      // Ignore
    }
  },
};
