// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
import React from 'react';
import Link from 'next/link';
import {
  Plane,
  Shield,
  Zap,
  ArrowRight,
  Bell,
  Cpu,
  RefreshCw,
  Building2,
  UserCheck,
  CheckCircle2,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const coreLoopSteps = [
    {
      step: '01',
      title: 'Monitor',
      icon: Activity,
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
      description: 'Continuous real-time telemetry stream of multi-leg flight schedules and airport operations.',
    },
    {
      step: '02',
      title: 'Detect',
      icon: Zap,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      description: 'Sub-second cascade analysis detects missed connections, airport changes, and broken hotel check-ins.',
    },
    {
      step: '03',
      title: 'Decide',
      icon: Cpu,
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
      description: 'Deterministic policy engine evaluates candidate flights against budget caps and layover rules.',
    },
    {
      step: '04',
      title: 'Act',
      icon: RefreshCw,
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      description: 'Idempotent rebooking API executes ticket re-issue and automatically adjusts hotel reservation dates.',
    },
    {
      step: '05',
      title: 'Notify',
      icon: Bell,
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
      description: 'Instant contextual alerts and SMS delivered to traveler with transparent company reasons and support.',
    },
  ];

  return (
    <main className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-6xl mx-auto space-y-16">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/70 border border-blue-800/80 text-blue-300 text-xs font-semibold shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>PS-8 • Autonomous Travel-Disruption Concierge</span>
      </div>

      {/* Hero Title & Subtitle */}
      <div className="space-y-5 max-w-4xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Autonomous Travel-Disruption{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Concierge
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
          When flights get cancelled or delayed, the ripple effect collapses your entire trip.
          Our autonomous system detects disruptions, resolves downstream dependencies across flights and hotels,
          and executes policy-compliant rebooking in seconds.
        </p>
      </div>

      {/* Primary Role-Based CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto">
        <Link href="/signup?role=TRAVELER" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 text-white font-bold text-sm rounded-xl"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign up as Traveler</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        <Link href="/signup?role=COMPANY" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Sign up as Airline / Company</span>
          </Button>
        </Link>
      </div>

      {/* Existing User Login Link */}
      <div className="text-xs text-slate-400 -mt-8">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400 transition"
        >
          Sign in here →
        </Link>
      </div>

      {/* Core Loop Explainer: Monitor → Detect → Decide → Act → Notify */}
      <div className="w-full pt-6 space-y-6 text-left">
        <div className="flex flex-col items-center text-center space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            Autonomous Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            The Core Autonomous Decision Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            From initial flight disruption telemetry to finalized rebooking and hotel adjustment in under 60 seconds.
          </p>
        </div>

        {/* 5-Step Connected Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
          {coreLoopSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative rounded-2xl p-5 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase">
                      STEP {s.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-extrabold text-white text-base">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                </div>

                {idx < coreLoopSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      →
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access to Live Demo Itinerary */}
      <div className="pt-4 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-between gap-4 text-left">
        <div>
          <span className="text-xs font-bold text-white block">Ready to inspect active demo trip?</span>
          <span className="text-[11px] text-slate-400">
            Preview Mumbai (BOM) → Delhi (DEL) → London (LHR) + Hotel Landmark London.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Traveler Dashboard
            </Button>
          </Link>
          <Link href="/company/dashboard">
            <Button variant="secondary" size="sm" className="border-emerald-800/60 text-emerald-300">
              Company Portal
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
