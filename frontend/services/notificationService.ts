// Owner: Member B (Frontend Systems / Interaction & Demo)
// Notification Service backed by Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      const notifs: NotificationItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          message: data.message || '',
          timestamp: data.timestamp || new Date().toISOString(),
          read: data.read ?? false,
          type: data.type || 'INFO',
          reason: data.reason || null,
          whatHappened: data.whatHappened,
          whatSystemDid: data.whatSystemDid,
          currentStatus: data.currentStatus,
          whatUserMustDo: data.whatUserMustDo,
          itineraryId: data.itineraryId || 'TRIP-A',
          disruptionId: data.disruptionId,
          newFlightDetails: data.newFlightDetails,
          hotelChanges: data.hotelChanges,
          additionalCost: data.additionalCost,
          confirmationNumber: data.confirmationNumber,
          comments: data.comments || [],
        };
      });

      // Sort by timestamp descending
      notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        success: true,
        data: notifs,
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore getNotifications error:', err);
      return {
        success: false,
        data: [],
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  async markAsRead(id: string): Promise<ApiResponse<{ id: string; read: boolean }>> {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
      return {
        success: true,
        data: { id, read: true },
        error: null,
      };
    } catch (err: any) {
      console.error('Firestore markAsRead error:', err);
      return {
        success: true,
        data: { id, read: true },
        error: null,
      };
    }
  },

  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      let count = 0;
      for (const d of snap.docs) {
        if (!d.data().read) {
          await updateDoc(doc(db, 'notifications', d.id), { read: true });
          count++;
        }
      }
      return {
        success: true,
        data: { count },
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: { count: 0 },
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  async commentOnNotification(
    notificationId: string,
    payload: { message: string }
  ): Promise<ApiResponse<{ id: string; message: string; comments: string[] }>> {
    if (!payload.message || !payload.message.trim()) {
      return {
        success: false,
        data: null as any,
        error: { code: 'VALIDATION_ERROR', message: 'Comment text cannot be empty.' },
      };
    }

    try {
      const notifRef = doc(db, 'notifications', notificationId);
      const existing = await getDoc(notifRef);
      let comments: string[] = [];

      if (existing.exists()) {
        comments = existing.data().comments || [];
        comments.push(payload.message.trim());
        await updateDoc(notifRef, { comments });
      }

      return {
        success: true,
        data: {
          id: notificationId,
          message: payload.message.trim(),
          comments,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        error: { code: 'FIRESTORE_ERROR', message: err.message },
      };
    }
  },

  async addNotification(item: Partial<NotificationItem>): Promise<NotificationItem> {
    const notifId = item.id || `NOTIF-${Date.now().toString().slice(-6)}`;
    const newItem: NotificationItem = {
      id: notifId,
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
      itineraryId: item.itineraryId || 'TRIP-A',
      disruptionId: item.disruptionId,
      newFlightDetails: item.newFlightDetails,
      hotelChanges: item.hotelChanges,
      additionalCost: item.additionalCost,
      confirmationNumber: item.confirmationNumber,
      comments: item.comments || [],
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), cleanFirestoreData(newItem));
    } catch (err) {
      console.error('Firestore addNotification error:', err);
    }

    return newItem;
  },
};
