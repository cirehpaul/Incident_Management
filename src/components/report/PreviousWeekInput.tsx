'use client';

import React, { useState, useEffect } from 'react';
import type { PreviousWeekSLA } from '@/types/sla';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';
import {
  getStoredReports,
  extractWeeklySLAFromStored,
  type StoredReport,
} from '@/lib/storage/report-storage';

interface PreviousWeekInputProps {
  initialValues: PreviousWeekSLA;
  onSave: (values: PreviousWeekSLA) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function PreviousWeekInput({ initialValues, onSave, onBack, onProceed }: PreviousWeekInputProps) {
  const [values, setValues] = useState<PreviousWeekSLA>(initialValues);
  const [storedReports, setStoredReports] = useState<StoredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const calculateTotal = (teamValues: Record<string, number | null>): number | null => {
    const validValues = Object.values(teamValues).filter(
      (v): v is number => v !== null && v !== undefined && !isNaN(v)
    );
    if (validValues.length === 0) return null;
    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / validValues.length) * 100) / 100;
  };

  useEffect(() => {
    const weeklyReports = getStoredReports().filter((r) => r.type === 'weekly');
    setStoredReports(weeklyReports);

    // If initial values have no inputs, auto-fill from the latest stored report if available
    const hasExisting = Object.values(initialValues.firstResponse).some((v) => v !== null);
    if (!hasExisting && weeklyReports.length > 0) {
      const latest = weeklyReports[0];
      const extracted = extractWeeklySLAFromStored(latest);
      setValues(extracted);
      onSave(extracted);
      setSelectedReportId(latest.id);
    } else {
      const frTotal = initialValues.firstResponseTotal ?? calculateTotal(initialValues.firstResponse);
      const rtTotal = initialValues.resolutionTimeTotal ?? calculateTotal(initialValues.resolutionTime);
      setValues({
        ...initialValues,
        firstResponseTotal: frTotal,
        resolutionTimeTotal: rtTotal,
      });
    }
  }, [initialValues]);

  const handleSelectStoredReport = (reportId: string) => {
    if (!reportId) {
      setSelectedReportId(null);
      return;
    }
    const found = storedReports.find((r) => r.id === reportId);
    if (found) {
      const extracted = extractWeeklySLAFromStored(found);
      setValues(extracted);
      onSave(extracted);
      setSelectedReportId(reportId);
    }
  };

  const handleClearAutofill = () => {
    setSelectedReportId(null);
    const emptyFirst: Record<string, number | null> = {};
    const emptyRes: Record<string, number | null> = {};
    for (const t of REPORT_TEAMS) {
      emptyFirst[t] = null;
      emptyRes[t] = null;
    }
    const empty: PreviousWeekSLA = {
      firstResponse: emptyFirst,
      resolutionTime: emptyRes,
      firstResponseTotal: null,
      resolutionTimeTotal: null,
    };
    setValues(empty);
    onSave(empty);
  };

  const handleChange = (
    section: 'firstResponse' | 'resolutionTime',
    team: string,
    rawValue: string
  ) => {
    const newSectionValues = { ...values[section] };
    const cleaned = rawValue.trim().replace('%', '');

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a' || cleaned === '-') {
      newSectionValues[team] = null;
    } else {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        newSectionValues[team] = num;
      }
    }

    const totalKey = section === 'firstResponse' ? 'firstResponseTotal' : 'resolutionTimeTotal';
    const autoTotal = calculateTotal(newSectionValues);

    const newValues: PreviousWeekSLA = {
      ...values,
      [section]: newSectionValues,
      [totalKey]: autoTotal,
    };

    setValues(newValues);
    onSave(newValues);
  };

  const handleTotalChange = (
    section: 'firstResponseTotal' | 'resolutionTimeTotal',
    rawValue: string
  ) => {
    const newValues = { ...values };
    const cleaned = rawValue.trim().replace('%', '');

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a' || cleaned === '-') {
      newValues[section] = null;
    } else {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        newValues[section] = num;
      }
    }

    setValues(newValues);
    onSave(newValues);
  };

  const formatValue = (val: number | null): string => {
    if (val === null) return '';
    return val.toFixed(2);
  };

  return (
    <div className="prevweek-container">
      <div className="prevweek-header">
        <h2>Previous Week SLA Values</h2>
        <p className="prevweek-description">
          Please enter the SLA pass rates from the previous week's report.
          The Total pass rate is automatically calculated based on the input data per team.
        </p>
      </div>

      {storedReports.length > 0 && (
        <div className="prevweek-autofill-banner">
          <div className="prevweek-autofill-left">
            <span className="prevweek-autofill-icon">💡</span>
            <div>
              <div className="prevweek-autofill-title">
                {selectedReportId ? 'Auto-filled from Stored Report' : 'Auto-fill from Stored Reports'}
              </div>
              <div className="prevweek-autofill-sub">
                {selectedReportId ? (
                  <>
                    Loaded previous week SLA rates from{' '}
                    <strong>
                      {storedReports.find((r) => r.id === selectedReportId)?.period ||
                        storedReports.find((r) => r.id === selectedReportId)?.title}
                    </strong>
                    . You can freely adjust any values below.
                  </>
                ) : (
                  'Select a previous stored report to automatically pull last week pass rates.'
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
              <option value="">-- Manual Entry / Pick Stored Report --</option>
              {storedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.period || r.title} ({r.savedAtFormatted})
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
        <span className="info-icon">📊</span>
        <p>
          Enter or review the percentage values per team. The total automatically calculates based on the team percentages.
        </p>
      </div>

      <div className="prevweek-table-wrapper">
        <table className="prevweek-table">
          <thead>
            <tr>
              <th className="col-team">Final Team</th>
              <th className="col-sla" colSpan={1}>First Response (%)</th>
              <th className="col-sla" colSpan={1}>Resolution Time (%)</th>
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
                    placeholder="N/A"
                    value={formatValue(values.firstResponse[team])}
                    onChange={(e) => handleChange('firstResponse', team, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="sla-input"
                    placeholder="N/A"
                    value={formatValue(values.resolutionTime[team])}
                    onChange={(e) => handleChange('resolutionTime', team, e.target.value)}
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
                  placeholder="N/A"
                  value={formatValue(values.firstResponseTotal)}
                  onChange={(e) => handleTotalChange('firstResponseTotal', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="sla-input sla-input-total"
                  placeholder="N/A"
                  value={formatValue(values.resolutionTimeTotal)}
                  onChange={(e) => handleTotalChange('resolutionTimeTotal', e.target.value)}
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
