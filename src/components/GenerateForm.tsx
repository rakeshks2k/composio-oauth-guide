'use client';

import { useState, useEffect } from 'react';
import { Guide, ResearchEvent } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Globe,
  ArrowRight,
  Loader2,
  Sparkles,
  Layers,
  ShieldCheck,
  Clock,
  Code2,
  Check,
  Circle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface GenerateFormProps {
  initialAppName?: string;
  onEventsUpdate: (events: ResearchEvent[]) => void;
  onGenerateStart: () => void;
  onGenerateComplete: (guide: Guide) => void;
  onGenerateError: () => void;
}

const QUICK_SUGGESTIONS = [
  { name: 'Linear', website: 'linear.app' },
  { name: 'Notion', website: 'notion.so' },
  { name: 'Zoom', website: 'zoom.us' },
  { name: 'Salesforce', website: 'salesforce.com' },
  { name: 'Spotify', website: 'spotify.com' },
  { name: 'Stripe', website: 'stripe.com' },
];

const PIPELINE_STAGES = [
  {
    title: 'Provider Identity & Endpoint Resolution',
    desc: 'Verify official developer documentation, OAuth endpoints, and registration portal',
  },
  {
    title: 'Composio Managed Auth Catalog Audit',
    desc: 'Check managed toolkit availability and pre-configured client credentials',
  },
  {
    title: 'Permissions Matrix & Scope Sensitivity',
    desc: 'Categorize OAuth scopes into basic, sensitive, and restricted access tiers',
  },
  {
    title: 'Provider Review & Approval Timelines',
    desc: 'Evaluate CASA tier assessments, restricted scope approvals, and calendar wait times',
  },
  {
    title: 'Implementation Checklist & SDK Code Snippets',
    desc: 'Compile ordered setup checklist, blockers, and ready-to-run Composio code',
  },
];

