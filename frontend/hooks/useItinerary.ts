// Owner: Member B (Frontend Systems / Interaction & Demo)
import { useState, useEffect, useCallback } from 'react';
import { itineraryService } from '../services/itineraryService';
import { Itinerary } from '../types/itinerary';

export function useItinerary(itineraryId?: string) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItinerary = useCallback(async () => {
    if (!itineraryId) return;
    setLoading(true);
    try {
      const res = await itineraryService.getItineraryById(itineraryId);
      if (res.success && res.data) {
        setItinerary(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch itinerary');
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    fetchItinerary();
  }, [fetchItinerary]);

  return { itinerary, loading, error, refetch: fetchItinerary };
}
