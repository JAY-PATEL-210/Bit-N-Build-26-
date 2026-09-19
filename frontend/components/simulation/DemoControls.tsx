// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 33: Demo Control Panel for Hackathon Presentation
import React from 'react';

interface DemoControlsProps {
  onSimulate: (scenario: string) => void;
  isLoading?: boolean;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ onSimulate, isLoading }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Judge Demo Controls (Simulation Mode)
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSimulate('NORMAL')}
          disabled={isLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          [ Normal Flight ]
        </button>
        <button
          onClick={() => onSimulate('DELAY')}
          disabled={isLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 transition"
        >
          [ Simulate Delay ]
        </button>
        <button
          onClick={() => onSimulate('CANCELLATION')}
          disabled={isLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 transition"
        >
          [ Simulate Cancellation ]
        </button>
        <button
          onClick={() => onSimulate('MISSED_CONNECTION')}
          disabled={isLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 transition"
        >
          [ Simulate Missed Connection ]
        </button>
        <button
          onClick={() => onSimulate('BOOKING_FAILURE')}
          disabled={isLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 transition"
        >
          [ Simulate Booking Failure ]
        </button>
      </div>
    </div>
  );
};
