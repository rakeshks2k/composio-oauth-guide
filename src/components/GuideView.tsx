'use client';

import { useState } from 'react';
import { Guide, ChecklistItem } from '@/lib/types';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface GuideViewProps {
  guide: Guide;
}

const STEP_TYPE_LABELS: Record<ChecklistItem['type'], string> = {
  'app-registration': 'App Registration',
  'end-user-auth': 'End User Auth',
  'provider-verification': 'Provider Verification',
  'marketplace-review': 'Marketplace Review',
};

const STEP_TYPE_BADGES: Record<ChecklistItem['type'], { text: string; bg: string; border: string }> = {
  'app-registration': { text: '#51a2ff', bg: '#0d2636', border: '#1a5676' },
  'end-user-auth': { text: '#10b981', bg: '#0b291e', border: '#135e45' },
  'provider-verification': { text: '#f59e0b', bg: '#291d06', border: '#664708' },
  'marketplace-review': { text: '#a855f7', bg: '#260f38', border: '#592285' },
};

function CodeSnippetCard({
  title,
  tabs,
  activeTab,
  onTabChange,
  code,
  language = 'bash',
}: {
  title: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-white tracking-tight">{title}</div>
      <div className="rounded-md bg-[#141414] border border-[#2c2c2c] overflow-hidden font-mono">
        {/* Card Header Bar */}
        <div className="h-9 px-3 flex items-center justify-between border-b border-[#2c2c2c] bg-[#1a1a1a]">
          {tabs && tabs.length > 0 ? (
            <div className="flex items-center gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange?.(tab)}
                  className={clsx(
                    'text-[11px] font-mono transition-colors',
                    activeTab === tab
                      ? 'text-white font-medium'
                      : 'text-[#737373] hover:text-[#a0a0a0]'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-[#737373]">{language}</div>
          )}

          <button
            onClick={copyCode}
            className="text-[#737373] hover:text-white p-1 rounded transition-colors flex items-center gap-1 text-[11px]"
            title="Copy snippet"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-3.5 overflow-x-auto text-xs text-white leading-relaxed">
          <pre className="whitespace-pre">{code}</pre>
        </div>
      </div>
    </div>
  );
}

export function GuideView({ guide }: GuideViewProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(null);
  const [packageTab, setPackageTab] = useState('npm');

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/guides/${guide.slug}`
      : `/guides/${guide.slug}`;

  function copyMarkdown() {
    const md = guideToMarkdown(guide);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // Sample Composio SDK quickstart snippet for this guide
  const sampleInstallCommand =
    packageTab === 'npm'
      ? `npm install @composio/core @composio/vercel ai`
      : packageTab === 'pnpm'
      ? `pnpm add @composio/core @composio/vercel ai`
      : packageTab === 'yarn'
      ? `yarn add @composio/core @composio/vercel ai`
      : `bun add @composio/core @composio/vercel ai`;

  const sampleAgentCode = `import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { streamText } from "ai";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

// Connect to ${guide.appName} (${guide.recommendedPath === 'managed' ? 'Managed OAuth' : 'Custom App'})
const tools = await composio.getTools({
  tools: ["${guide.slug.toUpperCase().replace('-', '_')}_*"],
  entityId: "default_user",
});`;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
      {/* 1. Workspace Header Bar matching Composio screenshot */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-[#2c2c2c] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold text-white tracking-tight truncate">
            {guide.appName}
          </span>
          <span
            className={clsx(
              'text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider',
              guide.recommendedPath === 'managed'
                ? 'bg-[#0d2636] border-[#1a5676] text-[#51a2ff]'
                : 'bg-[#291d06] border-[#664708] text-[#f59e0b]'
            )}
          >
            {guide.recommendedPath === 'managed' ? 'Managed OAuth' : 'Custom OAuth'}
          </span>
          {guide.composioManaged && (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-[#737373]">
              Toolkit Supported
            </span>
          )}
        </div>

        {/* Action Buttons matching Composio screenshot */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={copyMarkdown}
            className="h-8 px-3 rounded-md bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedMd ? (
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#a0a0a0]" />
            )}
            <span>Copy as Markdown</span>
          </button>

          <button
            onClick={copyShareLink}
            className="h-8 px-3 rounded-md bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#383838] text-[#a0a0a0] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copy shareable guide link"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-7 max-w-4xl">
        {/* Recommendation & Overview Card */}
        <div className="p-4 rounded-md bg-[#141414] border border-[#2c2c2c] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#51a2ff]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#51a2ff]">
                Recommended Architecture: {guide.recommendedPath.toUpperCase()}
              </span>
            </div>
            {guide.appDomain && (
              <a
                href={`https://${guide.appDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#737373] hover:text-[#51a2ff] flex items-center gap-1 transition-colors"
              >
                <span>{guide.appDomain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-[#a0a0a0] leading-relaxed">
            {guide.pathJustification}
          </p>
          <div className="pt-2 text-xs text-white leading-relaxed border-t border-[#222222]">
            {guide.summary}
          </div>
        </div>

        {/* 3-Metric Stats (Hands-on, Elapsed, Approval wait) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 rounded-md bg-[#141414] border border-[#2c2c2c]">
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#51a2ff]" />
              <span>Hands-on Effort</span>
            </div>
            <div className="text-lg font-bold text-white">
              {guide.handsOnHours.min}–{guide.handsOnHours.max}h
            </div>
            <div className="text-[10px] text-[#737373] mt-0.5">Active engineering setup</div>
          </div>

          <div className="p-3.5 rounded-md bg-[#141414] border border-[#2c2c2c]">
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#f59e0b]" />
              <span>Total Elapsed</span>
            </div>
            <div className="text-lg font-bold text-white">
              {guide.elapsedDays.min}–{guide.elapsedDays.max}d
            </div>
            <div className="text-[10px] text-[#737373] mt-0.5">Start to production readiness</div>
          </div>

          <div className="p-3.5 rounded-md bg-[#141414] border border-[#2c2c2c]">
            <div className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#10b981]" />
              <span>Approval Wait</span>
            </div>
            <div className="text-lg font-bold text-white">
              {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max}d` : 'None'}
            </div>
            <div className="text-[10px] text-[#737373] mt-0.5">External provider audit</div>
          </div>
        </div>

        {/* Code Snippets matching Composio screenshot */}
        <CodeSnippetCard
          title="Install Composio toolkits"
          tabs={['npm', 'pnpm', 'yarn', 'bun']}
          activeTab={packageTab}
          onTabChange={setPackageTab}
          code={sampleInstallCommand}
        />

        <CodeSnippetCard
          title="Connect agent with Composio"
          tabs={['agent.ts']}
          code={sampleAgentCode}
          language="typescript"
        />

        {/* Setup Checklist matching screenshot's step numbers */}
        {guide.setupChecklist.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white tracking-tight uppercase tracking-wider font-mono">
              Setup Checklist
            </div>

            <div className="space-y-2.5">
              {guide.setupChecklist.map((step) => {
                const badge = STEP_TYPE_BADGES[step.type];

                return (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-md bg-[#141414] border border-[#2c2c2c] hover:border-[#383838] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Dark square step number badge matching screenshot step 4 */}
                      <div className="w-6 h-6 rounded bg-[#1e1e1e] border border-[#2c2c2c] text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.step}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-semibold text-white">
                            {step.title}
                          </span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider"
                            style={{
                              color: badge.text,
                              backgroundColor: badge.bg,
                              borderColor: badge.border,
                            }}
                          >
                            {STEP_TYPE_LABELS[step.type]}
                          </span>
                          {step.estimatedTime && (
                            <span className="text-[10px] text-[#737373] font-mono">
                              ({step.estimatedTime})
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#a0a0a0] leading-relaxed mb-2">
                          {step.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1e1e1e]">
                          <div>
                            {step.agentCanDo ? (
                              <span className="text-[#10b981] flex items-center gap-1 font-mono text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Agent can prepare
                              </span>
                            ) : (
                              <span className="text-[#737373] flex items-center gap-1 font-mono text-[10px]">
                                <XCircle className="w-3 h-3" /> Manual developer action
                              </span>
                            )}
                          </div>

                          {step.officialLink && (
                            <a
                              href={step.officialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#51a2ff] hover:underline flex items-center gap-1 font-mono text-[10px]"
                            >
                              <span>Official Docs</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OAuth Scopes Table */}
        {guide.scopes.length > 0 && (
          <div className="space-y-3 font-mono">
            <div className="text-xs font-semibold text-white tracking-tight uppercase tracking-wider">
              Scopes &amp; Sensitivity Tiers
            </div>

            <div className="rounded-md border border-[#2c2c2c] overflow-hidden bg-[#141414]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c2c] bg-[#1a1a1a] text-[#737373] text-[10px] uppercase">
                    <th className="py-2 px-3 font-semibold">Scope Identifier</th>
                    <th className="py-2 px-3 font-semibold">Purpose</th>
                    <th className="py-2 px-3 font-semibold">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {guide.scopes.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#51a2ff] text-[11px]">
                        <code>{s.scope}</code>
                      </td>
                      <td className="py-2.5 px-3 text-[#a0a0a0] text-xs font-sans">
                        {s.description}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={clsx(
                            'text-[9px] px-1.5 py-0.5 rounded border uppercase',
                            s.sensitivity === 'basic' &&
                              'text-[#10b981] bg-[#0b291e] border-[#135e45]',
                            s.sensitivity === 'sensitive' &&
                              'text-[#f59e0b] bg-[#291d06] border-[#664708]',
                            s.sensitivity === 'restricted' &&
                              'text-[#ef4444] bg-[#290d0d] border-[#5e1919]'
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

        {/* Common Blockers Accordion */}
        {guide.commonBlockers.length > 0 && (
          <div className="space-y-3 font-mono">
            <div className="text-xs font-semibold text-white tracking-tight uppercase tracking-wider">
              Common Blockers &amp; Mitigations
            </div>

            <div className="space-y-2">
              {guide.commonBlockers.map((b, idx) => {
                const isOpen = expandedBlocker === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-md bg-[#141414] border border-[#2c2c2c] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedBlocker(isOpen ? null : idx)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={clsx(
                            'w-3.5 h-3.5 flex-shrink-0',
                            b.severity === 'high'
                              ? 'text-[#ef4444]'
                              : b.severity === 'medium'
                              ? 'text-[#f59e0b]'
                              : 'text-[#51a2ff]'
                          )}
                        />
                        <span className="text-xs font-medium text-white font-sans">
                          {b.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase text-[#737373]">
                          {b.severity}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#737373]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 pt-0 border-t border-[#1e1e1e] space-y-2 text-xs font-sans">
                        <p className="text-[#a0a0a0] leading-relaxed">{b.description}</p>
                        <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#2c2c2c]">
                          <div className="text-[10px] font-mono text-[#51a2ff] uppercase mb-0.5">
                            Resolution
                          </div>
                          <div className="text-white text-xs leading-relaxed">
                            {b.resolution}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Capabilities Matrix */}
        {guide.agentCapabilities.length > 0 && (
          <div className="space-y-3 font-mono">
            <div className="text-xs font-semibold text-white tracking-tight uppercase tracking-wider">
              Agent Automation Matrix
            </div>

            <div className="rounded-md border border-[#2c2c2c] overflow-hidden bg-[#141414]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c2c] bg-[#1a1a1a] text-[#737373] text-[10px] uppercase">
                    <th className="py-2 px-3 font-semibold">Action</th>
                    <th className="py-2 px-3 font-semibold">Autonomous</th>
                    <th className="py-2 px-3 font-semibold">Operational Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {guide.agentCapabilities.map((cap, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="py-2.5 px-3 text-white font-sans text-xs">
                        {cap.action}
                      </td>
                      <td className="py-2.5 px-3">
                        {cap.canDo ? (
                          <span className="text-[#10b981] flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-[#737373] text-[11px]">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#737373] text-xs font-sans">
                        {cap.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Caveats: Assumptions & Unverified Claims */}
        {(guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) && (
          <div className="p-3.5 rounded-md bg-[#141414] border border-[#2c2c2c] space-y-2 text-xs font-mono">
            <div className="text-[#f59e0b] font-semibold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Assumptions &amp; Unverified Claims</span>
            </div>
            {guide.assumptions.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-[#a0a0a0] font-sans">
                {guide.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
            {guide.unverifiedClaims.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-[#ef4444] font-sans">
                {guide.unverifiedClaims.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Footer Audit Info */}
        <div className="pt-4 border-t border-[#2c2c2c] flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <div>Research date: {guide.researchDate}</div>
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
    `> **Effort:** ${guide.handsOnHours.min}–${guide.handsOnHours.max}h hands-on | **Total Calendar:** ${guide.elapsedDays.min}–${guide.elapsedDays.max} days | **Approval Wait:** ${guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'None'}`,
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
      lines.push(`- **Type:** ${STEP_TYPE_LABELS[step.type]}`);
      lines.push(`- **Estimated Time:** ${step.estimatedTime || 'N/A'}`);
      lines.push(`- **Automation:** ${step.agentCanDo ? 'Agent can prepare' : 'Manual developer action'}`);
      lines.push(`- **Details:** ${step.description}`);
      if (step.officialLink) lines.push(`- **Docs:** ${step.officialLink}`);
      lines.push('');
    });
  }

  if (guide.scopes.length > 0) {
    lines.push('## Scopes', '');
    lines.push('| Scope | Purpose | Sensitivity |');
    lines.push('|---|---|---|');
    guide.scopes.forEach((s) => {
      lines.push(`| \`${s.scope}\` | ${s.description} | ${s.sensitivity} |`);
    });
    lines.push('');
  }

  if (guide.commonBlockers.length > 0) {
    lines.push('## Common Blockers', '');
    guide.commonBlockers.forEach((b) => {
      lines.push(`### ⚠️ ${b.title} (${b.severity.toUpperCase()})`);
      lines.push(b.description);
      lines.push(`**Resolution:** ${b.resolution}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}