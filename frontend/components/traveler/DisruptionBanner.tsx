// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldCheck, Zap, Info } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AutonomousProgressStepper, PipelineStage } from './AutonomousProgressStepper';

interface DisruptionBannerProps {
  disruptionId: string;
  tripId: string;
  whatHappened: string;
  whatIsAffected: string;
  whatIsSystemDoing: string;
  currentStage: PipelineStage;
  isResolved?: boolean;
}

export const DisruptionBanner: React.FC<DisruptionBannerProps> = ({
  disruptionId,
  tripId,
  whatHappened,
  whatIsAffected,
  whatIsSystemDoing,
  currentStage,
  isResolved = false,
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-900/90 border border-rose-800/60 p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/80 flex items-center justify-center text-rose-400 shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-rose-100">Live Disruption Detected</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 font-mono font-bold">
                {disruptionId}
              </span>
            </div>
            <p className="text-xs text-rose-300/80">Proactive autonomous resolution in progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={currentStage === 'CONFIRMED' ? 'CONFIRMED' : 'REBOOKING'} />
          <Link
            href={`/disruptions/${disruptionId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition"
          >
            <span>Live Mission Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* The 3 Core Questions mandated by Specification Section 12 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            1. What happened?
          </span>
          <p className="text-sm font-semibold text-slate-100">{whatHappened}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            2. What is affected?
          </span>
          <p className="text-sm font-semibold text-slate-100">{whatIsAffected}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            3. What is the concierge doing?
          </span>
          <p className="text-sm font-semibold text-slate-100">{whatIsSystemDoing}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="pt-2 border-t border-slate-800/60">
        <AutonomousProgressStepper currentStage={currentStage} />
      </div>
    </div>
  );
};
