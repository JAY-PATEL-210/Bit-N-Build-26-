'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /dashboard — Traveler dashboard connected to Firebase Firestore
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DemoControls } from '@/components/simulation/DemoControls';
import { HotelModificationCard } from '@/components/hotel/HotelModificationCard';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { TripTimeline } from '@/components/trips/TripTimeline';
import { Flight, HotelBooking, Disruption } from '@/types/index';
import { RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';
import { itineraryService } from '@/services/itineraryService';
import { disruptionService } from '@/services/disruptionService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


export default function DashboardPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState<string>('NORMAL');
  const [tripStatus, setTripStatus] = useState<string>('NORMAL');
  const [hasDisruption, setHasDisruption] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [latestDisruptionId, setLatestDisruptionId] = useState<string>('DISRUPT-001');

  const [itineraryId, setItineraryId] = useState<string>('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotel, setHotel] = useState<HotelBooking | null>(null);

  // USER-to-TRIP mapping: maps the seeded Firestore user IDs to their trip IDs
  const USER_TRIP_MAP: Record<string, string> = {
    'traveler.ahmedabad@routepilot.com': 'TRIP-A',
    'traveler.mumbai@routepilot.com': 'TRIP-B',
    'traveler.delhi@routepilot.com': 'TRIP-C',
    'traveler.bangalore@routepilot.com': 'TRIP-D',
  };

  // Fetch real data from Firestore via itineraryService
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const user = authService.getCurrentUser();

      // 1. Determine itinerary ID for the logged-in traveler
      let itinId = '';
      if (user?.email) {
        const normalizedEmail = user.email.trim().toLowerCase();
        // Check the email-to-trip map first
        if (USER_TRIP_MAP[normalizedEmail]) {
          itinId = USER_TRIP_MAP[normalizedEmail];
        }
      }

      // 2. Load itinerary from Firestore
      let itinData: any = null;
      if (itinId) {
        const detailRes = await itineraryService.getItineraryById(itinId);
        if (detailRes.success && detailRes.data) {
          itinData = detailRes.data;
        }
      }

      // 3. If no itinerary found by ID, try fetching all and picking the first one
      if (!itinData) {
        const allRes = await itineraryService.getItineraries();
        if (allRes.success && allRes.data && allRes.data.length > 0) {
          itinData = allRes.data[0];
          itinId = itinData.id;
        }
      }

      if (itinData) {
        setItineraryId(itinData.id);

        // 4. Map flights
        if (itinData.flights && itinData.flights.length > 0) {
          const mappedFlights: Flight[] = itinData.flights.map((f: any) => ({
            id: f.id,
            airline: f.airline || 'Demo Airlines',
            flightNumber: f.flightNumber || '',
            origin: f.origin || '',
            destination: f.destination || '',
            scheduledDeparture: f.scheduledDeparture || '',
            scheduledArrival: f.scheduledArrival || '',
            estimatedDeparture: f.estimatedDeparture || f.scheduledDeparture,
            estimatedArrival: f.estimatedArrival || f.scheduledArrival,
            status: f.status || 'SCHEDULED',
            terminal: f.terminal || 'T1',
            gate: f.gate || 'Gate TBD',
          }));
          setFlights(mappedFlights);
        }

        // 5. Map hotel
        if (itinData.hotel) {
          const h = itinData.hotel;
          setHotel({
            id: h.id || `HTL-${itinId}`,
            itineraryId: itinData.id,
            hotelName: h.hotelName || '',
            location: h.location || '',
            checkIn: h.checkIn?.split('T')[0] || '',
            checkOut: h.checkOut?.split('T')[0] || '',
            bookingReference: h.bookingReference || 'HTL-REF',
            status: h.status || 'CONFIRMED',
            originalCheckIn: h.checkIn?.split('T')[0],
            pricePerNight: h.price ? Math.round(h.price / 3) : 7500,
            currency: h.currency || 'INR',
          });
        }
      } else {
        // Fallback: show hardcoded demo data so the UI is never empty
        setItineraryId('TRIP-A');
        setFlights([
          {
            id: 'FLT-TRIP-A-1',
            airline: 'IndiGo',
            flightNumber: '6E101',
            origin: 'AMD',
            destination: 'DEL',
            scheduledDeparture: '2026-11-15T10:00:00Z',
            scheduledArrival: '2026-11-15T12:30:00Z',
            estimatedDeparture: '2026-11-15T10:00:00Z',
            estimatedArrival: '2026-11-15T12:30:00Z',
            status: 'CANCELLED',
            terminal: 'T1',
            gate: 'G10',
          },
        ]);
      }

      // 6. Check for active disruptions in Firestore
      try {
        const disRes = await disruptionService.getDisruptions();
        if (disRes.success && disRes.data && disRes.data.length > 0) {
          const myDisruptions = disRes.data.filter(
            (d: any) => d.itineraryId === (itinId || itinData?.id)
          );
          if (myDisruptions.length > 0) {
            const latest = myDisruptions[myDisruptions.length - 1];
            setLatestDisruptionId(latest.id);
          }
        }
      } catch {
        // Disruptions are optional — ignore errors
      }
    } catch (err) {
      console.error('Dashboard: Error loading Firestore data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSimulate = async (scenario: string) => {
    setActiveScenario(scenario);

    if (scenario === 'NORMAL') {
      // Reset: reload fresh data
      setTripStatus('NORMAL');
      setHasDisruption(false);
      await fetchDashboardData();
      return;
    }

    // Try to trigger disruption via backend API
    try {
      const eventType = scenario === 'DELAY' ? 'DELAY' : 'CANCELLATION';
      const res = await fetch(`${API_BASE}/api/disruptions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          flightId: flights.length > 0 ? flights[0].id : '',
          itineraryId: itineraryId,
          delayMinutes: scenario === 'DELAY' ? 180 : 0,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLatestDisruptionId(json.data.disruptionId || json.data.id || 'DISRUPT-001');
        }
      }
    } catch {
      // API unavailable, proceed with client-side simulation
    }

    // Update local state regardless
    if (scenario === 'CANCELLATION') {
      setTripStatus('CANCELLED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f, idx) =>
          idx === 0 ? { ...f, status: 'CANCELLED' } : { ...f, status: 'DELAYED' }
        )
      );
    } else if (scenario === 'DELAY') {
      setTripStatus('DELAYED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f, idx) =>
          idx === 0 ? { ...f, status: 'DELAYED' } : f
        )
      );
    } else if (scenario === 'MISSED_CONNECTION') {
      setTripStatus('APPROVAL_REQUIRED');
      setHasDisruption(true);
      setFlights((prev) =>
        prev.map((f, idx) =>
          idx === 0 ? { ...f, status: 'DELAYED' } : { ...f, status: 'CANCELLED' }
        )
      );
    } else if (scenario === 'BOOKING_FAILURE') {
      setTripStatus('FAILED');
      setHasDisruption(true);
    }
  };

  const recentActivities = [
    {
      time: '08:05 AM',
      actor: 'SYSTEM',
      event: hasDisruption ? 'REBOOKING_CONFIRMED' : 'FLIGHT_MONITORED',
      desc: hasDisruption
        ? 'Rebooked and adjusted hotel check-in.'
        : 'Continuous radar ping: All flights on schedule.',
    },
    {
      time: '08:00 AM',
      actor: hasDisruption ? 'AI_AGENT' : 'SYSTEM',
      event: hasDisruption ? 'DISRUPTION_DETECTED' : 'ITINERARY_LOADED',
      desc: hasDisruption
        ? `Signal received: ${flights.length > 0 ? flights[0].flightNumber : 'Flight'} status changed to CANCELLED. Evaluated alternatives.`
        : `Itinerary ${itineraryId || 'TRIP'} initialized for live autonomous protection.`,
    },
  ];

  if (loading && flights.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs font-mono">Loading your trip data...</span>
        </div>
      </div>
    );
  }

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

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Demo Controls for Hackathon Judges (Section 33) */}
      <DemoControls onSimulate={handleSimulate} currentScenario={activeScenario} />

      {/* Disruption Alert Banner (Section 12: Disruption Status) */}
      {hasDisruption && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-slate-900/90 border border-rose-700/80 shadow-[0_0_35px_-5px_rgba(244,63,94,0.3)] backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 illusion-shimmer opacity-30 pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-ping"></span>
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-rose-300">
                ACTIVE TRAVEL DISRUPTION DETECTED
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Flight {flights.length > 0 ? flights[0].flightNumber : ''} {tripStatus === 'DELAYED' ? 'Delayed' : 'Cancelled'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {tripStatus === 'DELAYED' 
                ? 'Severe delay detected. Downstream connection may be impacted. The AI decision agent is monitoring alternatives.'
                : 'Downstream connection may be infeasible. The AI decision agent has filtered candidate routes against your corporate policy.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" size="md" onClick={() => router.push(`/disruptions/${latestDisruptionId}`)}>
              Disruption Analysis
            </Button>
            <Button variant="success" size="md" className="gap-1.5 shadow-md shadow-emerald-950/40" onClick={() => router.push(`/alternatives/${latestDisruptionId}`)}>
              <span>⚡</span> Review Alternatives & Rebook →
            </Button>
          </div>
        </div>
      )}

      {/* High-level Summary Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Trip Route</span>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {flights.length >= 2
              ? `${flights[0].origin} → ${flights[flights.length - 1].destination}`
              : flights.length === 1 
              ? `${flights[0].origin} → ${flights[0].destination}` 
              : 'Unknown Route'}
          </p>
          <span className="text-[11px] text-slate-500">
            {flights.length > 1 ? `${flights.length - 1} Layover${flights.length > 2 ? 's' : ''}` : 'Direct'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Disruption Status</span>
          <div className="mt-1">
            <StatusBadge status={hasDisruption ? tripStatus : 'NORMAL'} size="sm" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {hasDisruption ? 'Proactive Pipeline Engaged' : 'All legs on schedule'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Next Action</span>
          <p className="text-sm font-semibold text-slate-200 mt-1 truncate">
            {hasDisruption ? 'Review AI Replacement Flight' : `Monitoring flight ${flights.length > 0 ? flights[0].flightNumber : ''}`}
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
              <span>Connected Trip Timeline ({flights.length >= 2 ? `${flights[0].origin} → ${flights[flights.length - 1].destination}` : flights.length === 1 ? `${flights[0].origin} → ${flights[0].destination}` : 'Direct Flight'})</span>
            </h2>
            <Link href={`/trips/${itineraryId}`} className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline">
              View Full Timeline →
            </Link>
          </div>

          <TripTimeline
            flights={flights}
            hotel={hotel as HotelBooking}
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
                  ? 'Alternative selected within limit. Ready for one-click rebooking.'
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
          {recentActivities.map((act, i) => {
            const isAI = act.actor === 'AI_AGENT';
            const isSystem = act.actor === 'SYSTEM';

            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isAI
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : isSystem
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {act.actor}
                  </span>
                  <span className="font-bold text-white font-mono">{act.event}</span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-slate-300">{act.desc}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downstream Hotel Reservation Status */}
      <HotelModificationCard isFlightRebooked={hasDisruption} />
    </div>
  );
}
