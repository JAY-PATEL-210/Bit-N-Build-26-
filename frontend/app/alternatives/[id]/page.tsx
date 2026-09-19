// Owner: Member B (Frontend Systems / Interaction & Demo)
export default function AlternativesPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Alternative Flight Options</h1>
        <p className="text-slate-400">Evaluated options for Disruption ID: {params.id}</p>
      </header>

      {/* Alternative Flight Card Demonstration */}
      <div className="p-6 rounded-xl bg-slate-900 border border-emerald-600/50 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400">
              Recommended Choice
            </span>
            <h2 className="text-xl font-bold mt-2">Air India (AI203)</h2>
            <p className="text-sm text-slate-400">Delhi (DEL) → London (LHR) • 20:30 → 05:45 (1 Stop)</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">₹8,500</span>
            <p className="text-xs text-slate-400">Additional Fare</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 text-xs text-slate-300">
          <p className="font-semibold text-slate-200">Autonomous Selection Rationale:</p>
          <p>Within ₹20,000 corporate limit. Earliest eligible arrival in London. Valid 2h 15m connection buffer.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition">
            Rebook Automatically
          </button>
        </div>
      </div>
    </div>
  );
}
