'use client';

import { useState } from 'react';
import { Guide, ChecklistItem } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  ExternalLink,
  Copy,
  Check,
  Share2,
  Clock,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeEditorBlock } from './CodeEditorBlock';

interface GuideViewProps {
  guide: Guide;
}

const STEP_TYPE_LABELS: Record<ChecklistItem['type'], string> = {
  'app-registration': 'App Registration',
  'end-user-auth': 'End-User Auth',
  'provider-verification': 'Verification',
  'marketplace-review': 'Marketplace',
};

export function GuideView({ guide }: GuideViewProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(0);

  const COMPOSIO_REDIRECT_URI = 'https://backend.composio.dev/api/v1/auth-apps/add';

  function copyRedirectUri() {
    navigator.clipboard.writeText(COMPOSIO_REDIRECT_URI);
    setCopiedRedirectUri(true);
    setTimeout(() => setCopiedRedirectUri(false), 1800);
  }

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
    clientId: process.env.${guide.slug.toUpperCase().replace(/-/g, '_')}_CLIENT_ID,
    clientSecret: process.env.${guide.slug.toUpperCase().replace(/-/g, '_')}_CLIENT_SECRET,
  },
});`;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-6 sm:px-10 flex items-center justify-between border-b border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <AppIcon name={guide.appName} size="sm" />
            <h1 className="text-[14px] font-medium text-white tracking-[-0.01em] truncate">
              {guide.appName}
            </h1>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#262626] bg-[#141414] text-[#a1a1a1]">
            {guide.recommendedPath === 'managed' ? 'Managed OAuth' : 'Custom OAuth'}
          </span>

          {guide.appDomain && (
            <a
              href={`https://${guide.appDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#ededed] font-mono transition-colors"
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
            className="h-7 px-2.5 rounded bg-[#141414] border border-[#242424] hover:border-[#383838] text-[#cccccc] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#737373]" />
                <span className="hidden sm:inline">Copy Markdown</span>
                <span className="sm:hidden">MD</span>
              </>
            )}
          </button>

          <button
            onClick={copyShareLink}
            className="h-7 px-2.5 rounded bg-[#141414] border border-[#242424] hover:border-[#383838] text-[#cccccc] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy permanent share link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#737373]" />
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 pt-6 pb-16 space-y-7 max-w-4xl mx-auto w-full">
        {/* Quick Actions Strip: Callback URI & Console Link */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-md bg-[#121212] border border-[#222222]">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#737373] font-mono text-[11px]">
              Composio Redirect URI:
            </span>
            <code className="px-2 py-0.5 rounded bg-[#161616] border border-[#262626] text-[#ededed] font-mono text-[11.5px]">
              {COMPOSIO_REDIRECT_URI}
            </code>
            <button
              onClick={copyRedirectUri}
              className="h-6 px-2 rounded bg-[#1a1a1a] border border-[#262626] hover:border-[#383838] text-[#ededed] text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedRedirectUri ? (
                <>
                  <Check className="w-3 h-3 text-white" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#737373]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {(guide.setupChecklist[0]?.officialLink || guide.appDomain) && (
            <a
              href={guide.setupChecklist[0]?.officialLink || `https://${guide.appDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 px-2.5 rounded bg-[#1a1a1a] border border-[#262626] hover:border-[#383838] text-[#a0a0a0] hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors"
            >
              <span>Developer Console</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#666666]" />
            </a>
          )}
        </div>

        {/* Architecture Recommendation & Summary */}
        <div className="p-5 sm:p-6 rounded-lg bg-[#121212] border border-[#222222] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-medium text-[13.5px]">Recommended Architecture:</span>
              <span className="text-[11px] font-mono text-[#a1a1a1] bg-[#1a1a1a] border border-[#282828] px-2 py-0.5 rounded">
                {guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth Application'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#737373] bg-[#161616] border border-[#242424] px-2 py-0.5 rounded capitalize">
              Difficulty: {guide.difficulty.replace('-', ' ')}
            </span>
          </div>

          <p className="text-[13.5px] text-[#a1a1a1] leading-[1.7]">
            {guide.pathJustification}
          </p>

          <div className="pt-3.5 border-t border-[#1a1a1a]">
            <p className="text-[13.5px] text-[#d4d4d4] leading-[1.7]">
              {guide.summary}
            </p>
          </div>
        </div>

        {/* Effort & Time Breakdown Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-[#121212] border border-[#222222]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1">
              Hands-on effort
            </div>
            <div className="text-white font-mono font-medium text-lg my-0.5">
              {guide.handsOnHours.min}–{guide.handsOnHours.max} hours
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              Active engineering setup
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#121212] border border-[#222222]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1">
              Calendar elapsed
            </div>
            <div className="text-white font-mono font-medium text-lg my-0.5">
              {guide.elapsedDays.min}–{guide.elapsedDays.max} days
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              Kickoff to production live
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#121212] border border-[#222222]">
            <div className="text-[#737373] text-[11px] font-mono uppercase tracking-wider mb-1">
              External approval
            </div>
            <div className="text-white font-mono font-medium text-lg my-0.5">
              {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'Immediate (0d)'}
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              {guide.approvalDays ? 'Third-party review queue' : 'Immediate — no review required'}
            </div>
          </div>
        </div>

        {/* Composio Integration Code Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-medium text-white">
              Integration Code
            </h2>
            <span className="text-[11px] font-mono text-[#666666]">Composio SDK &amp; CLI</span>
          </div>

          <CodeEditorBlock
            cliCode={cliSnippet}
            tsCode={tsSnippet}
            appName={guide.appName}
          />
        </div>

        {/* Step-by-Step Implementation Checklist */}
        {guide.setupChecklist.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                Implementation Checklist
              </h2>
              <span className="text-[11px] font-mono text-[#666666]">
                {guide.setupChecklist.length} steps
              </span>
            </div>

            <div className="rounded-lg border border-[#222222] bg-[#121212] divide-y divide-[#1c1c1c] overflow-hidden">
              {guide.setupChecklist.map((step) => (
                <div
                  key={step.id}
                  className="p-5 sm:p-5.5 space-y-3 bg-[#121212]"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Step Number Badge */}
                    <div className="w-5 h-5 rounded bg-[#181818] border border-[#262626] text-[#a0a0a0] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[10.5px]">
                      {step.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <h3 className="text-[13.5px] font-medium text-white">
                          {step.title}
                        </h3>
                        {step.estimatedTime && (
                          <span className="text-[11px] text-[#737373] font-mono flex-shrink-0">
                            ~{step.estimatedTime}
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-[#a1a1a1] leading-[1.65] mt-1.5">
                        {step.description}
                      </p>

                      {step.completionCriteria && (
                        <div className="flex items-start gap-2 mt-2.5 p-2.5 rounded bg-[#161616] border border-[#202020]">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#666666]" />
                          <span className="text-[12px] text-[#a1a1a1] leading-[1.5]">
                            <span className="text-[#666666] font-mono text-[10.5px] mr-1.5">Criteria:</span>
                            {step.completionCriteria}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center flex-wrap justify-between gap-3 text-[11px] pt-2.5 font-mono border-t border-[#1a1a1a] mt-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#242424] text-[#888888]">
                            {STEP_TYPE_LABELS[step.type]}
                          </span>

                          {step.agentCanDo && (
                            <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#262626] text-[#a1a1a1]">
                              Agent automated
                            </span>
                          )}
                        </div>

                        {step.officialLink && (
                          <a
                            href={step.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#a1a1a1] hover:text-white hover:underline inline-flex items-center gap-1 ml-auto"
                          >
                            <span>Official docs</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#666666]" />
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

        {/* OAuth Scopes Table */}
        {guide.scopes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                OAuth Scopes &amp; Sensitivity
              </h2>
              <span className="text-[11px] font-mono text-[#666666]">
                {guide.scopes.length} scopes
              </span>
            </div>

            <div className="rounded-lg border border-[#222222] bg-[#121212] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] bg-[#141414] text-[#737373] font-mono text-[11px]">
                    <th className="py-2.5 px-4 font-normal">Scope</th>
                    <th className="py-2.5 px-4 font-normal">Description &amp; Purpose</th>
                    <th className="py-2.5 px-4 font-normal">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  {guide.scopes.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                        <code className="bg-[#181818] border border-[#242424] text-[#ededed] px-1.5 py-0.5 rounded text-[11.5px]">
                          {s.scope}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-[#a1a1a1] text-[12.5px] leading-[1.6]">
                        {s.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        <span
                          className={clsx(
                            'capitalize px-1.5 py-0.5 rounded',
                            s.sensitivity === 'restricted'
                              ? 'text-[#f87171] bg-[#221515] border border-[#3b1c1c]'
                              : s.sensitivity === 'sensitive'
                              ? 'text-[#fbbf24] bg-[#221c12] border border-[#3d2e16]'
                              : 'text-[#888888] bg-[#161616] border border-[#222222]'
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

        {/* Vendor Verification & Review Requirements */}
        {guide.approvalRequirements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                Vendor Verification &amp; Review
              </h2>
              <span className="text-[11px] font-mono text-[#666666]">
                {guide.approvalRequirements.length} {guide.approvalRequirements.length === 1 ? 'requirement' : 'requirements'}
              </span>
            </div>

            <div className="rounded-lg border border-[#222222] bg-[#121212] divide-y divide-[#1c1c1c] overflow-hidden">
              {guide.approvalRequirements.map((req, idx) => (
                <div key={idx} className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-medium text-white leading-tight">{req.name}</span>
                      <span
                        className={clsx(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0',
                          req.required
                            ? 'text-white bg-[#1a1a1a] border-[#2c2c2c]'
                            : 'text-[#737373] bg-[#141414] border-[#222222]'
                        )}
                      >
                        {req.required ? 'Mandatory' : 'Optional / Tiered'}
                      </span>
                    </div>
                    {req.estimatedTime && (
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#737373] flex-shrink-0">
                        <Clock className="w-3 h-3 text-[#555555]" />
                        {req.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#a1a1a1] leading-[1.65]">{req.description}</p>
                  {req.link && (
                    <a
                      href={req.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#a1a1a1] hover:text-white hover:underline inline-flex items-center gap-1 font-mono pt-1"
                    >
                      <span>Official review requirements</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#666666]" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Blockers */}
        {guide.commonBlockers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                Potential Friction Points &amp; Workarounds
              </h2>
              <span className="text-[11px] font-mono text-[#666666]">
                {guide.commonBlockers.length} identified
              </span>
            </div>

            <div className="rounded-lg border border-[#222222] bg-[#121212] divide-y divide-[#1c1c1c] overflow-hidden">
              {guide.commonBlockers.map((b, idx) => {
                const isOpen = expandedBlocker === idx;

                return (
                  <div key={idx} className="text-xs">
                    <button
                      onClick={() => setExpandedBlocker(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161616] transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-white text-[13.5px] truncate pr-3">
                        {b.title}
                      </span>

                      <div className="flex items-center gap-3 text-[#737373] font-mono text-[11px] flex-shrink-0">
                        <span className="capitalize">{b.severity} priority</span>
                        <ChevronDown
                          className={clsx(
                            'w-3.5 h-3.5 transition-transform duration-150',
                            isOpen ? 'transform rotate-180 text-white' : 'text-[#666666]'
                          )}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3 text-[#a1a1a1] leading-[1.65] text-[13px] border-t border-[#1a1a1a]">
                            <p>{b.description}</p>
                            <div className="p-3 rounded bg-[#161616] border border-[#222222] text-[#ededed]">
                              <span className="text-[#737373] font-mono text-[10.5px] uppercase tracking-wider block mb-1">
                                Resolution
                              </span>
                              <span className="text-[#cccccc] text-[12.5px] leading-[1.6]">
                                {b.resolution}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Automation Matrix */}
        {guide.agentCapabilities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                Agent Automation Boundaries
              </h2>
            </div>

            <div className="rounded-lg border border-[#222222] bg-[#121212] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] bg-[#141414] text-[#737373] font-mono text-[11px]">
                    <th className="py-2.5 px-4 font-normal">Integration Task</th>
                    <th className="py-2.5 px-4 font-normal">Responsibility</th>
                    <th className="py-2.5 px-4 font-normal">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  {guide.agentCapabilities.map((cap, idx) => (
                    <tr key={idx} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3 px-4 text-white text-[13px] font-medium">
                        {cap.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                        {cap.canDo ? (
                          <span className="text-white font-medium">Agent autonomous</span>
                        ) : (
                          <span className="text-[#888888]">Developer action</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#888888] text-[12.5px] leading-[1.6]">
                        {cap.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sources & Citations */}
        {guide.sources.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white">
                Documentation &amp; Citations
              </h2>
              <span className="text-[11px] font-mono text-[#666666]">
                {guide.sources.length} sources
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {guide.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#222222] hover:border-[#333333] hover:bg-[#161616] text-[#ededed] hover:text-white transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-medium text-[12.5px]">{src.title}</div>
                    <div className="text-[11px] font-mono text-[#666666] truncate mt-0.5">
                      {src.type} · {src.accessedAt}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#555555] group-hover:text-white flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Caveats & Audit Notes */}
        {(guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) && (
          <div className="p-4 rounded-lg bg-[#121212] border border-[#222222] text-xs text-[#888888] space-y-1.5 font-mono">
            <div className="text-white text-[11px] font-medium mb-1">
              Audit Notes &amp; Verification Boundaries
            </div>
            {guide.assumptions.map((a, i) => (
              <div key={i} className="leading-[1.6] text-[11px]">• {a}</div>
            ))}
            {guide.unverifiedClaims.map((c, i) => (
              <div key={i} className="text-[#a1a1a1] leading-[1.6] text-[11px]">• Unverified claim: {c}</div>
            ))}
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-between text-xs font-mono text-[#555555]">
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
    `> **Recommended Path:** ${guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth App'}  `,
    `> **Difficulty:** ${guide.difficulty.replace('-', ' ')}  `,
    `> **Hands-on Effort:** ${guide.handsOnHours.min}–${guide.handsOnHours.max}h  `,
    `> **Total Calendar:** ${guide.elapsedDays.min}–${guide.elapsedDays.max} days  `,
    `> **Approval Wait:** ${guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'None required'}  `,
    `> **Researched:** ${guide.researchDate}`,
    '',
    '## Overview',
    '',
    guide.summary,
    '',
    '## Architecture Recommendation',
    '',
    guide.pathJustification,
    '',
  ];

  // Composio integration code
  const slug = guide.slug;
  const envSlug = slug.toUpperCase().replace(/-/g, '_');
  lines.push('## Composio Integration Code', '');
  if (guide.recommendedPath === 'managed') {
    lines.push('```bash');
    lines.push(`# Connect with Composio Managed OAuth`);
    lines.push(`composio add ${slug}`);
    lines.push('```', '');
    lines.push('```typescript');
    lines.push(`import { Composio } from "@composio/core";`);
    lines.push(`const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });`);
    lines.push(`const connection = await composio.connectedAccounts.initiate({`);
    lines.push(`  appName: "${slug}",`);
    lines.push(`  redirectUrl: "https://your-domain.com/api/oauth/callback",`);
    lines.push(`});`);
    lines.push(`console.log("Redirect user to:", connection.redirectUrl);`);
    lines.push('```', '');
  } else {
    lines.push('```bash');
    lines.push(`# Register custom OAuth credentials`);
    lines.push(`composio auth add-config ${slug} \\`);
    lines.push(`  --client-id "<YOUR_CLIENT_ID>" \\`);
    lines.push(`  --client-secret "<YOUR_CLIENT_SECRET>"`);
    lines.push('```', '');
    lines.push('```typescript');
    lines.push(`import { Composio } from "@composio/core";`);
    lines.push(`const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });`);
    lines.push(`await composio.authConfigs.create({`);
    lines.push(`  appName: "${slug}",`);
    lines.push(`  authScheme: "OAUTH2",`);
    lines.push(`  credentials: {`);
    lines.push(`    clientId: process.env.${envSlug}_CLIENT_ID,`);
    lines.push(`    clientSecret: process.env.${envSlug}_CLIENT_SECRET,`);
    lines.push(`  },`);
    lines.push(`});`);
    lines.push('```', '');
  }

  // Setup checklist
  if (guide.setupChecklist.length > 0) {
    lines.push('## Step-by-Step Implementation Checklist', '');
    guide.setupChecklist.forEach((step) => {
      lines.push(`### Step ${step.step}: ${step.title}`);
      lines.push(`- **Category:** ${STEP_TYPE_LABELS[step.type]}`);
      lines.push(`- **Estimated Time:** ${step.estimatedTime || 'N/A'}`);
      lines.push(`- **Agent Autonomous:** ${step.agentCanDo ? 'Yes' : 'No'}`);
      lines.push(`- **Description:** ${step.description}`);
      if (step.completionCriteria) {
        lines.push(`- **Done When:** ${step.completionCriteria}`);
      }
      if (step.officialLink) {
        lines.push(`- **Documentation:** ${step.officialLink}`);
      }
      lines.push('');
    });
  }

  // Scopes
  if (guide.scopes.length > 0) {
    lines.push('## OAuth Scopes', '');
    lines.push('| Scope | Description | Sensitivity |');
    lines.push('|---|---|---|');
    guide.scopes.forEach((s) => {
      lines.push(`| \`${s.scope}\` | ${s.description} | ${s.sensitivity} |`);
    });
    lines.push('');
  }

  // Approvals
  if (guide.approvalRequirements.length > 0) {
    lines.push('## Vendor Approval Requirements', '');
    guide.approvalRequirements.forEach((req) => {
      lines.push(`- **${req.name}** (${req.required ? 'Mandatory' : 'Optional'})`);
      if (req.estimatedTime) lines.push(`  - Estimated wait: ${req.estimatedTime}`);
      lines.push(`  - ${req.description}`);
      if (req.link) lines.push(`  - Documentation: ${req.link}`);
    });
    lines.push('');
  }

  // Blockers
  if (guide.commonBlockers.length > 0) {
    lines.push('## Common Blockers & Solutions', '');
    guide.commonBlockers.forEach((b) => {
      lines.push(`### ${b.title} (${b.severity} priority)`);
      lines.push(b.description);
      lines.push('');
      lines.push(`**Resolution:** ${b.resolution}`);
      lines.push('');
    });
  }

  // Agent Automation
  if (guide.agentCapabilities.length > 0) {
    lines.push('## Agent Automation Boundaries', '');
    lines.push('| Task | Handled by Agent? | Notes |');
    lines.push('|---|---|---|');
    guide.agentCapabilities.forEach((cap) => {
      lines.push(`| ${cap.action} | ${cap.canDo ? 'Yes (Autonomous)' : 'No (Human)'} | ${cap.notes || '—'} |`);
    });
    lines.push('');
  }

  // Sources
  if (guide.sources.length > 0) {
    lines.push('## Official Documentation & Citations', '');
    guide.sources.forEach((s) => {
      lines.push(`- [${s.title}](${s.url}) (${s.type}, accessed ${s.accessedAt})`);
    });
    lines.push('');
  }

  // Audit notes
  if (guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0) {
    lines.push('## Audit Notes & Verification Limitations', '');
    guide.assumptions.forEach((a) => lines.push(`- Assumption: ${a}`));
    guide.unverifiedClaims.forEach((c) => lines.push(`- Unverified: ${c}`));
    lines.push('');
  }

  return lines.join('\n');
}
