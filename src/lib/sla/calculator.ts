import type { Incident } from '@/types/incident';
import type { TeamSLAResult, SLAReport, WeeklyCompletion } from '@/types/sla';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';


export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export function parsePriority(priorityStr?: string | number | null): PriorityLevel {
  if (priorityStr === undefined || priorityStr === null) return 'P3';
  const str = String(priorityStr).trim().toLowerCase();

  if (
    str.includes('p1') ||
    str.includes('critical') ||
    str === '1' ||
    str.startsWith('1 ') ||
    str.startsWith('1-')
  ) {
    return 'P1';
  }
  if (
    str.includes('p2') ||
    str.includes('high') ||
    str.includes('urgent') ||
    str === '2' ||
    str.startsWith('2 ') ||
    str.startsWith('2-')
  ) {
    return 'P2';
  }
  if (
    str.includes('p4') ||
    str.includes('low') ||
    str === '4' ||
    str.startsWith('4 ') ||
    str.startsWith('4-')
  ) {
    return 'P4';
  }
  if (
    str.includes('p3') ||
    str.includes('medium') ||
    str.includes('normal') ||
    str === '3' ||
    str.startsWith('3 ') ||
    str.startsWith('3-')
  ) {
    return 'P3';
  }

  return 'P3';
}

export const SLA_THRESHOLDS = {
  firstResponse: {
    P1: 15,          // 15 mins
    P2: 30,          // 30 mins
    P3: 4 * 60,      // 4 hours (240 mins)
    P4: 8 * 60,      // 8 hours (480 mins)
    default: 4 * 60, // 4 hours
  },
  resolution: {
    P1: 4 * 60,        // 4 hours (240 mins)
    P2: 24 * 60,       // 24 hours (1,440 mins)
    P3: 3 * 24 * 60,   // 3 days = 72 hours (4,320 mins)
    P4: 5 * 24 * 60,   // 5 days = 120 hours (7,200 mins)
    default: 3 * 24 * 60, // 3 days
  },
} as const;

export function getSLAThreshold(
  priority: string | undefined,
  type: 'firstResponse' | 'resolution'
): number {
  if (!priority) return SLA_THRESHOLDS[type].default;
  const p = parsePriority(priority);
  return SLA_THRESHOLDS[type][p];
}

export function getBusinessMinutes(start: Date, end: Date): number {
  if (start >= end) return 0;

  let totalMinutes = 0;
  const current = new Date(start.getTime());

  while (current.getTime() < end.getTime()) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday (Exclude Weekends)
    if (day !== 0 && day !== 6) {
      const startOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 8, 30, 0);
      const endOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 17, 30, 0);

      const effectiveStart = current > startOfDay ? current : startOfDay;
      const effectiveEnd = end < endOfDay ? end : endOfDay;

      if (effectiveStart < effectiveEnd) {
        totalMinutes += (effectiveEnd.getTime() - effectiveStart.getTime()) / 60000;
      }
    }
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  return totalMinutes;
}

// Ticket validation
export function isStatusOverdue(value: unknown): boolean | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim().toLowerCase();
  if (str === '') return null;

  if (
    str === 'true' ||
    str === 'yes' ||
    str === 'overdue' ||
    str === 'breached' ||
    str === 'failed' ||
    str === '1'
  ) {
    return true; // Overdue = true (SLA Failed)
  }
  if (
    str === 'false' ||
    str === 'no' ||
    str === 'met' ||
    str === 'passed' ||
    str === 'pass' ||
    str === 'complied' ||
    str === 'compliant' ||
    str === '0'
  ) {
    return false; // Overdue = false (SLA Passed)
  }
  return null;
}

/**
 * Evaluates First Response SLA for an incident.
 * Uses SDP raw overdue status if present; otherwise accurately computes against SLA matrix.
 */
export function evaluateFirstResponseOverdue(
  inc: Incident,
  teamName: string,
  referenceDate: Date = new Date()
): boolean {
  // 1. Check raw SDP status
  const rawStatus = isStatusOverdue(inc.rawFirstResponseStatus);
  if (rawStatus !== null) {
    return rawStatus;
  }

  // Check in rawData if mapping missed it
  if (inc.rawData) {
    for (const [key, val] of Object.entries(inc.rawData)) {
      if (/first\s*response.*(overdue|status|sla)/i.test(key)) {
        const s = isStatusOverdue(val);
        if (s !== null) return s;
      }
    }
  }

  // 2. Compute from timestamps using SLA matrix
  if (!inc.createdTime) return false;

  const thresholdMins = getSLAThreshold(inc.priority, 'firstResponse');
  const endDate = inc.respondedDate || inc.completedTime || referenceDate;
  let elapsedMins = 0;

  if (teamName === 'ECS ISS') {
    // 24/7 SLA
    elapsedMins = (endDate.getTime() - inc.createdTime.getTime()) / 60000;
  } else {
    // Office Hours (8:30 AM - 5:30 PM, Mon-Fri)
    elapsedMins = getBusinessMinutes(inc.createdTime, endDate);
  }

  return elapsedMins > thresholdMins;
}

