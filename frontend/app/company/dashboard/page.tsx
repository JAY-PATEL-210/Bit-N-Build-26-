'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Route: /company/dashboard - Airline / Company Flight Operations Management
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plane,
  Plus,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Flight } from '@/types/index';
import { flightService } from '@/services/flightService';
import { authService } from '@/services/authService';
import { CancelFlightModal } from '@/components/company/CancelFlightModal';
import { DelayFlightModal } from '@/components/company/DelayFlightModal';
import { AddFlightModal } from '@/components/company/AddFlightModal';

export default function CompanyDashboardPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Feedback notification toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await flightService.getFlights();
      if (response.success && response.data) {
        setFlights(response.data);
      } else {
        setError(response.error?.message || 'Failed to retrieve flights roster.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching flights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleOpenCancel = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsCancelModalOpen(true);
  };

  const handleOpenDelay = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDelayModalOpen(true);
  };

  // Called strictly with the status returned from the backend/service response
  const handleFlightUpdated = (updatedFlight: Flight) => {
    setFlights((prev) =>
      prev.map((f) => (f.id === updatedFlight.id ? updatedFlight : f))
    );
    setFeedback({
      message: `Flight ${updatedFlight.flightNumber} status successfully updated to ${updatedFlight.status} via API response. Disruption reason dispatched to traveler notification stream.`,
      type: updatedFlight.status === 'CANCELLED' ? 'warning' : 'success',
    });
    setTimeout(() => setFeedback(null), 6000);
  };

  const handleFlightCreated = (newFlight: Flight) => {
    setFlights((prev) => [newFlight, ...prev]);
    setFeedback({
      message: `Flight ${newFlight.flightNumber} successfully added to operational schedule.`,
      type: 'success',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Company Flight Operations</span>
          </div>

        </div>

        {/* Header with Title and Add Flight Button */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                Airline Dispatch & Disruption Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Company Mode
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              TravelSync Partner
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Control flight statuses, broadcast delays and cancellations with mandatory operational reasons,
              and trigger autonomous traveler resolution cascades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchFlights}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flight</span>
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
              feedback.type === 'warning'
                ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                : 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'warning' ? (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Operational Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-900/60 border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Total Scheduled</span>
            <div className="text-2xl font-bold text-white mt-1">{flights.length}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Active flights monitored</span>
          </Card>

          <Card className="p-4 bg-slate-900/60 border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Normal / On Time</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {flights.filter((f) => f.status === 'SCHEDULED' || f.status === 'BOARDING' || f.status === 'DEPARTED').length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Operating normally</span>
          </Card>

          <Card className="p-4 bg-slate-900/60 border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Delayed</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {flights.filter((f) => f.status === 'DELAYED').length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Connection risk flagged</span>
          </Card>

          <Card className="p-4 bg-slate-900/60 border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Cancelled</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {flights.filter((f) => f.status === 'CANCELLED').length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Cascades triggered</span>
          </Card>
        </div>

        {/* Flight Table / Card Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Monitored Flights ({flights.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Per-flight row actions: <span className="text-rose-400 font-semibold">[Cancel]</span> and <span className="text-amber-400 font-semibold">[Delay]</span>
            </span>
          </div>

          {loading && flights.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Loading airline flight roster...</span>
            </div>
          ) : flights.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm space-y-3">
              <Plane className="w-8 h-8 mx-auto text-slate-600" />
              <p>No flights currently registered in the company operations database.</p>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                + Register First Flight
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5">Flight Number</th>
                      <th className="px-5 py-3.5">Airline</th>
                      <th className="px-5 py-3.5">Route</th>
                      <th className="px-5 py-3.5">Scheduled Dep / Arr</th>
                      <th className="px-5 py-3.5">Live Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {flights.map((flight) => {
                      const isCancelled = flight.status === 'CANCELLED';
                      const isDelayed = flight.status === 'DELAYED';

                      return (
                        <tr
                          key={flight.id}
                          className="hover:bg-slate-800/40 transition group"
                        >
                          {/* Flight Number */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-mono font-bold">
                                {flight.flightNumber.slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-mono font-bold text-sm text-white block">
                                  {flight.flightNumber}
                                </span>
                                <span className="text-[10px] text-slate-500">ID: {flight.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Airline */}
                          <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-300">
                            {flight.airline}
                          </td>

                          {/* Route */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{flight.origin}</span>
                              <span className="text-slate-500">→</span>
                              <span className="font-bold text-white text-xs">{flight.destination}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {flight.terminal || 'T1'} • {flight.gate || 'Gate TBD'}
                            </span>
                          </td>

                          {/* Scheduled Departure / Arrival */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-mono text-slate-200">
                              {flight.departureTime || flight.scheduledDeparture?.slice(11, 16) || '08:30'}
                              <span className="text-slate-500 mx-1">→</span>
                              {flight.arrivalTime || flight.scheduledArrival?.slice(11, 16) || '10:45'}
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {flight.scheduledDeparture?.slice(0, 10) || '2026-06-10'}
                            </span>
                          </td>

                          {/* Live Status Badge */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={flight.status} size="sm" />
                          </td>

                          {/* Per-flight row actions: [Cancel] [Delay] */}
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={isCancelled}
                                onClick={() => handleOpenDelay(flight)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                  isCancelled
                                    ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800'
                                    : 'bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Delay</span>
                              </button>

                              <button
                                type="button"
                                disabled={isCancelled}
                                onClick={() => handleOpenCancel(flight)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                  isCancelled
                                    ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800'
                                    : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Dialogs */}
        <CancelFlightModal
          flight={selectedFlight}
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onFlightUpdated={handleFlightUpdated}
        />

        <DelayFlightModal
          flight={selectedFlight}
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          onFlightUpdated={handleFlightUpdated}
        />

        <AddFlightModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onFlightCreated={handleFlightCreated}
        />
      </div>
    </div>
  );
}
