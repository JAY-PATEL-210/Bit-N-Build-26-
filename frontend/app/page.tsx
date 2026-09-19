import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Autonomous Travel-Disruption Concierge
      </h1>
      <p className="text-slate-400 max-w-xl mb-8">
        Proactive, agentic travel operations layer that detects disruptions, evaluates policy-compliant alternatives, and autonomously rebooks your travel.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
