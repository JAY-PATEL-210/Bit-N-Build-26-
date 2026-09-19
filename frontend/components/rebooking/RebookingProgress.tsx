// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 37, 38, 52: Interactive Autonomous Rebooking Progress Modal
import React from 'react';
import { RebookingWorkflowStep } from '../../hooks/useRebooking';
import { AlternativeFlight, RebookingRequest } from '../../types';

interface RebookingProgressProps {
  isOpen: boolean;
  step: RebookingWorkflowStep;
  flight: AlternativeFlight | null;
  request: RebookingRequest | null;
  error: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

const STEPS = [
  { id: 'VALIDATING', label: '1. Deterministic Constraint Validation' },
  { id: 'CHECKING_AVAILABILITY', label: '2. Verifying Real-time Seat Availability' },
  { id: 'GENERATING_IDEMPOTENCY', label: '3. Generating Unique Idempotency Key' },
  { id: 'EXECUTING_BOOKING', label: '4. Calling Airline Provider Booking API' },
  { id: 'VERIFYING', label: '5. Verifying PNR & Booking Confirmation' },
  { id: 'SYNCHRONIZING_HOTEL', label: '6. Synchronizing Downstream Hotel Dates' },
  { id: 'EMITTING_AUDIT', label: '7. Recording Audit Trail & Dispatching Notification' },
];

export const RebookingProgress: React.FC<RebookingProgressProps> = ({
  isOpen,
  step,
  flight,
  request,
  error,
  onClose,
  onRetry,
}) => {
  if (!isOpen || !flight) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const isConfirmed = step === 'CONFIRMED';
  const isFailed = step === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
              Autonomous Travel Operations
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                isConfirmed
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : isFailed
                  ? 'bg-red-950 text-red-400 border border-red-700'
                  : 'bg-blue-950 text-blue-400 border border-blue-700 animate-pulse'
              }`}
            >
              {isConfirmed ? 'CONFIRMED' : isFailed ? 'FAILED' : 'IN_PROGRESS'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {isConfirmed ? '🎉 Rebooking Successfully Completed!' : 'Executing Autonomous Rebooking'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rebooking to {flight.airline} ({flight.flightNumber}) • +₹{flight.additionalFare.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Idempotency Key Badge (Section 38) */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Idempotency Key:</span>
          <span className="font-mono text-emerald-400 font-semibold text-[11px] truncate max-w-[260px]">
            {request?.idempotencyKey || `REBOOK-TRIP001-DISRUPTION001-${flight.id}`}
          </span>
        </div>

        {/* Workflow Steps Stepper */}
        <div className="space-y-2.5">
          {STEPS.map((s, index) => {
            const isDone = isConfirmed || currentStepIndex > index;
            const isCurrent = !isConfirmed && currentStepIndex === index;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-2 rounded-lg text-xs transition ${
                  isDone
                    ? 'bg-emerald-950/20 text-emerald-300'
                    : isCurrent
                    ? 'bg-blue-950/40 text-blue-300 font-semibold ring-1 ring-blue-700/50'
                    : 'text-slate-500 opacity-60'
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                  {isDone ? (
                    <span className="text-emerald-400">✓</span>
                  ) : isCurrent ? (
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                  ) : (
                    <span>○</span>
                  )}
                </div>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {isFailed && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs space-y-1">
            <p className="font-bold">Execution Stopped:</p>
            <p>{error || 'Provider booking failed or seat inventory expired.'}</p>
          </div>
        )}

        {/* Success Details */}
        {isConfirmed && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-xs space-y-2 text-emerald-200">
            <div className="flex justify-between">
              <span>PNR Confirmation:</span>
              <span className="font-mono font-bold text-white">PNR-AI-994812</span>
            </div>
            <div className="flex justify-between">
              <span>Hotel Adaptation:</span>
              <span className="text-white">Check-in moved to 11 June 2026</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Hash:</span>
              <span className="font-mono text-[11px] text-slate-400">sha256:7f4c...982a</span>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex justify-end gap-3 pt-2">
          {isFailed && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
            >
              Retry Autonomous Rebooking
            </button>
          )}

          {(isConfirmed || isFailed) && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Close
            </button>
          )}

          {isConfirmed && (
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              Return to Dashboard
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
