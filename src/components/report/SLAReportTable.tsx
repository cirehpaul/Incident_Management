'use client';

import React, { useRef } from 'react';
import type { WeeklyReportData } from '@/types/sla';
import { formatSLAPercentage } from '@/lib/sla/calculator';

interface SLAReportTableProps {
  data: WeeklyReportData;
  onCellClick?: (title: string, incidentIds: string[]) => void;
}

export function SLAReportTable({ data, onCellClick }: SLAReportTableProps) {
  const reportRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="report-wrapper" ref={reportRef}>
      <div className="report-canvas" id="sla-report-canvas">
        {/* Report Title */}
        <div className="report-title-bar">
          <h1 className="report-main-title">Closed Incident Weekly Report</h1>
          <p className="report-period">{data.reportPeriod}</p>
        </div>

        {/* Main Report Table */}
        <table className="report-table">
          <thead>
            {/* Top Header Row — Groups */}
            <tr className="report-header-groups">
              <th className="col-technician header-technician" rowSpan={2}>
                Final Team
              </th>
              <th className="header-first-response" colSpan={5}>
                First Response
              </th>
              <th className="header-resolution" colSpan={5}>
                Resolution Time
              </th>
            </tr>

            {/* Sub-header Row */}
            <tr className="report-header-columns">
              {/* First Response columns */}
              <th className="header-total">Total # of IRs</th>
              <th className="header-failed">Failed</th>
              <th className="header-passed">Passed</th>
              <th className="header-sla-rate">SLA Pass Rate this week</th>
              <th className="header-sla-prev">SLA Pass Rate as of last week</th>

              {/* Resolution Time columns */}
              <th className="header-total">Total # of IRs</th>
              <th className="header-failed">Failed</th>
              <th className="header-passed">Passed</th>
              <th className="header-sla-rate">SLA Pass Rate this week</th>
              <th className="header-sla-prev">SLA Pass Rate as of last week</th>
            </tr>
          </thead>

          <tbody>
            {/* Team Rows */}
            {data.teamOrder.map((team) => {
              const fr = data.currentWeek.firstResponse.find((r) => r.teamName === team);
              const rt = data.currentWeek.resolutionTime.find((r) => r.teamName === team);
              const frPrev = data.previousWeek.firstResponse[team];
              const rtPrev = data.previousWeek.resolutionTime[team];

              if (!fr || !rt) return null;

              return (
                <tr key={team} className="report-data-row">
                  <td className="cell-technician">{team}</td>

                  {/* First Response */}
                  <td
                    className="cell-total clickable"
                    onClick={() => handleClick(`${team} — First Response — Total`, fr.incidentIds)}
                  >
                    {fr.total > 0 ? fr.total : 'N/A'}
                  </td>
                  <td
                    className={`cell-failed clickable ${fr.failed > 0 ? 'has-failures' : ''}`}
                    onClick={() => handleClick(`${team} — First Response — Failed`, fr.failedIncidentIds)}
                  >
                    {fr.total > 0 ? fr.failed : 'N/A'}
                  </td>
                  <td
                    className="cell-passed clickable"
                    onClick={() => handleClick(`${team} — First Response — Passed`, fr.passedIncidentIds)}
                  >
                    {fr.total > 0 ? fr.passed : 'N/A'}
                  </td>
                  <td className={`cell-sla-rate ${getPercentageClass(fr.slaPassRate)}`}>
                    {formatSLAPercentage(fr.slaPassRate)}
                  </td>
                  <td className={`cell-sla-prev ${getPercentageClass(frPrev)}`}>
                    {frPrev !== null && frPrev !== undefined ? `${frPrev.toFixed(2)}%` : 'N/A'}
                  </td>

                  {/* Resolution Time */}
                  <td
                    className="cell-total clickable"
                    onClick={() => handleClick(`${team} — Resolution — Total`, rt.incidentIds)}
                  >
                    {rt.total > 0 ? rt.total : 'N/A'}
                  </td>
                  <td
                    className={`cell-failed clickable ${rt.failed > 0 ? 'has-failures' : ''}`}
                    onClick={() => handleClick(`${team} — Resolution — Failed`, rt.failedIncidentIds)}
                  >
                    {rt.total > 0 ? rt.failed : 'N/A'}
                  </td>
                  <td
                    className="cell-passed clickable"
                    onClick={() => handleClick(`${team} — Resolution — Passed`, rt.passedIncidentIds)}
                  >
                    {rt.total > 0 ? rt.passed : 'N/A'}
                  </td>
                  <td className={`cell-sla-rate ${getPercentageClass(rt.slaPassRate)}`}>
                    {formatSLAPercentage(rt.slaPassRate)}
                  </td>
                  <td className={`cell-sla-prev ${getPercentageClass(rtPrev)}`}>
                    {rtPrev !== null && rtPrev !== undefined ? `${rtPrev.toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="report-total-row">
              <td className="cell-technician cell-total-label">Total</td>

              {/* First Response Total */}
              <td className="cell-total-value">
                {data.currentWeek.firstResponseTotal.total}
              </td>
              <td className={`cell-total-value ${data.currentWeek.firstResponseTotal.failed > 0 ? 'has-failures' : ''}`}>
                {data.currentWeek.firstResponseTotal.failed}
              </td>
              <td className="cell-total-value">
                {data.currentWeek.firstResponseTotal.passed}
              </td>
              <td className={`cell-total-sla ${getPercentageClass(data.currentWeek.firstResponseTotal.slaPassRate)}`}>
                {formatSLAPercentage(data.currentWeek.firstResponseTotal.slaPassRate)}
              </td>
              <td className={`cell-total-sla ${getPercentageClass(data.previousWeek.firstResponseTotal)}`}>
                {data.previousWeek.firstResponseTotal !== null
                  ? `${data.previousWeek.firstResponseTotal.toFixed(2)}%`
                  : 'N/A'}
              </td>

              {/* Resolution Total */}
              <td className="cell-total-value">
                {data.currentWeek.resolutionTimeTotal.total}
              </td>
              <td className={`cell-total-value ${data.currentWeek.resolutionTimeTotal.failed > 0 ? 'has-failures' : ''}`}>
                {data.currentWeek.resolutionTimeTotal.failed}
              </td>
              <td className="cell-total-value">
                {data.currentWeek.resolutionTimeTotal.passed}
              </td>
              <td className={`cell-total-sla ${getPercentageClass(data.currentWeek.resolutionTimeTotal.slaPassRate)}`}>
                {formatSLAPercentage(data.currentWeek.resolutionTimeTotal.slaPassRate)}
              </td>
              <td className={`cell-total-sla ${getPercentageClass(data.previousWeek.resolutionTimeTotal)}`}>
                {data.previousWeek.resolutionTimeTotal !== null
                  ? `${data.previousWeek.resolutionTimeTotal.toFixed(2)}%`
                  : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Weekly Completion Tables */}
        <div className="weekly-completion-container">
          {/* First Response Table */}
          <div className="weekly-completion-table">
            <h2 className="weekly-completion-title">Weekly Completion for First Response (Filed last 7 days)</h2>
            <table className="completion-table">
              <tbody>
                <tr>
                  <td className="comp-label" rowSpan={2}>Overdue Status</td>
                  <td className="comp-status">PASSED</td>
                  <td
                    className={`comp-count ${onCellClick && (data.weeklyCompletion.firstResponse.passedIncidentIds?.length || 0) > 0 ? 'clickable' : ''}`}
                    onClick={() => handleClick('Weekly Completion — First Response — Passed', data.weeklyCompletion.firstResponse.passedIncidentIds || [])}
                  >
                    {data.weeklyCompletion.firstResponse.passed}
                  </td>
                  <td className="comp-rate" rowSpan={2}>
                    {formatSLAPercentage(data.weeklyCompletion.firstResponse.slaPassRate)}
                  </td>
                </tr>
                <tr>
                  <td className="comp-status">FAILED</td>
                  <td
                    className={`comp-count ${onCellClick && (data.weeklyCompletion.firstResponse.failedIncidentIds?.length || 0) > 0 ? 'clickable' : ''}`}
                    onClick={() => handleClick('Weekly Completion — First Response — Failed', data.weeklyCompletion.firstResponse.failedIncidentIds || [])}
                  >
                    {data.weeklyCompletion.firstResponse.failed}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resolution Table */}
          <div className="weekly-completion-table">
            <h2 className="weekly-completion-title">Weekly Completion for Resolution (Filed last 7 days)</h2>
            <table className="completion-table">
              <tbody>
                <tr>
                  <td className="comp-label" rowSpan={2}>Overdue Status</td>
                  <td className="comp-status">PASSED</td>
                  <td
                    className={`comp-count ${onCellClick && (data.weeklyCompletion.resolution.passedIncidentIds?.length || 0) > 0 ? 'clickable' : ''}`}
                    onClick={() => handleClick('Weekly Completion — Resolution — Passed', data.weeklyCompletion.resolution.passedIncidentIds || [])}
                  >
                    {data.weeklyCompletion.resolution.passed}
                  </td>
                  <td className="comp-rate" rowSpan={2}>
                    {formatSLAPercentage(data.weeklyCompletion.resolution.slaPassRate)}
                  </td>
                </tr>
                <tr>
                  <td className="comp-status">FAILED</td>
                  <td
                    className={`comp-count ${onCellClick && (data.weeklyCompletion.resolution.failedIncidentIds?.length || 0) > 0 ? 'clickable' : ''}`}
                    onClick={() => handleClick('Weekly Completion — Resolution — Failed', data.weeklyCompletion.resolution.failedIncidentIds || [])}
                  >
                    {data.weeklyCompletion.resolution.failed}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p>Generated: {data.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
}
