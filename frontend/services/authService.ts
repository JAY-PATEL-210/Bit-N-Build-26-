// Owner: Member B (Frontend Systems / Interaction & Demo)
// Role-based Authentication Service: Full backend integration with resilient fallback
import { ApiResponse, AuthResponse, LoginPayload, SignupPayload, User } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const CURRENT_USER_KEY = 'concierge_current_user';
const USERS_STORE_KEY = 'concierge_users';
const API_TIMEOUT = 5000; // 5 seconds — sufficient for cold start

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getStoredUsers();
    const filtered = users.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify([...filtered, user]));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // local storage write failed
  }
}

export const authService = {
  /**
   * Role-based signup for TRAVELER or COMPANY
   * API: POST /api/auth/signup
   */
  async signup(payload: SignupPayload): Promise<ApiResponse<AuthResponse>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const json = await res.json();
      if (json.success && json.data) {
        saveUser(json.data.user);
        return json;
      }
      // Return backend error response
      return {
        success: false,
        data: null,
        error: json.error || { code: 'SIGNUP_FAILED', message: 'Signup failed. Please try again.' },
      };
    } catch (err: any) {
      // Network error — backend offline
      console.warn('Signup: Backend unavailable, using local fallback');
      const newUser: User = {
        id: `USER-${Date.now().toString().slice(-5)}`,
        email: payload.email,
        role: payload.role,
        name: payload.name || 'Traveler',
        phone: payload.phone,
        companyName: payload.companyName,
        airlineCode: payload.airlineCode,
      };
      saveUser(newUser);
      return {
        success: true,
        data: {
          user: newUser,
          token: `mock-jwt-${newUser.role.toLowerCase()}-${newUser.id}`,
        },
        error: null,
      };
    }
  },

  /**
   * Role-agnostic login
   * API: POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json.success && json.data) {
        saveUser(json.data.user);
        return json;
      }
      // Return backend error (invalid credentials, etc.)
      return {
        success: false,
        data: null,
        error: json.error || { code: 'AUTH_FAILED', message: 'Login failed. Please check your credentials.' },
      };
    } catch (err: any) {
      // Network error — backend offline, use local fallback
      console.warn('Login: Backend unavailable, using local fallback');

      const emailLower = payload.email.trim().toLowerCase();
      const providedPassword = (payload.password || '').trim();
      const roleRequested = payload.role || 'TRAVELER';

      // Airline check for offline fallback
      const isAuthorizedAirline =
        ['airline@travelsync.com', 'ops@airline.com', 'airline'].includes(emailLower) &&
        ['airline123', 'airline2026', 'admin123'].includes(providedPassword);

      if (roleRequested === 'COMPANY' || emailLower === 'airline@travelsync.com') {
        if (!isAuthorizedAirline) {
          return {
            success: false,
            data: null,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Access Denied: Invalid Airline Credentials. Only authorized airline partners may log in.',
            },
          };
        }
        const companyUser: User = {
          id: 'USER-AIRLINE-01',
          email: emailLower,
          role: 'COMPANY',
          name: 'Airline Operations Admin',
          companyName: 'Air India / TravelSync Partner',
          airlineCode: 'AI',
        };
        saveUser(companyUser);
        return {
          success: true,
          data: { user: companyUser, token: `mock-jwt-company-${companyUser.id}` },
          error: null,
        };
      }

      // Traveler fallback
      const displayName = emailLower.includes('@')
        ? emailLower.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Traveler';
      const travelerUser: User = {
        id: `USER-${Date.now().toString().slice(-5)}`,
        email: payload.email,
        role: 'TRAVELER',
        name: displayName,
      };
      saveUser(travelerUser);
      return {
        success: true,
        data: { user: travelerUser, token: `mock-jwt-traveler-${travelerUser.id}` },
        error: null,
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

  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {
      // Local storage clear failed
    }
  },
};
