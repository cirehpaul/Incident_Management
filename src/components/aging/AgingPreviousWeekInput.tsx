'use client';

import React, { useState, useEffect } from 'react';
import type { PreviousWeekAging } from '@/types/aging';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';
import {
  getStoredReports,
  extractAgingFromStored,
  type StoredReport,
} from '@/lib/storage/report-storage';

interface AgingPreviousWeekInputProps {
  initialValues: PreviousWeekAging;
  onSave: (values: PreviousWeekAging) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function AgingPreviousWeekInput({ initialValues, onSave, onBack, onProceed }: AgingPreviousWeekInputProps) {
  const [values, setValues] = useState<PreviousWeekAging>(initialValues);
  const [storedReports, setStoredReports] = useState<StoredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const agingReports = getStoredReports().filter(
      (r) => r.type === 'aging' || (!r.type && 'agingRows' in (r.reportData || {}))
    );
    setStoredReports(agingReports);

    // If initial values have no inputs, auto-fill from latest stored report if available
    const hasExisting = Object.values(initialValues.teamTotals).some((v) => v !== null);
    if (!hasExisting && agingReports.length > 0) {
      const latest = agingReports[0];
      const extracted = extractAgingFromStored(latest);
      setValues(extracted);
      onSave(extracted);
      setSelectedReportId(latest.id);
    } else {
      setValues(initialValues);
    }
  }, [initialValues]);

  const handleSelectStoredReport = (reportId: string) => {
    if (!reportId) {
      setSelectedReportId(null);
      return;
    }
    const found = storedReports.find((r) => r.id === reportId);
    if (found) {
      const extracted = extractAgingFromStored(found);
      setValues(extracted);
      onSave(extracted);
      setSelectedReportId(reportId);
    }
  };

  const handleClearAutofill = () => {
    setSelectedReportId(null);
    const emptyTotals: Record<string, number | null> = {};
    for (const t of REPORT_TEAMS) {
      emptyTotals[t] = null;
    }
    const empty: PreviousWeekAging = {
      teamTotals: emptyTotals,
      grandTotal: null,
    };
    setValues(empty);
    onSave(empty);
  };

  const handleTeamChange = (team: string, rawValue: string) => {
    const newValues = { ...values, teamTotals: { ...values.teamTotals } };
    const cleaned = rawValue.trim();

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a' || cleaned === '-') {
      newValues.teamTotals[team] = null;
    } else {
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num >= 0) {
        newValues.teamTotals[team] = num;
      }
    }

    // Recalculate grand total
    let grandTotal = 0;
    let hasAny = false;
    for (const t of REPORT_TEAMS) {
      const v = newValues.teamTotals[t];
      if (v !== null && v !== undefined) {
        grandTotal += v;
        hasAny = true;
      }
    }
    newValues.grandTotal = hasAny ? grandTotal : null;

    setValues(newValues);
    onSave(newValues);
  };

  const handleGrandTotalChange = (rawValue: string) => {
    const newValues = { ...values };
    const cleaned = rawValue.trim();

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a') {
      newValues.grandTotal = null;
    } else {
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num >= 0) {
        newValues.grandTotal = num;
      }
    }

    setValues(newValues);
    onSave(newValues);
  };

  const formatValue = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  return (
    <div className="prevweek-container">
      <div className="prevweek-header">
        <h2>Previous Week Aging Totals</h2>
        <p className="prevweek-description">
          The total aging IR counts are automatically calculated based on the available ticket data.
          Review the values below to ensure they accurately reflect the previous week’s report.
        </p>
      </div>

      {storedReports.length > 0 && (
        <div className="prevweek-autofill-banner">
          <div className="prevweek-autofill-left">
            <span className="prevweek-autofill-icon">💡</span>
            <div>
              <div className="prevweek-autofill-title">
                {selectedReportId ? 'Retrieve Last Week’s SLA Rates' : 'Retrieve Last Week’s SLA Rates'}
              </div>
              <div className="prevweek-autofill-sub">
                {selectedReportId ? (
                  <>
                    'You have successfully retrieved last week’s SLA rates from:'
                    <strong>
                      {storedReports.find((r) => r.id === selectedReportId)?.period ||
                        storedReports.find((r) => r.id === selectedReportId)?.title}
                    </strong>
                    '. You can freely adjust any values below.'
                  </>
                ) : (
                  'Select a previous aging report from Stored Reports Archive to automatically pull last week’s aging IRs.'
                )}
              </div>
            </div>
          </div>
          <div className="prevweek-autofill-controls">
            <select
              value={selectedReportId || ''}
              onChange={(e) => handleSelectStoredReport(e.target.value)}
              className="prevweek-autofill-select"
            >
              <option value="">-- Manual Entry / Pick Aging Stored Report --</option>
              {storedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  [Aging Trend] {r.period || r.title} ({r.savedAtFormatted})
                </option>
              ))}
            </select>
            {selectedReportId && (
              <button
                type="button"
                onClick={handleClearAutofill}
                className="btn-clear-autofill"
                title="Clear auto-filled values and enter manually"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="prevweek-info-banner">
        <span className="info-icon">✨</span>
        <p>
          Fill in or review the values for each team. Leave them blank or type "-" if you do not have data for a specific team.
        </p>
      </div>

      <div className="prevweek-table-wrapper">
        <table className="prevweek-table">
          <thead>
            <tr>
              <th className="col-team">Technician Name</th>
              <th className="col-sla">Total Aging IRs (Last Week)</th>
            </tr>
          </thead>
          <tbody>
            {REPORT_TEAMS.map((team) => (
              <tr key={team}>
                <td className="cell-team-name">{team}</td>
                <td>
                  <input
                    type="text"
                    className="sla-input"
                    placeholder="-"
                    value={formatValue(values.teamTotals[team])}
                    onChange={(e) => handleTeamChange(team, e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr className="row-total">
              <td className="cell-team-name"><strong>Total</strong></td>
              <td>
                <input
                  type="text"
                  className="sla-input sla-input-total"
                  placeholder="-"
                  value={formatValue(values.grandTotal)}
                  onChange={(e) => handleGrandTotalChange(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prevweek-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onProceed}>
          Generate Report →
        </button>
      </div>
    </div>
  );
}
