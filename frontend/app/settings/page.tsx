// Owner: Member A (Frontend Lead / Traveler Experience)
export default function SettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Preferences & Travel Policies</h1>
        <p className="text-slate-400">Configure autonomous rebooking limits and permissions.</p>
      </header>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold">Corporate Policy Constraints</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400 block mb-1">Max Additional Fare</label>
            <input type="text" readOnly value="₹20,000" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Min Connection Time</label>
            <input type="text" readOnly value="90 Minutes" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Autonomous Rebooking</label>
            <input type="text" readOnly value="ENABLED" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-emerald-400 font-semibold" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Autonomous Hotel Modification</label>
            <input type="text" readOnly value="ENABLED" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-emerald-400 font-semibold" />
          </div>
        </div>
      </div>
    </div>
  );
}
