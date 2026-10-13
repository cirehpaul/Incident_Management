'use client';

import React, { useState, useEffect } from 'react';
import {
  getStoredReports,
  deleteStoredReport,
  type StoredReport,
} from '@/lib/storage/report-storage';

interface StoredReportsListProps {
  onOpenReport: (report: StoredReport) => void;
}

export function StoredReportsList({ onOpenReport }: StoredReportsListProps) {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadReports = () => {
    setReports(getStoredReports());
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = (id: string) => {
    deleteStoredReport(id);
    setDeleteConfirmId(null);
    loadReports();
  };

  return (
    <div className="stored-reports-container card rounded-2xl p-6 border border-slate-700/60 bg-slate-900/90 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15 text-sky-300 font-bold text-lg">
            📋
          </div>
          <div>
            <h3 className="m-0 text-lg font-bold text-white tracking-tight">
              Stored Reports Archive
            </h3>
            <p className="m-0 text-xs text-slate-300">
              Access and view previously saved reports directly in the Report view.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/25">
          {reports.length} {reports.length === 1 ? 'Report Stored' : 'Reports Stored'}
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <div className="text-3xl mb-2">📂</div>
          <p className="text-sm font-medium text-slate-300">No reports stored yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            When you generate a Weekly SLA or Aging report, click the{' '}
            <span className="text-emerald-400 font-semibold">💾 Save Report</span> button in the
            footer to save and store it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            const isWeekly = report.type === 'weekly';
            return (
              <div
                key={report.id}
                className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-4 transition-all hover:border-sky-400/40 hover:bg-slate-800/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        isWeekly
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isWeekly ? 'Weekly SLA' : 'Aging Trend'}
                    </span>
                    <span className="text-[11px] text-slate-400" title={report.savedAt}>
                      {report.savedAtFormatted}
                    </span>
                  </div>

                  <h4 className="m-0 text-sm font-bold text-white line-clamp-1">
                    {report.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-1">
                    {report.period}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReport(report)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    <span>Open Report</span>
                    <span>📋</span>
                  </button>

                  {deleteConfirmId === report.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        className="px-2 py-1.5 text-[11px] font-bold rounded bg-rose-600 hover:bg-rose-500 text-white"
                        title="Confirm deletion"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 text-[11px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(report.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete saved report"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
