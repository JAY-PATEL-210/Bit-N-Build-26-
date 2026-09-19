// Owner: Member A (Frontend Lead / Traveler Experience)
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, ShieldCheck, Bell, Activity, Sliders, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Plane },
    { href: '/trips/TRIP-001', label: 'Active Trip', icon: MapPin },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/activity', label: 'Audit Trail', icon: Activity },
    { href: '/settings', label: 'Policies', icon: Sliders },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              Disruption Concierge
            </span>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Autonomous Operations
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-800/80 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right side status indicators */}
      <div className="flex items-center gap-3">
        {/* System Monitoring Pulse */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AUTONOMOUS ACTIVE</span>
        </div>

        {/* Traveler Profile chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            DT
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-tight">Demo Traveler</p>
            <p className="text-[10px] text-slate-500">Corporate Economy</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

