// Owner: Member A (Frontend Lead / Traveler Experience)
// Section 12 & 51: Travel Timeline (Flight 1 -> Flight 2 -> Hotel)
import React from 'react';
import { Flight, HotelBooking } from '../../types';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';

interface TripTimelineProps {
  flights: Flight[];
  hotel?: HotelBooking;
  isDisrupted?: boolean;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({ flights, hotel, isDisrupted }) => {
  return (
    <div className="space-y-6">
      <div className="relative pl-8 border-l-2 border-slate-800 space-y-8">
        {/* Flights */}
        {flights.map((flight, idx) => {
          const isCancelled = flight.status === 'CANCELLED';
          const isDelayed = flight.status === 'DELAYED';

          return (
            <div key={flight.id} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-slate-950 flex items-center justify-center text-[10px] font-bold ${
                  isCancelled
                    ? 'bg-red-500 text-white ring-4 ring-red-950'
                    : isDelayed
                    ? 'bg-amber-500 text-white ring-4 ring-amber-950'
                    : 'bg-blue-600 text-white ring-4 ring-blue-950'
                }`}
              >
                {idx + 1}
              </div>

              {/* Flight Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isCancelled
                    ? 'bg-red-950/20 border-red-800/80 shadow-lg shadow-red-950/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Leg 0{idx + 1} • Flight Segment
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      {flight.airline} <span className="text-blue-400 font-mono">({flight.flightNumber})</span>
                    </h4>
                  </div>
                  <StatusBadge status={flight.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] block">From</span>
                    <span className="font-bold text-white text-sm">{flight.origin}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:30 AM'}
                    </span>
                    {flight.terminal && (
                      <span className="text-slate-500 text-[10px] block mt-0.5">{flight.terminal}</span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center items-center text-center">
                    <span className="text-[11px] text-slate-400">Non-Stop</span>
                    <div className="w-full h-0.5 bg-slate-700 relative my-1">
                      <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
                    </div>
                    {flight.gate && (
                      <span className="text-[10px] text-blue-400 font-mono">{flight.gate}</span>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] block">To</span>
                    <span className="font-bold text-white text-sm">{flight.destination}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {flight.scheduledArrival ? new Date(flight.scheduledArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:45 AM'}
                    </span>
                  </div>
                </div>

                {isCancelled && (
                  <div className="mt-3 p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                    ⚠️ <strong>Disruption Broadcast:</strong> This flight was cancelled by the carrier. Downstream connections are triggered for autonomous replanning.
                  </div>
                )}
              </div>

              {/* Connection / Layover Indicator between Leg 1 and 2 */}
              {idx === 0 && flights.length > 1 && (
                <div className="py-2 pl-4 flex items-center gap-3 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span className="font-mono">Layover in Delhi (DEL) • 3h 00m connection window</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Destination Hotel */}
        {hotel && (
          <div className="relative group">
            {/* Timeline Pin */}
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-slate-950 bg-purple-600 text-white flex items-center justify-center text-xs ring-4 ring-purple-950">
              🏨
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                    Accommodation • End Milestone
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{hotel.hotelName}</h4>
                  <p className="text-xs text-slate-400">{hotel.location} • Ref: {hotel.bookingReference}</p>
                </div>
                <StatusBadge status={hotel.status} label={hotel.status.replace(/_/g, ' ')} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/70">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Check-in</span>
                  <span className="font-bold text-white">{hotel.checkIn}</span>
                  <span className="text-slate-400 text-[10px] block">Standard: 02:00 PM</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Check-out</span>
                  <span className="font-bold text-white">{hotel.checkOut}</span>
                  <span className="text-slate-400 text-[10px] block">11:00 AM</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Rate</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₹{hotel.pricePerNight?.toLocaleString('en-IN') || '7,500'}/night
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
