// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import { Building2, Calendar, MapPin, Check } from 'lucide-react';
import { HotelBooking } from '@/types/index';
import { Badge } from '@/components/ui/Badge';

interface HotelCardProps {
  hotel: HotelBooking;
  isModified?: boolean;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, isModified = false }) => {
  return (
    <div className="rounded-xl p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base block">{hotel.hotelName}</span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hotel.location}</span>
            </div>
          </div>
        </div>

        {isModified ? (
          <Badge variant="purple" pulse>
            Check-in Auto-Adjusted
          </Badge>
        ) : (
          <Badge variant="success">
            <Check className="w-3 h-3 mr-1 inline" />
            Confirmed
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/60 text-sm">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Check-in</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-200">{hotel.checkIn}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Check-out</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-200">{hotel.checkOut}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <span>Booking Ref: <strong className="text-slate-300 font-mono">{hotel.bookingReference}</strong></span>
        <span className="text-emerald-400 font-medium">Auto-protection sync enabled</span>
      </div>
    </div>
  );
};
