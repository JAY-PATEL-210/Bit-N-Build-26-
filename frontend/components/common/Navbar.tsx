// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tight text-white">Concierge AI</span>
        <div className="flex gap-4 text-sm text-slate-300">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/notifications" className="hover:text-white transition">Notifications</Link>
          <Link href="/activity" className="hover:text-white transition">Audit Log</Link>
          <Link href="/settings" className="hover:text-white transition">Policies</Link>
        </div>
      </div>
    </nav>
  );
};
