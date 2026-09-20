'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
import React, { useState } from 'react';
import Link from 'next/link';
import { DemoControls } from '@/components/simulation/DemoControls';
import { HotelModificationCard } from '@/components/hotel/HotelModificationCard';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { TripTimeline } from '@/components/trips/TripTimeline';
import { Flight, HotelBooking } from '@/types/index';


export default function DashboardPage() {
  const [activeScenario, setActiveScenario] = useState<string>('NORMAL');
  const [tripStatus, setTripStatus] = useState<string>('NORMAL');
  const [hasDisruption, setHasDisruption] = useState<boolean>(false);

  const [flights, setFlights] = useState<Flight[]>([
    {
      id: 'FLIGHT-101',
      airline: 'Air India',
      flightNumber: 'AI101',
      origin: 'BOM',
      destination: 'DEL',
      scheduledDeparture: '2026-06-10T08:30:00Z',
      scheduledArrival: '2026-06-10T10:45:00Z',
      estimatedDeparture: '2026-06-10T08:30:00Z',
      estimatedArrival: '2026-06-10T10:45:00Z',
      status: 'SCHEDULED',
      terminal: 'Terminal 2',
      gate: 'Gate 42B',
    },
    {
      id: 'FLIGHT-203',
      airline: 'Air India',
      flightNumber: 'AI203',
      origin: 'DEL',
      destination: 'LHR',
      scheduledDeparture: '2026-06-10T13:45:00Z',
      scheduledArrival: '2026-06-10T18:30:00Z',
      estimatedDeparture: '2026-06-10T13:45:00Z',
      estimatedArrival: '2026-06-10T18:30:00Z',
      status: 'SCHEDULED',
      terminal: 'Terminal 3',
      gate: 'Gate 18',
    },
  ]);

  const hotel: HotelBooking = {
    id: 'HOTEL-LON-001',
    itineraryId: 'TRIP-001',
    hotelName: 'The Landmark London Hotel',
    location: 'Marylebone, London, UK',
    checkIn: '2026-06-10',
    checkOut: '2026-06-13',
    bookingReference: 'HTL-LON-9921',
    status: 'CONFIRMED',
    originalCheckIn: '2026-06-10',
    pricePerNight: 7500,
    currency: 'INR',
  };

  const handleSimulate = (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'CANCELLATION') {
      setTripStatus('CANCELLED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f) =>
          f.id === 'FLIGHT-101' ? { ...f, status: 'CANCELLED' } : { ...f, status: 'DELAYED' }
        )
      );
    } else if (scenario === 'DELAY') {
      setTripStatus('DELAYED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f) =>
          f.id === 'FLIGHT-101' ? { ...f, status: 'DELAYED' } : f
        )
      );
    } else if (scenario === 'MISSED_CONNECTION') {
      setTripStatus('APPROVAL_REQUIRED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f) =>
          f.id === 'FLIGHT-101' ? { ...f, status: 'DELAYED' } : { ...f, status: 'CANCELLED' }
        )
      );
    } else if (scenario === 'BOOKING_FAILURE') {
      setTripStatus('FAILED');
      setHasDisruption(true);
    } else {
      setTripStatus('NORMAL');
      setHasDisruption(false);
      setFlights((prev) =>
        prev.map((f) => ({ ...f, status: 'SCHEDULED' }))
      );
    }
  };

  const recentActivities = [
    {
      time: '08:05 AM',
      actor: 'SYSTEM',
      event: hasDisruption ? 'REBOOKING_CONFIRMED' : 'FLIGHT_MONITORED',
      desc: hasDisruption
        ? 'Rebooked onto Flight AI203 and adjusted London hotel check-in.'
        : 'Continuous radar ping: All flights on schedule.',
    },
    {
      time: '08:00 AM',
      actor: hasDisruption ? 'AI_AGENT' : 'SYSTEM',
      event: hasDisruption ? 'DISRUPTION_DETECTED' : 'ITINERARY_LOADED',
      desc: hasDisruption
        ? 'Signal received: AI101 status changed to CANCELLED. Evaluated 4 alternatives.'
        : 'Itinerary TRIP-001 initialized for live autonomous protection.',
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
              Personal Concierge
            </span>
            <StatusBadge status={tripStatus} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Your travel operations concierge is actively monitoring your connected journey.
          </p>
        </div>


      </div>

      {/* Demo Controls for Hackathon Judges (Section 33) */}
      <DemoControls onSimulate={handleSimulate} currentScenario={activeScenario} />

      {/* Disruption Alert Banner (Section 12: Disruption Status) */}
      {hasDisruption && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-slate-900/90 border border-red-700/80 shadow-[0_0_35px_-5px_rgba(239,68,68,0.3)] backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 illusion-shimmer opacity-30 pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-ping"></span>
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-red-300">
                ACTIVE TRAVEL DISRUPTION DETECTED
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Flight AI101 Mumbai → Delhi Cancelled
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Downstream connection AI203 (Delhi → London) is infeasible. The AI decision agent has
              filtered 4 candidate routes against your ₹20,000 corporate policy.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/disruptions/DISRUPT-001">
              <Button variant="secondary" size="md">
                Disruption Analysis
              </Button>
            </Link>
            <Link href="/alternatives/DISRUPT-001">
              <Button variant="emerald" size="md" className="gap-1.5">
                <span>⚡</span> Review Alternatives & Rebook →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* High-level Summary Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Trip Route</span>
          <p className="text-lg font-bold text-slate-100 mt-1">BOM → LHR</p>
          <span className="text-[11px] text-slate-500">1 Layover at DEL</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Disruption Status</span>
          <div className="mt-1">
            <StatusBadge status={hasDisruption ? 'CANCELLED' : 'NORMAL'} size="sm" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {hasDisruption ? 'Proactive Pipeline Engaged' : 'All legs on schedule'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Next Action</span>
          <p className="text-sm font-semibold text-slate-200 mt-1 truncate">
            {hasDisruption ? 'Review AI Replacement Flight' : 'Monitoring flight AI101'}
          </p>
          <span className="text-[11px] text-emerald-400">Autonomous protection active</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Travel Policy Limit</span>
          <p className="text-lg font-bold text-slate-100 mt-1">₹20,000 INR</p>
          <span className="text-[11px] text-indigo-400 font-medium">Auto-rebook authorized</span>
        </Card>
      </section>

      {/* Active Trip Overview & Next Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Connected Trip Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Connected Trip Timeline (Mumbai → London)</span>
            </h2>
            <Link href="/trips/TRIP-001" className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline">
              View Full Timeline →
            </Link>
          </div>

          <TripTimeline
            flights={flights}
            hotel={hotel}
            isDisrupted={hasDisruption}
          />
        </div>

        {/* Right 1 Col: Next Action & Policy Status */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Next Action & Protection
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                Next Required Action
              </span>
              <p className="text-white font-semibold">
                {hasDisruption
                  ? 'Review AI Recommended Replacement Flight'
                  : 'Boarding Gate 42B Opens at 07:45 AM'}
              </p>
              <p className="text-slate-400 text-[11px]">
                {hasDisruption
                  ? 'AI203 selected within ₹20,000 limit. Ready for one-click rebooking.'
                  : 'Autonomous monitoring active. No manual intervention required.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                Corporate Policy Limits
              </span>
              <p className="text-slate-300">Max Rebooking Fare: <strong className="text-white">₹20,000</strong></p>
              <p className="text-slate-300">Min Layover Buffer: <strong className="text-white">90 min</strong></p>
            </div>
          </div>

          <Link href="/settings" className="block pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              Edit Travel Policies & Permissions
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Recent Concierge Activity</h2>
          <Link href="/activity" className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold">
            View Complete Audit Trail →
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentActivities.map((act, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {act.actor}
                </span>
                <span className="font-bold text-white font-mono">{act.event}</span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-300">{act.desc}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Downstream Hotel Reservation Status */}
      <HotelModificationCard isFlightRebooked={hasDisruption} />
    </div>
  );
}
