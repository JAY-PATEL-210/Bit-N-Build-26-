'use client';

// Owner: Member A (Frontend Lead / Traveler Experience) & Member B (Interaction & Demo)
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Zap } from 'lucide-react';
import { TripTimeline } from '@/components/trips/TripTimeline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useItinerary } from '@/hooks/useItinerary';
import { Flight, HotelBooking } from '@/types/index';

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const { itinerary, loading, error, refetch } = useItinerary(params.id);
  const [isCancelled, setIsCancelled] = useState(false);

  const fallbackFlights: Flight[] = [
    {
      id: 'FL-001',
      airline: 'Air India',
      flightNumber: 'AI101',
      origin: 'BOM',
      destination: 'DEL',
      scheduledDeparture: '2026-06-10T08:30:00Z',
      scheduledArrival: '2026-06-10T10:45:00Z',
      status: isCancelled ? 'CANCELLED' : 'SCHEDULED',
      terminal: 'Terminal 2',
      gate: 'Gate 42B',
    },
    {
      id: 'FL-002',
      airline: 'Air India',
      flightNumber: 'AI203',
      origin: 'DEL',
      destination: 'LHR',
      scheduledDeparture: '2026-06-10T13:45:00Z',
      scheduledArrival: '2026-06-10T18:30:00Z',
      status: isCancelled ? 'DELAYED' : 'SCHEDULED',
      terminal: 'Terminal 3',
      gate: 'Gate 18',
    },
  ];

  const fallbackHotel: HotelBooking = {
    id: 'HTL-001',
    itineraryId: params.id || 'TRIP-001',
    hotelName: 'The Landmark London Hotel',
    location: 'Marylebone, London, UK',
    checkIn: isCancelled ? '11 June 2026' : '10 June 2026',
    checkOut: '13 June 2026',
    bookingReference: 'HTL-LHR-8891',
    status: 'CONFIRMED',
    pricePerNight: 7500,
    currency: 'INR',
  };

  const trip = itinerary || {
    id: params.id || 'TRIP-001',
    userId: 'USER-DEMO-01',
    tripName: 'Business Travel: Mumbai to London',
    startDate: '2026-06-10',
    endDate: '2026-06-13',
    status: 'ACTIVE',
    flights: fallbackFlights,
    hotel: fallbackHotel,
  };

  const hasCancelledFlight = isCancelled || (trip.flights || []).some((f) => f.status === 'CANCELLED');

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Trip: Mumbai → London
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {trip.id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Comprehensive connected journey graph with automated disruption guardian.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isCancelled ? 'secondary' : 'danger'}
            onClick={() => setIsCancelled(!isCancelled)}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{isCancelled ? 'Restore Normal State' : 'Simulate Flight Cancellation'}</span>
          </Button>
          <button
            onClick={refetch}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-xs"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Travel Route
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-bold text-white">Mumbai</span>
            <span className="text-slate-500">→</span>
            <span className="text-xl font-bold text-white">Delhi</span>
            <span className="text-slate-500">→</span>
            <span className="text-xl font-bold text-white">London</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Total Distance: 4,480 mi • 2 Segments • 1 Hotel
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Trip Window
          </span>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-base font-bold text-slate-100">{trip.startDate} - {trip.endDate}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            3 Nights London accommodation synchronized
          </p>
        </Card>

        <Card className="p-5 border-emerald-900/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Concierge Sentinel Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={hasCancelledFlight ? 'CANCELLED' : 'NORMAL'} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {hasCancelledFlight
              ? 'Disruption detected on leg 1. Alternatives ready.'
              : 'Flight telemetry actively monitored.'}
          </p>
        </Card>
      </div>

      {/* Disruption Alert if Disrupted */}
      {hasCancelledFlight && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border border-red-800/80 shadow-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-red-300 uppercase">
                DISRUPTION ACTIVE ON LEG 1
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Flight AI101 Cancelled by Airline</h3>
            <p className="text-xs text-slate-300">
              Autonomous replanning engine has calculated replacement routes and verified policy.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/disruptions/DISRUPT-001"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Disruption View
            </Link>
            <Link
              href="/alternatives/DISRUPT-001"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition"
            >
              View Alternatives →
            </Link>
          </div>
        </div>
      )}

      {/* Connected Graph Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-100">
            Connected Itinerary Milestones
          </h2>
          <span className="text-xs text-slate-400">
            Graph nodes dynamically evaluate dependencies
          </span>
        </div>

        <TripTimeline
          flights={isCancelled ? fallbackFlights : (trip.flights || [])}
          hotel={trip.hotel}
          isDisrupted={hasCancelledFlight}
        />
      </div>
    </div>
  );
}
