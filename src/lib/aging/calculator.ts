
import type { Incident } from '@/types/incident';
import type {
  AgingBucket,
  TeamAgingResult,
  AgingSLARow,
  AgingSLATotals,
  PreviousWeekAging,
} from '@/types/aging';
import { AGING_BUCKET_ORDER } from '@/types/aging';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';



// Determine which aging bucket an incident falls into based on its age in calendar days
function classifyAge(createdTime: Date, referenceDate: Date): AgingBucket {
  const diffMs = referenceDate.getTime() - createdTime.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 30) return '>1month';
  if (diffDays > 14) return '2-4weeks';
  if (diffDays > 7) return '1-2weeks';
  if (diffDays > 3) return '4-6days';
  if (diffDays > 0) return '1-3days';
  return 'sameday';
}

// Filter incidents to only open/pending (not completed) 
export function filterOpenIncidents(incidents: Incident[]): Incident[] {
  return incidents.filter((inc) => {
    // If there's no completedTime, the incident is still open
    if (!inc.completedTime) return true;

    // Also include if status text indicates open/pending
    const status = (inc.requestStatus || '').toLowerCase();
    if (status.includes('open') || status.includes('pending') || status.includes('in progress')) {
      return true;
    }

    return false;
  });
}

// Aging Distribution Calculation 
function createEmptyBuckets(): Record<AgingBucket, number> {
  return {
    '>1month': 0,
    '2-4weeks': 0,
    '1-2weeks': 0,
    '4-6days': 0,
    '1-3days': 0,
    'sameday': 0,
  };
}

function createEmptyBucketIds(): Record<AgingBucket, string[]> {
  return {
    '>1month': [],
    '2-4weeks': [],
    '1-2weeks': [],
    '4-6days': [],
    '1-3days': [],
    'sameday': [],
  };
}

export function calculateAgingDistribution(
  incidents: Incident[],
  teamOrder: string[] = REPORT_TEAMS,
  referenceDate: Date = new Date()
): TeamAgingResult[] {
  // Group incidents by team
  const grouped: Record<string, Incident[]> = {};
  for (const inc of incidents) {
    const team = inc.assignedTeam;
    if (!grouped[team]) grouped[team] = [];
    grouped[team].push(inc);
  }

  const results: TeamAgingResult[] = [];

  for (const team of teamOrder) {
    const teamIncidents = grouped[team] || [];
    const buckets = createEmptyBuckets();
    const bucketIncidentIds = createEmptyBucketIds();
    const incidentIds: string[] = [];

    for (const inc of teamIncidents) {
      if (!inc.createdTime) continue;
      const bucket = classifyAge(inc.createdTime, referenceDate);
      buckets[bucket]++;
      bucketIncidentIds[bucket].push(inc.requestId);
      incidentIds.push(inc.requestId);
    }

    results.push({
      teamName: team,
      buckets,
      bucketIncidentIds,
      totalAging: incidentIds.length,
      incidentIds,
    });
  }

  return results;
}

//SLA Compliance Calculation

import {
  evaluateFirstResponseOverdue,
  evaluateResolutionOverdue,
} from '@/lib/sla/calculator';

