// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import { Plane, Building2, Clock, AlertTriangle, CheckCircle2, ArrowDown } from 'lucide-react';
import { Flight, HotelBooking } from '@/types/index';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FlightSegmentCard } from './FlightSegmentCard';
import { HotelCard } from './HotelCard';

interface TripTimelineProps {
  flights: Flight[];
  hotel?: HotelBooking;
  disruptionFlightId?: string;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  flights,
  hotel,
  disruptionFlightId,
}) => {
  return (
    <div className="space-y-6">
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8">
        {flights.map((flight, index) => {
          const isTargetedDisruption = flight.id === disruptionFlightId || flight.status === 'CANCELLED';
          const isDownstreamAffected = index > 0 && flights[0].status === 'CANCELLED';

          return (
            <div key={flight.id} className="relative group">
              {/* Timeline node marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isTargetedDisruption
                    ? 'bg-rose-950 border-rose-500 text-rose-400 ring-4 ring-rose-950'
                    : isDownstreamAffected
                    ? 'bg-amber-950 border-amber-500 text-amber-400 ring-4 ring-amber-950'
                    : 'bg-slate-900 border-blue-500 text-blue-400 ring-4 ring-slate-950'
                }`}
              >
                <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-45" />
              </div>

              {/* Leg header */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Segment 0{index + 1} • Flight Leg
                </span>
                {isDownstreamAffected && (
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                    Connection At Risk
                  </span>
                )}
              </div>

              {/* Segment card */}
              <FlightSegmentCard
                flight={flight}
                legNumber={index + 1}
                highlightDisruption={isTargetedDisruption}
              />

              {/* Layover buffer notice between connecting flights */}
              {index < flights.length - 1 && (
                <div className="my-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>
                      Connection at <strong className="text-slate-200">{flight.destination}</strong>: 2h 45m buffer
                    </span>
                  </div>
                  <span className="text-emerald-400 font-medium">Within 90m Minimum Connection Policy</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Hotel Accommodation Node */}
        {hotel && (
          <div className="relative group pt-2">
            <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 bg-slate-900 border-indigo-500 text-indigo-400 ring-4 ring-slate-950 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Final Leg • Hotel Accommodation
              </span>
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/80">
                Auto-Synchronized
              </span>
            </div>

            <HotelCard hotel={hotel} isModified={flights[0]?.status === 'CANCELLED'} />
          </div>
        )}
      </div>
    </div>
  );
};
