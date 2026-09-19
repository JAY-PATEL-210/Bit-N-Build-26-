// Owner: Member A (Frontend Lead / Traveler Experience)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Plane,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { DisruptionBanner } from '@/components/traveler/DisruptionBanner';
import { TripTimeline } from '@/components/traveler/TripTimeline';
import { Flight, HotelBooking } from '@/types/index';

export default function DashboardPage() {
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [disruptedFlightId, setDisruptedFlightId] = useState<string | null>(null);

  // Demo Traveler Active Itinerary (Appendix B of Specification)
  const [flights, setFlights] = useState<Flight[]>([
    {
      id: 'FL-001',
      airline: 'Air India',
      flightNumber: 'AI101',
      origin: 'BOM (Mumbai)',
      destination: 'DEL (Delhi)',
      scheduledDeparture: '10 June 2026, 06:00 AM',
      scheduledArrival: '10 June 2026, 08:15 AM',
      status: 'SCHEDULED',
      terminal: '2',
      gate: 'A12',
    },
    {
      id: 'FL-002',
      airline: 'Air India',
      flightNumber: 'AI203',
      origin: 'DEL (Delhi)',
      destination: 'LHR (London)',
      scheduledDeparture: '10 June 2026, 11:00 AM',
      scheduledArrival: '10 June 2026, 03:45 PM',
      status: 'SCHEDULED',
      terminal: '3',
      gate: '14B',
    },
  ]);

  const hotel: HotelBooking = {
    id: 'HTL-001',
    itineraryId: 'TRIP-001',
    hotelName: 'The Landmark London Hotel',
    location: 'Marylebone, London, UK',
    checkIn: '10 June 2026',
    checkOut: '13 June 2026',
    bookingReference: 'HTL-LHR-8891',
    status: 'CONFIRMED',
  };

  const handleSimulateDisruption = () => {
    setSimulationActive(true);
    setDisruptedFlightId('FL-001');
    setFlights((prev) =>
      prev.map((f) => (f.id === 'FL-001' ? { ...f, status: 'CANCELLED' } : f))
    );
  };

  const handleResetSimulation = () => {
    setSimulationActive(false);
    setDisruptedFlightId(null);
    setFlights((prev) =>
      prev.map((f) => (f.id === 'FL-001' ? { ...f, status: 'SCHEDULED' } : f))
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Welcome Header with Protection Shield */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Traveler Operations Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 font-semibold border border-blue-800">
              Trip #TRIP-001
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Welcome back, <strong className="text-slate-200">Demo Traveler</strong>. Autonomous disruption protection is active.
          </p>
        </div>

        {/* Quick Simulation Trigger for Judges */}
        <div className="flex items-center gap-3">
          {!simulationActive ? (
            <Button
              variant="danger"
              onClick={handleSimulateDisruption}
              className="flex items-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Trigger AI101 Cancellation</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleResetSimulation}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Scenario</span>
            </Button>
          )}

          <Link
            href="/trips/TRIP-001"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-slate-700"
          >
            <span>Full Trip</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Disruption Status Banner (Visible when disruption occurs) */}
      {simulationActive && (
        <DisruptionBanner
          disruptionId="DISRUPT-BOM-001"
          tripId="TRIP-001"
          whatHappened="Flight AI101 (Mumbai → Delhi) has been CANCELLED by the carrier."
          whatIsAffected="Leg 2 (AI203 to London) missed connection; London hotel check-in date affected."
          whatIsSystemDoing="Autonomous agent evaluated 4 alternatives, validated policy constraints (₹20k budget), and scheduled auto-rebooking."
          currentStage="REBOOKING"
        />
      )}

      {/* 3. High-level Summary Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Trip Route</span>
          <p className="text-lg font-bold text-slate-100 mt-1">BOM → LHR</p>
          <span className="text-[11px] text-slate-500">1 Layover at DEL</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Disruption Status</span>
          <div className="mt-1">
            <StatusBadge status={simulationActive ? 'CANCELLED' : 'NORMAL'} size="sm" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {simulationActive ? 'Proactive Pipeline Engaged' : 'All legs on schedule'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Next Action</span>
          <p className="text-sm font-semibold text-slate-200 mt-1 truncate">
            {simulationActive ? 'Autonomous Rebooking in progress' : 'Monitoring flight AI101'}
          </p>
          <span className="text-[11px] text-emerald-400">No traveler action required</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Travel Policy Limit</span>
          <p className="text-lg font-bold text-slate-100 mt-1">₹20,000 INR</p>
          <span className="text-[11px] text-indigo-400 font-medium">Auto-rebook authorized</span>
        </Card>
      </section>

      {/* 4. Active Trip Overview & Next Action / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Connected Trip Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-400" />
              <span>Active Trip Graph (Mumbai → London)</span>
            </h2>
            <span className="text-xs text-slate-400">10 June - 13 June 2026</span>
          </div>

          <TripTimeline
            flights={flights}
            hotel={hotel}
            disruptionFlightId={disruptedFlightId || undefined}
          />
        </div>

        {/* Right 1 Col: Next Action & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Autonomous Protection Widget */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-slate-200">Concierge Protection</h3>
              </div>
            }
            className="border-emerald-900/30"
          >
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  Autonomous Rebooking is <strong className="text-emerald-400">ENABLED</strong> within ₹20,000 fare limit and 90m connection buffer.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  Hotel check-in auto-adjustment is <strong className="text-emerald-400">ENABLED</strong>.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <Link href="/settings" className="text-xs text-blue-400 hover:text-blue-300">
                  View Policy Rules →
                </Link>
              </div>
            </div>
          </Card>

          {/* Recent Activity Log */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold text-sm text-slate-200">Recent Operational Activity</h3>
                <span className="text-[11px] text-slate-500">Live feed</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              {simulationActive && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-1">
                  <div className="flex items-center justify-between text-rose-300 font-semibold">
                    <span>Flight Cancellation Detected</span>
                    <span className="text-[10px] text-rose-400 font-mono">Just now</span>
                  </div>
                  <p className="text-slate-300">Carrier notified flight AI101 cancellation. Search triggered.</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Itinerary Graph Synchronized</span>
                  <span className="text-[10px] text-slate-500 font-mono">08:00 AM</span>
                </div>
                <p className="text-slate-400">Connected legs AI101 & AI203 verified with 165m transfer margin.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Hotel Reservation Attached</span>
                  <span className="text-[10px] text-slate-500 font-mono">07:55 AM</span>
                </div>
                <p className="text-slate-400">The Landmark London Hotel verified for June 10 check-in.</p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/activity"
                  className="text-xs text-slate-400 hover:text-slate-200 transition font-medium"
                >
                  View Full Audit Trail →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