export function calculateAgingSLA(
  incidents: Incident[],
  teamOrder: string[] = REPORT_TEAMS,
  referenceDate: Date = new Date()
): { rows: AgingSLARow[]; totals: AgingSLATotals } {
  const grouped: Record<string, Incident[]> = {};
  for (const inc of incidents) {
    const team = inc.assignedTeam;
    if (!grouped[team]) grouped[team] = [];
    grouped[team].push(inc);
  }

  const rows: AgingSLARow[] = [];
  let grandTotalIRs = 0;
  let grandFRFailed = 0;
  let grandFRPassed = 0;
  let grandRTFailed = 0;
  let grandRTPassed = 0;

  for (const team of teamOrder) {
    const teamIncidents = grouped[team] || [];
    const totalIRs = teamIncidents.length;

    const frFailedIds: string[] = [];
    const frPassedIds: string[] = [];
    const rtFailedIds: string[] = [];
    const rtPassedIds: string[] = [];

    for (const inc of teamIncidents) {
      // First Response SLA
      const frFailed = evaluateFirstResponseOverdue(inc, team, referenceDate);
      if (frFailed) {
        frFailedIds.push(inc.requestId);
      } else {
        frPassedIds.push(inc.requestId);
      }

      // Resolution Time SLA
      const rtFailed = evaluateResolutionOverdue(inc, referenceDate);
      if (rtFailed) {
        rtFailedIds.push(inc.requestId);
      } else {
        rtPassedIds.push(inc.requestId);
      }
    }

    const frFailed = frFailedIds.length;
    const frPassed = frPassedIds.length;
    const rtFailed = rtFailedIds.length;
    const rtPassed = rtPassedIds.length;

    grandTotalIRs += totalIRs;
    grandFRFailed += frFailed;
    grandFRPassed += frPassed;
    grandRTFailed += rtFailed;
    grandRTPassed += rtPassed;

    rows.push({
      teamName: team,
      totalIRs,
      firstResponse: {
        failed: frFailed,
        passed: frPassed,
        slaPassRate: totalIRs > 0 ? (frPassed / totalIRs) * 100 : null,
        failedIds: frFailedIds,
        passedIds: frPassedIds,
      },
      resolutionTime: {
        failed: rtFailed,
        passed: rtPassed,
        slaPassRate: totalIRs > 0 ? (rtPassed / totalIRs) * 100 : null,
        failedIds: rtFailedIds,
        passedIds: rtPassedIds,
      },
      incidentIds: teamIncidents.map((i) => i.requestId),
    });
  }

  const totals: AgingSLATotals = {
    totalIRs: grandTotalIRs,
    firstResponse: {
      failed: grandFRFailed,
      passed: grandFRPassed,
      slaPassRate: grandTotalIRs > 0 ? (grandFRPassed / grandTotalIRs) * 100 : null,
    },
    resolutionTime: {
      failed: grandRTFailed,
      passed: grandRTPassed,
      slaPassRate: grandTotalIRs > 0 ? (grandRTPassed / grandTotalIRs) * 100 : null,
    },
  };

  return { rows, totals };
}

//Previous Week Auto-Calculation 

export function calculatePreviousWeekAging(
  incidents: Incident[],
  teamOrder: string[] = REPORT_TEAMS
): PreviousWeekAging {
  const grouped: Record<string, number> = {};
  for (const inc of incidents) {
    const team = inc.assignedTeam;
    grouped[team] = (grouped[team] || 0) + 1;
  }

  const teamTotals: Record<string, number | null> = {};
  for (const team of teamOrder) {
    teamTotals[team] = grouped[team] ?? null;
  }

  return {
    teamTotals,
    grandTotal: incidents.length > 0 ? incidents.length : null,
  };
}

// Utility

export function formatSLAPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Split open incidents into this-week and last-week
export function splitAgingByWeek(
  incidents: Incident[]
): { currentWeek: Incident[]; previousWeek: Incident[] } {
  let maxDate = new Date(0);
  for (const inc of incidents) {
    const d = inc.createdTime;
    if (d && d > maxDate) maxDate = d;
  }

  if (maxDate.getTime() === 0) {
    return { currentWeek: incidents, previousWeek: [] };
  }

  // Find Monday of max date's week
  const day = maxDate.getDay();
  const diff = maxDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentWeekStart = new Date(maxDate);
  currentWeekStart.setDate(diff);
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  // All incidents that were still open as of current week
  // and all that were still open as of previous week
  // For aging, we use createdTime to determine when the ticket was first logged
  const currentWeek: Incident[] = [];
  const previousWeek: Incident[] = [];

  for (const inc of incidents) {
    const d = inc.createdTime;
    if (!d) continue;

    // If created before the end of current week and still not completed, it's aging in current week
    currentWeek.push(inc);

    // If created before the previous week start, it was also aging in previous week
    if (d < currentWeekStart) {
      previousWeek.push(inc);
    }
  }

  return { currentWeek, previousWeek };
}
