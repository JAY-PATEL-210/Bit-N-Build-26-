'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 40 & 52: Traveler Notification Center Page
import React from 'react';
import Link from 'next/link';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCenter } from '../../components/notifications/NotificationCenter';

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, addComment, refresh } =
    useNotifications();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">Notification Center</span>
          </div>

          <button
            onClick={refresh}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
                FR-12 & Section 40 Contract
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Traveler Notifications</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time proactive alerts for flight disruptions, autonomous rebookings, and hotel adaptations.
            </p>
          </div>
        </div>

        {/* Notification Center Feed */}
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onCommentAdded={addComment}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
