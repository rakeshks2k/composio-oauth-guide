'use client';

import { Guide } from '@/lib/types';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Copy,
  Share2,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface GuideViewProps {
  guide: Guide;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'easy': 'text-green-400 bg-green-400/10 border-green-400/30',
  'medium': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'hard': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'very-hard': 'text-accent-red bg-accent-red/10 border-accent-red/30',
};

const STEP_TYPE_COLORS: Record<string, string> = {
  'app-registration': 'text-blue-400 bg-blue-400/10',
  'end-user-auth': 'text-green-400 bg-green-400/10',
  'provider-verification': 'text-orange-400 bg-orange-400/10',
  'marketplace-review': 'text-purple-400 bg-purple-400/10',
};

const STEP_TYPE_LABELS: Record<string, string> = {
  'app-registration': 'App Registration',
  'end-user-auth': 'End User Auth',
  'provider-verification': 'Provider Verification',
  'marketplace-review': 'Marketplace Review',
};

const SENSITIVITY_COLORS: Record<string, string> = {
  'basic': 'text-green-400 bg-green-400/10',
  'sensitive': 'text-accent-amber bg-accent-amber/10',
  'restricted': 'text-accent-red bg-accent-red/10',
};

const SEVERITY_COLORS: Record<string, string> = {
  'low': 'border-l-blue-400',
  'medium': 'border-l-accent-amber',
  'high': 'border-l-accent-red',
};

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-text-muted">{icon}</span>}
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function GuideView({ guide }: GuideViewProps) {
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/guides/${guide.slug}`
    : `/guides/${guide.slug}`;

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyAsMarkdown() {
    const md = guideToMarkdown(guide);
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">{guide.appName}</h1>
              {guide.appDomain && (
                <a
                  href={`https://${guide.appDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-text-muted hover:text-accent-teal transition-colors"
                >
                  {guide.appDomain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={copyAsMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-border hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedMd ? 'Copied!' : 'Copy MD'}
              </button>
              <button
                onClick={copyShareUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-border hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold border',
                guide.recommendedPath === 'managed'
                  ? 'text-accent-teal bg-accent-teal/10 border-accent-teal/30'
                  : 'text-accent-amber bg-accent-amber/10 border-accent-amber/30'
              )}
            >
              {guide.recommendedPath === 'managed' ? '✓ Managed OAuth' : '⚡ Custom OAuth'}
            </span>
            <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', DIFFICULTY_COLORS[guide.difficulty])}>
              {guide.difficulty === 'very-hard' ? 'Very Hard' : guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
            </span>
            {guide.composioManaged && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-text-secondary bg-bg-border border border-bg-border">
                Composio Managed Available
              </span>
            )}
          </div>
        </div>

        {/* Path recommendation */}
        <div
          className={clsx(
            'p-4 rounded-xl border',
            guide.recommendedPath === 'managed'
              ? 'bg-accent-teal/5 border-accent-teal/20'
              : 'bg-accent-amber/5 border-accent-amber/20'
          )}
        >
          <div className="flex items-start gap-3">
            <Zap className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', guide.recommendedPath === 'managed' ? 'text-accent-teal' : 'text-accent-amber')} />
            <div>
              <div className={clsx('text-sm font-semibold mb-1', guide.recommendedPath === 'managed' ? 'text-accent-teal' : 'text-accent-amber')}>
                Recommendation: {guide.recommendedPath === 'managed' ? 'Start with Managed OAuth' : 'Use Custom OAuth'}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{guide.pathJustification}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-text-secondary leading-relaxed">{guide.summary}</p>

        {/* Time estimates */}
        <Section title="Time Estimates" icon={<Clock className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-bg-secondary border border-bg-border">
              <div className="text-xs text-text-muted mb-1">Hands-on Work</div>
              <div className="text-lg font-bold text-text-primary">
                {guide.handsOnHours.min}–{guide.handsOnHours.max}h
              </div>
              <div className="text-xs text-text-muted mt-1">Active setup time</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-secondary border border-bg-border">
              <div className="text-xs text-text-muted mb-1">Total Elapsed</div>
              <div className="text-lg font-bold text-text-primary">
                {guide.elapsedDays.min}–{guide.elapsedDays.max}d
              </div>
              <div className="text-xs text-text-muted mt-1">Calendar days</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-secondary border border-bg-border">
              <div className="text-xs text-text-muted mb-1">Approval Wait</div>
              <div className="text-lg font-bold text-text-primary">
                {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max}d` : 'None'}
              </div>
              <div className="text-xs text-text-muted mt-1">External review</div>
            </div>
          </div>
        </Section>

        {/* Setup Checklist */}
        {guide.setupChecklist.length > 0 && (
          <Section title="Setup Checklist" icon={<Shield className="w-4 h-4" />}>
            <div className="space-y-3">
              {guide.setupChecklist.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-bg-secondary border border-bg-border">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-border flex items-center justify-center text-xs font-bold text-text-muted mt-0.5">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-text-primary">{item.title}</span>
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', STEP_TYPE_COLORS[item.type])}>
                          {STEP_TYPE_LABELS[item.type]}
                        </span>
                        {item.estimatedTime && (
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimatedTime}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed mb-2">{item.description}</p>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          {item.agentCanDo ? (
                            <span className="flex items-center gap-1 text-xs text-accent-teal">
                              <CheckCircle className="w-3 h-3" /> Agent can do this
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <XCircle className="w-3 h-3" /> You must do this
                            </span>
                          )}
                        </div>
                        {item.officialLink && (
                          <a
                            href={item.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-accent-teal hover:underline"
                          >
                            Docs <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Scopes */}
        {guide.scopes.length > 0 && (
          <Section title="OAuth Scopes" icon={<Shield className="w-4 h-4" />}>
            <div className="overflow-hidden rounded-xl border border-bg-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary border-b border-bg-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Scope</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Sensitivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {guide.scopes.map((scope, i) => (
                    <tr key={i} className="bg-bg-primary hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-accent-teal whitespace-nowrap max-w-48">
                        <span className="truncate block">{scope.scope}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{scope.description}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] px-2 py-1 rounded font-medium', SENSITIVITY_COLORS[scope.sensitivity])}>
                          {scope.sensitivity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Approval Requirements */}
        {guide.approvalRequirements.length > 0 && (
          <Section title="Approval Requirements" icon={<Calendar className="w-4 h-4" />}>
            <div className="space-y-3">
              {guide.approvalRequirements.map((req, i) => (
                <div key={i} className="p-4 rounded-xl bg-bg-secondary border border-bg-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary">{req.name}</span>
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', req.required ? 'text-accent-red bg-accent-red/10' : 'text-text-muted bg-bg-border')}>
                          {req.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{req.description}</p>
                    </div>
                    {req.estimatedTime && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-text-muted">Wait time</div>
                        <div className="text-sm font-semibold text-accent-amber">{req.estimatedTime}</div>
                      </div>
                    )}
                  </div>
                  {req.link && (
                    <a href={req.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-teal hover:underline mt-2">
                      View Requirements <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Common Blockers */}
        {guide.commonBlockers.length > 0 && (
          <Section title="Common Blockers" icon={<AlertTriangle className="w-4 h-4" />}>
            <div className="space-y-2">
              {guide.commonBlockers.map((blocker, i) => (
                <div key={i} className={clsx('rounded-xl bg-bg-secondary border border-bg-border border-l-4 overflow-hidden', SEVERITY_COLORS[blocker.severity])}>
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setExpandedBlocker(expandedBlocker === i ? null : i)}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={clsx('w-4 h-4 flex-shrink-0', {
                        'text-blue-400': blocker.severity === 'low',
                        'text-accent-amber': blocker.severity === 'medium',
                        'text-accent-red': blocker.severity === 'high',
                      })} />
                      <span className="text-sm font-medium text-text-primary">{blocker.title}</span>
                    </div>
                    {expandedBlocker === i ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </button>
                  {expandedBlocker === i && (
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-xs text-text-secondary">{blocker.description}</p>
                      <div className="p-3 rounded-lg bg-bg-border/50">
                        <div className="text-xs font-medium text-text-secondary mb-1">Resolution</div>
                        <p className="text-xs text-text-muted">{blocker.resolution}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Agent Capabilities */}
        {guide.agentCapabilities.length > 0 && (
          <Section title="Agent Capabilities" icon={<Zap className="w-4 h-4" />}>
            <div className="overflow-hidden rounded-xl border border-bg-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary border-b border-bg-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {guide.agentCapabilities.map((cap, i) => (
                    <tr key={i} className="bg-bg-primary hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-text-primary">{cap.action}</td>
                      <td className="px-4 py-3">
                        {cap.canDo ? (
                          <span className="flex items-center gap-1 text-xs text-accent-teal">
                            <CheckCircle className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <XCircle className="w-3 h-3" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">{cap.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Sources */}
        {guide.sources.length > 0 && (
          <Section title="Sources" icon={<ExternalLink className="w-4 h-4" />}>
            <div className="space-y-2">
              {guide.sources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary border border-bg-border hover:border-accent-teal/30 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded flex-shrink-0', {
                      'text-blue-400 bg-blue-400/10': source.type === 'official-docs',
                      'text-orange-400 bg-orange-400/10': source.type === 'provider-policy',
                      'text-accent-teal bg-accent-teal/10': source.type === 'composio-docs',
                      'text-text-muted bg-bg-border': source.type === 'community',
                    })}>
                      {source.type.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary truncate transition-colors">{source.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-text-muted">{source.accessedAt}</span>
                    <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-accent-teal transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Assumptions & Unverified Claims */}
        {(guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) && (
          <div className="p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/20 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent-amber" />
              <span className="text-sm font-semibold text-accent-amber">Caveats</span>
            </div>
            {guide.assumptions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-text-secondary mb-1">Assumptions</div>
                <ul className="space-y-1">
                  {guide.assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                      <span className="text-text-muted mt-0.5">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guide.unverifiedClaims.length > 0 && (
              <div>
                <div className="text-xs font-medium text-accent-amber mb-1">Unverified Claims</div>
                <ul className="space-y-1">
                  {guide.unverifiedClaims.map((c, i) => (
                    <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-accent-amber flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-bg-border flex items-center justify-between text-xs text-text-muted">
          <span>Research date: {guide.researchDate}</span>
          <span>Guide ID: <code className="text-text-muted">{guide.id}</code></span>
        </div>
      </div>
    </div>
  );
}

function guideToMarkdown(guide: Guide): string {
  const lines: string[] = [
    `# ${guide.appName} — OAuth Integration Guide`,
    '',
    `> **Recommended Path:** ${guide.recommendedPath === 'managed' ? 'Managed OAuth (Composio)' : 'Custom OAuth'}`,
    `> **Difficulty:** ${guide.difficulty} | **Hands-on:** ${guide.handsOnHours.min}–${guide.handsOnHours.max}h | **Elapsed:** ${guide.elapsedDays.min}–${guide.elapsedDays.max} days`,
    '',
    '## Summary',
    '',
    guide.summary,
    '',
    '## Path Recommendation',
    '',
    guide.pathJustification,
    '',
  ];

  if (guide.setupChecklist.length > 0) {
    lines.push('## Setup Checklist', '');
    guide.setupChecklist.forEach((item) => {
      lines.push(`### Step ${item.step}: ${item.title}`);
      lines.push('');
      lines.push(`**Type:** ${STEP_TYPE_LABELS[item.type]} | **Time:** ${item.estimatedTime || 'N/A'} | **Agent:** ${item.agentCanDo ? 'Can do' : 'Manual'}`);
      lines.push('');
      lines.push(item.description);
      if (item.officialLink) lines.push('', `📎 [Official Docs](${item.officialLink})`);
      lines.push('');
    });
  }

  if (guide.scopes.length > 0) {
    lines.push('## OAuth Scopes', '');
    lines.push('| Scope | Description | Sensitivity |');
    lines.push('|-------|-------------|-------------|');
    guide.scopes.forEach((s) => lines.push(`| \`${s.scope}\` | ${s.description} | ${s.sensitivity} |`));
    lines.push('');
  }

  if (guide.commonBlockers.length > 0) {
    lines.push('## Common Blockers', '');
    guide.commonBlockers.forEach((b) => {
      lines.push(`### ⚠️ ${b.title}`);
      lines.push('');
      lines.push(b.description);
      lines.push('');
      lines.push(`**Resolution:** ${b.resolution}`);
      lines.push('');
    });
  }

  if (guide.unverifiedClaims.length > 0) {
    lines.push('## Unverified Claims', '');
    guide.unverifiedClaims.forEach((c) => lines.push(`- ⚠️ ${c}`));
    lines.push('');
  }

  if (guide.sources.length > 0) {
    lines.push('## Sources', '');
    guide.sources.forEach((s) => lines.push(`- [${s.title}](${s.url}) — ${s.type} (accessed ${s.accessedAt})`));
  }

  return lines.join('\n');
}
