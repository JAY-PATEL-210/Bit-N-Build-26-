// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

export type PipelineStage =
  | 'DETECTED'
  | 'ANALYZING'
  | 'SEARCHING'
  | 'DECIDING'
  | 'REBOOKING'
  | 'CONFIRMED'
  | 'FAILED';

interface Step {
  id: PipelineStage;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'DETECTED', label: 'Disruption Detected', description: 'Real-time flight status event parsed' },
  { id: 'ANALYZING', label: 'Impact Analysis', description: 'Downstream legs & hotel evaluated' },
  { id: 'SEARCHING', label: 'Alternatives Search', description: 'Provider adapters queried' },
  { id: 'DECIDING', label: 'Policy & AI Decision', description: 'Deterministic guardrails verified' },
  { id: 'REBOOKING', label: 'Autonomous Action', description: 'Booking execution & hotel adjustment' },
  { id: 'CONFIRMED', label: 'Resolved & Notified', description: 'Itinerary updated with audit trail' },
];

interface AutonomousProgressStepperProps {
  currentStage: PipelineStage;
  failed?: boolean;
}

export const AutonomousProgressStepper: React.FC<AutonomousProgressStepperProps> = ({
  currentStage,
  failed = false,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Progress connecting line */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentIndex || currentStage === 'CONFIRMED';
            const isCurrent = idx === currentIndex && currentStage !== 'CONFIRMED';
            const isPending = idx > currentIndex;

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950'
                      : isCurrent
                      ? failed
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : 'bg-indigo-950 border-indigo-500 text-indigo-300 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-950'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    failed ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    )
                  ) : (
                    <Circle className="w-3.5 h-3.5 fill-current" />
                  )}
                </div>

                <div className="mt-3">
                  <span
                    className={`text-xs font-semibold block leading-tight ${
                      isDone
                        ? 'text-slate-200'
                        : isCurrent
                        ? 'text-indigo-400 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 hidden sm:block">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
