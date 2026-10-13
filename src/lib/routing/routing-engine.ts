import type { Incident } from '@/types/incident';
import type { RoutingRule, RoutingConfig, RoutingResult, RoutingSummary } from '@/types/routing';
import { lookupRoutingMatrix } from './routing-matrix';

// Technician
export const REPORT_TEAMS = [
  'ECS HR',
  'ECS ADMIN',
  'ECS ISS',
  'ECS SDS',
  'ECS PSD',
  'ECS ISMS Support',
];

export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'facility-to-admin',
    name: 'Facility → ECS ADMIN',
    description: 'Facility-related incidents from ISS teams are reassigned to ECS ADMIN',
    priority: 1,
    conditions: {
      sourceTeams: ['ISS Binondo', 'ISS MT', 'ECS ISS Binondo', 'ECS ISS'],
      categories: ['Facility'],
      categoryMatch: 'contains',
    },
    assignedTeam: 'ECS ADMIN',
    enabled: true,
  },
  {
    id: 'hr-routing',
    name: 'HR Issues → ECS HR',
    description: 'HR-related incidents are assigned to ECS HR',
    priority: 2,
    conditions: {
      categories: ['HR', 'Human Resource'],
      categoryMatch: 'contains',
    },
    assignedTeam: 'ECS HR',
    enabled: true,
  },
  {
    id: 'isms-routing',
    name: 'ISMS → ECS ISMS Support',
    description: 'ISMS/Security incidents are assigned to ECS ISMS Support',
    priority: 3,
    conditions: {
      categories: ['ISMS', 'Information Security'],
      categoryMatch: 'contains',
    },
    assignedTeam: 'ECS ISMS Support',
    enabled: true,
  },
  {
    id: 'sds-routing',
    name: 'SDS → ECS SDS',
    description: 'SDS-related incidents are assigned to ECS SDS',
    priority: 4,
    conditions: {
      categories: ['SDS', 'Service Desk'],
      categoryMatch: 'contains',
    },
    assignedTeam: 'ECS SDS',
    enabled: true,
  },
  {
    id: 'psd-routing',
    name: 'PSD → ECS PSD',
    description: 'PSD-related incidents are assigned to ECS PSD',
    priority: 5,
    conditions: {
      categories: ['PSD', 'Professional Service'],
      categoryMatch: 'contains',
    },
    assignedTeam: 'ECS PSD',
    enabled: true,
  },
];

// Technician 
export const DEFAULT_TEAM_MAPPING: Record<string, string> = {
  'ISS Binondo': 'ECS ISS',
  'ISS MT': 'ECS ISS',
  'ECS ISS Binondo': 'ECS ISS',
  'ECS ISS': 'ECS ISS',
  'ECS HR': 'ECS HR',
  'ECS SDS': 'ECS SDS',
  'ECS PSD': 'ECS PSD',
  'ECS PSD Group': 'ECS PSD',
  'ECS ISMS Support': 'ECS ISMS Support',
  'ECS ISMS Support Group': 'ECS ISMS Support',
  'ECS HRAD': 'ECS ADMIN',
  'ECS HRAD Group': 'ECS ADMIN',
  'ECS ADMIN': 'ECS ADMIN',
};

export const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  rules: DEFAULT_ROUTING_RULES,
  defaultTeamMapping: DEFAULT_TEAM_MAPPING,
  reportTeams: REPORT_TEAMS,
};

function matchesRule(incident: Incident, rule: RoutingRule): boolean {
  if (!rule.enabled) return false;

  const { conditions } = rule;

  if (conditions.sourceTeams && conditions.sourceTeams.length > 0) {
    const sourceMatch = conditions.sourceTeams.some(
      (team) => team.toLowerCase() === incident.sourceTeam.toLowerCase()
    );
    if (!sourceMatch) return false;
  }

  if (conditions.categories && conditions.categories.length > 0) {
    const categoryLower = incident.category.toLowerCase();
    const categoryMatch = conditions.categories.some((cat) => {
      const catLower = cat.toLowerCase();
      if (conditions.categoryMatch === 'exact') {
        return categoryLower === catLower;
      }
      return categoryLower.includes(catLower);
    });
    if (!categoryMatch) return false;
  }

  if (conditions.subCategories && conditions.subCategories.length > 0) {
    const subLower = (incident.subCategory || '').toLowerCase();
    const subMatch = conditions.subCategories.some((sub) => {
      const targetLower = sub.toLowerCase();
      return subLower.includes(targetLower);
    });
    if (!subMatch) return false;
  }

  if (conditions.items && conditions.items.length > 0) {
    const itemLower = (incident.item || '').toLowerCase();
    const itemMatch = conditions.items.some((itm) => {
      const targetLower = itm.toLowerCase();
      return itemLower.includes(targetLower);
    });
    if (!itemMatch) return false;
  }

  return true;
}