/**
 * Evaluates Resolution Time SLA for an incident.
 * Uses SDP raw overdue status if present; otherwise accurately computes against SLA matrix.
 */
export function evaluateResolutionOverdue(
  inc: Incident,
  referenceDate: Date = new Date()
): boolean {
  // 1. Check raw SDP status
  const rawStatus = isStatusOverdue(inc.rawResolutionStatus);
  if (rawStatus !== null) {
    return rawStatus;
  }

  // Check in rawData if mapping missed it
  if (inc.rawData) {
    for (const [key, val] of Object.entries(inc.rawData)) {
      if (/^(overdue\s*status|resolution\s*overdue|resolution\s*sla|resolution\s*status)/i.test(key)) {
        const s = isStatusOverdue(val);
        if (s !== null) return s;
      }
    }
  }

  // 2. Compute from timestamps using SLA matrix (24/7 calendar elapsed minutes)
  if (!inc.createdTime) return false;

  const thresholdMins = getSLAThreshold(inc.priority, 'resolution');
  const endDate = inc.completedTime || referenceDate;
  const elapsedMins = (endDate.getTime() - inc.createdTime.getTime()) / 60000;

  return elapsedMins > thresholdMins;
}

// First Response SLA per Team
function calculateFirstResponseSLA(teamName: string, incidents: Incident[]): TeamSLAResult {
  const total = incidents.length;
  const failedIncidentIds: string[] = [];
  const passedIncidentIds: string[] = [];

  for (const inc of incidents) {
    const isOverdue = evaluateFirstResponseOverdue(inc, teamName);
    inc.firstResponseOverdue = isOverdue;

    if (isOverdue) {
      failedIncidentIds.push(inc.requestId);
    } else {
      passedIncidentIds.push(inc.requestId);
    }
  }

  const failed = failedIncidentIds.length;
  const passed = passedIncidentIds.length;
  const slaPassRate = total > 0 ? (passed / total) * 100 : null;

  return {
    teamName,
    total,
    failed,
    passed,
    slaPassRate,
    incidentIds: incidents.map((i) => i.requestId),
    failedIncidentIds,
    passedIncidentIds,
  };
}

// Resolution Time SLA per Team
function calculateResolutionSLA(teamName: string, incidents: Incident[]): TeamSLAResult {
  const total = incidents.length;
  const failedIncidentIds: string[] = [];
  const passedIncidentIds: string[] = [];

  for (const inc of incidents) {
    const isOverdue = evaluateResolutionOverdue(inc);
    inc.resolutionOverdue = isOverdue;

    if (isOverdue) {
      failedIncidentIds.push(inc.requestId);
    } else {
      passedIncidentIds.push(inc.requestId);
    }
  }

  const failed = failedIncidentIds.length;
  const passed = passedIncidentIds.length;
  const slaPassRate = total > 0 ? (passed / total) * 100 : null;

  return {
    teamName,
    total,
    failed,
    passed,
    slaPassRate,
    incidentIds: incidents.map((i) => i.requestId),
    failedIncidentIds,
    passedIncidentIds,
  };
}

// Calculation of Rows based on the data
function calculateTotalRow(teamResults: TeamSLAResult[]): TeamSLAResult {
  let totalIncidents = 0;
  let totalFailed = 0;
  let totalPassed = 0;
  const allIncidentIds: string[] = [];
  const allFailedIds: string[] = [];
  const allPassedIds: string[] = [];

  for (const result of teamResults) {
    totalIncidents += result.total;
    totalFailed += result.failed;
    totalPassed += result.passed;
    allIncidentIds.push(...result.incidentIds);
    allFailedIds.push(...result.failedIncidentIds);
    allPassedIds.push(...result.passedIncidentIds);
  }

  const slaPassRate = totalIncidents > 0 ? (totalPassed / totalIncidents) * 100 : null;

  return {
    teamName: 'Total',
    total: totalIncidents,
    failed: totalFailed,
    passed: totalPassed,
    slaPassRate,
    incidentIds: allIncidentIds,
    failedIncidentIds: allFailedIds,
    passedIncidentIds: allPassedIds,
  };
}

