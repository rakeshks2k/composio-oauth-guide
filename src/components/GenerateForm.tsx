'use client';

import { useState, useEffect } from 'react';
import { Guide, ResearchEvent } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Globe,
  ArrowRight,
  Loader2,
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-3.5 sm:px-8 lg:px-10 flex items-center justify-between border-b border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-[13.5px] sm:text-[14px] font-medium text-white tracking-[-0.01em] truncate">
            {isLoading ? `Investigating ${appName}` : 'Generate Guide'}
          </h1>
          <span className="text-[10.5px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.5 rounded border border-[#242424] bg-[#141414] text-[#888888] flex items-center gap-1.5 flex-shrink-0">
            {isLoading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />
                <span className="text-[#a1a1a1]">Active Investigation</span>
              </>
            ) : (
              <span>AI Research</span>
            )}
          </span>
        </div>
      </div>

      {/* 2. Body: Seamless Loading State OR Form */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-16 space-y-5 sm:space-y-6 max-w-4xl mx-auto w-full">
          {/* Header Progress Card */}
          <div className="p-4 sm:p-6 rounded-lg bg-[#121212] border border-[#222222] space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AppIcon name={appName} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-medium text-white tracking-tight">
                      Investigating {appName}
                    </h2>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-[#262626] bg-[#161616] text-[#888888]">
                      OAuth 2.0
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] font-mono mt-0.5">
                    {appWebsite ? appWebsite.replace(/^https?:\/\//, '') : `${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a1a1a1]" />
                <span>Auditing endpoints</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#666666]">
                <span>Progress</span>
                <span className="text-[#ededed] font-medium">{Math.min(95, Math.max(15, phaseIndex * 20))}%</span>
              </div>
              <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#51a2ff] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(95, Math.max(15, phaseIndex * 20))}%` }}
                />
              </div>
            </div>

            {/* Current Active Step Banner */}
            <div className="p-3 rounded bg-[#161616] border border-[#222222] flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono text-[#cccccc] truncate">
                {currentPhase}
              </span>
            </div>
          </div>

          {/* Autonomous Investigation Stages Checklist */}
          <div className="p-3.5 sm:p-5 rounded-lg bg-[#121212] border border-[#222222] space-y-3">
            <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
              Investigation Pipeline
            </div>

            <div className="space-y-2 font-mono text-xs">
              {PIPELINE_STAGES.map((stage, idx) => {
                const stepNum = idx + 1;
                const isComplete = phaseIndex > stepNum;
                const isCurrent = phaseIndex === stepNum;

                return (
                  <div
                    key={stage.title}
                    className={clsx(
                      'p-2.5 rounded border flex items-center justify-between transition-colors duration-150',
                      isCurrent
                        ? 'bg-[#161616] border-[#333333] text-white'
                        : isComplete
                        ? 'bg-[#141414] border-[#1e1e1e] text-[#a0a0a0]'
                        : 'bg-[#101010] border-[#1a1a1a] text-[#555555]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isComplete ? (
                        <Check className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#a1a1a1] animate-spin flex-shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-[#444444] flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{stage.title}</div>
                        <div className="text-[11px] text-[#666666] truncate font-sans">{stage.desc}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#222222] bg-[#161616] text-[#737373] flex-shrink-0 ml-3">
                      {isComplete ? 'verified' : isCurrent ? 'auditing' : 'queued'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guide Skeleton Outlines */}
          <div className="space-y-2.5 opacity-50">
            <div className="text-[11px] font-mono text-[#555555] px-0.5">
              Assembling guide structure
            </div>
            <div className="p-4 rounded-lg bg-[#121212] border border-[#1e1e1e] space-y-2">
              <div className="h-3.5 w-40 bg-[#1c1c1c] rounded" />
              <div className="h-2.5 w-full bg-[#181818] rounded" />
              <div className="h-2.5 w-3/4 bg-[#181818] rounded" />
            </div>
          </div>
        </div>
      ) : (
        /* The Standard Form */
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-16 space-y-5 sm:space-y-7 max-w-4xl mx-auto w-full">
          <div className="space-y-1.5">
            <h2 className="text-[15px] font-medium text-white tracking-tight">
              OAuth Integration Guide Generator
            </h2>
            <p className="text-[12.5px] sm:text-[13px] text-[#888888] leading-[1.65]">
              Generate a verified OAuth 2.0 integration guide for any application. Analyzes Composio managed auth availability, scope permissions, and external provider approval wait times.
            </p>
          </div>

          {/* Primary Input Card */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-lg bg-[#121212] border border-[#222222] space-y-4 sm:space-y-5">
            <div className="space-y-2.5">
              <label htmlFor="appName" className="block text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Application Name
              </label>
              <input
                id="appName"
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Linear, Notion, Zoom, Salesforce, Spotify, Stripe"
                disabled={isLoading}
                className="w-full h-9 px-3 rounded-md bg-[#161616] border border-[#242424] focus:border-[#383838] focus:ring-1 focus:ring-[#51a2ff]/30 text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
              />

              {/* Quick Suggestions Chips with Brand Icons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#666666] font-mono">Suggested integrations:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {QUICK_SUGGESTIONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setAppName(item.name);
                        setAppWebsite(item.website);
                      }}
                      className="h-7 px-2 rounded bg-[#161616] border border-[#242424] hover:border-[#383838] text-[#a0a0a0] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    >
                      <AppIcon name={item.name} size="sm" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="appWebsite" className="block text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Documentation or Website URL <span className="text-[#555555] normal-case">(optional)</span>
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="appWebsite"
                  type="text"
                  value={appWebsite}
                  onChange={(e) => setAppWebsite(e.target.value)}
                  placeholder="e.g. linear.app or https://developers.notion.com"
                  disabled={isLoading}
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-[#161616] border border-[#242424] focus:border-[#383838] focus:ring-1 focus:ring-[#51a2ff]/30 text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-[#1c1414] border border-[#3d1a1a] text-[#f87171] text-xs font-mono">
                {error}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={!appName.trim() || isLoading}
                className={clsx(
                  'h-9 px-4 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  !appName.trim() || isLoading
                    ? 'bg-[#181818] border border-[#262626] text-[#555555] cursor-not-allowed'
                    : 'bg-white hover:bg-[#ededed] text-black shadow-sm'
                )}
              >
                <span>Generate Production Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Understated Technical Scope Breakdown */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
              Investigation Scope
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#121212] border border-[#222222] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Architecture Evaluation</span>
                </div>
                <p className="text-[#888888] text-[12px] leading-[1.6]">
                  Compares Composio Managed OAuth against custom provider developer app registration.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#121212] border border-[#222222] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Scope Sensitivity Audit</span>
                </div>
                <p className="text-[#888888] text-[12px] leading-[1.6]">
                  Classifies scopes into basic, sensitive, and restricted access tiers.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#121212] border border-[#222222] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Approval &amp; Wait Time Modeling</span>
                </div>
                <p className="text-[#888888] text-[12px] leading-[1.6]">
                  Quantifies hands-on engineering hours vs. external provider review delays.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#121212] border border-[#222222] space-y-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Code2 className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Ready-to-Run Code</span>
                </div>
                <p className="text-[#888888] text-[12px] leading-[1.6]">
                  Produces verified Composio CLI commands and TypeScript SDK snippets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
