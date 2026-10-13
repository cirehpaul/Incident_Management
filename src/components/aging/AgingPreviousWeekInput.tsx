'use client';

import React, { useState, useEffect } from 'react';
import type { PreviousWeekAging } from '@/types/aging';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';

interface AgingPreviousWeekInputProps {
  initialValues: PreviousWeekAging;
  onSave: (values: PreviousWeekAging) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function AgingPreviousWeekInput({ initialValues, onSave, onBack, onProceed }: AgingPreviousWeekInputProps) {
  const [values, setValues] = useState<PreviousWeekAging>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

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
          Please manually enter the total aging IR counts from the previous week's report.
          This data cannot be auto-calculated, as it relies on the exact snapshot of tickets that were open last week.
        </p>
      </div>

      <div className="prevweek-info-banner">
        <span className="info-icon">✨</span>
        <p>
          Fill in the values exactly as they appeared in last week's "Total Aging IRs" column. Leave them blank or type "-" if you do not have data for a specific team.
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
