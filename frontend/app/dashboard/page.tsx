// Owner: Member A (Frontend Lead / Traveler Experience)
export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Traveler Dashboard</h1>
        <p className="text-slate-400">Real-time trip status and autonomous disruption monitoring.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Trip Overview */}
        <div className="col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Active Trip: Mumbai → London</h2>
          <p className="text-sm text-slate-400 mb-4">Flight AI101 (BOM → DEL) • Flight AI203 (DEL → LHR)</p>
          <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm">
            Status: NORMAL (Monitoring Active)
          </div>
        </div>

        {/* Next Action / Disruption Widget */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Concierge Status</h2>
          <p className="text-sm text-slate-400">Autonomous protection active. No manual action required.</p>
        </div>
      </section>
    </div>
  );
}
