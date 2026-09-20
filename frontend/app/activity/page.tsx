'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 41, 42 & 52: Audit & Decision Timeline Page
import React from 'react';
import Link from 'next/link';
import { useAudit } from '../../hooks/useAudit';
import { AuditTimeline } from '../../components/audit/AuditTimeline';

export default function ActivityPage() {
  const { logs, loading, refresh } = useAudit('TRIP-001');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">Audit & Activity Timeline</span>
          </div>

          <button
            onClick={refresh}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            ↻ Refresh Trail
          </button>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
            FR-13 & Sections 41, 42 Compliance
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Audit & Decision Trail</h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable, traceable log of all autonomous detections, AI recommendations, deterministic policy validations, and executed transactions.
          </p>
        </div>

        {/* Audit Timeline Component */}
        <AuditTimeline logs={logs} isLoading={loading} />
      </div>
    </div>
  );
}
