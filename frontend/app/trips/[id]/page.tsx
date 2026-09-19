// Owner: Member A (Frontend Lead / Traveler Experience)
export default function TripDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Trip Details: {params.id}</h1>
        <p className="text-slate-400">Complete connected itinerary graph and leg milestones.</p>
      </header>

      {/* Connected Graph Timeline: Flight 1 -> Flight 2 -> Hotel */}
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-lg">Leg 1: Mumbai (BOM) → Delhi (DEL)</h3>
          <p className="text-sm text-slate-400">Flight: AI101</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-lg">Leg 2: Delhi (DEL) → London (LHR)</h3>
          <p className="text-sm text-slate-400">Flight: AI203</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-lg">Accommodation: London Hotel</h3>
          <p className="text-sm text-slate-400">Check-in: 10 June • Check-out: 13 June</p>
        </div>
      </div>
    </div>
  );
}
