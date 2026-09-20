// Owner: Member B (Frontend Systems / Interaction & Demo)
import React, { useState } from 'react';
import { PlusCircle, Loader2, X, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/index';
import { flightService } from '@/services/flightService';

interface AddFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlightCreated: (newFlight: Flight) => void;
}

export const AddFlightModal: React.FC<AddFlightModalProps> = ({
  isOpen,
  onClose,
  onFlightCreated,
}) => {
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('Air India');
  const [origin, setOrigin] = useState('BOM');
  const [destination, setDestination] = useState('DEL');
  const [scheduledDeparture, setScheduledDeparture] = useState('2026-06-12T09:00');
  const [scheduledArrival, setScheduledArrival] = useState('2026-06-12T11:15');
  const [terminal, setTerminal] = useState('Terminal 2');
  const [gate, setGate] = useState('Gate 24');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flightNumber.trim() || !origin.trim() || !destination.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await flightService.createFlight({
        flightNumber: flightNumber.trim().toUpperCase(),
        airline: airline.trim(),
        origin: origin.trim().toUpperCase(),
        destination: destination.trim().toUpperCase(),
        scheduledDeparture: new Date(scheduledDeparture).toISOString(),
        scheduledArrival: new Date(scheduledArrival).toISOString(),
        terminal: terminal.trim() || 'Terminal 1',
        gate: gate.trim() || 'Gate TBD',
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Failed to create flight.');
        setLoading(false);
        return;
      }

      onFlightCreated(response.data);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while adding flight.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-blue-950/30">
          <div className="flex items-center gap-2 text-blue-400">
            <PlusCircle className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Register New Scheduled Flight</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Flight Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI440"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Airline Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Air India"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Origin IATA <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="BOM"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destination IATA <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="DEL"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scheduled Departure <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDeparture}
                onChange={(e) => setScheduledDeparture(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scheduled Arrival <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledArrival}
                onChange={(e) => setScheduledArrival(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Terminal
              </label>
              <input
                type="text"
                placeholder="Terminal 2"
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gate
              </label>
              <input
                type="text"
                placeholder="Gate 14B"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plane className="w-3.5 h-3.5" />
                  <span>Publish Flight</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
