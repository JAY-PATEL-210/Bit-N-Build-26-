'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Clean, Role-Aware, Premium Aerospace Navigation Bar
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  Bell,
  Activity,
  MapPin,
  Building2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User as UserType } from '@/types/index';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, [pathname]);

  // Completely hide Navbar on login and signup pages for full-screen immersion
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    router.replace('/login');
  };

  const isCompany = currentUser?.role === 'COMPANY';

  // Role-Aware Curated Navigation Links
  const navLinks = isCompany
    ? [
        { href: '/company/dashboard', label: 'Ops Console', icon: Building2 },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: Plane },
        { href: '/trips', label: 'My Trips', icon: MapPin },
        { href: '/notifications', label: 'Notifications', icon: Bell },
        { href: '/activity', label: 'Audit Trail', icon: Activity },
      ];

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href={isCompany ? '/company/dashboard' : '/dashboard'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-sky-900/40 group-hover:scale-105 transition-transform duration-200">
              ✈
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-sky-300 transition">
                  RoutePilot
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-800/70 text-sky-400 font-semibold">
                  PS-8
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Autonomous Disruption Concierge
              </span>
            </div>
          </Link>

          {/* Clean Role-Specific Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Status, Demo Disruption Trigger & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Autonomous Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-mono text-emerald-300 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent Active</span>
          </div>

          {/* Demo Alert Trigger — only for Traveler role */}
          {!isCompany && (
            <Link
              href="/disruptions/DISRUPT-001"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-800/70 text-rose-200 text-xs font-bold transition shadow-sm hover:scale-[1.02] active:scale-98"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Simulate Disruption</span>
            </Link>
          )}

          {/* Authenticated User Profile & Sign Out */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800/80">
              {/* Profile Chip */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white leading-tight capitalize">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono leading-tight">
                    {currentUser.role === 'COMPANY' ? 'Airline Partner' : 'Traveler'}
                  </span>
                </div>
              </div>

              {/* Sign Out Action */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 border border-transparent hover:border-rose-800/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
