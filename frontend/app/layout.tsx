// Owner: Member A (Frontend Lead / Traveler Experience) & Member B (Systems / Demo)
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';

export const metadata = {
  title: 'Autonomous Travel-Disruption Concierge',
  description: 'AI-agent travel disruption detection, decisioning, and autonomous rebooking platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>Autonomous Travel-Disruption Concierge • Hackathon Prototype (PS-8)</p>
          <p className="mt-1 font-mono text-[11px] text-slate-600">
            Perception → Reasoning → Policy → Action → Verification
          </p>
        </footer>
      </body>
    </html>
  );
}
