import type { Incident } from '@/types/incident';
import type { TeamSLAResult, SLAReport } from '@/types/sla';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';

// SLA TIME BASED IN MINUTES
const SLA_THRESHOLDS = {
  firstResponse: {
    High: 15,    // 15 mins
    Medium: 30,  // 30 mins
    Low: 60,     // 1 hour
    default: 30
  },
  resolution: {
    High: 120,   // 2 hours
    Medium: 240, // 4 hours
    Low: 480,    // 8 hours
    default: 240
  }
};

function getSLAThreshold(priority: string | undefined, type: 'firstResponse' | 'resolution'): number {
  if (!priority) return SLA_THRESHOLDS[type].default;
  const p = priority.toLowerCase();
  if (p.includes('high') || p.includes('urgent') || p.includes('1')) return SLA_THRESHOLDS[type].High;
  if (p.includes('low') || p.includes('3')) return SLA_THRESHOLDS[type].Low;
  return SLA_THRESHOLDS[type].Medium;
}

// Business hours: 8:30 AM to 5:30 PM (17:30), Monday to Friday.
function getBusinessMinutes(start: Date, end: Date): number {
  if (start >= end) return 0;

  let totalMinutes = 0;
  const current = new Date(start.getTime());

  while (current.getTime() < end.getTime()) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday (Exclude Weekends)
    if (day !== 0 && day !== 6) {
      // Define start (8:30 AM) and end (5:30 PM) of business hours for the current day
      const startOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 8, 30, 0);
      const endOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 17, 30, 0);

      const effectiveStart = current > startOfDay ? current : startOfDay;
      const effectiveEnd = end < endOfDay ? end : endOfDay;

      if (effectiveStart < effectiveEnd) {
        totalMinutes += (effectiveEnd.getTime() - effectiveStart.getTime()) / 60000;
      }
    }
    // Move to midnight of the next day
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  return totalMinutes;
}

