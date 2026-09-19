// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useState, useEffect, useCallback } from 'react';
import { Disruption, AlternativeFlight } from '../types';
import { disruptionService } from '../services/disruptionService';

export function useDisruption(disruptionId?: string) {
  const [disruption, setDisruption] = useState<Disruption | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeFlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisruptionData = useCallback(async () => {
    if (!disruptionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [disruptionRes, altRes] = await Promise.all([
        disruptionService.getDisruptionById(disruptionId),
        disruptionService.getAlternatives(disruptionId),
      ]);

      if (disruptionRes.success && disruptionRes.data) {
        setDisruption(disruptionRes.data);
      }
      if (altRes.success && altRes.data) {
        setAlternatives(altRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch disruption data');
    } finally {
      setIsLoading(false);
    }
  }, [disruptionId]);

  useEffect(() => {
    fetchDisruptionData();
  }, [fetchDisruptionData]);

  return {
    disruption,
    alternatives,
    isLoading,
    error,
    refresh: fetchDisruptionData,
  };
}
