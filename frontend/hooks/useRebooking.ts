// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useState } from 'react';
import { rebookingService } from '../services/rebookingService';

export function useRebooking() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async (disruptionId: string, alternativeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const idempotencyKey = `REBOOK-${disruptionId}-${alternativeId}-${Date.now()}`;
      const res = await rebookingService.executeRebooking({ disruptionId, alternativeId, idempotencyKey });
      if (res.success) {
        setStatus('CONFIRMED');
        return res.data;
      } else {
        setError(res.error?.message || 'Rebooking failed');
      }
    } catch (err: any) {
      setError(err.message || 'Rebooking request error');
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, status, error };
}
