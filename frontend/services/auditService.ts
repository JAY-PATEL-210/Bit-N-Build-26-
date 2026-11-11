// Owner: Member B (Frontend Systems / Interaction & Demo)
// Audit Service backed by Firebase Firestore
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiResponse, AuditLogEntry } from '../types';

export const auditService = {
  async getAuditTrail(itineraryId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    try {
      const snap = await getDocs(collection(db, 'audit_logs'));
      if (!snap.empty) {
        const logs: AuditLogEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as AuditLogEntry));

        logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return {
          success: true,
          data: logs,
          error: null,
        };
      }
    } catch (err: any) {
      console.error('Firestore getAuditTrail error:', err);
    }

    return {
      success: true,
      data: [],
      error: null,
    };
  },

  async recordAuditEvent(entry: Partial<AuditLogEntry>): Promise<AuditLogEntry> {
    const auditId = entry.id || `AUD-${Date.now().toString().slice(-6)}`;
    const newEntry: AuditLogEntry = {
      id: auditId,
      event: entry.event || 'SYSTEM_ACTION',
      actor: entry.actor || 'SYSTEM',
      itineraryId: entry.itineraryId || 'TRIP-A',
      decisionId: entry.decisionId,
      action: entry.action || '',
      decision: entry.decision,
      reason: entry.reason,
      reasonCodes: entry.reasonCodes,
      confidence: entry.confidence,
      result: entry.result || 'SUCCESS',
      timestamp: new Date().toISOString(),
      metadata: entry.metadata,
    };

    try {
      await setDoc(doc(db, 'audit_logs', auditId), newEntry);
    } catch (err) {
      console.error('Firestore recordAuditEvent error:', err);
    }

    return newEntry;
  },
};
