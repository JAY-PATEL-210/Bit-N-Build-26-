// Owner: Member A (Frontend Lead / Traveler Experience) & Member B (Systems / Demo)
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';

export const metadata = {
  title: 'Autonomous Travel-Disruption Concierge',
  description: 'AI-agent travel disruption detection, decisioning, and autonomous rebooking platform.',
};

import { AuthGuard } from '@/components/auth/AuthGuard';

import { Footer } from '@/components/common/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthGuard>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthGuard>
      </body>
    </html>
  );
}
