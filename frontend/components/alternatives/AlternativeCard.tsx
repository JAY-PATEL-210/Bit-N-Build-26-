// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 13, 14, 52: Alternative Flight Card with Policy Badges & AI Rationale
import React from 'react';
import { AlternativeFlight } from '../../types';

interface AlternativeCardProps {
  alternative: AlternativeFlight;
  onSelect: (alternative: AlternativeFlight) => void;
  isSelecting?: boolean;
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({
  alternative,
  onSelect,
  isSelecting,
}) => {
  const isCompliant = alternative.policyCompliant;
  const isRecommended = alternative.recommended;

  return (
    <div
      className={`p-5 rounded-xl transition-all duration-200 space-y-4 border ${
        isRecommended
          ? 'bg-slate-900/90 border-emerald-500/70 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
          : isCompliant
          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          : 'bg-slate-900/40 border-amber-950/60 hover:border-amber-900/80 opacity-90'
      }`}
    >
      {/* Top Header: Airline, Badges, and Price */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {isRecommended && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AI RECOMMENDED CHOICE
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                isCompliant
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
              }`}
            >
              {isCompliant ? '✓ Within Policy (≤ ₹20,000)' : '⚠️ Exceeds Policy Limit'}
            </span>
            {alternative.cabin && (
              <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                {alternative.cabin}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white pt-1">
            {alternative.airline} <span className="text-sky-400 font-mono">({alternative.flightNumber})</span>
          </h3>
          <p className="text-xs text-slate-400">
            {alternative.origin || 'DEL'} → {alternative.destination || 'LHR'} • {alternative.duration} •{' '}
            {alternative.stops === 0 ? 'Non-Stop Direct' : `${alternative.stops} Stop`}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +₹{alternative.additionalFare.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Additional Fare</p>
        </div>
      </div>

      {/* Flight Schedule Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/70 text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Departure</span>
          <span className="text-sm font-semibold text-white font-mono">{alternative.departureTime}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400">{alternative.duration}</span>
          <div className="w-full h-0.5 bg-slate-700 relative my-1">
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-500"></div>
          </div>
          <span className="text-[10px] text-slate-500">
            {alternative.stops === 0 ? 'Direct' : `${alternative.stops} Stop`}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Arrival</span>
          <span className="text-sm font-semibold text-white font-mono">{alternative.arrivalTime}</span>
        </div>
      </div>

      {/* AI Reasoning & Explanation Box (Feature 4: Explainable Decisions) */}
      {alternative.explanation && (
        <div className="p-3 rounded-lg bg-slate-950 border border-indigo-950/80 space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <span className="text-indigo-400">✨</span> Autonomous Selection Rationale:
            </span>
            <span className="text-indigo-400 font-mono font-bold">
              Confidence: {Math.round(alternative.confidence * 100)}%
            </span>
          </div>
          <p className="text-xs text-slate-300 italic">"{alternative.explanation}"</p>

          {alternative.reasonCodes && alternative.reasonCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {alternative.reasonCodes.map((code) => (
                <span
                  key={code}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-indigo-900/60 text-indigo-300"
                >
                  #{code}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-[11px] text-slate-400">
          {alternative.availableSeats ? `${alternative.availableSeats} seat(s) remaining` : 'Seats available'}
          {alternative.connectionBufferMinutes ? ` • ${alternative.connectionBufferMinutes}m connection buffer` : ''}
        </div>

        <button
          onClick={() => onSelect(alternative)}
          disabled={isSelecting}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            isRecommended
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
              : isCompliant
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30'
          } ${isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSelecting ? (
            'Processing...'
          ) : isRecommended ? (
            <>
              <span>⚡</span> [ Rebook Automatically ]
            </>
          ) : isCompliant ? (
            '[ Select & Rebook ]'
          ) : (
            '[ Request Exception & Approve ]'
          )}
        </button>
      </div>
    </div>
  );
};
