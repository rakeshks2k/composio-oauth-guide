'use client';

import { useState, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import { Zap, Globe, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface GenerateFormProps {
  initialAppName?: string;
  onEventsUpdate: (events: ResearchEvent[]) => void;
  onGenerateStart: () => void;
  onGenerateComplete: (guideId: string) => void;
  onGenerateError: () => void;
}

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

  const QUICK_SUGGESTIONS = [
    { name: 'Linear', website: 'linear.app' },
    { name: 'Notion', website: 'notion.so' },
    { name: 'Salesforce', website: 'salesforce.com' },
    { name: 'Zoom', website: 'zoom.us' },
    { name: 'Spotify', website: 'spotify.com' },
  ];

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
        body: JSON.stringify({ appName: appName.trim(), appWebsite: appWebsite.trim() || undefined }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

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
              setError(event.detail || 'Generation failed');
              onGenerateError();
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      onGenerateError();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 mb-4">
            <Zap className="w-7 h-7 text-accent-teal" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Generate OAuth Guide</h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
            Enter an app name and our AI research pipeline will generate a comprehensive OAuth integration guide, including scopes, setup steps, and approval requirements.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-text-secondary mb-2">
              App Name <span className="text-accent-red">*</span>
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g., Notion, Stripe, Twitter"
              disabled={isLoading}
              className={clsx(
                'w-full px-4 py-3 rounded-lg bg-bg-secondary border text-text-primary placeholder-text-muted text-sm transition-colors',
                'focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal',
                isLoading ? 'opacity-50 cursor-not-allowed border-bg-border' : 'border-bg-border hover:border-text-muted'
              )}
            />
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent-teal" /> Try:
              </span>
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setAppName(item.name);
                    setAppWebsite(item.website);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-bg-border hover:bg-bg-border/80 text-text-secondary hover:text-accent-teal transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="appWebsite" className="block text-sm font-medium text-text-secondary mb-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                App Website
                <span className="text-text-muted font-normal">(optional)</span>
              </span>
            </label>
            <input
              id="appWebsite"
              type="text"
              value={appWebsite}
              onChange={(e) => setAppWebsite(e.target.value)}
              placeholder="e.g., notion.so or https://stripe.com"
              disabled={isLoading}
              className={clsx(
                'w-full px-4 py-3 rounded-lg bg-bg-secondary border text-text-primary placeholder-text-muted text-sm transition-colors',
                'focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal',
                isLoading ? 'opacity-50 cursor-not-allowed border-bg-border' : 'border-bg-border hover:border-text-muted'
              )}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!appName.trim() || isLoading}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all',
              !appName.trim() || isLoading
                ? 'bg-bg-border text-text-muted cursor-not-allowed'
                : 'bg-accent-teal text-bg-primary hover:bg-accent-teal/90 active:scale-[0.98]'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching & Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Guide
              </>
            )}
          </button>
        </form>

        {/* Info note */}
        <div className="mt-6 p-4 rounded-lg bg-bg-secondary border border-bg-border">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="text-text-secondary font-medium">AI Research Pipeline: </span>
            The generator uses GPT-4o to research official OAuth documentation, check Composio managed OAuth availability, identify required scopes, and structure a complete integration guide. Requires{' '}
            <code className="text-xs">OPENAI_API_KEY</code> in <code className="text-xs">.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
