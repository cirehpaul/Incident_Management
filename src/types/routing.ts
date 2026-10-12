/**
 * Routing Types
 * Configurable rules for incident team assignment
 */

/** A single routing rule */
export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Lower number = higher priority

  /** Conditions to match */
  conditions: {
    sourceTeams?: string[];    // Match if sourceTeam is in this list
    categories?: string[];      // Match if category contains/matches these
    categoryMatch?: 'exact' | 'contains'; // How to match categories
  };

  /** The final team assignment if rule matches */
  assignedTeam: string;

  /** Whether this rule is active */
  enabled: boolean;
}

/** Complete routing configuration */
export interface RoutingConfig {
  rules: RoutingRule[];

  /** Default team mapping when no rule matches */
  defaultTeamMapping: Record<string, string>;

  /** Known report teams */
  reportTeams: string[];
}

/** Result of applying routing to an incident */
export interface RoutingResult {
  requestId: string;
  sourceTeam: string;
  category: string;
  originalAssignment: string;
  finalAssignedTeam: string;
  routingReason: string;
  wasReassigned: boolean;
  matchedRuleId?: string;
}

/** Summary of routing results */
export interface RoutingSummary {
  totalRecords: number;
  reassignedRecords: number;
  unchangedRecords: number;
  errorsOrWarnings: number;
  results: RoutingResult[];
}
