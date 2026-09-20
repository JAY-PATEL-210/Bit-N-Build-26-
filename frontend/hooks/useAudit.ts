// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry } from '../types';
import { auditService } from '../services/auditService';

export function useAudit(itineraryId: string) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    if (!itineraryId) return;
    try {
      const res = await auditService.getAuditTrail(itineraryId);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit log trail');
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  };
}
