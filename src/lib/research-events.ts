import { Guide, ResearchEvent } from './types';

export function getGuideResearchEvents(guide: Guide): ResearchEvent[] {
  const baseTime = new Date(guide.createdAt || Date.now()).getTime();
  const t = (offsetSec: number) => new Date(baseTime + offsetSec * 1000).toISOString();

  const isPreset = guide.isPreset;
  const origin = isPreset
    ? `Pre-researched on ${guide.researchDate} — sources manually verified`
    : `AI-researched via GPT-4o pipeline on ${guide.researchDate}`;

  const events: ResearchEvent[] = [
    {
      type: 'step',
      message: isPreset
        ? `Loading pre-researched guide for ${guide.appName} from verified library`
        : `Loading AI-researched guide for ${guide.appName} from database`,
      detail: guide.appDomain ? `Provider domain: ${guide.appDomain}` : undefined,
      timestamp: t(0),
    },
    {
      type: 'finding',
      message: origin,
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
      message: `Composio managed auth: ${guide.composioManaged ? 'Supported' : 'Not supported — custom credentials required'}`,
      detail: guide.composioManaged
        ? `Active managed OAuth toolkit with pre-configured client credentials available.`
        : `Custom OAuth developer application registration required.`,
      timestamp: t(3),
    },
    {
      type: 'finding',
      message: `${guide.scopes.length} OAuth scopes identified · ${guide.setupChecklist.length} setup steps · ${guide.commonBlockers.length} known blockers`,
      detail: `Effort: ${guide.handsOnHours.min}–${guide.handsOnHours.max}h hands-on | ${guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max}d` : '0d'} approval wait`,
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
        detail: `${src.type.replace(/-/g, ' ')} · accessed ${src.accessedAt}`,
        timestamp: t(5 + i),
      });
    }
  }

  // Blockers warning if any
  if (guide.commonBlockers && guide.commonBlockers.length > 0) {
    events.push({
      type: 'warning',
      message: `${guide.commonBlockers.length} known blockers identified — see guide for resolutions`,
      detail: guide.commonBlockers.filter(b => b.severity === 'high').map(b => b.title).join(' · ') || guide.commonBlockers[0]?.title,
      timestamp: t(9),
    });
  }

  // Approval requirements note
  if (guide.approvalRequirements && guide.approvalRequirements.length > 0) {
    const required = guide.approvalRequirements.filter(r => r.required);
    events.push({
      type: required.length > 0 ? 'warning' : 'step',
      message: required.length > 0
        ? `${required.length} mandatory approval process${required.length > 1 ? 'es' : ''} required before production launch`
        : `${guide.approvalRequirements.length} optional approval process${guide.approvalRequirements.length > 1 ? 'es' : ''} available`,
      detail: required.map(r => r.name).join(' · ') || guide.approvalRequirements[0]?.name,
      timestamp: t(10),
    });
  }

  // Unverified claims notice if any
  if (guide.unverifiedClaims && guide.unverifiedClaims.length > 0) {
    events.push({
      type: 'warning',
      message: `${guide.unverifiedClaims.length} claim${guide.unverifiedClaims.length > 1 ? 's' : ''} marked as unverified — review audit notes`,
      timestamp: t(11),
    });
  }

  // Final complete event
  events.push({
    type: 'complete',
    message: `Guide loaded: ${guide.appName} · ${guide.difficulty.replace('-', ' ')} difficulty`,
    detail: JSON.stringify(guide),
    timestamp: t(12),
  });

  return events;
}

