
import type { Incident, ValidationSummary, ColumnMapping } from '@/types/incident';
import type { RoutingConfig, RoutingSummary } from '@/types/routing';
import type { SLAReport, PreviousWeekSLA, WeeklyReportData } from '@/types/sla';
import { DEFAULT_COLUMN_MAPPING } from '@/types/incident';
import { DEFAULT_ROUTING_CONFIG, REPORT_TEAMS } from '@/lib/routing/routing-engine';

/** Application processing step */
export type AppStep = 'upload' | 'validation' | 'routing' | 'previous-week' | 'report';

/** Complete application state */
export interface AppState {
  currentStep: AppStep;

  // Upload
  fileName: string | null;
  rawData: Record<string, unknown>[] | null;
  detectedColumns: string[];
  columnMapping: ColumnMapping;

  // Validation
  incidents: Incident[];
  validationSummary: ValidationSummary | null;

  // Routing
  routingConfig: RoutingConfig;
  routedIncidents: Incident[];
  routingSummary: RoutingSummary | null;

  // SLA
  slaReport: SLAReport | null;

  // Previous Week (manual input)
  previousWeekSLA: PreviousWeekSLA;

  // Report
  reportData: WeeklyReportData | null;
  reportPeriod: string;

  // UI
  isProcessing: boolean;
  error: string | null;

  // Detail modal
  detailModal: {
    isOpen: boolean;
    title: string;
    incidentIds: string[];
  };
}

/** Action types */
export type AppAction =
  | { type: 'SET_STEP'; step: AppStep }
  | { type: 'SET_FILE'; fileName: string; rawData: Record<string, unknown>[]; columns: string[] }
  | { type: 'SET_COLUMN_MAPPING'; mapping: ColumnMapping }
  | { type: 'SET_VALIDATION'; incidents: Incident[]; summary: ValidationSummary }
  | { type: 'SET_ROUTING_CONFIG'; config: RoutingConfig }
  | { type: 'SET_ROUTING_RESULT'; incidents: Incident[]; summary: RoutingSummary }
  | { type: 'SET_SLA_REPORT'; report: SLAReport }
  | { type: 'SET_PREVIOUS_WEEK'; previousWeek: PreviousWeekSLA }
  | { type: 'SET_REPORT_DATA'; data: WeeklyReportData }
  | { type: 'SET_REPORT_PERIOD'; period: string }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'OPEN_DETAIL_MODAL'; title: string; incidentIds: string[] }
  | { type: 'CLOSE_DETAIL_MODAL' }
  | { type: 'LOAD_STORED_REPORT'; reportData: WeeklyReportData; routedIncidents: Incident[] }
  | { type: 'RESET' };

/** Create empty previous week SLA */
function createEmptyPreviousWeekSLA(): PreviousWeekSLA {
  const firstResponse: Record<string, number | null> = {};
  const resolutionTime: Record<string, number | null> = {};

  for (const team of REPORT_TEAMS) {
    firstResponse[team] = null;
    resolutionTime[team] = null;
  }

  return {
    firstResponse,
    resolutionTime,
    firstResponseTotal: null,
    resolutionTimeTotal: null,
  };
}

/** Initial state */
export const initialState: AppState = {
  currentStep: 'upload',
  fileName: null,
  rawData: null,
  detectedColumns: [],
  columnMapping: DEFAULT_COLUMN_MAPPING,
  incidents: [],
  validationSummary: null,
  routingConfig: DEFAULT_ROUTING_CONFIG,
  routedIncidents: [],
  routingSummary: null,
  slaReport: null,
  previousWeekSLA: createEmptyPreviousWeekSLA(),
  reportData: null,
  reportPeriod: '',
  isProcessing: false,
  error: null,
  detailModal: {
    isOpen: false,
    title: '',
    incidentIds: [],
  },
};

/** State reducer */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: null };

    case 'SET_FILE':
      return {
        ...state,
        fileName: action.fileName,
        rawData: action.rawData,
        detectedColumns: action.columns,
        error: null,
      };

    case 'SET_COLUMN_MAPPING':
      return { ...state, columnMapping: action.mapping };

    case 'SET_VALIDATION':
      return {
        ...state,
        incidents: action.incidents,
        validationSummary: action.summary,
      };

    case 'SET_ROUTING_CONFIG':
      return { ...state, routingConfig: action.config };

    case 'SET_ROUTING_RESULT':
      return {
        ...state,
        routedIncidents: action.incidents,
        routingSummary: action.summary,
      };

    case 'SET_SLA_REPORT':
      return { ...state, slaReport: action.report };

    case 'SET_PREVIOUS_WEEK':
      return { ...state, previousWeekSLA: action.previousWeek };

    case 'SET_REPORT_DATA':
      return { ...state, reportData: action.data };

    case 'SET_REPORT_PERIOD':
      return { ...state, reportPeriod: action.period };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'OPEN_DETAIL_MODAL':
      return {
        ...state,
        detailModal: {
          isOpen: true,
          title: action.title,
          incidentIds: action.incidentIds,
        },
      };

    case 'CLOSE_DETAIL_MODAL':
      return {
        ...state,
        detailModal: { isOpen: false, title: '', incidentIds: [] },
      };

    case 'LOAD_STORED_REPORT':
      return {
        ...state,
        currentStep: 'report',
        reportData: action.reportData,
        routedIncidents: action.routedIncidents,
        incidents: action.routedIncidents,
        error: null,
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}
