// Owner: Member B (Frontend Systems / Interaction & Demo)
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/index';
import { flightService } from '@/services/flightService';

interface DelayFlightModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onFlightUpdated: (updatedFlight: Flight) => void;
}

export const DelayFlightModal: React.FC<DelayFlightModalProps> = ({
  flight,
  isOpen,
  onClose,
  onFlightUpdated,
}) => {
  const [newDepartureTime, setNewDepartureTime] = useState('');
  const [newArrivalTime, setNewArrivalTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flight) {
      // Initialize with existing or default delayed times
      const depDate = flight.scheduledDeparture ? new Date(flight.scheduledDeparture) : new Date();
      depDate.setHours(depDate.getHours() + 2); // default +2 hours
      const arrDate = flight.scheduledArrival ? new Date(flight.scheduledArrival) : new Date();
      arrDate.setHours(arrDate.getHours() + 2);

      setNewDepartureTime(depDate.toISOString().slice(0, 16));
      setNewArrivalTime(arrDate.toISOString().slice(0, 16));
      setReason('');
      setError(null);
    }
  }, [flight]);

  if (!isOpen || !flight) return null;

  const isSubmitDisabled = !reason.trim() || !newDepartureTime || !newArrivalTime || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for the delay.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await flightService.delayFlight(flight.id, {
        reason: reason.trim(),
        newDepartureTime: new Date(newDepartureTime).toISOString(),
        newArrivalTime: new Date(newArrivalTime).toISOString(),
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Failed to delay flight. API returned an error.');
        setLoading(false);
        return;
      }

      onFlightUpdated(response.data);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-amber-950/30">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Schedule Delay for {flight.flightNumber}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Route & Airline</span>
              <span className="text-white font-bold text-sm">
                {flight.airline} • {flight.origin} → {flight.destination}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Original Departure</span>
              <span className="text-slate-300 font-mono">
                {flight.scheduledDeparture.slice(11, 16)} UTC
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Datetime Inputs for New Estimated Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Estimated Departure <span className="text-amber-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={newDepartureTime}
                onChange={(e) => setNewDepartureTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Estimated Arrival <span className="text-amber-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={newArrivalTime}
                onChange={(e) => setNewArrivalTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Reason for delay <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Air traffic control slot constraints and severe thunderstorm weather over Delhi corridor."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition resize-none"
            />
            <span className="text-[11px] text-slate-500 block">
              Required. This reason will be broadcast to downstream concierge agents and traveler notifications.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Schedule...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Confirm Flight Delay</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
