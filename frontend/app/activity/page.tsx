// Owner: Member B (Frontend Systems / Interaction & Demo)
export default function ActivityPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Audit & Activity Timeline</h1>
        <p className="text-slate-400">Complete, transparent history of system detections, decisions, and actions.</p>
      </header>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="font-mono text-emerald-400">REBOOKING_CONFIRMED</span>
            <span>Actor: SYSTEM (Autonomous)</span>
          </div>
          <p className="font-medium">Alternative Flight AI203 confirmed with provider.</p>
          <p className="text-xs text-slate-400">Decision ID: DEC-009 • Result: SUCCESS</p>
        </div>
      </div>
    </div>
  );
}
