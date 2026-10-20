'use client';

import { useState, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import { Globe, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
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
  { name: 'Salesforce', website: 'salesforce.com' },
  { name: 'Zoom', website: 'zoom.us' },
  { name: 'Spotify', website: 'spotify.com' },
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
      {/* 1. Header Bar */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[14px] sm:text-[15px] font-medium text-white tracking-[-0.01em]">
            Generate Guide
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#262626] bg-[#141414] text-[#a1a1a1]">
            Live AI Research
          </span>
        </div>
      </div>

      {/* 2. Form Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 max-w-3xl space-y-7">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
            Research third-party application
          </h2>
          <p className="text-[13.5px] text-[#b0b0b0] leading-[1.68]">
            Enter an application name or developer website to initiate an autonomous OAuth analysis.
            The agent evaluates Composio managed OAuth availability, audits scope sensitivity, and
            quantifies developer hands-on hours vs. external vendor approval waiting periods.
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-lg bg-[#141414] border border-[#262626] space-y-5">
          <div className="space-y-2">
            <label htmlFor="appName" className="block text-[12px] font-mono uppercase tracking-wider text-[#a0a0a0]">
              Application Name <span className="text-[#ff7b72]">*</span>
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Linear, Notion, Zoom, Salesforce, Stripe"
              disabled={isLoading}
              className="w-full h-9 px-3.5 rounded-md bg-[#1a1a1a] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#666666] outline-none transition-colors font-mono"
            />

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
              <span className="text-[11px] text-[#737373] font-mono">Suggested:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setAppName(item.name);
                    setAppWebsite(item.website);
                  }}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#282828] hover:border-[#383838] text-[#a0a0a0] hover:text-white transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="appWebsite" className="block text-[12px] font-mono uppercase tracking-wider text-[#a0a0a0]">
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
                className="w-full h-9 pl-9 pr-3.5 rounded-md bg-[#1a1a1a] border border-[#262626] focus:border-[#51a2ff] text-[13px] text-white placeholder:text-[#666666] outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[#1c1414] border border-[#5e2020] text-[#ff7b72] text-xs font-mono">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!appName.trim() || isLoading}
              className={clsx(
                'h-9 px-4 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-all',
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

        {/* Real Pipeline Stages Information */}
        <div className="p-5 sm:p-6 rounded-md bg-[#141414] border border-[#262626] space-y-3.5">
          <div className="text-[12px] font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#737373]" />
            <span>Autonomous Research Pipeline</span>
          </div>

          <div className="space-y-2 font-mono text-[11.5px] text-[#8c8c8c] leading-[1.6]">
            <div className="flex items-start gap-2.5">
              <span className="text-[#666666]">01</span>
              <span>Resolve provider domain, official developer portals, and OAuth 2.0 specs.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#666666]">02</span>
              <span>Audit Composio catalog for managed authentication availability.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#666666]">03</span>
              <span>Extract scope matrix and categorize access tiers (basic, sensitive, restricted).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#666666]">04</span>
              <span>Differentiate developer engineering hours from vendor approval calendar delays.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#666666]">05</span>
              <span>Synthesize production checklist with clickable evidence citations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
