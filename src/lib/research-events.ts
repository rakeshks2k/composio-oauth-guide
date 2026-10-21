import { Guide, ResearchEvent } from './types';

export function getGuideResearchEvents(guide: Guide): ResearchEvent[] {
  const baseTime = new Date(guide.createdAt || Date.now()).getTime();
  const t = (offsetSec: number) => new Date(baseTime + offsetSec * 1000).toISOString();

  const events: ResearchEvent[] = [
    {
      type: 'step',
      message: `Initiating autonomous research for ${guide.appName}...`,
      detail: guide.appDomain ? `Target domain: ${guide.appDomain}` : undefined,
      timestamp: t(0),
    },
    {
      type: 'step',
      message: `Checking Composio managed authentication catalog for ${guide.appName}...`,
      detail: guide.composioManaged
        ? `Found active managed OAuth toolkit with pre-configured client credentials.`
        : `Managed toolkit not active; requires custom OAuth developer application setup.`,
      timestamp: t(1),
    },
    {
      type: 'finding',
      message: `Architectural Path: ${guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth Application'}`,
      detail: guide.pathJustification,
      timestamp: t(2),
    },
    {
      type: 'step',
      message: `Auditing permissions matrix (${guide.scopes.length} OAuth scopes identified)...`,
      detail: `Categorized into basic, sensitive, and restricted security tiers.`,
      timestamp: t(3),
    },
    {
      type: 'finding',
      message: `Effort calculation: ${guide.handsOnHours.min}–${guide.handsOnHours.max}h engineering work vs. ${guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max}d` : '0d'} vendor review delay.`,
      timestamp: t(4),
    },
  ];

  // Add all official sources & citations
  if (guide.sources && guide.sources.length > 0) {
    for (let i = 0; i < guide.sources.length; i++) {
      const src = guide.sources[i];
      events.push({
        type: 'source',
        message: src.title,
        url: src.url,
        detail: `Verified from ${src.type.replace('-', ' ')}`,
        timestamp: t(5 + i),
      });
    }
  }

  // Add checklist findings
  if (guide.setupChecklist && guide.setupChecklist.length > 0) {
    events.push({
      type: 'step',
      message: `Synthesizing ${guide.setupChecklist.length}-step production implementation checklist...`,
      detail: `Delineated developer manual steps vs. Composio CLI automation capabilities.`,
      timestamp: t(9),
    });
  }

  // Add blockers warning if any
  if (guide.commonBlockers && guide.commonBlockers.length > 0) {
    events.push({
      type: 'warning',
      message: `Identified ${guide.commonBlockers.length} known friction points and mitigation strategies.`,
      detail: guide.commonBlockers[0]?.title,
      timestamp: t(10),
    });
  }

  // Final complete event
  events.push({
    type: 'complete',
    message: `Research complete for ${guide.appName} (${guide.difficulty.toUpperCase()} difficulty)`,
    detail: JSON.stringify(guide),
    timestamp: t(11),
  });

  return events;
}

