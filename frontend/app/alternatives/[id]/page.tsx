'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 13, 14, 52: Interactive Alternative Flights Page
import React, { useState } from 'react';
import Link from 'next/link';
import { useDisruption } from '../../../hooks/useDisruption';
import { useRebooking } from '../../../hooks/useRebooking';
import { AlternativeCard } from '../../../components/alternatives/AlternativeCard';
import { AlternativeComparison } from '../../../components/alternatives/AlternativeComparison';
import { RebookingProgress } from '../../../components/rebooking/RebookingProgress';
import { ApprovalModal } from '../../../components/approval/ApprovalModal';
import { HotelModificationCard } from '../../../components/hotel/HotelModificationCard';
import { AlternativeFlight } from '../../../types';

export default function AlternativesPage({ params }: { params: { id: string } }) {
  const { disruption, alternatives, isLoading, error, refresh } = useDisruption(params.id);
  const { execute, approve, reject, reset, loading: isRebooking, step, activeRequest, error: rebookingError } = useRebooking();

  const [selectedFlight, setSelectedFlight] = useState<AlternativeFlight | null>(null);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'CARDS' | 'COMPARISON'>('CARDS');

  const handleSelectAlternative = async (alt: AlternativeFlight) => {
    setSelectedFlight(alt);

    if (alt.requiresApproval || !alt.policyCompliant) {
      // Trigger FR-10 Human Approval Workflow
      setShowApprovalModal(true);
    } else {
      // Trigger Autonomous Rebooking Workflow
      setShowProgressModal(true);
      await execute(params.id, alt.id, {
        requiresApproval: false,
        fare: alt.additionalFare,
        airline: alt.airline,
        flightNumber: alt.flightNumber,
      });
    }
  };

  const handleApproveEscalation = async () => {
    if (!selectedFlight) return;
    setShowApprovalModal(false);
    setShowProgressModal(true);
    await execute(params.id, selectedFlight.id, {
      requiresApproval: false,
      fare: selectedFlight.additionalFare,
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
    });
  };

  const handleRejectEscalation = async () => {
    if (activeRequest) {
      await reject(activeRequest.id);
    }
    setShowApprovalModal(false);
    setSelectedFlight(null);
  };

  const topPick = alternatives.find((a) => a.recommended) || alternatives[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <Link href={`/disruptions/${params.id}`} className="hover:text-white transition">
              Disruption ({params.id})
            </Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Alternatives</span>
          </div>

          <button
            onClick={refresh}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            ↻ Refresh Candidates
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
                AI Decision Engine (FR-06, FR-07)
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                Ranked Alternative Flights
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Disruption: <span className="text-rose-400 font-semibold">AI101 Mumbai → Delhi Cancelled</span> • Downstream Destination: London (LHR)
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'CARDS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode('COMPARISON')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'COMPARISON' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Comparison Matrix
              </button>
            </div>
          </div>
        </div>

        {/* AI Top Recommendation Banner */}
        {topPick && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/50 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-300">
                  Recommended Autonomous Action
                </span>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-800">
                AI Confidence: {Math.round(topPick.confidence * 100)}%
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-white">
                  {topPick.airline} ({topPick.flightNumber})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Departing {topPick.departureTime} → Arriving London {topPick.arrivalTime} • {topPick.duration} ({topPick.stops} Stop)
                </p>
                <p className="text-xs text-emerald-300/90 italic mt-2 bg-slate-950/80 p-2.5 rounded border border-emerald-900/60 max-w-2xl">
                  "{topPick.explanation}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-end md:items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    +₹{topPick.additionalFare.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400">Within ₹20,000 policy</span>
                </div>
                <button
                  onClick={() => handleSelectAlternative(topPick)}
                  disabled={isRebooking}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
                >
                  <span>⚡</span> [ Rebook Automatically ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Alternatives Grid or Matrix */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <span className="animate-spin inline-block mr-2">⟳</span>
            Evaluating candidate alternatives against corporate travel policies...
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        ) : viewMode === 'CARDS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alternatives.map((alt) => (
              <AlternativeCard
                key={alt.id}
                alternative={alt}
                onSelect={handleSelectAlternative}
                isSelecting={isRebooking && selectedFlight?.id === alt.id}
              />
            ))}
          </div>
        ) : (
          <AlternativeComparison
            alternatives={alternatives}
            onSelect={handleSelectAlternative}
            isSelecting={isRebooking}
          />
        )}

        {/* Downstream Hotel Synchronization Preview */}
        <div className="pt-4">
          <HotelModificationCard isFlightRebooked={step === 'CONFIRMED'} />
        </div>
      </div>

      {/* Rebooking Progress Stepper Modal */}
      <RebookingProgress
        isOpen={showProgressModal}
        step={step}
        flight={selectedFlight}
        request={activeRequest}
        error={rebookingError}
        onClose={() => {
          setShowProgressModal(false);
          reset();
        }}
        onRetry={() => {
          if (selectedFlight) {
            handleSelectAlternative(selectedFlight);
          }
        }}
      />

      {/* Human Approval Escalation Modal (FR-10) */}
      <ApprovalModal
        isOpen={showApprovalModal}
        flight={selectedFlight}
        request={activeRequest}
        isLoading={isRebooking}
        onApprove={handleApproveEscalation}
        onReject={handleRejectEscalation}
        onClose={() => setShowApprovalModal(false)}
      />
    </div>
  );
}
