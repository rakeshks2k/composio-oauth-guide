'use client';

import { useState, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import { Sparkles, Globe, Terminal, ArrowRight, Loader2 } from 'lucide-react';
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
      {/* 1. Workspace Top Header */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-[#2c2c2c] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white tracking-tight">
            Generate OAuth Guide
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d2636] border border-[#1a5676] text-[#51a2ff] uppercase tracking-wider">
            AI Research Pipeline
          </span>
        </div>
      </div>

      {/* 2. Main Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight mb-1">
            Research Third-Party OAuth App
          </h1>
          <p className="text-xs text-[#a0a0a0] leading-relaxed">
            Enter an unfamiliar application or toolkit name. The research pipeline evaluates
            Composio managed auth availability, extracts scopes, identifies approval gates (CASA,
            marketplace thresholds), and produces a production guide.
          </p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="p-5 rounded-md bg-[#141414] border border-[#2c2c2c] space-y-4">
          {/* App Name Field */}
          <div>
            <label htmlFor="appName" className="block text-xs font-mono font-medium text-[#a0a0a0] mb-1.5">
              APPLICATION NAME <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Linear, Notion, Zoom, Stripe"
              disabled={isLoading}
              className="w-full h-9 px-3 rounded bg-[#1a1a1a] border border-[#2c2c2c] focus:border-[#51a2ff] text-xs text-white placeholder:text-[#737373] outline-none transition-colors font-mono"
            />

            {/* Quick 1-Click Suggestion Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-mono text-[#737373]">Try:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setAppName(item.name);
                    setAppWebsite(item.website);
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2c2c2c] text-[#a0a0a0] hover:text-[#51a2ff] hover:border-[#383838] transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Website / Documentation Domain */}
          <div>
            <label htmlFor="appWebsite" className="block text-xs font-mono font-medium text-[#a0a0a0] mb-1.5">
              OFFICIAL DOMAIN / DOCS URL <span className="text-[#737373] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="appWebsite"
                type="text"
                value={appWebsite}
                onChange={(e) => setAppWebsite(e.target.value)}
                placeholder="e.g. linear.app or https://developers.notion.com"
                disabled={isLoading}
                className="w-full h-9 pl-9 pr-3 rounded bg-[#1a1a1a] border border-[#2c2c2c] focus:border-[#51a2ff] text-xs text-white placeholder:text-[#737373] outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded bg-[#290d0d] border border-[#5e1919] text-[#ef4444] text-xs font-mono">
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!appName.trim() || isLoading}
            className={clsx(
              'h-9 px-4 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-all w-full sm:w-auto',
              !appName.trim() || isLoading
                ? 'bg-[#1e1e1e] border border-[#2c2c2c] text-[#737373] cursor-not-allowed'
                : 'bg-[#51a2ff] hover:bg-[#4090ef] text-black font-semibold active:scale-[0.98]'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Research Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Research</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Console Execution Blueprint Preview matching Composio screenshot */}
        <div className="rounded-md bg-[#141414] border border-[#2c2c2c] overflow-hidden font-mono text-xs">
          <div className="h-9 px-3 flex items-center gap-2 border-b border-[#2c2c2c] bg-[#1a1a1a] text-[#737373] text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-[#51a2ff]" />
            <span>pipeline_specs.ts</span>
          </div>
          <div className="p-3.5 text-[#a0a0a0] leading-relaxed space-y-1.5 text-[11px]">
            <div>
              <span className="text-[#f87171]">const</span>{' '}
              <span className="text-[#51a2ff]">pipeline</span> = [
            </div>
            <div className="pl-4">
              &quot;1. Discover official developer endpoints &amp; OAuth 2.0 grant types&quot;,
            </div>
            <div className="pl-4">
              &quot;2. Check Composio managed auth registry across 1,600+ toolkits&quot;,
            </div>
            <div className="pl-4">
              &quot;3. Extract required scopes &amp; classify into sensitivity tiers&quot;,
            </div>
            <div className="pl-4">
              &quot;4. Calculate external approval wait times vs. engineering effort&quot;,
            </div>
            <div className="pl-4">
              &quot;5. Output verified integration guide with clickable citations&quot;
            </div>
            <div>];</div>
          </div>
        </div>
      </div>
    </div>
  );
}