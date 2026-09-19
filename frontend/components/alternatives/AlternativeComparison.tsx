// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 52: Alternative Comparison Matrix Component
import React from 'react';
import { AlternativeFlight } from '../../types';

interface AlternativeComparisonProps {
  alternatives: AlternativeFlight[];
  onSelect: (alternative: AlternativeFlight) => void;
  isSelecting?: boolean;
}

export const AlternativeComparison: React.FC<AlternativeComparisonProps> = ({
  alternatives,
  onSelect,
  isSelecting,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="p-3.5">Flight & Airline</th>
            <th className="p-3.5">Departure / Arrival</th>
            <th className="p-3.5">Duration & Stops</th>
            <th className="p-3.5">Additional Fare</th>
            <th className="p-3.5">Policy Status</th>
            <th className="p-3.5">AI Confidence</th>
            <th className="p-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {alternatives.map((alt) => {
            const isCompliant = alt.policyCompliant;
            const isRec = alt.recommended;

            return (
              <tr
                key={alt.id}
                className={`transition hover:bg-slate-800/40 ${
                  isRec ? 'bg-emerald-950/20' : ''
                }`}
              >
                <td className="p-3.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    {alt.airline}
                    <span className="font-mono text-blue-400 text-[11px]">({alt.flightNumber})</span>
                    {isRec && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900 text-emerald-300 border border-emerald-700">
                        Top Pick
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {alt.origin || 'DEL'} → {alt.destination || 'LHR'} ({alt.cabin || 'ECONOMY'})
                  </div>
                </td>

                <td className="p-3.5">
                  <div className="font-mono text-white">{alt.departureTime} → {alt.arrivalTime}</div>
                  <div className="text-[11px] text-slate-400">
                    Buffer: {alt.connectionBufferMinutes ? `${alt.connectionBufferMinutes} min` : 'N/A'}
                  </div>
                </td>

                <td className="p-3.5">
                  <span className="font-medium text-slate-200">{alt.duration}</span>
                  <div className="text-[11px] text-slate-400">
                    {alt.stops === 0 ? 'Non-Stop Direct' : `${alt.stops} Stop`}
                  </div>
                </td>

                <td className="p-3.5 font-mono font-bold text-sm text-emerald-400">
                  +₹{alt.additionalFare.toLocaleString('en-IN')}
                </td>

                <td className="p-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isCompliant
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {isCompliant ? '✓ Policy Compliant' : '✗ Over Budget'}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          alt.confidence >= 0.8 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.round(alt.confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  </div>
                </td>

                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onSelect(alt)}
                    disabled={isSelecting}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition ${
                      isRec
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : isCompliant
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-amber-700 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {isRec ? 'Rebook' : isCompliant ? 'Select' : 'Escalate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
