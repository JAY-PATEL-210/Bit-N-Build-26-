// Owner: Member B (Frontend Systems / Interaction & Demo)
// FR-10 & Feature 5: Human Approval & Escalation Dialog
import React from 'react';
import { AlternativeFlight, RebookingRequest } from '../../types';

interface ApprovalModalProps {
  isOpen: boolean;
  flight: AlternativeFlight | null;
  request: RebookingRequest | null;
  isLoading?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  flight,
  request,
  isLoading,
  onApprove,
  onReject,
  onClose,
}) => {
  if (!isOpen || !flight) return null;

  const fareDiff = flight.additionalFare;
  const policyLimit = 20000;
  const exceedsFare = fareDiff > policyLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-600/70 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
              ⚠️ HUMAN APPROVAL REQUIRED (FR-10)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Traveler Authorization Needed
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            The Autonomous Concierge flagged this option because it exceeds autonomous thresholds.
          </p>
        </div>

        {/* Escalation Reasons */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/80 space-y-2 text-xs text-amber-200">
          <p className="font-semibold text-amber-300">Triggered Policy Violations:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            {exceedsFare && (
              <li>
                <strong className="text-white">Budget Overrun:</strong> Additional fare of{' '}
                <span className="text-amber-400 font-bold font-mono">₹{fareDiff.toLocaleString('en-IN')}</span> exceeds the{' '}
                ₹{policyLimit.toLocaleString('en-IN')} corporate limit by ₹
                {(fareDiff - policyLimit).toLocaleString('en-IN')}.
              </li>
            )}
            {flight.cabin && flight.cabin !== 'ECONOMY' && (
              <li>
                <strong className="text-white">Cabin Class:</strong> Requires {flight.cabin} class upgrade (Default is Economy).
              </li>
            )}
            {flight.explanation && (
              <li>
                <strong className="text-white">AI Reason:</strong> {flight.explanation}
              </li>
            )}
          </ul>
        </div>

        {/* Selected Flight Summary */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between font-bold text-white">
            <span>{flight.airline} ({flight.flightNumber})</span>
            <span className="text-amber-400 font-mono">+₹{flight.additionalFare.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-slate-400">
            {flight.departureTime} → {flight.arrivalTime} • {flight.duration} ({flight.stops} Stop)
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-semibold transition"
          >
            [ Reject Option ]
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-950/40"
          >
            {isLoading ? 'Processing Authorization...' : '[ Approve & Execute ]'}
          </button>
        </div>
      </div>
    </div>
  );
};
