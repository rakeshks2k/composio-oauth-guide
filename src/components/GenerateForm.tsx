'use client';

import { useState, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
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
} from 'lucide-react';
import { clsx } from 'clsx';

interface GenerateFormProps {
  initialAppName?: string;
  onEventsUpdate: (events: ResearchEvent[]) => void;
  onGenerateStart: () => void;
  onGenerateComplete: (guideId: string) => void;
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

            if (event.type === 'complete' && event.detail) {
              const guide = JSON.parse(event.detail);
              onGenerateComplete(guide.id);
            } else if (event.type === 'error') {
              setError(event.detail || 'Research generation failed');
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
      onGenerateError();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-6 sm:px-10 flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] sm:text-[15px] font-medium text-white tracking-[-0.01em]">
            Generate Guide
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#262626] bg-[#141414] text-[#51a2ff]">
            Live AI Research
          </span>
        </div>
      </div>

      {/* 2. Form Body - Centered, well-spaced, filling width nicely without voids */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-9 space-y-8 max-w-4xl mx-auto w-full">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
            Research Third-Party Application
          </h2>
          <p className="text-[13.5px] text-[#a0a0a0] leading-[1.75]">
            Enter any third-party SaaS service or platform name to initiate an autonomous OAuth analysis.
            The agent evaluates Composio managed OAuth availability, audits scope sensitivity, and
            quantifies developer hands-on hours vs. external vendor approval waiting periods.
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
              placeholder="e.g. Linear, Notion, Zoom, Salesforce, Spotify, Stripe"
              disabled={isLoading}
              className="w-full h-10 px-3.5 rounded-md bg-[#181818] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
            />

            {/* Quick Suggestions Chips with Brand Icons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-[#737373] font-mono">Suggested integrations:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setAppName(item.name);
                      setAppWebsite(item.website);
                    }}
                    className="h-8 px-2.5 rounded-md bg-[#181818] border border-[#282828] hover:border-[#3a3a3a] hover:bg-[#202020] text-[#a0a0a0] hover:text-white transition-all flex items-center gap-2 text-xs font-medium"
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
              Developer Documentation or Website <span className="text-[#666666] font-normal normal-case">(optional)</span>
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
                className="w-full h-10 pl-9.5 pr-3.5 rounded-md bg-[#181818] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#555555] outline-none transition-colors font-mono"
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
                'h-10 px-5 rounded-md font-medium text-[13px] flex items-center justify-center gap-2 transition-all',
                !appName.trim() || isLoading
                  ? 'bg-[#1e1e1e] border border-[#2a2a2a] text-[#666666] cursor-not-allowed'
                  : 'bg-white hover:bg-[#eaeaea] text-black active:scale-[0.99] shadow-sm'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Researching {appName}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Production Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Structured Pipeline Architecture & Evaluation Pillars */}
        <div className="space-y-4">
          <div className="text-[11.5px] font-mono uppercase tracking-wider text-[#737373] px-1">
            Autonomous Pipeline Specification
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-white text-[13px] font-medium">
                <Layers className="w-4 h-4 text-[#51a2ff]" />
                <span>Managed vs. Custom Path</span>
              </div>
              <p className="text-xs text-[#8c8c8c] leading-[1.65]">
                Cross-references provider protocols with Composio&apos;s managed authentication network.
                Recommends zero-maintenance managed OAuth for rapid integrations or dedicated custom client IDs for enterprise white-labeling.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-white text-[13px] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#51a2ff]" />
                <span>Security &amp; Scope Audit</span>
              </div>
              <p className="text-xs text-[#8c8c8c] leading-[1.65]">
                Tiers requested permissions into basic, sensitive, and restricted classifications.
                Flags mandatory security audits (e.g. Google CASA Tier 2/3) and organizational consent barriers.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-white text-[13px] font-medium">
                <Clock className="w-4 h-4 text-[#51a2ff]" />
                <span>Approval vs. Effort Timeline</span>
              </div>
              <p className="text-xs text-[#8c8c8c] leading-[1.65]">
                Explicitly distinguishes actual developer coding time (0.5h to 6h) from third-party vendor review delays (e.g., Slack directory review or HubSpot 60-install thresholds).
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-white text-[13px] font-medium">
                <Code2 className="w-4 h-4 text-[#51a2ff]" />
                <span>TypeScript SDK Scaffold</span>
              </div>
              <p className="text-xs text-[#8c8c8c] leading-[1.65]">
                Provides ready-to-run Composio SDK connection code, redirect URI validation configurations, and required environment variable manifests for your engineering team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
