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
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Judge Presentation Controls (Feature 6: Simulation Engine)
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-[11px] text-sky-400 hover:text-sky-300 underline"
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
        {/* Normal Operation: Emerald */}
        <button
          onClick={() => handleClick('NORMAL')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'NORMAL'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md shadow-emerald-950/40'
              : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80'
          }`}
        >
          ✓ [ Normal Flight ]
        </button>

        {/* Delay Simulation: Amber */}
        <button
          onClick={() => handleClick('DELAY')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'DELAY'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md shadow-amber-950/40'
              : 'bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-800/80'
          }`}
        >
          ⏱ [ Simulate Delay ]
        </button>

        {/* Cancellation Simulation: Rose */}
        <button
          onClick={() => handleClick('CANCELLATION')}
          disabled={isLoading}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm ${
            active === 'CANCELLATION'
              ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse shadow-md shadow-rose-950/50'
              : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80'
          }`}
        >
          ⚡ [ Simulate Cancellation ]
        </button>

        {/* Missed Connection: Amber Warning Risk */}
        <button
          onClick={() => handleClick('MISSED_CONNECTION')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'MISSED_CONNECTION'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md shadow-amber-950/40'
              : 'bg-amber-950/50 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60'
          }`}
        >
          ⚠️ [ Simulate Missed Connection ]
        </button>

        {/* Booking Failure: Rose Error */}
        <button
          onClick={() => handleClick('BOOKING_FAILURE')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            active === 'BOOKING_FAILURE'
              ? 'bg-rose-700 text-white ring-2 ring-rose-400 shadow-md shadow-rose-950/40'
              : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60'
          }`}
        >
          ✕ [ Simulate Booking Failure ]
        </button>
      </div>
    </div>
  );
};
