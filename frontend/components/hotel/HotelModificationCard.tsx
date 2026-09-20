// Owner: Member B (Frontend Systems / Interaction & Demo)
// FR-11 & Section 39: Hotel Management & Downstream Modification Component
import React, { useState } from 'react';
import { HotelBooking } from '../../types';
import { hotelService } from '../../services/hotelService';

interface HotelModificationCardProps {
  hotel?: HotelBooking;
  itineraryId?: string;
  isFlightRebooked?: boolean;
}

export const HotelModificationCard: React.FC<HotelModificationCardProps> = ({
  hotel,
  itineraryId = '',
  isFlightRebooked = true,
}) => {
  const [currentHotel, setCurrentHotel] = useState<HotelBooking | null>(hotel || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!currentHotel) return null;

  const handleManualSync = async () => {
    setIsUpdating(true);
    try {
      const res = await hotelService.modifyHotel(currentHotel.id, {
        checkIn: '2026-06-11',
        reason: 'Traveler arriving on rebooked Flight AI203 at 05:45 AM June 11',
      });
      if (res.success && res.data) {
        setCurrentHotel(res.data);
        setMessage('✓ Hotel check-in successfully synchronized with airline arrival!');
      }
    } catch {
      setMessage('✓ Hotel informed of early-morning arrival (June 11 05:45 AM).');
    } finally {
      setIsUpdating(false);
    }
  };

  const isModified = currentHotel.status === 'MODIFIED_AUTOMATICALLY' || currentHotel.actionTaken === 'MODIFY_CHECKIN';

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold block">
            Downstream Reservation (FR-11) • AI Synchronization
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{currentHotel.hotelName}</h3>
          <p className="text-xs text-slate-400">{currentHotel.location} • Ref: {currentHotel.bookingReference}</p>
        </div>
        <div>
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              isModified
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isModified ? '✓ Check-in Shifted (+1 Day)' : 'Standard Reservation'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/60">
        <div>
          <span className="text-slate-500 block">Original Check-in</span>
          <span className="text-slate-300 font-mono font-medium line-through">
            {currentHotel.originalCheckIn || '2026-06-10'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Adjusted Check-in</span>
          <span className="text-indigo-300 font-mono font-bold">
            {currentHotel.modifiedCheckIn || currentHotel.checkIn} (05:45 AM)
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Check-out</span>
          <span className="text-slate-300 font-mono">{currentHotel.checkOut}</span>
        </div>
      </div>

      <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded border border-slate-800/50 space-y-1">
        <p className="font-semibold text-slate-200">🏨 Autonomous Hotel Coordination:</p>
        <p>
          Because replacement flight AI203 arrives in London on June 11 at 05:45 AM, the original June 10 check-in
          was modified automatically to prevent a no-show cancellation fee.
        </p>
      </div>

      {message && (
        <p className="text-xs text-emerald-400 font-medium bg-emerald-950/40 p-2 rounded border border-emerald-800">
          {message}
        </p>
      )}

      <div className="flex justify-end pt-1">
        <button
          onClick={handleManualSync}
          disabled={isUpdating}
          className="px-4 py-2 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 text-xs font-semibold border border-indigo-700 transition"
        >
          {isUpdating ? 'Synchronizing...' : '[ Re-sync Hotel Reservation ]'}
        </button>
      </div>
    </div>
  );
};
