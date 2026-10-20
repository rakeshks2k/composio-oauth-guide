export interface Guide {
  id: string;
  appName: string;
  appDomain?: string;
  slug: string;
  recommendedPath: 'managed' | 'custom';
  pathJustification: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  handsOnHours: { min: number; max: number };
  elapsedDays: { min: number; max: number };
  approvalDays: { min: number; max: number } | null;
  composioManaged: boolean;
  summary: string;
  setupChecklist: ChecklistItem[];
  approvalRequirements: ApprovalRequirement[];
  commonBlockers: Blocker[];
  agentCapabilities: AgentCapability[];
  scopes: ScopeInfo[];
  sources: Source[];
  researchDate: string;
  assumptions: string[];
  unverifiedClaims: string[];
  isPreset: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  step: number;
  title: string;
  description: string;
  type: 'app-registration' | 'end-user-auth' | 'provider-verification' | 'marketplace-review';
  completionCriteria: string;
  officialLink?: string;
  agentCanDo: boolean;
  estimatedTime?: string;
}

export interface ApprovalRequirement {
  name: string;
  required: boolean;
  description: string;
  estimatedTime?: string;
  link?: string;
}

export interface Blocker {
  title: string;
  description: string;
  resolution: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AgentCapability {
  action: string;
  canDo: boolean;
  notes?: string;
}

export interface ScopeInfo {
  scope: string;
  description: string;
  sensitivity: 'basic' | 'sensitive' | 'restricted';
}

export interface Source {
  title: string;
  url: string;
  type: 'official-docs' | 'provider-policy' | 'composio-docs' | 'community';
  accessedAt: string;
}

export interface ResearchEvent {
  type: 'step' | 'finding' | 'warning' | 'source' | 'complete' | 'error';
  message: string;
  detail?: string;
  url?: string;
  timestamp: string;
}
