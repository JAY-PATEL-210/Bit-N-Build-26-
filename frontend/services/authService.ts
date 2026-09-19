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
    // 1. Attempt live backend call if configured
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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
    // 1. Attempt live backend call
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveUser(json.data.user);
          return json;
        }
      }
    } catch {
      // Fallback
    }

    // 2. Check local registered users first
    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );

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

    // 3. Fallback inference based on email domain or keywords
    const emailLower = payload.email.toLowerCase();
    const isCompany =
      emailLower.includes('company') ||
      emailLower.includes('airline') ||
      emailLower.includes('airindia') ||
      emailLower.includes('ops') ||
      emailLower.includes('admin');

    const inferredUser: User = {
      id: `USER-${Date.now().toString().slice(-5)}`,
      email: payload.email,
      role: isCompany ? 'COMPANY' : 'TRAVELER',
      name: isCompany ? 'Airline Operations Admin' : 'Demo Traveler',
      companyName: isCompany ? 'Air India Flight Ops' : undefined,
      airlineCode: isCompany ? 'AI' : undefined,
    };

    saveUser(inferredUser);

    return {
      success: true,
      data: {
        user: inferredUser,
        token: `mock-jwt-${inferredUser.role.toLowerCase()}-${inferredUser.id}`,
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
