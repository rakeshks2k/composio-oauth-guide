'use client';

import { useState, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import { Globe, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
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

const SAMPLE_SCHEMA_CODE = `// OAuth Guide Generation Pipeline
const guide = await researchOAuthApp({
  appName: "Linear",
  checkCatalog: "https://docs.composio.dev/toolkits",
  extractScopes: true,
  evaluateApprovals: ["CASA", "Marketplace", "Verification"],
});`;

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
  const [copiedCode, setCopiedCode] = useState(false);

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
      <div className="h-12 px-6 flex items-center justify-between border-b border-[#2c2c2c] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-white tracking-tight">
            Generate Guide
          </h1>
          <span className="text-xs text-[#737373] font-mono">
            OAuth Research Pipeline
          </span>
        </div>
      </div>

      {/* 2. Form Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-7 max-w-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-white">
            Research third-party application
          </h2>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Enter an application name to evaluate Composio managed auth availability, extract required
            scopes, and estimate production review timelines.
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleSubmit} className="p-4 rounded-md bg-[#141414] border border-[#2c2c2c] space-y-4">
          <div>
            <label htmlFor="appName" className="block text-xs font-mono text-[#a3a3a3] mb-1.5">
              App name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Linear, Notion, Zoom, Stripe"
              disabled={isLoading}
              className="w-full h-8 px-3 rounded bg-[#1a1a1a] border border-[#2c2c2c] focus:border-[#51a2ff] text-xs text-white placeholder:text-[#737373] outline-none transition-colors font-mono"
            />

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-[#737373] font-mono">Try:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setAppName(item.name);
                    setAppWebsite(item.website);
                  }}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#3a3a3a] text-[#a3a3a3] hover:text-white transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="appWebsite" className="block text-xs font-mono text-[#a3a3a3] mb-1.5">
              Official website or docs URL <span className="text-[#737373]">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="appWebsite"
                type="text"
                value={appWebsite}
                onChange={(e) => setAppWebsite(e.target.value)}
                placeholder="e.g. linear.app or https://developers.notion.com"
                disabled={isLoading}
                className="w-full h-8 pl-8 pr-3 rounded bg-[#1a1a1a] border border-[#2c2c2c] focus:border-[#51a2ff] text-xs text-white placeholder:text-[#737373] outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#ef4444]/40 text-[#ef4444] text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!appName.trim() || isLoading}
            className={clsx(
              'h-8 px-3.5 rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors',
              !appName.trim() || isLoading
                ? 'bg-[#1a1a1a] border border-[#2c2c2c] text-[#737373] cursor-not-allowed'
                : 'bg-white hover:bg-[#e0e0e0] text-black active:scale-[0.98]'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate guide</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </form>

        {/* Code Preview matching Composio Getting Started */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-white">Pipeline execution definition</div>
          <div className="rounded-md bg-[#141414] border border-[#2c2c2c] overflow-hidden font-mono text-xs">
            <div className="h-9 px-3.5 flex items-center justify-between border-b border-[#2c2c2c] bg-[#171717] text-[#737373]">
              <span>research.ts</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SAMPLE_SCHEMA_CODE);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                }}
                className="hover:text-white"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-3.5 text-[#e0e0e0] leading-relaxed">
              <pre className="whitespace-pre font-mono">{SAMPLE_SCHEMA_CODE}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}