// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 41, 42 & 52: Audit & Decision Timeline Component
import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';

interface AuditTimelineProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, isLoading }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [actorFilter, setActorFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (actorFilter === 'ALL') return true;
    return l.actor === actorFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 gap-2">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['ALL', 'AI_AGENT', 'SYSTEM', 'USER'].map((actor) => (
            <button
              key={actor}
              onClick={() => setActorFilter(actor)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                actorFilter === actor
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {actor === 'ALL' ? 'All Entities' : actor}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-mono">{filteredLogs.length} Trace Events</span>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading audit trail...
        </div>
      )}

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l border-slate-800 space-y-6">
        {filteredLogs.map((entry) => {
          const isAI = entry.actor === 'AI_AGENT';
          const isSystem = entry.actor === 'SYSTEM';

          return (
            <div key={entry.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 transition ${
                  isAI
                    ? 'bg-purple-500 ring-2 ring-purple-900'
                    : isSystem
                    ? 'bg-emerald-500 ring-2 ring-emerald-900'
                    : 'bg-blue-500 ring-2 ring-blue-900'
                }`}
              />

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isAI
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : isSystem
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {entry.actor}
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {entry.event}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                {/* Main Action & Decision */}
                <div className="text-xs space-y-1">
                  <p className="text-slate-200 font-medium">{entry.reason || entry.action}</p>
                  {entry.decisionId && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Decision ID: <span className="text-blue-400">{entry.decisionId}</span>
                      {entry.confidence && (
                        <span> • Confidence: {Math.round(entry.confidence * 100)}%</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Reason Codes (Section 42) */}
                {entry.reasonCodes && entry.reasonCodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.reasonCodes.map((code) => (
                      <span
                        key={code}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-emerald-400 border border-slate-800"
                      >
                        #{code}
                      </span>
                    ))}
                  </div>
                )}

                {/* Inspect Details Button */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                  <span className="text-emerald-400 font-semibold font-mono">
                    STATUS: {entry.result}
                  </span>
                  <button
                    onClick={() => setSelectedLog(entry)}
                    className="text-blue-400 hover:text-blue-300 underline font-mono"
                  >
                    [ Inspect Full Trace ]
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-blue-400 font-bold block">
                  Immutable Audit Record ({selectedLog.id})
                </span>
                <h3 className="text-lg font-bold text-white font-mono">{selectedLog.event}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Actor</span>
                  <span className="text-white font-semibold font-mono">{selectedLog.actor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="text-white font-mono">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Itinerary ID</span>
                  <span className="text-white font-mono">{selectedLog.itineraryId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Result</span>
                  <span className="text-emerald-400 font-mono font-bold">{selectedLog.result}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Reason / Rationale:</span>
                <p className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 italic">
                  "{selectedLog.reason || selectedLog.action}"
                </p>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Raw Execution Metadata:</span>
                  <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
