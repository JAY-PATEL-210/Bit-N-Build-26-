'use client';

// Owner: Member A (Frontend Lead) & Member B (Interaction & Demo)
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Shield,
  CheckCircle2,
  Save,
  DollarSign,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const [maxFare, setMaxFare] = useState<number>(20000);
  const [currency, setCurrency] = useState<string>('INR');
  const [maxStops, setMaxStops] = useState<number>(1);
  const [minConnectionTime, setMinConnectionTime] = useState<number>(90);
  const [maxDelayHours, setMaxDelayHours] = useState<number>(8);
  const [cabin, setCabin] = useState<string>('ECONOMY');
  const [autoRebooking, setAutoRebooking] = useState<boolean>(true);
  const [autoHotel, setAutoHotel] = useState<boolean>(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('✓ Corporate travel policies & autonomous permissions saved successfully.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleReset = () => {
    setMaxFare(20000);
    setCurrency('INR');
    setMaxStops(1);
    setMinConnectionTime(90);
    setMaxDelayHours(8);
    setCabin('ECONOMY');
    setAutoRebooking(true);
    setAutoHotel(true);
    setSavedMessage('✓ Reset to Appendix C default policy.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Travel Policies & Settings</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Reset Defaults (Appendix C)
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
            FR-08 & Appendix C Travel Policy Contract
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Travel Policies & Concierge Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Deterministic business rules enforced by the Policy Engine before autonomous rebooking execution.
          </p>
        </div>

        {savedMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Autonomous Permissions Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Autonomous Action Permissions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={autoRebooking}
                  onChange={(e) => setAutoRebooking(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div>
                  <span className="font-bold text-white text-xs block">Autonomous Flight Rebooking</span>
                  <span className="text-[11px] text-slate-400">
                    Automatically confirm alternative flights that satisfy all corporate travel policy limits.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={autoHotel}
                  onChange={(e) => setAutoHotel(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div>
                  <span className="font-bold text-white text-xs block">Autonomous Hotel Adjustment</span>
                  <span className="text-[11px] text-slate-400">
                    Automatically synchronize downstream hotel check-in dates after flight rebooking confirmation.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Hard Constraints Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Deterministic Policy Engine Limits</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Maximum Additional Fare ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={maxFare}
                    onChange={(e) => setMaxFare(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Alternatives exceeding ₹{maxFare.toLocaleString('en-IN')} trigger FR-10 Human Approval.
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Minimum Connection Buffer (Minutes)
                </label>
                <input
                  type="number"
                  value={minConnectionTime}
                  onChange={(e) => setMinConnectionTime(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Layovers below {minConnectionTime}m are classified as CONNECTION_RISK / rejected.
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Maximum Acceptable Arrival Delay (Hours)
                </label>
                <input
                  type="number"
                  value={maxDelayHours}
                  onChange={(e) => setMaxDelayHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Preferred Cabin Class
                </label>
                <select
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business Class</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Maximum Allowed Stops
                </label>
                <select
                  value={maxStops}
                  onChange={(e) => setMaxStops(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>0 (Direct Flights Only)</option>
                  <option value={1}>1 Stop Maximum</option>
                  <option value={2}>2 Stops Maximum</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Preferred Airlines (Configurable)
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white">
                    Air India (AI)
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white">
                    British Airways (BA)
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white">
                    Lufthansa (LH)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button variant="primary" type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Save Policy Configuration</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
