'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  Bell,
  Activity,
  Sliders,
  MapPin,
  AlertTriangle,
  ListFilter,
  Building2,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User } from '@/types/index';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, [pathname]);

  // Completely hide Navbar on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    router.replace('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Plane },
    { href: '/trips', label: 'My Trips', icon: MapPin },
    { href: '/disruptions/DISRUPT-001', label: 'Disruption', icon: AlertTriangle },
    { href: '/alternatives/DISRUPT-001', label: 'Alternatives', icon: ListFilter },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/activity', label: 'Audit Trail', icon: Activity },
    { href: '/company/dashboard', label: 'Company Ops', icon: Building2 },
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
                TravelSync
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

        {/* User Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Agent Monitoring Active
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-white">{currentUser.name || currentUser.email}</span>
                <span className="text-[10px] text-emerald-400 ml-1">({currentUser.role})</span>
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900/80 border border-red-800/60 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Login</span>
            </Link>
          )}

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
