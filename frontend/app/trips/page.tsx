'use client';

// Owner: Member A (Frontend Lead / Traveler Experience)
// Section 12 & 51: Traveler Itineraries Overview Page
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Itinerary } from '../../types';
import { itineraryService } from '../../services/itineraryService';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';

export default function TripsPage() {
  const [trips, setTrips] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await itineraryService.getItineraries();
      if (res.success && res.data) {
        setTrips(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">My Trips</span>
          </div>

          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
              FR-02 Itinerary Management
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Traveler Itineraries</h1>
            <p className="text-slate-400 text-sm mt-1">
              Active and upcoming journeys actively monitored by the autonomous concierge.
            </p>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm">Loading itineraries...</div>
        ) : trips.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
            No trips configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => {
              const flights = trip.flights || [];
              const origin = flights[0]?.origin || 'BOM';
              const destination = flights[flights.length - 1]?.destination || 'LHR';

              return (
                <Card
                  key={trip.id}
                  title={trip.tripName}
                  subtitle={`Trip ID: ${trip.id} • ${trip.startDate} to ${trip.endDate}`}
                  badge={<StatusBadge status={trip.status} />}
                  action={
                    <Link
                      href={`/trips/${trip.id}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                    >
                      View Trip Timeline →
                    </Link>
                  }
                >
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Origin</span>
                        <span className="text-xl font-bold text-white">{origin}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">{flights.length} Flight Leg(s)</span>
                        <div className="w-24 h-0.5 bg-slate-700 relative my-1">
                          <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {trip.hotel ? '🏨 Hotel Booked' : 'Flight Only'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Destination</span>
                        <span className="text-xl font-bold text-white">{destination}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                      <span>Flights: {flights.map((f) => f.flightNumber).join(' → ')}</span>
                      {trip.hotel && <span>{trip.hotel.hotelName}</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
