/**
 * Aging Trends Types
 * Data structures for the Aging Incident Report module
 */

/** Aging time bucket identifiers (from oldest to newest) */
export type AgingBucket = '>1month' | '2-4weeks' | '1-2weeks' | '4-6days' | '1-3days' | 'sameday';

/** Human-readable labels for each aging bucket */
export const AGING_BUCKET_LABELS: Record<AgingBucket, string> = {
  '>1month': '> 1 month',
  '2-4weeks': '2 – 4 weeks',
  '1-2weeks': '1 – 2 weeks',
  '4-6days': '4 – 6 days',
  '1-3days': '1 – 3 days',
  'sameday': 'same day',
};

/** Ordered list of buckets (oldest → newest) */
export const AGING_BUCKET_ORDER: AgingBucket[] = [
  '>1month',
  '2-4weeks',
  '1-2weeks',
  '4-6days',
  '1-3days',
  'sameday',
];

/** Aging distribution for a single team */
export interface TeamAgingResult {
  teamName: string;
  /** Count per aging bucket */
  buckets: Record<AgingBucket, number>;
  /** Incident IDs per bucket (for drill-down) */
  bucketIncidentIds: Record<AgingBucket, string[]>;
  /** Total aging IRs for this team */
  totalAging: number;
  /** All incident IDs included */
  incidentIds: string[];
}

/** SLA row for the aging SLA compliance table */
export interface AgingSLARow {
  teamName: string;
  totalIRs: number;
  firstResponse: {
    failed: number;
    passed: number;
    slaPassRate: number | null;
    failedIds: string[];
    passedIds: string[];
  };
  resolutionTime: {
    failed: number;
    passed: number;
    slaPassRate: number | null;
    failedIds: string[];
    passedIds: string[];
  };
  /** All incident IDs for this team */
  incidentIds: string[];
}

/** SLA totals for the bottom row */
export interface AgingSLATotals {
  totalIRs: number;
  firstResponse: {
    failed: number;
    passed: number;
    slaPassRate: number | null;
  };
  resolutionTime: {
    failed: number;
    passed: number;
    slaPassRate: number | null;
  };
}

/** Previous week aging totals (per team) */
export interface PreviousWeekAging {
  teamTotals: Record<string, number | null>; // teamName → total aging count or null
  grandTotal: number | null;
}

/** Complete Aging Report data combining all tables */
export interface AgingReportData {
  reportTitle: string;
  reportPeriod: string;
  generatedAt: Date;

  /** SLA compliance table data */
  slaRows: AgingSLARow[];
  slaTotals: AgingSLATotals;

  /** Aging distribution table data */
  agingRows: TeamAgingResult[];
  agingGrandTotal: number;

  /** Previous week totals for comparison */
  previousWeek: PreviousWeekAging;

  /** Ordered list of teams */
  teamOrder: string[];
}
