/**
 * Aging Module State Store
 * Separate state management for the Aging Trends workflow
 */

import type { Incident, ValidationSummary, ColumnMapping } from '@/types/incident';
import type { RoutingConfig, RoutingSummary } from '@/types/routing';
import type { AgingReportData, PreviousWeekAging } from '@/types/aging';
import { DEFAULT_COLUMN_MAPPING } from '@/types/incident';
import { DEFAULT_ROUTING_CONFIG, REPORT_TEAMS } from '@/lib/routing/routing-engine';

/** Aging workflow steps */
export type AgingStep = 'upload' | 'validation' | 'routing' | 'previous-week' | 'report';

/** Aging module state */
export interface AgingState {
  currentStep: AgingStep;

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

  // Previous Week
  previousWeekAging: PreviousWeekAging;

  // Report
  reportData: AgingReportData | null;
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
export type AgingAction =
  | { type: 'SET_STEP'; step: AgingStep }
  | { type: 'SET_FILE'; fileName: string; rawData: Record<string, unknown>[]; columns: string[] }
  | { type: 'SET_COLUMN_MAPPING'; mapping: ColumnMapping }
  | { type: 'SET_VALIDATION'; incidents: Incident[]; summary: ValidationSummary }
  | { type: 'SET_ROUTING_CONFIG'; config: RoutingConfig }
  | { type: 'SET_ROUTING_RESULT'; incidents: Incident[]; summary: RoutingSummary }
  | { type: 'SET_PREVIOUS_WEEK'; previousWeek: PreviousWeekAging }
  | { type: 'SET_REPORT_DATA'; data: AgingReportData }
  | { type: 'SET_REPORT_PERIOD'; period: string }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'OPEN_DETAIL_MODAL'; title: string; incidentIds: string[] }
  | { type: 'CLOSE_DETAIL_MODAL' }
  | { type: 'RESET' };

function createEmptyPreviousWeekAging(): PreviousWeekAging {
  const teamTotals: Record<string, number | null> = {};
  for (const team of REPORT_TEAMS) {
    teamTotals[team] = null;
  }
  return { teamTotals, grandTotal: null };
}

/** Initial state */
export const agingInitialState: AgingState = {
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
  previousWeekAging: createEmptyPreviousWeekAging(),
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
export function agingReducer(state: AgingState, action: AgingAction): AgingState {
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

    case 'SET_PREVIOUS_WEEK':
      return { ...state, previousWeekAging: action.previousWeek };

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

    case 'RESET':
      return { ...agingInitialState };

    default:
      return state;
  }
}
