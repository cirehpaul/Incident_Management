'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Incident } from '@/types/incident';
import type { WeeklyReportData } from '@/types/sla';
import type { AgingReportData } from '@/types/aging';
import {
  exportToHTML,
  exportToPDF,
  exportToXLS,
  exportToXLSX,
  exportToCSV,
} from '@/lib/report/export';

interface ExportDropdownProps {
  incidents: Incident[];
  reportData?: WeeklyReportData | AgingReportData | null;
  baseFilename?: string;
}

export function ExportDropdown({
  incidents,
  reportData,
  baseFilename = 'Extracted_Incidents',
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type: 'html' | 'pdf' | 'xls' | 'xlsx' | 'csv') => {
    setIsOpen(false);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${baseFilename}_${dateStr}`;

    switch (type) {
      case 'html':
        exportToHTML(incidents, reportData, `${filename}.html`);
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'xls':
        exportToXLS(incidents, `${filename}.xls`);
        break;
      case 'xlsx':
        exportToXLSX(incidents, reportData, `${filename}.xlsx`);
        break;
      case 'csv':
        exportToCSV(incidents, `${filename}.csv`);
        break;
    }
  };

  return (
    <div className="export-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="export-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Export as</span>
        <svg
          style={{
            width: 13,
            height: 13,
            marginLeft: 6,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="export-dropdown-menu" role="menu">
          <button
            type="button"
            className="export-dropdown-item"
            onClick={() => handleSelect('html')}
            role="menuitem"
          >
            HTML file
          </button>
          <button
            type="button"
            className="export-dropdown-item"
            onClick={() => handleSelect('pdf')}
            role="menuitem"
          >
            PDF file
          </button>
          <button
            type="button"
            className="export-dropdown-item"
            onClick={() => handleSelect('xls')}
            role="menuitem"
          >
            XLS file
          </button>
          <button
            type="button"
            className="export-dropdown-item"
            onClick={() => handleSelect('xlsx')}
            role="menuitem"
          >
            XLSX file
          </button>
          <button
            type="button"
            className="export-dropdown-item"
            onClick={() => handleSelect('csv')}
            role="menuitem"
          >
            CSV file
          </button>
        </div>
      )}
    </div>
  );
}
