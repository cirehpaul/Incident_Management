/**
 * Report Storage Service
 * Persists and retrieves generated reports in browser localStorage
 */

import type { Incident } from '@/types/incident';
import type { WeeklyReportData } from '@/types/sla';
import type { AgingReportData } from '@/types/aging';

const STORAGE_KEY = 'smac_incident_stored_reports';

export interface StoredReport {
  id: string;
  type: 'weekly' | 'aging';
  title: string;
  period: string;
  savedAt: string; // ISO date string
  savedAtFormatted: string;
  author?: string;
  reportData: WeeklyReportData | AgingReportData;
  routedIncidents?: Incident[];
}

/**
 * Retrieve all stored reports from localStorage
 */
export function getStoredReports(): StoredReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Sort newest first
      return parsed.sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
    }
    return [];
  } catch (err) {
    console.error('Failed to load stored reports:', err);
    return [];
  }
}

/**
 * Save a new report or update an existing one in localStorage
 */
export function saveReport(params: {
  id?: string;
  type: 'weekly' | 'aging';
  title: string;
  period: string;
  author?: string;
  reportData: WeeklyReportData | AgingReportData;
  routedIncidents?: Incident[];
}): StoredReport {
  if (typeof window === 'undefined') {
    throw new Error('Storage is only available in browser');
  }

  const existing = getStoredReports();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const reportId = params.id || `report-${params.type}-${Date.now()}`;

  const record: StoredReport = {
    id: reportId,
    type: params.type,
    title: params.title,
    period: params.period,
    savedAt: now.toISOString(),
    savedAtFormatted: formattedDate,
    author: params.author,
    reportData: params.reportData,
    routedIncidents: params.routedIncidents || [],
  };

  const filtered = existing.filter((r) => r.id !== reportId);
  const updated = [record, ...filtered];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return record;
}

/**
 * Delete a stored report by ID
 */
export function deleteStoredReport(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredReports();
  const filtered = existing.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

import { REPORT_TEAMS } from '@/lib/routing/routing-engine';
import type { PreviousWeekSLA } from '@/types/sla';
import type { PreviousWeekAging } from '@/types/aging';

/**
 * Extract PreviousWeekSLA values from a stored Weekly report
 */
export function extractWeeklySLAFromStored(report: StoredReport): PreviousWeekSLA {
  const data = report.reportData as WeeklyReportData;
  const firstResponse: Record<string, number | null> = {};
  const resolutionTime: Record<string, number | null> = {};

  for (const team of REPORT_TEAMS) {
    const frItem = data.currentWeek?.firstResponse?.find((t) => t.teamName === team);
    const rtItem = data.currentWeek?.resolutionTime?.find((t) => t.teamName === team);
    firstResponse[team] = frItem?.slaPassRate !== undefined ? frItem.slaPassRate : null;
    resolutionTime[team] = rtItem?.slaPassRate !== undefined ? rtItem.slaPassRate : null;
  }

  return {
    firstResponse,
    resolutionTime,
    firstResponseTotal: data.currentWeek?.firstResponseTotal?.slaPassRate ?? null,
    resolutionTimeTotal: data.currentWeek?.resolutionTimeTotal?.slaPassRate ?? null,
  };
}

/**
 * Extract PreviousWeekAging values from a stored Aging report
 */
export function extractAgingFromStored(report: StoredReport): PreviousWeekAging {
  const data = report.reportData as AgingReportData;
  const teamTotals: Record<string, number | null> = {};

  for (const team of REPORT_TEAMS) {
    const row = data.agingRows?.find((r) => r.teamName === team);
    teamTotals[team] = row !== undefined ? row.totalAging : null;
  }

  return {
    teamTotals,
    grandTotal: data.agingGrandTotal ?? null,
  };
}

/**
 * Get a specific stored report by ID
 */
export function getStoredReportById(id: string): StoredReport | null {
  const existing = getStoredReports();
  return existing.find((r) => r.id === id) || null;
}
