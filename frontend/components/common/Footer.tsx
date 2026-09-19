'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on login and signup pages for clean immersive full-screen view
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <p>RoutePilot Autonomous Travel-Disruption Concierge • PS-8</p>
      <p className="mt-1 font-mono text-[11px] text-slate-600">
        Perception → Multi-Leg Cascade Reasoning → Policy Engine → Autonomous Rebooking
      </p>
    </footer>
  );
};
