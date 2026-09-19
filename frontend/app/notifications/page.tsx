// Owner: Member B (Frontend Systems / Interaction & Demo)
export default function NotificationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Traveler Notification Center</h1>
        <p className="text-slate-400">Proactive autonomous action alerts.</p>
      </header>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Flight Rebooked & Hotel Synchronized</span>
          <span>Just now</span>
        </div>
        <p className="text-sm font-semibold">Your Mumbai → Delhi flight was cancelled.</p>
        <p className="text-xs text-slate-300">
          We found an eligible replacement and automatically rebooked you on Flight AI203. New arrival: 11 June, 05:45 AM. Your hotel reservation was also updated. No action is currently required.
        </p>
      </div>
    </div>
  );
}
