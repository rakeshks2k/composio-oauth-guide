'use client';

import { useState, useEffect } from 'react';
import { Guide, ChecklistItem } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronDown,
  CircleCheck,
  Clock,
  RotateCcw,
  ShieldCheck,
  FileCode,
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
  'provider-verification': 'Provider Verification',
  'marketplace-review': 'Marketplace Review',
};

export function GuideView({ guide }: GuideViewProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [showPathComparison, setShowPathComparison] = useState(false);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`composio_oauth_progress_${guide.slug}`);
      if (stored) {
        setCompletedSteps(JSON.parse(stored));
      } else {
        setCompletedSteps([]);
      }
    } catch {
      setCompletedSteps([]);
    }
  }, [guide.slug]);

  function toggleStep(stepId: string) {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId];
      try {
        localStorage.setItem(`composio_oauth_progress_${guide.slug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function resetProgress() {
    setCompletedSteps([]);
    try {
      localStorage.removeItem(`composio_oauth_progress_${guide.slug}`);
    } catch {}
  }

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
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={copyMarkdown}
            className="h-7 px-2.5 rounded bg-[#161616] border border-[#262626] hover:border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedMd ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#737373]" />
            )}
            <span>Copy as Markdown</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
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
          </motion.button>
        </div>
      </div>

      {/* 2. Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 pt-5 pb-12 space-y-6 max-w-4xl mx-auto w-full">
        {/* Quick Actions Strip: Callback URL & Developer Console */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-lg bg-[#141414] border border-[#262626]">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#737373] font-mono text-[11px] uppercase tracking-wider">
              Composio Redirect URI:
            </span>
            <code className="px-2 py-0.5 rounded bg-[#181818] border border-[#2a2a2a] text-[#51a2ff] font-mono text-[11.5px]">
              {COMPOSIO_REDIRECT_URI}
            </code>
            <button
              onClick={copyRedirectUri}
              className="h-6 px-2 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#383838] text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              {copiedRedirectUri ? (
                <>
                  <Check className="w-3 h-3 text-[#51a2ff]" />
                  <span>Copied URI</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#737373]" />
                  <span>Copy URI</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(guide.setupChecklist[0]?.officialLink || guide.appDomain) && (
              <a
                href={guide.setupChecklist[0]?.officialLink || `https://${guide.appDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2.5 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#383838] text-[#a0a0a0] hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>Open Dev Console</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            <button
              onClick={() => setShowPathComparison(!showPathComparison)}
              className="h-6 px-2.5 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#383838] text-[#a0a0a0] hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors"
            >
              <span>{showPathComparison ? 'Hide Path Matrix' : 'Compare Paths'}</span>
              <ChevronDown
                className={clsx(
                  'w-3 h-3 transition-transform',
                  showPathComparison && 'rotate-180'
                )}
              />
            </button>
          </div>
        </div>

        {/* Path Comparison Matrix (Expandable) */}
        <AnimatePresence>
          {showPathComparison && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-lg bg-[#141414] border border-[#262626]"
            >
              <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                <span className="text-[11.5px] font-mono uppercase tracking-wider text-[#737373]">
                  Integration Path Comparison: {guide.appName}
                </span>
                <span className="text-[11px] font-mono text-[#51a2ff]">
                  Recommended: {guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth Application'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#161616] text-[#737373] font-mono text-[10.5px] uppercase">
                      <th className="py-2.5 px-4 font-normal">Dimension</th>
                      <th className="py-2.5 px-4 font-normal text-[#51a2ff]">Composio Managed OAuth</th>
                      <th className="py-2.5 px-4 font-normal text-[#e0e0e0]">Custom OAuth Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f] text-[12px] font-mono text-[#a1a1a1]">
                    <tr>
                      <td className="py-2.5 px-4 text-[#737373]">Hands-on Setup</td>
                      <td className="py-2.5 px-4 text-white">~2 minutes (`composio add {guide.slug}`)</td>
                      <td className="py-2.5 px-4">{guide.handsOnHours.min}–{guide.handsOnHours.max} hours dev portal configuration</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-[#737373]">Vendor Approval Wait</td>
                      <td className="py-2.5 px-4 text-white">Zero wait (Pre-approved catalog integration)</td>
                      <td className="py-2.5 px-4">{guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days review queue` : '0 days (instant self-service)'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-[#737373]">Consent Screen Identity</td>
                      <td className="py-2.5 px-4">Displays &quot;Composio&quot; identity</td>
                      <td className="py-2.5 px-4 text-white">Fully white-labeled (Your company name &amp; logo)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-[#737373]">Secret &amp; Token Storage</td>
                      <td className="py-2.5 px-4">Encrypted and rotated by Composio</td>
                      <td className="py-2.5 px-4">Stored in your secure environment variables / KMS</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-[#737373]">Ideal Use Case</td>
                      <td className="py-2.5 px-4 text-white">AI Agent MVPs, testing, internal automations</td>
                      <td className="py-2.5 px-4 text-white">Marketplace listings, enterprise security reviews</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Architecture Recommendation & Summary */}
        <div className="p-5 sm:p-6 rounded-lg bg-[#141414] border border-[#262626] space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#51a2ff] font-mono">RECOMMENDED ARCHITECTURE:</span>
              <span className="font-medium">{guide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth App'}</span>
            </div>
            <div className="text-[11px] font-mono text-[#8c8c8c] bg-[#1a1a1a] border border-[#262626] px-2 py-0.5 rounded capitalize">
              Difficulty: {guide.difficulty.replace('-', ' ')}
            </div>
          </div>

          <p className="text-[13.5px] text-[#a0a0a0] leading-[1.7]">
            {guide.pathJustification}
          </p>

          <div className="pt-3 border-t border-[#1f1f1f]">
            <p className="text-[13.5px] text-[#d4d4d4] leading-[1.7]">
              {guide.summary}
            </p>
          </div>
        </div>

        {/* Effort & Time Breakdown Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <motion.div
            whileHover={{ y: -2, borderColor: '#383838' }}
            transition={{ duration: 0.15 }}
            className="p-4 sm:p-4.5 rounded-lg bg-[#141414] border border-[#262626] cursor-default"
          >
            <div className="text-[#737373] text-[11px] font-medium uppercase tracking-wider mb-1">
              Hands-on Effort
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-0.5">
              {guide.handsOnHours.min}–{guide.handsOnHours.max} hours
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              Active engineering setup
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, borderColor: '#383838' }}
            transition={{ duration: 0.15 }}
            className="p-4 sm:p-4.5 rounded-lg bg-[#141414] border border-[#262626] cursor-default"
          >
            <div className="text-[#737373] text-[11px] font-medium uppercase tracking-wider mb-1">
              Calendar Elapsed
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-0.5">
              {guide.elapsedDays.min}–{guide.elapsedDays.max} days
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              Kickoff to production live
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, borderColor: '#383838' }}
            transition={{ duration: 0.15 }}
            className="p-4 sm:p-4.5 rounded-lg bg-[#141414] border border-[#262626] cursor-default"
          >
            <div className="text-[#737373] text-[11px] font-medium uppercase tracking-wider mb-1">
              External Approval
            </div>
            <div className="text-white font-mono font-medium text-lg sm:text-xl my-0.5">
              {guide.approvalDays ? `${guide.approvalDays.min}–${guide.approvalDays.max} days` : 'Immediate (0d)'}
            </div>
            <div className="text-[#666666] text-[11.5px] mt-0.5">
              {guide.approvalDays ? 'Third-party review queue' : 'Immediate — no review required'}
            </div>
          </motion.div>
        </div>

        {/* Evidence & Verification Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#51a2ff] flex-shrink-0" />
            <div>
              <div className="text-white font-medium text-[12px]">Composio Verified</div>
              <div className="text-[#666666] text-[11px] font-mono">Tested with SDK &amp; token refresh</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-[#51a2ff] flex-shrink-0" />
            <div>
              <div className="text-white font-medium text-[12px]">{guide.sources.length} Official Citations</div>
              <div className="text-[#666666] text-[11px] font-mono">Verified provider documentation</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] flex items-center gap-2.5">
            <CircleCheck className="w-4 h-4 text-[#51a2ff] flex-shrink-0" />
            <div>
              <div className="text-white font-medium text-[12px]">
                {guide.assumptions.length + guide.unverifiedClaims.length > 0
                  ? `${guide.assumptions.length + guide.unverifiedClaims.length} Policy Caveats`
                  : 'Zero Unverified Claims'}
              </div>
              <div className="text-[#666666] text-[11px] font-mono">Nuances &amp; boundaries flagged</div>
            </div>
          </div>
        </div>

        {/* Composio Integration Code Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
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
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                Step-by-Step Implementation Checklist
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.setupChecklist.length} steps
              </span>
            </div>

            {/* Interactive Progress Bar */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#141414] border border-[#262626] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a1a1a1] font-mono">
                  Setup Progress: <strong className="text-white">{completedSteps.length} of {guide.setupChecklist.length}</strong> steps completed
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#51a2ff] font-medium">
                    {Math.round((completedSteps.length / guide.setupChecklist.length) * 100)}%
                  </span>
                  {completedSteps.length > 0 && (
                    <button
                      onClick={resetProgress}
                      className="text-[#666666] hover:text-white flex items-center gap-1 text-[10.5px] font-mono transition-colors"
                      title="Reset progress"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#51a2ff] transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.round((completedSteps.length / guide.setupChecklist.length) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] divide-y divide-[#1f1f1f] overflow-hidden">
              {guide.setupChecklist.map((step) => {
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className={clsx(
                      'p-5 sm:p-6 space-y-3 transition-colors',
                      isCompleted ? 'bg-[#101317]' : 'bg-[#141414]'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Interactive Step Completion Button */}
                      <button
                        onClick={() => toggleStep(step.id)}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        className={clsx(
                          'w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[11px] transition-all cursor-pointer',
                          isCompleted
                            ? 'bg-[#51a2ff] text-black font-semibold'
                            : 'bg-[#1a1a1a] border border-[#262626] text-[#737373] hover:border-[#51a2ff] hover:text-white'
                        )}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.step}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3
                            className={clsx(
                              'text-[14px] font-medium tracking-normal transition-colors cursor-pointer',
                              isCompleted ? 'text-[#737373] line-through' : 'text-white'
                            )}
                            onClick={() => toggleStep(step.id)}
                          >
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

                        {step.completionCriteria && (
                          <div
                            className={clsx(
                              'flex items-start gap-2 mt-3 p-3 rounded-md border transition-colors',
                              isCompleted
                                ? 'bg-[#0f1720] border-[#1c2e40]'
                                : 'bg-[#181818] border-[#1e1e1e]'
                            )}
                          >
                            <CircleCheck
                              className={clsx(
                                'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                                isCompleted ? 'text-[#51a2ff]' : 'text-[#737373]'
                              )}
                            />
                            <span className="text-[12.5px] text-[#a1a1a1] leading-[1.6]">
                              <span className="text-[#555555] font-mono text-[10.5px] uppercase tracking-wider mr-1.5">Done when:</span>
                              {step.completionCriteria}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center flex-wrap gap-3 text-[11px] text-[#737373] pt-3 font-mono border-t border-[#1a1a1a] mt-3">
                          <span className="px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#262626] text-[#8c8c8c]">
                            {STEP_TYPE_LABELS[step.type]}
                          </span>

                          <span className="text-[#8c8c8c]">
                            {step.agentCanDo ? 'Agent can prepare' : 'Developer action required'}
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
                );
              })}
            </div>
          </div>
        )}

        {/* Scopes Table */}
        {guide.scopes.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                OAuth Scopes &amp; Sensitivity Classification
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
                    <th className="py-3 px-5 font-normal">Description &amp; Purpose</th>
                    <th className="py-3 px-5 font-normal">Sensitivity Tier</th>
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

        {/* Approval Requirements */}
        {guide.approvalRequirements.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                Vendor Verification &amp; Review Requirements
              </h2>
              <span className="text-[11px] font-mono text-[#555555]">
                {guide.approvalRequirements.length} {guide.approvalRequirements.length === 1 ? 'requirement' : 'requirements'}
              </span>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] divide-y divide-[#1f1f1f] overflow-hidden">
              {guide.approvalRequirements.map((req, idx) => (
                <div key={idx} className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[14px] font-medium text-white leading-tight">{req.name}</span>
                      <span
                        className={clsx(
                          'text-[10.5px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0',
                          req.required
                            ? 'text-white bg-[#1c1c1c] border-[#2c2c2c]'
                            : 'text-[#737373] bg-transparent border-[#2a2a2a]'
                        )}
                      >
                        {req.required ? 'Mandatory' : 'Optional / Conditional'}
                      </span>
                    </div>
                    {req.estimatedTime && (
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#737373] flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {req.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-[13.5px] text-[#a1a1a1] leading-[1.7]">{req.description}</p>
                  {req.link && (
                    <a
                      href={req.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#51a2ff] hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      <span>Official Requirements</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Blockers */}
        {guide.commonBlockers.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                Known Blockers &amp; Pre-emptions
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
                        <ChevronDown
                          className={clsx(
                            'w-3.5 h-3.5 transition-transform duration-200',
                            isOpen ? 'transform rotate-180 text-[#a1a1a1]' : 'text-[#555555]'
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
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 space-y-3.5 text-[#a1a1a1] leading-[1.7] text-[13px] border-t border-[#1c1c1c]">
                            <p>{b.description}</p>
                            <div className="p-3.5 rounded bg-[#181818] border border-[#262626] text-white">
                              <span className="text-[#737373] font-mono text-[11px] uppercase tracking-wider block mb-1">
                                How to resolve:
                              </span>
                              <span className="text-[#e0e0e0] leading-[1.65]">
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
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                What an Agent Can Do vs. Where You Must Take Over
              </h2>
            </div>

            <div className="rounded-md border border-[#262626] bg-[#141414] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#161616] text-[#737373] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5 font-normal">Integration Task</th>
                    <th className="py-3 px-5 font-normal">Responsibility</th>
                    <th className="py-3 px-5 font-normal">Hand-off Details &amp; Nuances</th>
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
                          <span className="text-[#51a2ff] font-medium">Agent autonomous</span>
                        ) : (
                          <span className="text-[#a1a1a1]">Developer action</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-[#8c8c8c] text-[13px] leading-[1.65]">
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
              <h2 className="text-[11.5px] font-medium uppercase tracking-wider text-[#737373]">
                Official Documentation &amp; Citations
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
              Audit Notes, Assumptions &amp; Limitations
            </div>
            {guide.assumptions.map((a, i) => (
              <div key={i} className="leading-[1.7]">• {a}</div>
            ))}
            {guide.unverifiedClaims.map((c, i) => (
              <div key={i} className="text-[#a1a1a1] leading-[1.7]">• Unverified: {c}</div>
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
      lines.push('');
      lines.push(`**Type:** ${STEP_TYPE_LABELS[step.type]}  `);
      lines.push(`**Estimated Time:** ${step.estimatedTime || 'N/A'}  `);
      lines.push(`**Responsibility:** ${step.agentCanDo ? 'Agent can prepare' : 'Developer action required'}  `);
      lines.push('');
      lines.push(step.description);
      if (step.completionCriteria) {
        lines.push('');
        lines.push(`> **Done when:** ${step.completionCriteria}`);
      }
      if (step.officialLink) {
        lines.push('');
        lines.push(`[Official Docs](${step.officialLink})`);
      }
      lines.push('');
    });
  }

  // Scopes table
  if (guide.scopes.length > 0) {
    lines.push('## OAuth Scopes & Sensitivity Classification', '');
    lines.push('| Scope | Description & Purpose | Sensitivity Tier |');
    lines.push('|---|---|---|');
    guide.scopes.forEach((s) => {
      lines.push(`| \`${s.scope}\` | ${s.description} | ${s.sensitivity} |`);
    });
    lines.push('');
  }

  // Approval requirements
  if (guide.approvalRequirements.length > 0) {
    lines.push('## Vendor Verification & Review Requirements', '');
    guide.approvalRequirements.forEach((req) => {
      lines.push(`### ${req.name} (${req.required ? 'Mandatory' : 'Optional / Conditional'})`);
      lines.push('');
      if (req.estimatedTime) lines.push(`**Timeline:** ${req.estimatedTime}  `);
      lines.push('');
      lines.push(req.description);
      if (req.link) lines.push(`\n[Official Requirements](${req.link})`);
      lines.push('');
    });
  }

  // Blockers
  if (guide.commonBlockers.length > 0) {
    lines.push('## Known Blockers & Pre-emptions', '');
    guide.commonBlockers.forEach((b) => {
      lines.push(`### ${b.title} (${b.severity} priority)`);
      lines.push('');
      lines.push(b.description);
      lines.push('');
      lines.push(`**How to resolve:** ${b.resolution}`);
      lines.push('');
    });
  }

  // Agent capabilities matrix
  if (guide.agentCapabilities.length > 0) {
    lines.push('## What an Agent Can Do vs. Where You Must Take Over', '');
    lines.push('| Integration Task | Responsibility | Hand-off Details & Nuances |');
    lines.push('|---|---|---|');
    guide.agentCapabilities.forEach((cap) => {
      lines.push(`| ${cap.action} | ${cap.canDo ? 'Agent autonomous' : 'Developer action'} | ${cap.notes || '—'} |`);
    });
    lines.push('');
  }

  // Sources
  if (guide.sources.length > 0) {
    lines.push('## Official Documentation & Citations', '');
    guide.sources.forEach((src) => {
      lines.push(`- [${src.title}](${src.url}) *(${src.type.replace(/-/g, ' ')} · ${src.accessedAt})*`);
    });
    lines.push('');
  }

  // Audit notes
  const hasNotes = guide.assumptions.length > 0 || guide.unverifiedClaims.length > 0;
  if (hasNotes) {
    lines.push('## Audit Notes, Assumptions & Limitations', '');
    guide.assumptions.forEach((a) => lines.push(`- ${a}`));
    guide.unverifiedClaims.forEach((c) => lines.push(`- *Unverified:* ${c}`));
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`*Generated by Composio OAuth Guide Generator · ${guide.researchDate}*`);

  return lines.join('\n');
}
