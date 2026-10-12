'use client';

import React, { useState } from 'react';
import type { RoutingSummary } from '@/types/routing';

interface RoutingPreviewProps {
  summary: RoutingSummary;
  onProceed: () => void;
  onBack: () => void;
}

export function RoutingPreview({ summary, onProceed, onBack }: RoutingPreviewProps) {
  const [filter, setFilter] = useState<'all' | 'reassigned' | 'unchanged'>('all');

  const filteredResults = summary.results.filter((r) => {
    if (filter === 'reassigned') return r.wasReassigned;
    if (filter === 'unchanged') return !r.wasReassigned;
    return true;
  });

  return (
    <div className="routing-container">
      <div className="routing-header">
        <h2>Routing Preview</h2>
        <p className="routing-description">
          Review how incidents were routed from source teams to final SLA teams.
        </p>
      </div>

      {/* Stats */}
      <div className="routing-stats">
        <div className="stat-card stat-total">
          <span className="stat-value">{summary.totalRecords}</span>
          <span className="stat-label">Total Records</span>
        </div>
        <div className="stat-card stat-reassigned">
          <span className="stat-value">{summary.reassignedRecords}</span>
          <span className="stat-label">Reassigned</span>
        </div>
        <div className="stat-card stat-unchanged">
          <span className="stat-value">{summary.unchangedRecords}</span>
          <span className="stat-label">Unchanged</span>
        </div>
      </div>

      {/* Filters */}
      <div className="routing-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({summary.totalRecords})
        </button>
        <button
          className={`filter-btn ${filter === 'reassigned' ? 'active' : ''}`}
          onClick={() => setFilter('reassigned')}
        >
          Reassigned ({summary.reassignedRecords})
        </button>
        <button
          className={`filter-btn ${filter === 'unchanged' ? 'active' : ''}`}
          onClick={() => setFilter('unchanged')}
        >
          Unchanged ({summary.unchangedRecords})
        </button>
      </div>

      {/* Routing Table */}
      <div className="routing-table-wrapper">
        <table className="routing-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Source Team</th>
              <th>Category</th>
              <th>Final Team</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r) => (
              <tr key={r.requestId} className={r.wasReassigned ? 'row-reassigned' : ''}>
                <td className="cell-id">{r.requestId}</td>
                <td>{r.sourceTeam}</td>
                <td>{r.category}</td>
                <td className="cell-team">
                  {r.wasReassigned && <span className="reassigned-badge">↗</span>}
                  {r.finalAssignedTeam}
                </td>
                <td className="cell-reason">{r.routingReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="routing-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onProceed}>
          Proceed to Previous Week →
        </button>
      </div>
    </div>
  );
}
