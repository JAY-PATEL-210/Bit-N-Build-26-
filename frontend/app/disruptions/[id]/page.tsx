// Owner: Member B (Frontend Systems / Interaction & Demo)
export default function DisruptionPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
        <h2 className="text-xl font-bold">⚠️ Disruption Detected ({params.id})</h2>
        <p className="text-sm mt-1">Flight AI101 (Mumbai → Delhi) has been CANCELLED.</p>
      </div>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-semibold text-lg">Autonomous Operation Progress</h3>
        <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
          <li>Detect cancellation (Completed)</li>
          <li>Analyze connection impact (Completed - Leg 2 & Hotel Affected)</li>
          <li>Search valid alternative routes (In Progress)</li>
          <li>Evaluate corporate travel policy</li>
          <li>Validate AI decision</li>
          <li>Execute rebooking & update hotel</li>
        </ol>
      </div>
    </div>
  );
}