export function resolveAssignedTeam(
  incident: Incident,
  config: RoutingConfig = DEFAULT_ROUTING_CONFIG
): RoutingResult {
  // 1. Matrix matching (highest fidelity: Category > Subcategory > Item)
  const matrixMatch = lookupRoutingMatrix(
    incident.category,
    incident.subCategory,
    incident.item
  );

  if (matrixMatch) {
    const finalAssignedTeam = matrixMatch.targetReportTeam;
    const wasReassigned = finalAssignedTeam !== incident.sourceTeam;
    const itemDetail = matrixMatch.item && matrixMatch.item !== 'Not Applicable' ? ` > ${matrixMatch.item}` : '';
    const routingReason = `${matrixMatch.autoAssignedGroup} (${matrixMatch.subCategory}${itemDetail})`;

    return {
      requestId: incident.requestId,
      sourceTeam: incident.sourceTeam,
      category: incident.category,
      subCategory: incident.subCategory,
      item: incident.item,
      autoAssignedGroup: matrixMatch.autoAssignedGroup,
      originalAssignment: incident.sourceTeam,
      finalAssignedTeam,
      routingReason,
      wasReassigned,
      matchedRuleId: `matrix-${matrixMatch.autoAssignedGroup}`,
    };
  }

  // 2. Custom Configured Rules
  const sortedRules = [...config.rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (matchesRule(incident, rule)) {
      const wasReassigned = rule.assignedTeam !== incident.sourceTeam;
      return {
        requestId: incident.requestId,
        sourceTeam: incident.sourceTeam,
        category: incident.category,
        subCategory: incident.subCategory,
        item: incident.item,
        autoAssignedGroup: rule.assignedTeam,
        originalAssignment: incident.sourceTeam,
        finalAssignedTeam: rule.assignedTeam,
        routingReason: rule.name,
        wasReassigned,
        matchedRuleId: rule.id,
      };
    }
  }

  // 3. Default Team Mapping
  const mappedTeam = config.defaultTeamMapping[incident.sourceTeam];
  if (mappedTeam) {
    const wasReassigned = mappedTeam !== incident.sourceTeam;
    return {
      requestId: incident.requestId,
      sourceTeam: incident.sourceTeam,
      category: incident.category,
      subCategory: incident.subCategory,
      item: incident.item,
      autoAssignedGroup: mappedTeam,
      originalAssignment: incident.sourceTeam,
      finalAssignedTeam: mappedTeam,
      routingReason: 'Default team mapping',
      wasReassigned,
    };
  }

  // 4. Fuzzy Match
  const sourceUpper = incident.sourceTeam.toUpperCase();
  const matchedReportTeam = config.reportTeams.find(
    (t) => sourceUpper.includes(t.replace('ECS ', '').toUpperCase())
  );

  if (matchedReportTeam) {
    return {
      requestId: incident.requestId,
      sourceTeam: incident.sourceTeam,
      category: incident.category,
      subCategory: incident.subCategory,
      item: incident.item,
      autoAssignedGroup: matchedReportTeam,
      originalAssignment: incident.sourceTeam,
      finalAssignedTeam: matchedReportTeam,
      routingReason: 'Fuzzy team match',
      wasReassigned: true,
    };
  }

  // 5. Ultimate Fallback
  return {
    requestId: incident.requestId,
    sourceTeam: incident.sourceTeam,
    category: incident.category,
    subCategory: incident.subCategory,
    item: incident.item,
    autoAssignedGroup: 'ECS ISS',
    originalAssignment: incident.sourceTeam,
    finalAssignedTeam: 'ECS ISS',
    routingReason: 'No matching rule — defaulted to ECS ISS',
    wasReassigned: true,
  };
}

export function applyRouting(
  incidents: Incident[],
  config: RoutingConfig = DEFAULT_ROUTING_CONFIG
): { routedIncidents: Incident[]; summary: RoutingSummary } {
  const results: RoutingResult[] = [];
  const routedIncidents: Incident[] = [];
  let reassigned = 0;
  let unchanged = 0;

  for (const incident of incidents) {
    const result = resolveAssignedTeam(incident, config);
    results.push(result);

    const routedIncident: Incident = {
      ...incident,
      assignedTeam: result.finalAssignedTeam,
      routingReason: result.routingReason,
      wasReassigned: result.wasReassigned,
    };

    routedIncidents.push(routedIncident);

    if (result.wasReassigned) {
      reassigned++;
    } else {
      unchanged++;
    }
  }

  return {
    routedIncidents,
    summary: {
      totalRecords: incidents.length,
      reassignedRecords: reassigned,
      unchangedRecords: unchanged,
      errorsOrWarnings: 0,
      results,
    },
  };
}
