// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 40 & 52: Notification Center Component
import React, { useState } from 'react';
import { NotificationItem } from '../../types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  isLoading?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'UNREAD'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading notification feed...
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-slate-500 text-sm">
          No notifications found.
        </div>
      )}

      {/* Notification Cards (Section 40) */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isCritical = item.type.includes('CRITICAL') || item.type.includes('DISRUPTION');

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition space-y-3 ${
                !item.read
                  ? isCritical
                    ? 'bg-red-950/20 border-red-800/80 shadow-md shadow-red-950/30'
                    : 'bg-slate-900 border-blue-800/70 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!item.read && (
                    <button
                      onClick={() => onMarkAsRead(item.id)}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium">{item.message}</p>

              {/* Section 40 Contract Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3.5 rounded-lg border border-slate-800/80">
                {item.whatHappened && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                      What Happened
                    </span>
                    <span className="text-slate-300">{item.whatHappened}</span>
                  </div>
                )}
                {item.whatSystemDid && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                      Autonomous Action
                    </span>
                    <span className="text-emerald-300">{item.whatSystemDid}</span>
                  </div>
                )}
                {item.currentStatus && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                      Current Status
                    </span>
                    <span className="text-blue-300">{item.currentStatus}</span>
                  </div>
                )}
                {item.whatUserMustDo && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                      Traveler Action Required
                    </span>
                    <span className="text-amber-300 font-medium">{item.whatUserMustDo}</span>
                  </div>
                )}
              </div>

              {/* Extended Booking/Hotel changes preview */}
              {(item.newFlightDetails || item.hotelChanges || item.confirmationNumber) && (
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] border-t border-slate-800/60 text-slate-400">
                  {item.confirmationNumber && (
                    <span>
                      PNR: <strong className="text-white font-mono">{item.confirmationNumber}</strong>
                    </span>
                  )}
                  {item.newFlightDetails && (
                    <span>
                      Flight: <strong className="text-white">{item.newFlightDetails}</strong>
                    </span>
                  )}
                  {item.additionalCost && (
                    <span>
                      Cost: <strong className="text-emerald-400">{item.additionalCost}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
