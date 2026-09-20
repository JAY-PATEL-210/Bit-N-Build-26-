// Owner: Member B (Frontend Systems / Interaction & Demo)
// Section 40 & 52: Notification Center Component with Stated Reason & Support Inquiries
import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, Building2, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/button';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onCommentAdded?: (id: string, message: string) => void;
  isLoading?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onCommentAdded,
  isLoading,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  // State for free-text comments per notification card
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [commentFeedback, setCommentFeedback] = useState<Record<string, string>>({});

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const handleCommentSubmit = async (notificationId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[notificationId]?.trim();
    if (!text) return;

    setCommentLoading((prev) => ({ ...prev, [notificationId]: true }));
    setCommentFeedback((prev) => ({ ...prev, [notificationId]: '' }));

    try {
      const response = await notificationService.commentOnNotification(notificationId, {
        message: text,
      });

      if (response.success) {
        setCommentInputs((prev) => ({ ...prev, [notificationId]: '' }));
        setCommentFeedback((prev) => ({
          ...prev,
          [notificationId]: 'Question sent to flight concierge desk.',
        }));
        if (onCommentAdded) {
          onCommentAdded(notificationId, text);
        }
        setTimeout(() => {
          setCommentFeedback((prev) => ({ ...prev, [notificationId]: '' }));
        }, 4000);
      }
    } catch {
      // Error handling
    } finally {
      setCommentLoading((prev) => ({ ...prev, [notificationId]: false }));
    }
  };

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
      <div className="space-y-4">
        {filtered.map((item) => {
          const isCritical = item.type.includes('CRITICAL') || item.type.includes('DISRUPTION');
          const currentCommentText = commentInputs[item.id] || '';
          const isSubmittingComment = commentLoading[item.id] || false;
          const feedbackMsg = commentFeedback[item.id];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition space-y-4 ${
                !item.read
                  ? isCritical
                    ? 'bg-rose-950/25 border-rose-800/80 shadow-md shadow-rose-950/30'
                    : 'bg-slate-900 border-sky-800/70 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/60 opacity-90'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                  )}
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono" suppressHydrationWarning>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!item.read && (
                    <button
                      onClick={() => onMarkAsRead(item.id)}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium">{item.message}</p>

              {/* Section 40 Contract Attributes: WHAT HAPPENED / WHAT SYSTEM DID / CURRENT STATUS / WHAT USER MUST DO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/90 p-4 rounded-xl border border-slate-800/80">
                {/* 1. WHAT HAPPENED — includes airline's stated reason when present */}
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                    What Happened
                  </span>
                  <p className="text-slate-300">
                    {item.whatHappened || 'Operational schedule change detected.'}
                  </p>

                  {/* Stated Reason from Company Cancel/Delay */}
                  {item.reason && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                        <Building2 className="w-3 h-3 text-amber-400" />
                        <span>Carrier Disruption Reason</span>
                      </div>
                      <p className="italic text-slate-200">
                        &ldquo;{item.reason}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. WHAT THE SYSTEM DID */}
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                    What The System Did
                  </span>
                  <p className="text-emerald-300">
                    {item.whatSystemDid || 'Analyzed itinerary impact and verified policy limits.'}
                  </p>
                </div>

                {/* 3. CURRENT STATUS */}
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                    Current Status
                  </span>
                  <p className="text-blue-300">
                    {item.currentStatus || 'Processing automated safeguards.'}
                  </p>
                </div>

                {/* 4. WHAT THE USER MUST DO */}
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                    What The Traveler Must Do
                  </span>
                  <p className="text-amber-300 font-medium">
                    {item.whatUserMustDo || 'No immediate action required.'}
                  </p>
                </div>
              </div>

              {/* Extended Booking / Hotel Changes Details */}
              {(item.newFlightDetails || item.hotelChanges || item.confirmationNumber) && (
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] border-t border-slate-800/60 text-slate-400">
                  {item.confirmationNumber && (
                    <span>
                      PNR / Booking: <strong className="text-white font-mono">{item.confirmationNumber}</strong>
                    </span>
                  )}
                  {item.newFlightDetails && (
                    <span>
                      Flight: <strong className="text-white">{item.newFlightDetails}</strong>
                    </span>
                  )}
                  {item.additionalCost && (
                    <span>
                      Cost Impact: <strong className="text-emerald-400">{item.additionalCost}</strong>
                    </span>
                  )}
                  {item.hotelChanges && (
                    <span>
                      Hotel: <strong className="text-indigo-300">{item.hotelChanges}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Support Inquiries & Comments Thread */}
              <div className="pt-3 border-t border-slate-800/70 space-y-2.5">
                {item.comments && item.comments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Support Thread & Inquiries ({item.comments.length})
                    </span>
                    <div className="space-y-1.5">
                      {item.comments.map((comm, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                          <span>{comm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment / Question Textarea Form */}
                <form
                  onSubmit={(e) => handleCommentSubmit(item.id, e)}
                  className="space-y-2"
                >
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Add a comment / question for support
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      rows={2}
                      value={currentCommentText}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="e.g. Will my baggage be re-tagged automatically to the new flight?"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition resize-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!currentCommentText.trim() || isSubmittingComment}
                      className="sm:self-end bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {feedbackMsg && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{feedbackMsg}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
