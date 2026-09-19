// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 33: Demo Control Panel for Hackathon Presentation
import React, { useState } from 'react';

interface DemoControlsProps {
  onSimulate: (scenario: string) => void;
  isLoading?: boolean;
  currentScenario?: string;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onSimulate,
  isLoading,
  currentScenario = 'NORMAL',
}) => {
  const [active, setActive] = useState<string>(currentScenario);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleClick = (scenario: string) => {
    setActive(scenario);
    onSimulate(scenario);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Judge Presentation Controls (Feature 6: Simulation Engine)
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-[11px] text-blue-400 hover:text-blue-300 underline"
        >
          {showInfo ? 'Hide Guide' : 'Judge Demo Guide'}
        </button>
      </div>

      {showInfo && (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-150">
          <p className="font-semibold text-white">Recommended Demonstration Flow (Appendix B):</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-400 text-[11px]">
            <li>Click <strong>[ Simulate Cancellation ]</strong> to trigger AI101 cancellation broadcast.</li>
            <li>Observe Disruption Engine detect cascading impact on London flight & hotel.</li>
            <li>Inspect 4 ranked alternatives (AI203 recommended; 2 options rejected by policy).</li>
            <li>Execute Autonomous Rebooking with idempotency key verification.</li>
            <li>Verify downstream hotel adaptation and real-time audit logging.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => handleClick('NORMAL')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'NORMAL'
              ? 'bg-slate-700 text-white ring-1 ring-slate-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          [ Normal Flight ]
        </button>

        <button
          onClick={() => handleClick('DELAY')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'DELAY'
              ? 'bg-amber-800 text-white ring-1 ring-amber-400'
              : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800'
          }`}
        >
          [ Simulate Delay ]
        </button>

        <button
          onClick={() => handleClick('CANCELLATION')}
          disabled={isLoading}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm ${
            active === 'CANCELLATION'
              ? 'bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
              : 'bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-800'
          }`}
        >
          ⚡ [ Simulate Cancellation ]
        </button>

        <button
          onClick={() => handleClick('MISSED_CONNECTION')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'MISSED_CONNECTION'
              ? 'bg-purple-800 text-white ring-1 ring-purple-400'
              : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800'
          }`}
        >
          [ Simulate Missed Connection ]
        </button>

        <button
          onClick={() => handleClick('BOOKING_FAILURE')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'BOOKING_FAILURE'
              ? 'bg-rose-800 text-white ring-1 ring-rose-400'
              : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
          }`}
        >
          [ Simulate Booking Failure ]
        </button>
      </div>
    </div>
  );
};
