'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 13, 33, 35, 52: Disruption Analysis & Command Center
import React from 'react';
import Link from 'next/link';
import { useDisruption } from '../../../hooks/useDisruption';
import { DemoControls } from '../../../components/simulation/DemoControls';
import { HotelModificationCard } from '../../../components/hotel/HotelModificationCard';

export default function DisruptionPage({ params }: { params: { id: string } }) {
  const { disruption, alternatives, isLoading, error, refresh, simulateEvent } = useDisruption(params.id);

  const stages = [
    { label: 'Perception: Detection', status: 'COMPLETED', desc: 'Received cancellation signal for Flight AI101' },
    { label: 'Reasoning: Impact Analysis', status: 'COMPLETED', desc: 'Leg 2 (AI203 to LHR) & London hotel affected' },
    { label: 'Search: Discovery', status: 'COMPLETED', desc: `${alternatives.length || 4} alternative routes discovered` },
    { label: 'Policy: Deterministic Filter', status: 'COMPLETED', desc: '2 alternatives rejected; 2 eligible within ₹20,000 limit' },
    { label: 'Decision: AI Recommendation', status: 'READY', desc: 'Selected AI203 (Earliest eligible London arrival)' },
    { label: 'Action & Verification', status: 'ACTION_REQUIRED', desc: 'Autonomous rebooking ready for execution' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <span className="text-rose-400 font-semibold">Disruption ({params.id})</span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/alternatives/${params.id}`}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition text-xs"
            >
              [ View Alternatives ({alternatives.length || 4}) ]
            </Link>
          </div>
        </div>

        {/* Judge Simulation Controls */}
        <DemoControls
          onSimulate={(scenario) => {
            simulateEvent(scenario);
          }}
          isLoading={isLoading}
        />

        {/* Main Disruption Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-800/80 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-900 text-rose-200 border border-rose-700 animate-pulse">
                {disruption?.severity || 'CRITICAL'} DISRUPTION DETECTED
              </span>
              <span className="text-xs font-mono text-slate-400">
                Disruption ID: {params.id}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
              Detected: {disruption ? new Date(disruption.detectedAt).toLocaleTimeString() : '08:00:00 AM'}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {disruption?.description || 'Flight AI101 (Mumbai → Delhi) has been CANCELLED.'}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {disruption?.impact ||
                'Cascading disruption detected across itinerary TRIP-001. Feeder flight failure breaks downstream connection AI203 to London Heathrow and impacts hotel check-in at The Landmark London.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href={`/alternatives/${params.id}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
            >
              <span>⚡</span> Review {alternatives.length} Evaluated Alternatives →
            </Link>
            <Link
              href="/activity"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              Inspect Autonomous Audit Trail
            </Link>
          </div>
        </div>

        {/* Connected Graph Impact Visualization (Section 35) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
              Itinerary Dependency Graph Analysis (Section 35)
            </h3>
            <span className="text-xs text-sky-400 font-mono">Trip: Mumbai → London</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Leg 1: Rose (Root Cancellation) */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2">
              <div className="flex justify-between font-bold text-rose-300">
                <span>Flight 1: AI101</span>
                <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px]">CANCELLED</span>
              </div>
              <p className="text-white font-mono">Mumbai (BOM) → Delhi (DEL)</p>
              <p className="text-slate-400 text-[11px]">Scheduled: 08:30 → 10:45</p>
              <p className="text-rose-400 text-[11px] font-semibold">Origin root failure event.</p>
            </div>

            {/* Leg 2: Amber (Connection Broken) */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-2">
              <div className="flex justify-between font-bold text-amber-300">
                <span>Flight 2: AI203</span>
                <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-200 text-[10px]">CONNECTION BROKEN</span>
              </div>
              <p className="text-white font-mono">Delhi (DEL) → London (LHR)</p>
              <p className="text-slate-400 text-[11px]">Scheduled: 13:45 → 18:30</p>
              <p className="text-amber-400 text-[11px] font-semibold">Missed connection due to Leg 1 cancellation.</p>
            </div>

            {/* Hotel: Indigo (AI Downstream Coordination) */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 space-y-2">
              <div className="flex justify-between font-bold text-indigo-300">
                <span>Hotel: The Landmark London</span>
                <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200 text-[10px]">CHECK-IN IMPACT</span>
              </div>
              <p className="text-white font-mono">London, UK (3 Nights)</p>
              <p className="text-slate-400 text-[11px]">Original Check-in: 10 June 2026</p>
              <p className="text-indigo-300 text-[11px] font-semibold">Postponed to 11 June morning upon rebooking.</p>
            </div>
          </div>
        </div>

        {/* 6-Stage Autonomous Pipeline Progress */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800/80 pb-3">
            Autonomous Concierge Execution Stages
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stages.map((stage, idx) => (
              <div
                key={stage.label}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-slate-500">STAGE 0{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {stage.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{stage.label}</h4>
                <p className="text-slate-400 text-[11px]">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hotel Coordination Card */}
        <HotelModificationCard />
      </div>
    </div>
  );
}
