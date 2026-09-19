// Owner: Member A (Frontend Lead / Traveler Experience)
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Luggage,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TripTimeline } from '@/components/traveler/TripTimeline';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Flight, HotelBooking } from '@/types/index';

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const [isCancelled, setIsCancelled] = useState(false);

  const flights: Flight[] = [
    {
      id: 'FL-001',
      airline: 'Air India',
      flightNumber: 'AI101',
      origin: 'BOM (Mumbai, Chhatrapati Shivaji Maharaj T2)',
      destination: 'DEL (Delhi, Indira Gandhi International T3)',
      scheduledDeparture: '10 June 2026, 06:00 AM',
      scheduledArrival: '10 June 2026, 08:15 AM',
      status: isCancelled ? 'CANCELLED' : 'SCHEDULED',
      terminal: '2',
      gate: 'A12',
    },
    {
      id: 'FL-002',
      airline: 'Air India',
      flightNumber: 'AI203',
      origin: 'DEL (Delhi, Indira Gandhi International T3)',
      destination: 'LHR (London Heathrow T2)',
      scheduledDeparture: '10 June 2026, 11:00 AM',
      scheduledArrival: '10 June 2026, 03:45 PM',
      status: 'SCHEDULED',
      terminal: '3',
      gate: '14B',
    },
  ];

  const hotel: HotelBooking = {
    id: 'HTL-001',
    itineraryId: params.id || 'TRIP-001',
    hotelName: 'The Landmark London Hotel',
    location: '222 Marylebone Rd, London NW1 6JQ, United Kingdom',
    checkIn: isCancelled ? '11 June 2026 (Auto-adjusted)' : '10 June 2026',
    checkOut: '13 June 2026',
    bookingReference: 'HTL-LHR-8891',
    status: 'CONFIRMED',
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Navigation and Top Actions */}
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
                {params.id}
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
            <span className="text-base font-bold text-slate-100">10 June - 13 June 2026</span>
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
            <StatusBadge status={isCancelled ? 'CANCELLED' : 'NORMAL'} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isCancelled
              ? 'Disruption detected on leg 1. Alternatives ready.'
              : 'Flight telemetry actively monitored.'}
          </p>
        </Card>
      </div>

      {/* Connected Graph Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">
            Connected Itinerary Milestones
          </h2>
          <span className="text-xs text-slate-400">
            Graph nodes dynamically evaluate dependencies
          </span>
        </div>

        <TripTimeline
          flights={flights}
          hotel={hotel}
          disruptionFlightId={isCancelled ? 'FL-001' : undefined}
        />
      </div>
    </div>
  );
}

