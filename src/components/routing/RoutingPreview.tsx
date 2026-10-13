'use client';

import React, { useState, useMemo } from 'react';
import type { RoutingSummary } from '@/types/routing';

interface RoutingPreviewProps {
  summary: RoutingSummary;
  onProceed: () => void;
  onBack: () => void;
}

export function RoutingPreview({ summary, onProceed, onBack }: RoutingPreviewProps) {
  const [filter, setFilter] = useState<'all' | 'reassigned' | 'unchanged'>('all');
  const [search, setSearch] = useState('');

  const filteredResults = useMemo(() => {
    return summary.results.filter((r) => {
      if (filter === 'reassigned' && !r.wasReassigned) return false;
      if (filter === 'unchanged' && r.wasReassigned) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesQuery =
          r.requestId.toLowerCase().includes(query) ||
          r.sourceTeam.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          (r.subCategory && r.subCategory.toLowerCase().includes(query)) ||
          (r.item && r.item.toLowerCase().includes(query)) ||
          (r.autoAssignedGroup && r.autoAssignedGroup.toLowerCase().includes(query)) ||
          r.finalAssignedTeam.toLowerCase().includes(query) ||
          r.routingReason.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [summary.results, filter, search]);

  return (
    <div className="routing-container">
      <div className="routing-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2>Final Team Routing Alignment</h2>
            <p className="routing-description" style={{ marginBottom: 0 }}>
              Verify auto-assigned group and final team resolution based on Category, Sub Category, and Item.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onBack}>
              ← Back to Validation
            </button>
            <button className="btn btn-primary btn-sm" onClick={onProceed}>
              Proceed to SLA Report →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="routing-stats">
        <div className="stat-card stat-total">
          <span className="stat-value">{summary.totalRecords}</span>
          <span className="stat-label">Total Incidents</span>
        </div>
        <div className="stat-card stat-reassigned">
          <span className="stat-value">{summary.reassignedRecords}</span>
          <span className="stat-label">Realigned to New Team</span>
        </div>
        <div className="stat-card stat-unchanged">
          <span className="stat-value">{summary.unchangedRecords}</span>
          <span className="stat-label">Kept in Source Team</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="routing-filters"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-card)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Incidents ({summary.totalRecords})
          </button>
          <button
            className={`filter-btn ${filter === 'reassigned' ? 'active' : ''}`}
            onClick={() => setFilter('reassigned')}
          >
            Realigned ({summary.reassignedRecords})
          </button>
          <button
            className={`filter-btn ${filter === 'unchanged' ? 'active' : ''}`}
            onClick={() => setFilter('unchanged')}
          >
            Retained ({summary.unchangedRecords})
          </button>
        </div>

        <div style={{ minWidth: '280px' }}>
          <input
            type="text"
            className="period-input"
            style={{
              margin: 0,
              padding: '6px 12px',
              fontSize: '0.82rem',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
            placeholder="Search by ID, Category, Item, Team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Routing Table */}
      <div className="routing-table-wrapper" style={{ marginTop: '1rem' }}>
        <table className="routing-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Request ID</th>
              <th style={{ width: '130px' }}>Source Team</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Item</th>
              <th style={{ width: '160px' }}>Auto Assigned Group</th>
              <th style={{ width: '130px' }}>Final Team</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted, #888)' }}>
                  No matching incidents found.
                </td>
              </tr>
            ) : (
              filteredResults.map((r) => (
                <tr key={r.requestId} className={r.wasReassigned ? 'row-reassigned' : ''}>
                  <td className="cell-id">{r.requestId}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.sourceTeam}</td>
                  <td style={{ fontWeight: 500 }}>{r.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.subCategory || '-'}</td>
                  <td>{r.item || '-'}</td>
                  <td>
                    <span className="group-pill" title={r.routingReason}>
                      {r.autoAssignedGroup || r.finalAssignedTeam}
                    </span>
                  </td>
                  <td>
                    <span className="team-pill">
                      {r.finalAssignedTeam}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {r.wasReassigned ? (
                      <span className="status-badge-realigned" title={r.routingReason}>
                        ↗ Realigned
                      </span>
                    ) : (
                      <span className="status-badge-retained" title="Retained original team">
                        ✓ Retained
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="routing-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Validation
        </button>
        <button className="btn btn-primary" onClick={onProceed}>
          Proceed to Previous Week →
        </button>
      </div>
    </div>
  );
}
