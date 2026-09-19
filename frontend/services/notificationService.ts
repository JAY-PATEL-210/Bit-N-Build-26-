// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 14, 15, 17, 40: Notification Service with Commenting and Reason Propagation
import { ApiResponse, NotificationItem } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const NOTIFICATIONS_STORE_KEY = 'concierge_notifications_store';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'Flight Cancelled & Autonomous Rebooking Initiated',
    message:
      'Your Mumbai (BOM) → Delhi (DEL) flight AI101 was cancelled. Autonomous concierge is actively resolving your connection.',
    timestamp: '2026-09-19T08:00:15Z',
    read: false,
    type: 'CRITICAL_DISRUPTION',
    reason: 'Technical maintenance on Boeing 787 aircraft at BOM terminal.',
    whatHappened: 'Flight AI101 (Mumbai BOM → Delhi DEL) status changed to CANCELLED.',
    whatSystemDid:
      'Analyzed downstream itinerary, detected missed London connection (AI203), and searched 4 eligible replacement routes.',
    currentStatus:
      'Selected optimal alternative AI203 (Direct BOM/DEL link) within ₹20,000 corporate budget.',
    whatUserMustDo: 'No manual action needed. Autonomous rebooking is executing.',
    itineraryId: 'TRIP-001',
    disruptionId: 'DISRUPT-001',
    comments: [
      'Traveler support inquiry: Will our checked luggage be automatically transferred to the replacement aircraft? — Concierge: Yes, baggage tags are automatically mapped.',
    ],
  },
  {
    id: 'NOTIF-002',
    title: 'Rebooking Confirmed & Hotel Check-in Adjusted',
    message:
      'Rebooking complete on Flight AI203. Hotel check-in at The Landmark London adjusted to 11 June 05:45 AM.',
    timestamp: '2026-09-19T08:05:30Z',
    read: false,
    type: 'REBOOKING_SUCCESS',
    whatHappened: 'Original connection was rescheduled to Air India AI203 departing 20:30.',
    whatSystemDid:
      'Executed booking API with idempotency key REBOOK-TRIP001-DISRUPTION001-ALT102 and updated hotel arrival time.',
    currentStatus: 'Confirmed. E-ticket issued and hotel informed.',
    whatUserMustDo: 'Check new boarding gate upon arrival at Terminal 3.',
    newFlightDetails: 'Air India AI203 • Dep: 20:30 DEL → Arr: 05:45 +1d LHR',
    hotelChanges: 'The Landmark London: Check-in postponed to 11 June 2026 (No penalty)',
    additionalCost: '₹8,500 (Covered under corporate disruption policy)',
    confirmationNumber: 'PNR-AI-994812',
    itineraryId: 'TRIP-001',
    disruptionId: 'DISRUPT-001',
    comments: [],
  },
  {
    id: 'NOTIF-003',
    title: 'Travel Policy Threshold Alert',
    message:
      'Alternative flight EK501 exceeds the ₹20,000 corporate limit. Requires manager or traveler approval.',
    timestamp: '2026-09-19T08:03:00Z',
    read: true,
    type: 'POLICY_EXCEPTION',
    whatHappened: 'Emirates EK501 offers alternative route via Dubai but costs +₹24,500.',
    whatSystemDid:
      'Blocked autonomous execution due to hard budget constraint (Max additional fare ₹20,000).',
    currentStatus: 'Awaiting human authorization.',
    whatUserMustDo: 'Approve fare exception or choose primary recommended alternative AI203.',
    itineraryId: 'TRIP-001',
    disruptionId: 'DISRUPT-001',
    comments: [],
  },
];

function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveNotifications(notifications: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORE_KEY, JSON.stringify(notifications));
  } catch {
    // localStorage error
  }
}

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) return json;
      }
    } catch {
      // Backend offline fallback
    }

    const notifs = getStoredNotifications();
    return {
      success: true,
      data: [...notifs],
      error: null,
    };
  },

  async markAsRead(id: string): Promise<ApiResponse<{ id: string; read: boolean }>> {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = getStoredNotifications();
          saveNotifications(current.map((n) => (n.id === id ? { ...n, read: true } : n)));
          return json;
        }
      }
    } catch {
      // Fallback
    }

    const current = getStoredNotifications();
    saveNotifications(current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    return {
      success: true,
      data: { id, read: true },
      error: null,
    };
  },

  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    const current = getStoredNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    return {
      success: true,
      data: { count: updated.length },
      error: null,
    };
  },

  /**
   * Post a comment or question to a specific notification (SRS Section 40 & Traveler Support)
   * Proposed API: PATCH /api/notifications/{id}/comment
   */
  async commentOnNotification(
    notificationId: string,
    payload: { message: string }
  ): Promise<ApiResponse<{ id: string; message: string; comments: string[] }>> {
    if (!payload.message || !payload.message.trim()) {
      return {
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Comment text cannot be empty.' },
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/comment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = getStoredNotifications();
          saveNotifications(
            current.map((n) =>
              n.id === notificationId
                ? { ...n, comments: [...(n.comments || []), payload.message.trim()] }
                : n
            )
          );
          return json;
        }
      }
    } catch {
      // Proposed endpoint fallback
    }

    const current = getStoredNotifications();
    let updatedComments: string[] = [];
    const updated = current.map((n) => {
      if (n.id === notificationId) {
        const comments = [...(n.comments || []), payload.message.trim()];
        updatedComments = comments;
        return { ...n, comments };
      }
      return n;
    });

    saveNotifications(updated);

    return {
      success: true,
      data: {
        id: notificationId,
        message: payload.message.trim(),
        comments: updatedComments,
      },
      error: null,
    };
  },

  async addNotification(item: Partial<NotificationItem>): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title: item.title || 'Disruption Event',
      message: item.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      type: item.type || 'INFO',
      reason: item.reason || null,
      whatHappened: item.whatHappened,
      whatSystemDid: item.whatSystemDid,
      currentStatus: item.currentStatus,
      whatUserMustDo: item.whatUserMustDo,
      itineraryId: item.itineraryId || 'TRIP-001',
      disruptionId: item.disruptionId,
      newFlightDetails: item.newFlightDetails,
      hotelChanges: item.hotelChanges,
      additionalCost: item.additionalCost,
      confirmationNumber: item.confirmationNumber,
      comments: item.comments || [],
    };

    const current = getStoredNotifications();
    saveNotifications([newItem, ...current]);
    return newItem;
  },
};
