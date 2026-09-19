'use client';

// Owner: Member A (Frontend Lead) & Member B (Interaction & Demo)
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, Bell, Activity, Sliders, MapPin, AlertTriangle, ListFilter } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Plane },
    { href: '/trips', label: 'My Trips', icon: MapPin },
    { href: '/disruptions/DISRUPT-001', label: 'Disruption', icon: AlertTriangle },
    { href: '/alternatives/DISRUPT-001', label: 'Alternatives', icon: ListFilter },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/activity', label: 'Audit Trail', icon: Activity },
    { href: '/settings', label: 'Policies', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-900/40 group-hover:scale-105 transition">
              ✈
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                Travel Concierge
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block -mt-1">
                Autonomous Ops
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Status Pill & Demo Disruption */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Agent Monitoring Active
          </div>

          <Link
            href="/disruptions/DISRUPT-001"
            className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            Demo Disruption
          </Link>
        </div>
      </div>
    </header>
  );
};
