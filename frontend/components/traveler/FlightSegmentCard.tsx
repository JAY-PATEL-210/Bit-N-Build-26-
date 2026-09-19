// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import { Plane, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Flight } from '@/types/index';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface FlightSegmentCardProps {
  flight: Flight;
  legNumber?: number;
  highlightDisruption?: boolean;
}

export const FlightSegmentCard: React.FC<FlightSegmentCardProps> = ({
  flight,
  legNumber,
  highlightDisruption = false,
}) => {
  const isCancelled = flight.status === 'CANCELLED';
  const isDelayed = flight.status === 'DELAYED';

  return (
    <div
      className={`rounded-xl p-5 border transition-all ${
        isCancelled
          ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20'
          : isDelayed
          ? 'bg-amber-950/20 border-amber-800/80'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-base">
                {flight.airline} {flight.flightNumber}
              </span>
              {legNumber && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                  Leg {legNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Scheduled Service</p>
          </div>
        </div>

        <StatusBadge status={flight.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-950/50 p-4 rounded-lg border border-slate-800/60">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Departure</span>
          <p className="text-xl font-bold text-slate-100">{flight.origin}</p>
          <p className="text-xs text-slate-400">{flight.scheduledDeparture}</p>
          {flight.terminal && <p className="text-[11px] text-slate-500 mt-0.5">Terminal {flight.terminal}</p>}
        </div>

        <div className="flex flex-col items-center justify-center text-slate-500">
          <ArrowRight className="w-5 h-5 mb-1 text-slate-600 hidden sm:block" />
          <span className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-400">Direct</span>
        </div>

        <div className="sm:text-right">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Arrival</span>
          <p className="text-xl font-bold text-slate-100">{flight.destination}</p>
          <p className="text-xs text-slate-400">{flight.scheduledArrival}</p>
          {flight.gate && <p className="text-[11px] text-slate-500 mt-0.5">Gate {flight.gate}</p>}
        </div>
      </div>

      {isCancelled && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Flight Cancelled by Airline • Concierge Autonomous Pipeline Engaged</span>
        </div>
      )}
    </div>
  );
};
