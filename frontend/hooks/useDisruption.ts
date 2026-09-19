// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useState, useEffect, useCallback } from 'react';
import { Disruption, AlternativeFlight } from '../types';
import { disruptionService } from '../services/disruptionService';

export function useDisruption(disruptionId: string = 'DISRUPT-001') {
  const [disruption, setDisruption] = useState<Disruption | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeFlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisruptionData = useCallback(async () => {
    const id = disruptionId || 'DISRUPT-001';
    setIsLoading(true);
    setError(null);
    try {
      const [disruptionRes, altRes] = await Promise.all([
        disruptionService.getDisruptionById(id),
        disruptionService.getAlternatives(id),
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

  const simulateEvent = async (scenario: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = disruptionId || 'DISRUPT-001';
      const eventType =
        scenario === 'CANCELLATION'
          ? 'FLIGHT_CANCELLED'
          : scenario === 'DELAY'
          ? 'FLIGHT_DELAYED'
          : scenario === 'MISSED_CONNECTION'
          ? 'MISSED_CONNECTION'
          : scenario === 'BOOKING_FAILURE'
          ? 'BOOKING_FAILURE'
          : 'NORMAL';

      const res = await disruptionService.simulateDisruption({
        eventType,
        flightId: 'AI101',
        itineraryId: 'TRIP-001',
      });

      if (res.success && res.data) {
        setDisruption(res.data);
      }
      const altRes = await disruptionService.getAlternatives(id);
      if (altRes.success && altRes.data) {
        setAlternatives(altRes.data);
      }
    } catch (e: any) {
      setError(e.message || 'Simulation trigger failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    disruption,
    alternatives,
    isLoading,
    error,
    refresh: fetchDisruptionData,
    simulateEvent,
    setDisruption,
  };
}