// Group per Team
function groupByTeam(incidents: Incident[]): Record<string, Incident[]> {
  const groups: Record<string, Incident[]> = {};

  for (const inc of incidents) {
    const team = inc.assignedTeam;
    if (!groups[team]) {
      groups[team] = [];
    }
    groups[team].push(inc);
  }

  return groups;
}

// SLA Completion
export function calculateSLAReport(
  incidents: Incident[],
  teamOrder: string[] = REPORT_TEAMS
): SLAReport {
  const grouped = groupByTeam(incidents);

  const firstResponse: TeamSLAResult[] = [];
  const resolutionTime: TeamSLAResult[] = [];

  for (const team of teamOrder) {
    const teamIncidents = grouped[team] || [];
    firstResponse.push(calculateFirstResponseSLA(team, teamIncidents));
    resolutionTime.push(calculateResolutionSLA(team, teamIncidents));
  }

  const firstResponseTotal = calculateTotalRow(firstResponse);
  const resolutionTimeTotal = calculateTotalRow(resolutionTime);

  return {
    firstResponse,
    resolutionTime,
    firstResponseTotal,
    resolutionTimeTotal,
  };
}

// Percentage format
export function formatSLAPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Split incidents into Current Week and Previous Week
export function splitIncidentsByWeek(
  incidents: Incident[]
): { currentWeek: Incident[]; previousWeek: Incident[] } {
  let maxDate = new Date(0);
  for (const inc of incidents) {
    const d = inc.completedTime || inc.createdTime;
    if (d && d > maxDate) {
      maxDate = d;
    }
  }

  if (maxDate.getTime() === 0) {
    return { currentWeek: incidents, previousWeek: [] };
  }

  const day = maxDate.getDay();
  const diff = maxDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentWeekStart = new Date(maxDate);
  currentWeekStart.setDate(diff);
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  const currentWeek: Incident[] = [];
  const previousWeek: Incident[] = [];

  for (const inc of incidents) {
    const d = inc.completedTime || inc.createdTime;
    if (!d) continue;

    if (d >= currentWeekStart && d < nextWeekStart) {
      currentWeek.push(inc);
    } else if (d >= previousWeekStart && d < currentWeekStart) {
      previousWeek.push(inc);
    }
  }

  return { currentWeek, previousWeek };
}

// Weekly Completion for FR & Resolution
export function calculateWeeklyCompletion(
  incidents: Incident[]
): WeeklyCompletion {
  if (incidents.length === 0) {
    return {
      firstResponse: { passed: 0, failed: 0, slaPassRate: null, passedIncidentIds: [], failedIncidentIds: [] },
      resolution: { passed: 0, failed: 0, slaPassRate: null, passedIncidentIds: [], failedIncidentIds: [] },
    };
  }

  const frPassedIds: string[] = [];
  const frFailedIds: string[] = [];
  const rtPassedIds: string[] = [];
  const rtFailedIds: string[] = [];

  for (const inc of incidents) {
    const frOverdue = evaluateFirstResponseOverdue(inc, inc.assignedTeam || inc.sourceTeam);
    if (frOverdue) {
      frFailedIds.push(inc.requestId);
    } else {
      frPassedIds.push(inc.requestId);
    }

    const rtOverdue = evaluateResolutionOverdue(inc);
    if (rtOverdue) {
      rtFailedIds.push(inc.requestId);
    } else {
      rtPassedIds.push(inc.requestId);
    }
  }

  const frTotal = frPassedIds.length + frFailedIds.length;
  const frRate = frTotal > 0 ? (frPassedIds.length / frTotal) * 100 : null;

  const rtTotal = rtPassedIds.length + rtFailedIds.length;
  const rtRate = rtTotal > 0 ? (rtPassedIds.length / rtTotal) * 100 : null;

  return {
    firstResponse: {
      passed: frPassedIds.length,
      failed: frFailedIds.length,
      slaPassRate: frRate,
      passedIncidentIds: frPassedIds,
      failedIncidentIds: frFailedIds,
    },
    resolution: {
      passed: rtPassedIds.length,
      failed: rtFailedIds.length,
      slaPassRate: rtRate,
      passedIncidentIds: rtPassedIds,
      failedIncidentIds: rtFailedIds,
    },
  };
}
