// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';

export const metadata = {
  title: 'Autonomous Travel-Disruption Concierge',
  description: 'Real-time proactive travel operations and autonomous rebooking concierge.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}

