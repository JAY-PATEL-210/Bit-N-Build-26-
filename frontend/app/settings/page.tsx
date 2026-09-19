// Owner: Member A (Frontend Lead / Traveler Experience)
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  DollarSign,
  Clock,
  Building,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const [maxFare, setMaxFare] = useState('20000');
  const [minConnection, setMinConnection] = useState('90');
  const [maxArrivalDelay, setMaxArrivalDelay] = useState('8');
  const [autoRebook, setAutoRebook] = useState(true);
  const [autoHotel, setAutoHotel] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Travel Policy & Concierge Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Deterministic boundaries and permissions that govern autonomous decisions.
            </p>
          </div>
        </div>

        {saved && (
          <Badge variant="success" pulse>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
            Policy Saved Successfully
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Constraints Card */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-base text-slate-100">
                  Autonomous Policy Engine Constraints (Appendix C)
                </h2>
              </div>
              <Badge variant="purple">Deterministic Rules</Badge>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Additional Fare */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Max Additional Fare (Budget Limit)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  value={maxFare}
                  onChange={(e) => setMaxFare(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-8 pr-4 text-slate-100 font-semibold focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Alternatives with additional fare above this amount will trigger human approval.
              </p>
            </div>

            {/* Min Connection Minutes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Minimum Connection Time (Minutes)
              </label>
              <input
                type="number"
                value={minConnection}
                onChange={(e) => setMinConnection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-100 font-semibold focus:outline-none transition"
              />
              <p className="text-[11px] text-slate-500">
                Connections tighter than 90 minutes are automatically classified as risky or rejected.
              </p>
            </div>

            {/* Max Acceptable Delay */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Maximum Arrival Delay (Hours)
              </label>
              <input
                type="number"
                value={maxArrivalDelay}
                onChange={(e) => setMaxArrivalDelay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-100 font-semibold focus:outline-none transition"
              />
              <p className="text-[11px] text-slate-500">
                Alternatives causing more than 8 hours arrival delay require traveler approval.
              </p>
            </div>

            {/* Preferred Cabin */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Preferred Cabin Class
              </label>
              <select className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-100 font-semibold focus:outline-none transition">
                <option value="ECONOMY">Economy (Default)</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business Class</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Autonomous system prioritizes designated corporate cabin profile.
              </p>
            </div>
          </div>
        </Card>

        {/* Autonomous Permissions Card */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-slate-100">
                Autonomous Execution Permissions
              </h2>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block text-sm">
                  Autonomous Flight Rebooking
                </span>
                <p className="text-xs text-slate-400">
                  Allow concierge AI to execute verified policy-compliant flight rebookings immediately.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRebook}
                onChange={(e) => setAutoRebook(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block text-sm">
                  Autonomous Hotel Check-in Modification
                </span>
                <p className="text-xs text-slate-400">
                  Automatically shift hotel reservation check-in date when flight arrival date changes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoHotel}
                onChange={(e) => setAutoHotel(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Policies</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

