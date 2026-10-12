'use client';

import React from 'react';

interface DetailModalProps {
  isOpen: boolean;
  title: string;
  incidentIds: string[];
  onClose: () => void;
}

export function DetailModal({ isOpen, title, incidentIds, onClose }: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-count">
            <strong>{incidentIds.length}</strong> incident{incidentIds.length !== 1 ? 's' : ''}
          </p>
          <div className="modal-list">
            {incidentIds.map((id) => (
              <div key={id} className="modal-incident-row">
                <span className="incident-badge">{id}</span>
              </div>
            ))}
          </div>
          {incidentIds.length === 0 && (
            <p className="modal-empty">No incidents in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
