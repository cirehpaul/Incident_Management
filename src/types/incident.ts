/**
 * Core Incident Types
 * Normalized internal data model for incident processing
 */

/** Raw data as parsed directly from Excel/CSV */
export interface RawIncidentRow {
  [key: string]: string | number | undefined;
}

/** Column mapping configuration */
export interface ColumnMapping {
  requestId: string;
  technician: string;
  priority: string;
  requestStatus: string;
  createdTime: string;
  respondedDate: string;
  firstResponseOverdueStatus: string;
  completedTime: string;
  overdueStatus: string;
  category: string;
  department: string;
  requester: string;
}

/** Default column mapping matching ServiceDesk Plus exports */
export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  requestId: 'RequestID',
  technician: 'Technician',
  priority: 'Priority',
  requestStatus: 'Request Status',
  createdTime: 'Created Time',
  respondedDate: 'Responded Date',
  firstResponseOverdueStatus: 'First Response Overdue Status',
  completedTime: 'Completed Time',
  overdueStatus: 'Overdue Status',
  category: 'Category',
  department: 'Department',
  requester: 'Requester',
};

/** Normalized Incident model — the core internal representation */
export interface Incident {
  requestId: string;

  /** The team that originally received/inputted this incident */
  sourceTeam: string;

  /** The incident category */
  category: string;

  /** The final team responsible for SLA reporting (after routing) */
  assignedTeam: string;

  /** Reason for the routing decision */
  routingReason: string;

  /** Whether the incident was rerouted from original assignment */
  wasReassigned: boolean;

  priority?: string;
  requestStatus?: string;

  createdTime?: Date;
  respondedDate?: Date;
  completedTime?: Date;

  /** Whether the first response SLA was missed */
  firstResponseOverdue: boolean;

  /** Whether the resolution SLA was missed */
  resolutionOverdue: boolean;

  /** Raw First Response Overdue / SLA status from the file (e.g. TRUE/FALSE) */
  rawFirstResponseStatus?: string | number | boolean;

  /** Raw Resolution Overdue / SLA status from the file (e.g. TRUE/FALSE) */
  rawResolutionStatus?: string | number | boolean;

  /** Original raw data for traceability */
  rawData: RawIncidentRow;
}

/** Validation result for a single incident */
export interface ValidationResult {
  incident: Partial<Incident>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/** Summary of all validation results */
export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: { requestId: string; messages: string[] }[];
  warnings: { requestId: string; messages: string[] }[];
  detectedColumns: string[];
  detectedSourceTeams: string[];
  detectedCategories: string[];
}
