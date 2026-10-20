'use client';

import { useState } from 'react';
import { Guide, ChecklistItem } from '@/lib/types';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

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
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(null);
  const [authTab, setAuthTab] = useState<'cli' | 'typescript'>('cli');

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
      <div className="h-12 px-6 flex items-center justify-between border-b border-[#2c2c2c] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-medium text-white tracking-tight truncate">
            {guide.appName}
          </h1>
          <span className="text-xs text-[#737373] font-mono">
            {guide.recommendedPath === 'managed' ? 'Managed OAuth' : 'Custom OAuth'}
          </span>
          {guide.appDomain && (
            <a
              href={`https://${guide.appDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#51a2ff] font-mono transition-colors"
            >
              <span>{guide.appDomain}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={copyMarkdown}
            className="h-7 px-2.5 rounded bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#3a3a3a] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedMd ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#a3a3a3]" />
            )}
            <span>Copy as Markdown</span>
          </button>

          <button
            onClick={copyShareLink}
            className="h-7 px-2.5 rounded bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#3a3a3a] text-[#a3a3a3] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copy permanent share link"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-7 space-y-8 max-w-3xl">
        {/* Architecture Recommendation & Summary */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#51a2ff] font-medium">
            Path: {guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth App'}
          </div>
          <p className="text-sm text-[#a3a3a3] leading-relaxed">
            {guide.pathJustification}
          </p>
          <p className="text-sm text-white leading-relaxed pt-1">
            {guide.summary}
          </p>
        </div>

        {/* Effort & Time Breakdown Strip */}
        <div className="py-3 px-4 rounded bg-[#141414] border border-[#2c2c2c] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <div className="text-[#737373] text-[11px] mb-0.5">Hands-on Effort</div>
            <div className="text-white font-medium text-sm">
              {guide.handsOnHours.min}–{guide.handsOnHours.max} hours
            </div>
          </div>
          <div>
            <div className="text-[#737373] text-[11px] mb-0.5">Total Elapsed</div>
            <div className="text-white font-medium text-sm">
              {guide.elapsedDays.min}–{guide.elapsedDays.max} days
            </div>
          </div>
          <div>
            <div className="text-[#737373] text-[11px] mb-0.5">Approval Waiting</div>
            <div className="text-white font-medium text-sm">
              {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'None required'}
            </div>
          </div>
        </div>

        {/* Composio Integration Code Snippet */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-white">Composio integration code</div>
          <div className="rounded-md bg-[#141414] border border-[#2c2c2c] overflow-hidden font-mono text-xs">
            <div className="h-9 px-3.5 flex items-center justify-between border-b border-[#2c2c2c] bg-[#171717]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAuthTab('cli')}
                  className={clsx(
                    'text-xs font-mono transition-colors',
                    authTab === 'cli' ? 'text-white font-medium' : 'text-[#737373] hover:text-[#a3a3a3]'
                  )}
                >
                  CLI
                </button>
                <button
                  onClick={() => setAuthTab('typescript')}
                  className={clsx(
                    'text-xs font-mono transition-colors',
                    authTab === 'typescript' ? 'text-white font-medium' : 'text-[#737373] hover:text-[#a3a3a3]'
                  )}
                >
                  TypeScript SDK
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(authTab === 'cli' ? cliSnippet : tsSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                }}
                className="text-[#737373] hover:text-white"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-3.5 overflow-x-auto text-xs text-[#e0e0e0] leading-relaxed">
              <pre className="whitespace-pre font-mono">{authTab === 'cli' ? cliSnippet : tsSnippet}</pre>
            </div>
          </div>
        </div>

        {/* Setup Checklist */}
        {guide.setupChecklist.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white">Setup checklist</h2>

            <div className="rounded-md border border-[#2c2c2c] bg-[#141414] divide-y divide-[#242424] overflow-hidden">
              {guide.setupChecklist.map((step) => (
                <div key={step.id} className="p-4 space-y-1.5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-[#1e1e1e] border border-[#2c2c2c] text-[#a3a3a3] font-mono text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-medium text-white">{step.title}</h3>
                        {step.estimatedTime && (
                          <span className="text-xs text-[#737373] font-mono flex-shrink-0">
                            {step.estimatedTime}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#a3a3a3] leading-relaxed mt-1">
                        {step.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#737373] pt-2 font-mono">
                        <span>{STEP_TYPE_LABELS[step.type]}</span>
                        <span className="text-[#383838]">·</span>
                        <span>{step.agentCanDo ? 'Agent can prepare' : 'Developer action'}</span>
                        {step.officialLink && (
                          <>
                            <span className="text-[#383838]">·</span>
                            <a
                              href={step.officialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#51a2ff] hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Official docs</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </>
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
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white">OAuth scopes &amp; permissions</h2>

            <div className="rounded-md border border-[#2c2c2c] bg-[#141414] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c2c] bg-[#171717] text-[#737373] font-mono text-[11px]">
                    <th className="py-2.5 px-3.5 font-normal">Scope</th>
                    <th className="py-2.5 px-3.5 font-normal">Description</th>
                    <th className="py-2.5 px-3.5 font-normal">Access Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {guide.scopes.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-white text-xs">
                        <code>{s.scope}</code>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3] text-xs">
                        {s.description}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-xs text-[#737373] capitalize">
                        {s.sensitivity}
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
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white">Potential blockers &amp; resolutions</h2>

            <div className="rounded-md border border-[#2c2c2c] bg-[#141414] divide-y divide-[#222222] overflow-hidden">
              {guide.commonBlockers.map((b, idx) => {
                const isOpen = expandedBlocker === idx;

                return (
                  <div key={idx} className="text-xs">
                    <button
                      onClick={() => setExpandedBlocker(isOpen ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-[#737373] flex-shrink-0" />
                        <span className="font-medium text-white">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#737373] font-mono text-[11px]">
                        <span className="capitalize">{b.severity} priority</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-[#a3a3a3] leading-relaxed">
                        <p>{b.description}</p>
                        <div className="p-2.5 rounded bg-[#1a1a1a] border border-[#2c2c2c] text-white">
                          <span className="text-[#737373] font-mono text-[11px] block mb-0.5">
                            Resolution:
                          </span>
                          {b.resolution}
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
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white">Agent capabilities vs. developer responsibilities</h2>

            <div className="rounded-md border border-[#2c2c2c] bg-[#141414] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c2c] bg-[#171717] text-[#737373] font-mono text-[11px]">
                    <th className="py-2.5 px-3.5 font-normal">Action</th>
                    <th className="py-2.5 px-3.5 font-normal">Automation</th>
                    <th className="py-2.5 px-3.5 font-normal">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {guide.agentCapabilities.map((cap, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-2.5 px-3.5 text-white">{cap.action}</td>
                      <td className="py-2.5 px-3.5 font-mono text-xs">
                        {cap.canDo ? (
                          <span className="text-white">Autonomous</span>
                        ) : (
                          <span className="text-[#737373]">Manual</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#737373]">{cap.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sources & Audit Citations */}
        {guide.sources.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white">Official documentation &amp; policies</h2>

            <div className="space-y-1.5 text-xs">
              {guide.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded bg-[#141414] border border-[#2c2c2c] hover:border-[#3a3a3a] text-white hover:text-[#51a2ff] transition-colors group"
                >
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#737373] group-hover:text-[#51a2ff] flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Caveats */}
        {(guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) && (
          <div className="p-3.5 rounded bg-[#141414] border border-[#2c2c2c] text-xs text-[#737373] space-y-1.5">
            <div className="font-mono text-white text-[11px]">Audit notes &amp; assumptions</div>
            {guide.assumptions.map((a, i) => (
              <div key={i}>• {a}</div>
            ))}
            {guide.unverifiedClaims.map((c, i) => (
              <div key={i} className="text-[#a3a3a3]">• {c}</div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#2c2c2c] flex items-center justify-between text-xs font-mono text-[#737373]">
          <div>Researched: {guide.researchDate}</div>
          <div>ID: {guide.slug}</div>
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