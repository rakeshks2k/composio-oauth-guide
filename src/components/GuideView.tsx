'use client';

import { useState } from 'react';
import { Guide, ChecklistItem } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { CodeEditorBlock } from './CodeEditorBlock';

interface GuideViewProps {
  guide: Guide;
}

const STEP_TYPE_LABELS: Record<ChecklistItem['type'], string> = {
  'app-registration': 'App Registration',
  'end-user-auth': 'End-User Auth',
  'provider-verification': 'Provider Verification',
  'marketplace-review': 'Marketplace Review',
};

export function GuideView({ guide }: GuideViewProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(0);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/guides/${guide.slug}`
      : `/guides/${guide.slug}`;

  function copyMarkdown() {
    const md = guideToMarkdown(guide);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1800);
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  }

  // Real, working Composio OAuth commands tailored to this specific guide
  const cliSnippet =
    guide.recommendedPath === 'managed'
      ? `# Connect with Composio Managed OAuth (no custom client ID or secret needed)
composio add ${guide.slug}`
      : `# Add your custom OAuth credentials for ${guide.appName}
composio auth add-config ${guide.slug} \\
  --client-id "<YOUR_CLIENT_ID>" \\
  --client-secret "<YOUR_CLIENT_SECRET>"`;

  const tsSnippet =
    guide.recommendedPath === 'managed'
      ? `import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Initiate OAuth flow using Composio Managed App
const connection = await composio.connectedAccounts.initiate({
  appName: "${guide.slug}",
  redirectUrl: "https://your-domain.com/api/oauth/callback",
});

console.log("Redirect user to:", connection.redirectUrl);`
      : `import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Register custom OAuth client credentials
await composio.authConfigs.create({
  appName: "${guide.slug}",
  authScheme: "OAUTH2",
  credentials: {
    clientId: process.env.${guide.slug.toUpperCase().replace('-', '_')}_CLIENT_ID,
    clientSecret: process.env.${guide.slug.toUpperCase().replace('-', '_')}_CLIENT_SECRET,
  },
});`;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-6 sm:px-10 flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <AppIcon name={guide.appName} size="sm" />
            <h1 className="text-[14px] sm:text-[15px] font-medium text-white tracking-[-0.01em] truncate">
              {guide.appName}
            </h1>
          </div>

          <span
            className={clsx(
              'text-[11px] font-mono px-2 py-0.5 rounded border font-medium',
              guide.recommendedPath === 'managed'
                ? 'bg-[#161616] border-[#2c2c2c] text-[#51a2ff]'
                : 'bg-[#161616] border-[#2c2c2c] text-[#a1a1a1]'
            )}
          >
            {guide.recommendedPath === 'managed' ? 'Managed OAuth' : 'Custom OAuth'}
          </span>

          {guide.appDomain && (
            <a
              href={`https://${guide.appDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-white font-mono transition-colors"
            >
              <span>{guide.appDomain}</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#555555]" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={copyMarkdown}
            className="h-7 px-2.5 rounded bg-[#161616] border border-[#262626] hover:border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedMd ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#737373]" />
            )}
            <span>Copy as Markdown</span>
          </button>

          <button
            onClick={copyShareLink}
            className="h-7 px-2.5 rounded bg-[#161616] border border-[#262626] hover:border-[#383838] text-[#a1a1a1] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copy permanent share link"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-[#737373]" />
            )}
            <span className="hidden sm:inline">Share link</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-9 space-y-9 max-w-4xl mx-auto w-full">
        {/* Architecture Recommendation & Summary */}
        <div className="p-6 sm:p-7 rounded-md bg-[#141414] border border-[#262626] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] font-mono font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#51a2ff]">PATH:</span>
              <span>{guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth App'}</span>
            </div>
            <div className="text-[11px] font-mono text-[#737373] bg-[#181818] border border-[#262626] px-2 py-0.5 rounded capitalize">
              Difficulty: {guide.difficulty.replace('-', ' ')}
            </div>
          </div>

          <p className="text-[13.5px] text-[#a1a1a1] leading-[1.75]">
            {guide.pathJustification}
          </p>

          <div className="pt-4 border-t border-[#202020]">
            <p className="text-[13.5px] text-[#e0e0e0] leading-[1.75]">
              {guide.summary}
            </p>
          </div>
        </div>

        {/* Effort & Time Breakdown Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-md bg-[#141414] border border-[#262626]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1.5">
              Hands-on Effort
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-1">
              {guide.handsOnHours.min}–{guide.handsOnHours.max} hours
            </div>
            <div className="text-[#666666] text-[12px] mt-1">
              Direct engineering setup
            </div>
          </div>

          <div className="p-5 rounded-md bg-[#141414] border border-[#262626]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1.5">
              Calendar Elapsed
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-1">
              {guide.elapsedDays.min}–{guide.elapsedDays.max} days
            </div>
            <div className="text-[#666666] text-[12px] mt-1">
              Kickoff to production live
            </div>
          </div>

          <div className="p-5 rounded-md bg-[#141414] border border-[#262626]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1.5">
              External Approval
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-1">
              {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'Immediate (0d)'}
            </div>
            <div className="text-[#666666] text-[12px] mt-1">
              {guide.approvalDays ? 'Provider review queue' : 'No review required'}
            </div>
          </div>
        </div>

        {/* Composio Integration Code Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
              Composio Integration Code
            </h2>
            <span className="text-[11px] font-mono text-[#555555]">Production-ready</span>
          </div>

          <CodeEditorBlock
            cliCode={cliSnippet}
            tsCode={tsSnippet}
            appName={guide.appName}
          />
        </div>

        {/* Setup Checklist */}
        {guide.setupChecklist.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                Ordered Setup Checklist
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.setupChecklist.length} steps
              </span>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] divide-y divide-[#1f1f1f] overflow-hidden">
              {guide.setupChecklist.map((step) => (
                <div key={step.id} className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#262626] text-[#737373] font-mono text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <h3 className="text-[14px] font-medium text-white tracking-normal">
                          {step.title}
                        </h3>
                        {step.estimatedTime && (
                          <span className="text-[11px] text-[#737373] font-mono flex-shrink-0">
                            ~{step.estimatedTime}
                          </span>
                        )}
                      </div>

                      <p className="text-[13.5px] text-[#a1a1a1] leading-[1.7] mt-2">
                        {step.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-3 text-[11px] text-[#737373] pt-3 font-mono border-t border-[#1a1a1a] mt-3">
                        <span className="px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#262626] text-[#8c8c8c]">
                          {STEP_TYPE_LABELS[step.type]}
                        </span>

                        <span className="text-[#8c8c8c]">
                          {step.agentCanDo ? 'Agent can prepare' : 'Developer action'}
                        </span>

                        {step.officialLink && (
                          <a
                            href={step.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#51a2ff] hover:underline inline-flex items-center gap-1 ml-auto"
                          >
                            <span>Official Docs</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scopes Table */}
        {guide.scopes.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                OAuth Scopes &amp; Permissions
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.scopes.length} scopes
              </span>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#161616] text-[#737373] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5 font-normal">Scope</th>
                    <th className="py-3 px-5 font-normal">Description</th>
                    <th className="py-3 px-5 font-normal">Access Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {guide.scopes.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#181818] transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs whitespace-nowrap">
                        <code className="bg-[#1a1a1a] border border-[#262626] text-white px-2 py-0.5 rounded">
                          {s.scope}
                        </code>
                      </td>
                      <td className="py-3.5 px-5 text-[#a1a1a1] text-[13px] leading-[1.65]">
                        {s.description}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] whitespace-nowrap">
                        <span
                          className={clsx(
                            'capitalize',
                            s.sensitivity === 'restricted'
                              ? 'text-white px-1.5 py-0.5 rounded bg-[#202020] border border-[#2c2c2c]'
                              : 'text-[#737373]'
                          )}
                        >
                          {s.sensitivity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Common Blockers */}
        {guide.commonBlockers.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                Potential Blockers &amp; Resolutions
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.commonBlockers.length} identified
              </span>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] divide-y divide-[#1f1f1f] overflow-hidden">
              {guide.commonBlockers.map((b, idx) => {
                const isOpen = expandedBlocker === idx;

                return (
                  <div key={idx} className="text-xs">
                    <button
                      onClick={() => setExpandedBlocker(isOpen ? null : idx)}
                      className="w-full p-4.5 sm:p-5 flex items-center justify-between text-left hover:bg-[#181818] transition-colors"
                    >
                      <span className="font-medium text-white text-[14px] truncate pr-3">
                        {b.title}
                      </span>

                      <div className="flex items-center gap-3 text-[#737373] font-mono text-[11px] flex-shrink-0">
                        <span className="capitalize">{b.severity} priority</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#a1a1a1]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#555555]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 space-y-3.5 text-[#a1a1a1] leading-[1.7] text-[13px] border-t border-[#1c1c1c]">
                        <p>{b.description}</p>
                        <div className="p-3.5 rounded bg-[#181818] border border-[#262626] text-white">
                          <span className="text-[#737373] font-mono text-[11px] uppercase tracking-wider block mb-1">
                            Resolution:
                          </span>
                          <span className="text-[#e0e0e0] leading-[1.65]">
                            {b.resolution}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Automation Matrix */}
        {guide.agentCapabilities.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                Agent Automation vs. Developer Responsibilities
              </h2>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#161616] text-[#737373] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5 font-normal">Action</th>
                    <th className="py-3 px-5 font-normal">Automation Tier</th>
                    <th className="py-3 px-5 font-normal">Implementation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {guide.agentCapabilities.map((cap, idx) => (
                    <tr key={idx} className="hover:bg-[#181818] transition-colors">
                      <td className="py-3.5 px-5 text-white text-[13.5px] font-medium">
                        {cap.action}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs whitespace-nowrap">
                        {cap.canDo ? (
                          <span className="text-white">Autonomous</span>
                        ) : (
                          <span className="text-[#737373]">Manual</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-[#737373] text-[13px] leading-[1.65]">
                        {cap.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sources & Audit Citations */}
        {guide.sources.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                Official Documentation &amp; Policies
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.sources.length} sources
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {guide.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded bg-[#141414] border border-[#262626] hover:border-[#383838] text-white hover:text-[#51a2ff] transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-medium text-[13px]">{src.title}</div>
                    <div className="text-[11px] font-mono text-[#737373] truncate mt-1">
                      {src.type} · {src.accessedAt}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#555555] group-hover:text-[#51a2ff] flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Caveats & Audit Notes */}
        {(guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) && (
          <div className="p-5 rounded-md bg-[#141414] border border-[#262626] text-xs text-[#737373] space-y-2">
            <div className="font-mono text-white text-[11px] uppercase tracking-wider mb-2">
              Audit Notes &amp; Assumptions
            </div>
            {guide.assumptions.map((a, i) => (
              <div key={i} className="leading-[1.7]">• {a}</div>
            ))}
            {guide.unverifiedClaims.map((c, i) => (
              <div key={i} className="text-[#a1a1a1] leading-[1.7]">• {c}</div>
            ))}
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-5 border-t border-[#262626] flex items-center justify-between text-xs font-mono text-[#666666]">
          <div>Researched: {guide.researchDate}</div>
          <div>Slug: {guide.slug}</div>
        </div>
      </div>
    </div>
  );
}

function guideToMarkdown(guide: Guide): string {
  const lines: string[] = [
    `# ${guide.appName} — OAuth Integration Guide for Composio`,
    '',
    `> **Recommended Path:** ${guide.recommendedPath.toUpperCase()}`,
    `> **Effort:** ${guide.handsOnHours.min}–${guide.handsOnHours.max}h hands-on | **Total Calendar:** ${guide.elapsedDays.min}–${guide.elapsedDays.max} days | **Approval Wait:** ${guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'None required'}`,
    '',
    '## Overview',
    guide.summary,
    '',
    '## Architecture Recommendation',
    guide.pathJustification,
    '',
  ];

  if (guide.setupChecklist.length > 0) {
    lines.push('## Setup Checklist', '');
    guide.setupChecklist.forEach((step) => {
      lines.push(`### Step ${step.step}: ${step.title}`);
      lines.push(`- Type: ${STEP_TYPE_LABELS[step.type]}`);
      lines.push(`- Estimated Time: ${step.estimatedTime || 'N/A'}`);
      lines.push(`- Automation: ${step.agentCanDo ? 'Agent can prepare' : 'Developer action'}`);
      lines.push(`- Details: ${step.description}`);
      if (step.officialLink) lines.push(`- Official Docs: ${step.officialLink}`);
      lines.push('');
    });
  }

  if (guide.scopes.length > 0) {
    lines.push('## Scopes', '');
    lines.push('| Scope | Description | Access Tier |');
    lines.push('|---|---|---|');
    guide.scopes.forEach((s) => {
      lines.push(`| \`${s.scope}\` | ${s.description} | ${s.sensitivity} |`);
    });
    lines.push('');
  }

  if (guide.commonBlockers.length > 0) {
    lines.push('## Potential Blockers', '');
    guide.commonBlockers.forEach((b) => {
      lines.push(`### ⚠️ ${b.title} (${b.severity.toUpperCase()})`);
      lines.push(b.description);
      lines.push(`**Resolution:** ${b.resolution}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}
