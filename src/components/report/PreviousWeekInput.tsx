'use client';

import React, { useState, useEffect } from 'react';
import type { PreviousWeekSLA } from '@/types/sla';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';

interface PreviousWeekInputProps {
  initialValues: PreviousWeekSLA;
  onSave: (values: PreviousWeekSLA) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function PreviousWeekInput({ initialValues, onSave, onBack, onProceed }: PreviousWeekInputProps) {
  const [values, setValues] = useState<PreviousWeekSLA>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (
    section: 'firstResponse' | 'resolutionTime',
    team: string,
    rawValue: string
  ) => {
    const newValues = { ...values };
    const cleaned = rawValue.trim().replace('%', '');

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a') {
      newValues[section] = { ...newValues[section], [team]: null };
    } else {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        newValues[section] = { ...newValues[section], [team]: num };
      }
    }

    setValues(newValues);
    onSave(newValues);
  };

  const handleTotalChange = (
    section: 'firstResponseTotal' | 'resolutionTimeTotal',
    rawValue: string
  ) => {
    const newValues = { ...values };
    const cleaned = rawValue.trim().replace('%', '');

    if (cleaned === '' || cleaned.toLowerCase() === 'n/a') {
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
          These SLA pass rates were automatically calculated from the previous week's data found in your raw dataset.
          You can review or adjust them if needed before generating the final report.
        </p>
      </div>

      <div className="prevweek-info-banner">
        <span className="info-icon">✨</span>
        <p>
          Values are now fully automated! The system split your raw data into "Current Week" and "Previous Week"
          based on the dates of the tickets, and calculated both SLAs automatically.
        </p>
      </div>

      <div className="prevweek-table-wrapper">
        <table className="prevweek-table">
          <thead>
            <tr>
              <th className="col-team">Team</th>
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
