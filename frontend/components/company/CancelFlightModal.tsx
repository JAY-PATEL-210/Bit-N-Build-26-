// Owner: Member B (Frontend Systems / Interaction & Demo)
import React, { useState } from 'react';
import { XCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/index';
import { flightService } from '@/services/flightService';

interface CancelFlightModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onFlightUpdated: (updatedFlight: Flight) => void;
}

export const CancelFlightModal: React.FC<CancelFlightModalProps> = ({
  flight,
  isOpen,
  onClose,
  onFlightUpdated,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !flight) return null;

  const isSubmitDisabled = !reason.trim() || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for the cancellation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send cancellation request with reason to flightService
      const response = await flightService.cancelFlight(flight.id, {
        reason: reason.trim(),
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Failed to cancel flight. API returned an error.');
        setLoading(false);
        return;
      }

      // Reflect the actual returned status from backend response
      onFlightUpdated(response.data);
      setReason('');
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
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-rose-950/30">
          <div className="flex items-center gap-2 text-rose-400">
            <XCircle className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Cancel Flight {flight.flightNumber}</h3>
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
              <span className="text-slate-400 block font-medium">Route & Carrier</span>
              <span className="text-white font-bold text-sm">
                {flight.airline} • {flight.origin} → {flight.destination}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Scheduled</span>
              <span className="text-slate-200 font-mono">
                {flight.departureTime || flight.scheduledDeparture.slice(11, 16)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              This will broadcast a disruption event to all booked travelers. Your stated reason will be directly displayed in traveler notification centers and audit logs.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Reason for cancellation <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Unscheduled engine maintenance inspection at Terminal 2 gate; parts awaiting dispatch."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition resize-none"
            />
            <span className="text-[11px] text-slate-500 block">
              Required field. A non-empty operational reason is required before cancellation can be submitted.
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
              Back / Dismiss
            </Button>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Cancellation...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
