/**
 * SLA Types
 * SLA calculation and aggregation types
 */

/** SLA result for a single team in one category */
export interface TeamSLAResult {
  teamName: string;
  total: number;
  failed: number;
  passed: number;
  slaPassRate: number | null; // null when N/A (0 incidents)

  /** IDs of incidents that were counted */
  incidentIds: string[];
  /** IDs of incidents that failed */
  failedIncidentIds: string[];
  /** IDs of incidents that passed */
  passedIncidentIds: string[];
}

/** Complete SLA results for all teams */
export interface SLAReport {
  /** First Response SLA results per team */
  firstResponse: TeamSLAResult[];
  /** Resolution Time SLA results per team */
  resolutionTime: TeamSLAResult[];

  /** Overall totals (calculated from sums, not averages) */
  firstResponseTotal: TeamSLAResult;
  resolutionTimeTotal: TeamSLAResult;
}

/** Previous week SLA values (manually entered) */
export interface PreviousWeekSLA {
  firstResponse: Record<string, number | null>; // team -> percentage or null for N/A
  resolutionTime: Record<string, number | null>;
  firstResponseTotal: number | null;
  resolutionTimeTotal: number | null;
}

/** Weekly completion for incidents filed in the last 7 days */
export interface WeeklyCompletion {
  firstResponse: {
    passed: number;
    failed: number;
    slaPassRate: number | null;
    passedIncidentIds?: string[];
    failedIncidentIds?: string[];
  };
  resolution: {
    passed: number;
    failed: number;
    slaPassRate: number | null;
    passedIncidentIds?: string[];
    failedIncidentIds?: string[];
  };
}

/** Complete report data combining current and previous week */
export interface WeeklyReportData {
  reportTitle: string;
  reportPeriod: string;
  generatedAt: Date;

  currentWeek: SLAReport;
  previousWeek: PreviousWeekSLA;
  weeklyCompletion: WeeklyCompletion;

  /** Ordered list of teams for the report */
  teamOrder: string[];
}