export function GenerateForm({
  initialAppName = '',
  onEventsUpdate,
  onGenerateStart,
  onGenerateComplete,
  onGenerateError,
}: GenerateFormProps) {
  const [appName, setAppName] = useState(initialAppName);
  const [appWebsite, setAppWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(1);
  const [currentPhase, setCurrentPhase] = useState('Initializing autonomous OAuth research pipeline...');

  useEffect(() => {
    if (initialAppName) {
      setAppName(initialAppName);
    }
  }, [initialAppName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appName.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPhaseIndex(1);
    setCurrentPhase(`Resolving official developer identity for "${appName.trim()}"...`);

    const events: ResearchEvent[] = [];
    onGenerateStart();
    onEventsUpdate([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: appName.trim(),
          appWebsite: appWebsite.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No response body received');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as ResearchEvent;
            events.push(event);
            onEventsUpdate([...events]);

            const msg = event.message.toLowerCase();
            if (msg.includes('identity') || msg.includes('resolving') || msg.includes('phase 1')) {
              setPhaseIndex(1);
              setCurrentPhase(`Resolving official developer identity for "${appName.trim()}"...`);
            } else if (msg.includes('catalog') || msg.includes('managed') || msg.includes('phase 2')) {
              setPhaseIndex(2);
              setCurrentPhase('Auditing Composio managed OAuth catalog availability...');
            } else if (msg.includes('scopes') || msg.includes('permissions') || msg.includes('phase 3')) {
              setPhaseIndex(3);
              setCurrentPhase('Auditing permissions matrix and sensitive access tiers...');
            } else if (msg.includes('policies') || msg.includes('review') || msg.includes('friction') || msg.includes('phase 4')) {
              setPhaseIndex(4);
              setCurrentPhase('Evaluating provider verification policies and wait times...');
            } else if (msg.includes('complete') || msg.includes('generating') || msg.includes('phase 5')) {
              setPhaseIndex(5);
              setCurrentPhase('Synthesizing complete production OAuth guide...');
            }

            if (event.type === 'complete' && event.detail) {
              const guide = JSON.parse(event.detail) as Guide;
              setIsLoading(false);
              onGenerateComplete(guide);
            } else if (event.type === 'error') {
              setError(event.detail || 'Research generation failed');
              setIsLoading(false);
              onGenerateError();
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown network failure';
      setError(message);
      setIsLoading(false);
      onGenerateError();
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-6 sm:px-10 flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] sm:text-[15px] font-medium text-white tracking-[-0.01em]">
            {isLoading ? `Investigating ${appName}` : 'Generate Guide'}
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#262626] bg-[#141414] text-[#51a2ff] flex items-center gap-1.5">
            {isLoading && <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />}
            <span>{isLoading ? 'Live Investigation' : 'Live AI Research'}</span>
          </span>
        </div>
      </div>

      {/* 2. Body: Seamless Loading State OR Form */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 pt-6 pb-12 space-y-6 max-w-4xl mx-auto w-full">
          {/* Header Progress Card */}
          <div className="p-6 rounded-lg bg-[#141414] border border-[#262626] space-y-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <AppIcon name={appName} size="lg" className="ring-2 ring-[#51a2ff]/40" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#51a2ff] ring-2 ring-[#141414]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                      Investigating {appName}
                    </h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#51a2ff]/30 bg-[#51a2ff]/10 text-[#51a2ff]">
                      OAuth 2.0 Analysis
                    </span>
                  </div>
                  <p className="text-[13px] text-[#737373] font-mono mt-0.5">
                    {appWebsite ? appWebsite.replace(/^https?:\/\//, '') : `${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1a1]">
                <Loader2 className="w-4 h-4 text-[#51a2ff] animate-spin" />
                <span>Streaming live evidence</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                <span>Analysis Pipeline</span>
                <span className="text-[#51a2ff] font-medium">{Math.min(95, Math.max(15, phaseIndex * 20))}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#51a2ff] via-[#60a5fa] to-[#93c5fd] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(95, Math.max(15, phaseIndex * 20))}%` }}
                />
              </div>
            </div>

            {/* Current Active Step Banner */}
            <div className="p-3.5 rounded-md bg-[#181818] border border-[#262626] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#51a2ff] animate-pulse flex-shrink-0" />
              <span className="text-[12.5px] font-mono text-white truncate">
                {currentPhase}
              </span>
            </div>
          </div>

          {/* Autonomous Investigation Stages Checklist */}
          <div className="p-5 sm:p-6 rounded-lg bg-[#141414] border border-[#262626] space-y-3.5">
            <div className="text-[11.5px] font-mono uppercase tracking-wider text-[#737373]">
              Autonomous Investigation Stages
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {PIPELINE_STAGES.map((stage, idx) => {
                const stepNum = idx + 1;
                const isComplete = phaseIndex > stepNum;
                const isCurrent = phaseIndex === stepNum;

                return (
                  <div
                    key={stage.title}
                    className={clsx(
                      'p-3 rounded-md border flex items-center justify-between transition-colors duration-150',
                      isCurrent
                        ? 'bg-[#181818] border-[#51a2ff]/40 text-white'
                        : isComplete
                        ? 'bg-[#161616] border-[#262626] text-[#a0a0a0]'
                        : 'bg-[#121212] border-[#1e1e1e] text-[#555555]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isComplete ? (
                        <Check className="w-4 h-4 text-[#51a2ff] flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#51a2ff] animate-spin flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#444444] flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{stage.title}</div>
                        <div className="text-[11px] text-[#737373] truncate font-sans">{stage.desc}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#262626] bg-[#181818] flex-shrink-0">
                      {isComplete ? 'verified' : isCurrent ? 'auditing' : 'queued'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guide Skeleton Outlines */}
          <div className="space-y-3 opacity-60">
            <div className="text-[11.5px] font-mono uppercase tracking-wider text-[#555555] px-1">
              Preparing production guide structure
            </div>
            <div className="p-5 rounded-lg bg-[#141414] border border-[#222222] space-y-3">
              <div className="h-4 w-48 bg-[#222222] rounded" />
              <div className="h-3 w-full bg-[#1c1c1c] rounded" />
              <div className="h-3 w-3/4 bg-[#1c1c1c] rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-[#141414] border border-[#222222] space-y-2">
                <div className="h-3 w-20 bg-[#222222] rounded" />
                <div className="h-5 w-24 bg-[#1e1e1e] rounded" />
              </div>
              <div className="p-4 rounded-lg bg-[#141414] border border-[#222222] space-y-2">
                <div className="h-3 w-20 bg-[#222222] rounded" />
                <div className="h-5 w-24 bg-[#1e1e1e] rounded" />
              </div>
              <div className="p-4 rounded-lg bg-[#141414] border border-[#222222] space-y-2">
                <div className="h-3 w-20 bg-[#222222] rounded" />
                <div className="h-5 w-24 bg-[#1e1e1e] rounded" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* The Standard Form */
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 pt-5 pb-12 space-y-6 max-w-4xl mx-auto w-full">
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
              Generate an OAuth Integration Guide
            </h2>
            <p className="text-[13.5px] text-[#a0a0a0] leading-[1.75]">
              Enter any third-party SaaS app or platform name to initiate an autonomous OAuth analysis.
              The agent checks Composio managed OAuth availability, audits scope sensitivity, and
              quantifies active engineering hours against external vendor approval waiting periods.
            </p>
          </div>

          {/* Primary Input Card */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-lg bg-[#141414] border border-[#262626] space-y-6">
            <div className="space-y-3">
              <label htmlFor="appName" className="block text-[11.5px] font-mono uppercase tracking-wider text-[#a0a0a0]">
                Application Name <span className="text-[#51a2ff]">*</span>
              </label>
              <input
                id="appName"
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Linear, Figma, Notion, Zoom, Salesforce, Spotify, Stripe"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-md bg-[#181818] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
              />

              {/* Quick Suggestions Chips with Brand Icons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#737373] font-mono">Try a popular integration:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {QUICK_SUGGESTIONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setAppName(item.name);
                        setAppWebsite(item.website);
                      }}
                      className="h-8 px-2.5 rounded-md bg-[#181818] border border-[#282828] hover:border-[#3a3a3a] hover:bg-[#202020] text-[#a0a0a0] hover:text-white transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <AppIcon name={item.name} size="sm" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label htmlFor="appWebsite" className="block text-[11.5px] font-mono uppercase tracking-wider text-[#a0a0a0]">
                Documentation or Website URL <span className="text-[#666666] font-normal normal-case">(optional — focuses agent crawl)</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="appWebsite"
                  type="text"
                  value={appWebsite}
                  onChange={(e) => setAppWebsite(e.target.value)}
                  placeholder="e.g. linear.app or https://developers.notion.com"
                  disabled={isLoading}
                  className="w-full h-10 pl-10 pr-3.5 rounded-md bg-[#181818] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-md bg-[#1c1414] border border-[#5e2020] text-[#ff7b72] text-xs font-mono">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!appName.trim() || isLoading}
                className={clsx(
                  'h-10 px-5 rounded-md font-medium text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  !appName.trim() || isLoading
                    ? 'bg-[#1e1e1e] border border-[#2a2a2a] text-[#666666] cursor-not-allowed'
                    : 'bg-white hover:bg-[#eaeaea] text-black shadow-sm'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Production Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </form>

          {/* Structured Pipeline Architecture & Evaluation Pillars */}
          <div className="space-y-4">
            <div className="text-[11.5px] font-mono uppercase tracking-wider text-[#737373] px-1">
              What the agent investigates in real time
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3 cursor-default">
                <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#51a2ff]">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-[13.5px] font-medium">Architecture Path Evaluation</h3>
                  <p className="text-[#a0a0a0] text-xs leading-[1.6]">
                    Analyzes whether Composio Managed OAuth or a Custom OAuth App registration is best suited for your agent use-case.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3 cursor-default">
                <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#51a2ff]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-[13.5px] font-medium">Permissions &amp; Scope Sensitivity</h3>
                  <p className="text-[#a0a0a0] text-xs leading-[1.6]">
                    Audits OAuth 2.0 scopes, classifying each into basic, sensitive, or restricted tiers with security review implications.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3 cursor-default">
                <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#51a2ff]">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-[13.5px] font-medium">Effort &amp; Timeline Quantification</h3>
                  <p className="text-[#a0a0a0] text-xs leading-[1.6]">
                    Differentiates active hands-on engineering hours from external provider verification waiting periods.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3 cursor-default">
                <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#51a2ff]">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-[13.5px] font-medium">Ready-to-Run Code Snippets</h3>
                  <p className="text-[#a0a0a0] text-xs leading-[1.6]">
                    Produces working Composio CLI commands and TypeScript SDK snippets tailored directly to the application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
