// Owner: Member B (Frontend Systems / Interaction & Demo)
// Role-based Authentication Service: Section 56 Proposed Contract & Resilient Fallback
import { ApiResponse, AuthResponse, LoginPayload, SignupPayload, User } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const CURRENT_USER_KEY = 'concierge_current_user';
const USERS_STORE_KEY = 'concierge_users';

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
   * Proposed API: POST /api/auth/signup
   */
  async signup(payload: SignupPayload): Promise<ApiResponse<AuthResponse>> {
    // 1. Attempt live backend call if configured (with quick 800ms timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveUser(json.data.user);
          return json;
        }
      }
    } catch {
      // Backend proposed endpoint not available yet — proceed with client simulation
    }

    // 2. Simulated signup fallback adhering strictly to canonical role contract
    const newUser: User = {
      id: `USER-${Date.now().toString().slice(-5)}`,
      email: payload.email,
      role: payload.role, // 'TRAVELER' | 'COMPANY'
      name: payload.name,
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
  },

  /**
   * Role-agnostic login
   * Proposed API: POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    // 1. Attempt live backend call (with quick 800ms timeout to ensure instant response)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveUser(json.data.user);
          return json;
        } else if (json.error) {
          return {
            success: false,
            data: null,
            error: typeof json.error === 'string' ? { code: 'AUTH_FAILED', message: json.error } : json.error,
          };
        }
      }
    } catch {
      // Backend offline or network error, proceed with client fallback
    }

    const emailLower = payload.email.trim().toLowerCase();
    const providedPassword = (payload.password || '').trim();
    const roleRequested = payload.role || 'TRAVELER';

    const isAuthorizedAirline =
      ['airline@travelsync.com', 'ops@airline.com', 'airline'].includes(emailLower) &&
      ['airline123', 'airline2026', 'admin123'].includes(providedPassword);

    // 2. Strict Airline check
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
        data: {
          user: companyUser,
          token: `mock-jwt-company-${companyUser.id}`,
        },
        error: null,
      };
    }

    // 3. Customer / Traveler: Any email & password is valid!
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === emailLower);

    if (existing) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existing));
      }
      return {
        success: true,
        data: {
          user: existing,
          token: `mock-jwt-${existing.role.toLowerCase()}-${existing.id}`,
        },
        error: null,
      };
    }

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
      data: {
        user: travelerUser,
        token: `mock-jwt-traveler-${travelerUser.id}`,
      },
      error: null,
    };
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
