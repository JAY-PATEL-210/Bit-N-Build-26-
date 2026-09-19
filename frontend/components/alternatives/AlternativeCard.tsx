// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 13: Alternative Flight Card
import React from 'react';
import { AlternativeFlight } from '../../types';

interface AlternativeCardProps {
  alternative: AlternativeFlight;
  onSelect: (altId: string) => void;
  isSelecting?: boolean;
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({
  alternative,
  onSelect,
  isSelecting,
}) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-white">
            {alternative.airline} ({alternative.flightNumber})
          </h4>
          <p className="text-xs text-slate-400">
            {alternative.departureTime} → {alternative.arrivalTime} • {alternative.duration} ({alternative.stops} Stop)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-emerald-400">
            +₹{alternative.additionalFare.toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-slate-400">additional fare</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded ${alternative.policyCompliant ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
          {alternative.policyCompliant ? '✓ Within policy' : '✗ Exceeds policy'}
        </span>
        {alternative.recommended && (
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
            Recommended
          </span>
        )}
      </div>

      {alternative.explanation && (
        <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded border border-slate-800/80">
          "{alternative.explanation}"
        </p>
      )}

      <div className="pt-2 flex justify-end">
        <button
          onClick={() => onSelect(alternative.id)}
          disabled={isSelecting}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
        >
          [ Rebook ]
        </button>
      </div>
    </div>
  );
};