// First Response SLA
function calculateFirstResponseSLA(teamName: string, incidents: Incident[]): TeamSLAResult {
  const total = incidents.length;
  const failedIncidentIds: string[] = [];
  const passedIncidentIds: string[] = [];

  for (const inc of incidents) {
    if (!inc.createdTime) {
      passedIncidentIds.push(inc.requestId);
      continue;
    }

    const thresholdMins = getSLAThreshold(inc.priority, 'firstResponse');
    // If not responded yet, use current time to determine if it's currently overdue
    const endDate = inc.respondedDate || new Date();
    let elapsedMins = 0;

    if (teamName === 'ECS ISS') {
      // 24/7 SLA - Runs continuously
      elapsedMins = (endDate.getTime() - inc.createdTime.getTime()) / 60000;
    } else {
      // Office Hours SLA (8:30 AM - 5:30 PM, no weekends)
      elapsedMins = getBusinessMinutes(inc.createdTime, endDate);
    }

    const isOverdue = elapsedMins > thresholdMins;
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

// Convertion of Time Format 
function calculateResolutionSLA(teamName: string, incidents: Incident[]): TeamSLAResult {
  const total = incidents.length;
  const failedIncidentIds: string[] = [];
  const passedIncidentIds: string[] = [];

  for (const inc of incidents) {
    if (!inc.createdTime) {
      passedIncidentIds.push(inc.requestId);
      continue;
    }

    const thresholdMins = getSLAThreshold(inc.priority, 'resolution');
    const endDate = inc.completedTime || new Date();

    // Resolution Time is continuously calculated (24/7) for ALL teams
    const elapsedMins = (endDate.getTime() - inc.createdTime.getTime()) / 60000;

    // Determine status automatically
    const isOverdue = elapsedMins > thresholdMins;
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

//Group per Team
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

  // Calculate total rows using sum-based calculation
  const firstResponseTotal = calculateTotalRow(firstResponse);
  const resolutionTimeTotal = calculateTotalRow(resolutionTime);

  return {
    firstResponse,
    resolutionTime,
    firstResponseTotal,
    resolutionTimeTotal,
  };
}

// Pecentage format
export function formatSLAPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
}

//Split incidents into Current Week and Previous Week based on the raw data dates
export function splitIncidentsByWeek(incidents: Incident[]): { currentWeek: Incident[], previousWeek: Incident[] } {
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

  // Get Monday of the max date's week
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

//Weekly Compliance for FR & Resolution
export function parseSLAMetStatus(value: unknown): boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value;

  const str = String(value).trim().toLowerCase();
  if (str === '') return null;

  if (str === 'true' || str === 'passed' || str === 'pass' || str === 'met' || str === 'yes' || str === '1') {
    return true;
  }
  if (str === 'false' || str === 'failed' || str === 'fail' || str === 'overdue' || str === 'breached' || str === 'no' || str === '0') {
    return false;
  }
  return null;
}

function getIncidentFirstResponseMet(inc: Incident): boolean | null {
  if (inc.rawFirstResponseStatus !== undefined && inc.rawFirstResponseStatus !== null) {
    const met = parseSLAMetStatus(inc.rawFirstResponseStatus);
    if (met !== null) return met;
  }
  if (inc.rawData) {
    for (const [key, val] of Object.entries(inc.rawData)) {
      if (/first\s*response.*(overdue|status|sla)/i.test(key)) {
        const met = parseSLAMetStatus(val);
        if (met !== null) return met;
      }
    }
  }
  return null;
}

function getIncidentResolutionMet(inc: Incident): boolean | null {
  if (inc.rawResolutionStatus !== undefined && inc.rawResolutionStatus !== null) {
    const met = parseSLAMetStatus(inc.rawResolutionStatus);
    if (met !== null) return met;
  }
  if (inc.rawData) {
    for (const [key, val] of Object.entries(inc.rawData)) {
      if (/^(overdue\s*status|resolution\s*overdue|resolution\s*sla|resolution\s*status)/i.test(key)) {
        const met = parseSLAMetStatus(val);
        if (met !== null) return met;
      }
    }
  }
  return null;
}

export function calculateWeeklyCompletion(
  incidents: Incident[]
) {
  if (incidents.length === 0) {
    return {
      firstResponse: { passed: 0, failed: 0, slaPassRate: null, passedIncidentIds: [], failedIncidentIds: [] },
      resolution: { passed: 0, failed: 0, slaPassRate: null, passedIncidentIds: [], failedIncidentIds: [] },
    };
  }

  const targetIncidents = incidents;

  const frPassedIds: string[] = [];
  const frFailedIds: string[] = [];
  const rtPassedIds: string[] = [];
  const rtFailedIds: string[] = [];

  for (const inc of targetIncidents) {
    // First response evaluation: TRUE = PASSED, FALSE = FAILED
    const frMet = getIncidentFirstResponseMet(inc);
    if (frMet !== null) {
      if (frMet) {
        frPassedIds.push(inc.requestId);
      } else {
        frFailedIds.push(inc.requestId);
      }
    } else {
      // Fallback: if not overdue then passed, otherwise failed
      if (inc.firstResponseOverdue) {
        frFailedIds.push(inc.requestId);
      } else {
        frPassedIds.push(inc.requestId);
      }
    }

    // Resolution evaluation: TRUE = PASSED, FALSE = FAILED
    const rtMet = getIncidentResolutionMet(inc);
    if (rtMet !== null) {
      if (rtMet) {
        rtPassedIds.push(inc.requestId);
      } else {
        rtFailedIds.push(inc.requestId);
      }
    } else {
      // Fallback: if not overdue then passed, otherwise failed
      if (inc.resolutionOverdue) {
        rtFailedIds.push(inc.requestId);
      } else {
        rtPassedIds.push(inc.requestId);
      }
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
