'use client';

import React, { useRef, useState } from 'react';
import type { AgingReportData } from '@/types/aging';
import type { Incident } from '@/types/incident';
import { AGING_BUCKET_ORDER, AGING_BUCKET_LABELS } from '@/types/aging';
import { formatSLAPercentage } from '@/lib/aging/calculator';
import { saveReport } from '@/lib/storage/report-storage';

interface AgingReportTableProps {
  data: AgingReportData;
  onCellClick?: (title: string, incidentIds: string[]) => void;
  routedIncidents?: Incident[];
  onSaveReport?: () => void;
}

export function AgingReportTable({
  data,
  onCellClick,
  routedIncidents,
  onSaveReport,
}: AgingReportTableProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    saveReport({
      type: 'aging',
      title: data.reportTitle,
      period: data.reportPeriod,
      reportData: data,
      routedIncidents,
    });
    setIsSaved(true);
    if (onSaveReport) onSaveReport();
    setTimeout(() => setIsSaved(false), 4000);
  };

  const formattedDate = (() => {
    try {
      const d =
        typeof data.generatedAt === 'string'
          ? new Date(data.generatedAt)
          : data.generatedAt;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  const getPercentageClass = (value: number | null): string => {
    if (value === null) return 'sla-na';
    if (value >= 90) return 'sla-excellent';
    if (value >= 70) return 'sla-good';
    if (value >= 50) return 'sla-warning';
    return 'sla-critical';
  };

  const handleClick = (title: string, ids: string[]) => {
    if (onCellClick && ids.length > 0) {
      onCellClick(title, ids);
    }
  };

  // Calculate aging grand totals per bucket
  const bucketTotals: Record<string, number> = {};
  for (const bucket of AGING_BUCKET_ORDER) {
    bucketTotals[bucket] = data.agingRows.reduce((sum, row) => sum + row.buckets[bucket], 0);
  }

  return (
    <div className="aging-report-wrapper" ref={reportRef}>
      <div className="aging-report-canvas" id="aging-report-canvas">

        {/* ═══════ TABLE 1: SLA COMPLIANCE ═══════ */}
        <div className="aging-section-header aging-sla-header">
          <h1 className="aging-report-title">Aging IR</h1>
          <p className="aging-report-period">{data.reportPeriod}</p>
        </div>

        <table className="aging-sla-table">
          <thead>
            <tr className="aging-header-groups">
              <th className="aging-col-tech" rowSpan={2}>Final Team</th>
              <th className="aging-col-total-irs" rowSpan={2}>Total # of IRs</th>
              <th className="aging-header-fr" colSpan={3}>First Response</th>
              <th className="aging-header-rt" colSpan={3}>Resolution Time</th>
            </tr>
            <tr className="aging-header-sub">
              <th className="aging-sub-failed">Failed</th>
              <th className="aging-sub-passed">Passed</th>
              <th className="aging-sub-sla">SLA Pass Rate this week</th>
              <th className="aging-sub-failed">Failed</th>
              <th className="aging-sub-passed">Passed</th>
              <th className="aging-sub-sla">SLA Pass Rate this week</th>
            </tr>
          </thead>
          <tbody>
            {data.slaRows.map((row) => (
              <tr key={row.teamName} className="aging-data-row">
                <td className="aging-cell-tech">{row.teamName}</td>
                <td
                  className="aging-cell-num clickable"
                  onClick={() => handleClick(`${row.teamName} — Total IRs`, row.incidentIds)}
                >
                  {row.totalIRs > 0 ? row.totalIRs : 0}
                </td>
                {/* First Response */}
                <td
                  className={`aging-cell-num clickable ${row.firstResponse.failed > 0 ? 'aging-has-failures' : ''}`}
                  onClick={() => handleClick(`${row.teamName} — FR Failed`, row.firstResponse.failedIds)}
                >
                  {row.totalIRs > 0 ? row.firstResponse.failed : 0}
                </td>
                <td
                  className="aging-cell-num clickable"
                  onClick={() => handleClick(`${row.teamName} — FR Passed`, row.firstResponse.passedIds)}
                >
                  {row.totalIRs > 0 ? row.firstResponse.passed : 0}
                </td>
                <td className={`aging-cell-sla ${getPercentageClass(row.firstResponse.slaPassRate)}`}>
                  {row.totalIRs > 0 ? formatSLAPercentage(row.firstResponse.slaPassRate) : 'N/A'}
                </td>
                {/* Resolution Time */}
                <td
                  className={`aging-cell-num clickable ${row.resolutionTime.failed > 0 ? 'aging-has-failures' : ''}`}
                  onClick={() => handleClick(`${row.teamName} — RT Failed`, row.resolutionTime.failedIds)}
                >
                  {row.totalIRs > 0 ? row.resolutionTime.failed : 0}
                </td>
                <td
                  className="aging-cell-num clickable"
                  onClick={() => handleClick(`${row.teamName} — RT Passed`, row.resolutionTime.passedIds)}
                >
                  {row.totalIRs > 0 ? row.resolutionTime.passed : 0}
                </td>
                <td className={`aging-cell-sla ${getPercentageClass(row.resolutionTime.slaPassRate)}`}>
                  {row.totalIRs > 0 ? formatSLAPercentage(row.resolutionTime.slaPassRate) : 'N/A'}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="aging-total-row">
              <td className="aging-cell-tech aging-total-label">Total</td>
              <td className="aging-total-val">{data.slaTotals.totalIRs}</td>
              <td className={`aging-total-val ${data.slaTotals.firstResponse.failed > 0 ? 'aging-has-failures' : ''}`}>
                {data.slaTotals.firstResponse.failed}
              </td>
              <td className="aging-total-val">{data.slaTotals.firstResponse.passed}</td>
              <td className={`aging-total-sla ${getPercentageClass(data.slaTotals.firstResponse.slaPassRate)}`}>
                {formatSLAPercentage(data.slaTotals.firstResponse.slaPassRate)}
              </td>
              <td className={`aging-total-val ${data.slaTotals.resolutionTime.failed > 0 ? 'aging-has-failures' : ''}`}>
                {data.slaTotals.resolutionTime.failed}
              </td>
              <td className="aging-total-val">{data.slaTotals.resolutionTime.passed}</td>
              <td className={`aging-total-sla ${getPercentageClass(data.slaTotals.resolutionTime.slaPassRate)}`}>
                {formatSLAPercentage(data.slaTotals.resolutionTime.slaPassRate)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ═══════ TABLE 2: AGING DISTRIBUTION ═══════ */}
        <div className="aging-section-header aging-dist-header">
          <h1 className="aging-report-title">Aging Incident Report</h1>
        </div>

        <table className="aging-dist-table">
          <thead>
            <tr className="aging-dist-header-groups">
              <th className="aging-col-tech" rowSpan={2}>FINAL TEAM</th>
              <th className="aging-dist-main-header" colSpan={6}>Aging Incident Report</th>
              <th className="aging-dist-this-week" rowSpan={2}>
                <div className="aging-week-label">Total Aging IRs</div>
                <div className="aging-week-sub">as of this week</div>
              </th>
              <th className="aging-dist-last-week" rowSpan={2}>
                <div className="aging-week-label">Total Aging IRs</div>
                <div className="aging-week-sub">as of last week</div>
              </th>
            </tr>
            <tr className="aging-dist-header-sub">
              {AGING_BUCKET_ORDER.map((bucket) => (
                <th key={bucket} className="aging-bucket-header">
                  {AGING_BUCKET_LABELS[bucket]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.agingRows.map((row) => {
              const prevWeekTotal = data.previousWeek.teamTotals[row.teamName];
              return (
                <tr key={row.teamName} className="aging-dist-data-row">
                  <td className="aging-cell-tech">{row.teamName}</td>
                  {AGING_BUCKET_ORDER.map((bucket) => (
                    <td
                      key={bucket}
                      className={`aging-bucket-cell clickable ${row.buckets[bucket] > 0 ? 'aging-bucket-filled' : ''}`}
                      onClick={() => handleClick(
                        `${row.teamName} — ${AGING_BUCKET_LABELS[bucket]}`,
                        row.bucketIncidentIds[bucket]
                      )}
                    >
                      {row.buckets[bucket] > 0 ? row.buckets[bucket] : ''}
                    </td>
                  ))}
                  <td className="aging-this-week-cell">
                    {row.totalAging > 0 ? row.totalAging : '-'}
                  </td>
                  <td className="aging-last-week-cell">
                    {prevWeekTotal !== null && prevWeekTotal !== undefined ? prevWeekTotal : '-'}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="aging-dist-total-row">
              <td className="aging-cell-tech aging-total-label">Total</td>
              {AGING_BUCKET_ORDER.map((bucket) => (
                <td key={bucket} className="aging-dist-total-val">
                  {bucketTotals[bucket] > 0 ? bucketTotals[bucket] : ''}
                </td>
              ))}
              <td className="aging-dist-grand-this">
                {data.agingGrandTotal > 0 ? data.agingGrandTotal : '-'}
              </td>
              <td className="aging-dist-grand-last">
                {data.previousWeek.grandTotal !== null ? data.previousWeek.grandTotal : '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="aging-report-footer">
          <p>Generated: {formattedDate}</p>
          <button
            type="button"
            className={`btn-save-report ${isSaved ? 'is-saved' : ''}`}
            onClick={handleSave}
            title="Save report to Stored Reports in browser storage"
          >
            {isSaved ? (
              <>
                <span className="save-icon">✓</span> Report Saved
              </>
            ) : (
              <>
                <span className="save-icon">💾</span> Save Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
