
import type { RawIncidentRow, ColumnMapping, Incident } from '@/types/incident';


export function autoDetectMapping(columns: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};

  const matchers: { field: keyof ColumnMapping; patterns: RegExp[] }[] = [
    { field: 'requestId', patterns: [/request\s*id/i, /^id$/i, /incident\s*id/i, /ticket\s*id/i, /^sr\s*no/i] },
    { field: 'technician', patterns: [/technician/i, /assigned\s*to/i, /tech/i, /agent/i] },
    { field: 'priority', patterns: [/priority/i, /severity/i, /urgency/i] },
    { field: 'requestStatus', patterns: [/request\s*status/i, /^status$/i, /ticket\s*status/i] },
    { field: 'createdTime', patterns: [/created\s*time/i, /created\s*date/i, /created\s*at/i, /open\s*date/i] },
    { field: 'respondedDate', patterns: [/responded\s*date/i, /response\s*date/i, /first\s*respond/i] },
    { field: 'firstResponseOverdueStatus', patterns: [/first\s*response\s*overdue/i, /fr\s*overdue/i, /first\s*response\s*sla/i] },
    { field: 'completedTime', patterns: [/completed\s*time/i, /completed\s*date/i, /resolved\s*time/i, /closed\s*time/i, /resolved\s*date/i] },
    { field: 'overdueStatus', patterns: [/^overdue\s*status$/i, /resolution\s*overdue/i, /overdue$/i] },
    { field: 'category', patterns: [/^category$/i, /incident\s*category/i, /^type$/i] },
    { field: 'department', patterns: [/department/i, /dept/i] },
    { field: 'requester', patterns: [/requester/i, /requested\s*by/i, /caller/i, /reported\s*by/i] },
  ];

  for (const col of columns) {
    for (const matcher of matchers) {
      if (!mapping[matcher.field]) {
        for (const pattern of matcher.patterns) {
          if (pattern.test(col.trim())) {
            mapping[matcher.field] = col;
            break;
          }
        }
      }
    }
  }

  return mapping;
}


function parseDate(value: string | number | Date | undefined): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  if (value instanceof Date) return value;

  const strVal = String(value).trim();
  if (!strVal) return undefined;

  const parsed = new Date(strVal);
  if (!isNaN(parsed.getTime())) return parsed;

  const ddmmMatch = strVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (ddmmMatch) {
    const [, day, month, year, hour, min, sec] = ddmmMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec || '0'));
  }

  return undefined;
}

function isOverdue(value: string | number | undefined): boolean {
  if (value === undefined || value === null) return false;
  const str = String(value).toLowerCase().trim();
  return str === 'overdue' || str === 'yes' || str === 'true' || str === '1' || str === 'failed' || str === 'breached';
}

export function mapRowToIncident(
  row: RawIncidentRow,
  mapping: ColumnMapping
): { incident: Incident; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requestId = String(row[mapping.requestId] || '').trim();
  if (!requestId) {
    errors.push('Missing Request ID');
  }

  const technician = String(row[mapping.technician] || '').trim();
  if (!technician) {
    warnings.push('Missing Technician');
  }

  const category = String(row[mapping.category] || '').trim();
  if (!category) {
    warnings.push('Missing Category');
  }

  const createdTime = parseDate(row[mapping.createdTime]);
  const respondedDate = parseDate(row[mapping.respondedDate]);
  const completedTime = parseDate(row[mapping.completedTime]);

  if (!createdTime) {
    warnings.push('Missing or invalid Created Time');
  }

  const rawFirstResponseStatus = row[mapping.firstResponseOverdueStatus];
  const rawResolutionStatus = row[mapping.overdueStatus];

  const firstResponseOverdue = isOverdue(row[mapping.firstResponseOverdueStatus]);
  const resolutionOverdue = isOverdue(row[mapping.overdueStatus]);

  const incident: Incident = {
    requestId,
    sourceTeam: technician,
    category,
    assignedTeam: technician,
    routingReason: 'Default assignment',
    wasReassigned: false,
    priority: String(row[mapping.priority] || '').trim() || undefined,
    requestStatus: String(row[mapping.requestStatus] || '').trim() || undefined,
    createdTime,
    respondedDate,
    completedTime,
    firstResponseOverdue,
    resolutionOverdue,
    rawFirstResponseStatus,
    rawResolutionStatus,
    rawData: row,
  };

  return { incident, errors, warnings };
}


export function mapAllRows(
  rows: RawIncidentRow[],
  mapping: ColumnMapping
): { incidents: Incident[]; validationSummary: import('@/types/incident').ValidationSummary } {
  const incidents: Incident[] = [];
  const allErrors: { requestId: string; messages: string[] }[] = [];
  const allWarnings: { requestId: string; messages: string[] }[] = [];
  const sourceTeams = new Set<string>();
  const categories = new Set<string>();

  for (const row of rows) {
    const { incident, errors, warnings } = mapRowToIncident(row, mapping);

    if (incident.sourceTeam) sourceTeams.add(incident.sourceTeam);
    if (incident.category) categories.add(incident.category);

    if (errors.length > 0) {
      allErrors.push({ requestId: incident.requestId || 'Unknown', messages: errors });
    }
    if (warnings.length > 0) {
      allWarnings.push({ requestId: incident.requestId || 'Unknown', messages: warnings });
    }

    if (incident.requestId) {
      incidents.push(incident);
    }
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    incidents,
    validationSummary: {
      totalRecords: rows.length,
      validRecords: incidents.length,
      invalidRecords: rows.length - incidents.length,
      errors: allErrors,
      warnings: allWarnings,
      detectedColumns: columns,
      detectedSourceTeams: Array.from(sourceTeams),
      detectedCategories: Array.from(categories),
    },
  };
}
