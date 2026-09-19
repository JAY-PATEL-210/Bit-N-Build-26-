// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import Link from 'next/link';
import { Plane, Shield, Zap, ArrowRight, Activity, Sliders, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-5xl mx-auto space-y-12">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-300 text-xs font-semibold shadow-inner">
        <Shield className="w-3.5 h-3.5 text-blue-400" />
        <span>PS-8 • Autonomous Travel-Disruption Concierge</span>
      </div>

      {/* Hero Title & Subtitle */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent Operations for{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Travel Disruptions
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Detect delays, analyze downstream flight and hotel dependencies, evaluate corporate travel policies, and autonomously rebook your itinerary before you even reach the gate.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="flex items-center gap-2 shadow-lg shadow-blue-600/30">
            <span>Launch Traveler Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/trips/TRIP-001">
          <Button variant="secondary" size="lg" className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-400" />
            <span>View Active Demo Trip (BOM → LHR)</span>
          </Button>
        </Link>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-6">
        <Card hoverable className="p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">Instant Detection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time telemetry detects flight cancellations and missed connections in ≤ 5 seconds.
          </p>
        </Card>

        <Card hoverable className="p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">Policy Engine First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every candidate is checked against ₹20k fare limits and 90m connection minimums before AI decisions.
          </p>
        </Card>

        <Card hoverable className="p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">Automated Multi-Leg Action</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executes idempotent rebookings and automatically shifts hotel reservations when arrival days shift.
          </p>
        </Card>
      </div>
    </main>
  );
}

