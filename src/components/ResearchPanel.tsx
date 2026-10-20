'use client';

import { ResearchEvent } from '@/lib/types';
import {
  Search,
  Lightbulb,
  AlertTriangle,
  Link,
  CheckCircle,
  XCircle,
  Terminal,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

interface ResearchPanelProps {
  events: ResearchEvent[];
  isGenerating: boolean;
}

const EVENT_CONFIG: Record<
  ResearchEvent['type'],
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  step: { icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  finding: { icon: Lightbulb, color: 'text-accent-teal', bgColor: 'bg-accent-teal/10' },
  warning: { icon: AlertTriangle, color: 'text-accent-amber', bgColor: 'bg-accent-amber/10' },
  source: { icon: Link, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  complete: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  error: { icon: XCircle, color: 'text-accent-red', bgColor: 'bg-accent-red/10' },
};

export function ResearchPanel({ events, isGenerating }: ResearchPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-bg-secondary border-l border-bg-border h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">Research Pipeline</span>
          {isGenerating && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
              <span className="text-xs text-accent-teal">Live</span>
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted mt-1">Real-time events from the AI research pipeline</p>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {events.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 rounded-full bg-bg-border flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">Research events appear here</p>
            <p className="text-xs text-text-muted mt-1 max-w-48">
              Click &quot;Generate Guide&quot; to see the AI research pipeline in action
            </p>
          </div>
        )}

        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type];
          const Icon = config.icon;
          const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={i}
              className={clsx(
                'animate-slide-in rounded-lg p-3 border',
                i === events.length - 1 ? 'border-bg-border' : 'border-transparent'
              )}
            >
              <div className="flex items-start gap-2">
                <div className={clsx('w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5', config.bgColor)}>
                  <Icon className={clsx('w-3.5 h-3.5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-text-primary leading-tight">{event.message}</span>
                    <span className="text-[10px] text-text-muted flex-shrink-0 font-mono">{time}</span>
                  </div>
                  {event.detail && event.type !== 'complete' && (
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{event.detail}</p>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent-teal hover:underline mt-1 block truncate"
                    >
                      {event.url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-muted">Processing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-bg-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="w-1.5 h-1.5 rounded-full bg-bg-border" />
          <span>{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </aside>
  );
}
