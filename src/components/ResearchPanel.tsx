'use client';

import { useState, useRef, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import { ExternalLink, Copy, Check, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ResearchPanelProps {
  events: ResearchEvent[];
  isGenerating: boolean;
  onCloseMobile?: () => void;
  onClearEvents?: () => void;
}

export function ResearchPanel({
  events,
  isGenerating,
  onClearEvents,
}: ResearchPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'sources'>('logs');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-scroll pinning to bottom without jitter
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length]);

  function copyLogLine(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  const sources = events.filter((e) => e.type === 'source' && e.url);

  return (
    <aside className="w-full h-full flex flex-col bg-[#0f0f0f] border-l border-[#222222] select-none font-mono">
      {/* 1. Header Tab Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-5 h-full">
          <button
            onClick={() => setActiveTab('logs')}
            className={clsx(
              'relative h-full flex items-center gap-1.5 text-[11.5px] font-mono font-medium transition-colors px-0.5 whitespace-nowrap flex-shrink-0 border-b-2',
              activeTab === 'logs'
                ? 'text-white border-white'
                : 'text-[#737373] hover:text-[#a1a1a1] border-transparent'
            )}
          >
            <span>Agent Activity</span>
            {events.length > 0 && (
              <span className="text-[10px] text-[#666666] font-normal">({events.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={clsx(
              'relative h-full flex items-center gap-1.5 text-[11.5px] font-mono font-medium transition-colors px-0.5 whitespace-nowrap flex-shrink-0 border-b-2',
              activeTab === 'sources'
                ? 'text-white border-white'
                : 'text-[#737373] hover:text-[#a1a1a1] border-transparent'
            )}
          >
            <span>Sources</span>
            {sources.length > 0 && (
              <span className="text-[10px] text-[#666666] font-normal">({sources.length})</span>
            )}
          </button>
        </div>

        {/* Live indicator only during active research */}
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#a1a1a1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />
            <span className="hidden sm:inline">active</span>
          </div>
        )}
      </div>

      {/* 2. Main Console Output Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 text-[12px] font-mono bg-[#0a0a0a] space-y-2.5 leading-[1.65]"
      >
        {events.length === 0 && !isGenerating && (
          <div className="pt-2 px-1 space-y-2 text-[#737373]">
            <div className="text-[#a1a1a1] font-medium text-xs flex items-center gap-1.5">
              <span className="text-[#555555]">&gt;</span>
              <span>agent standby</span>
            </div>
            <div className="text-[11.5px] leading-[1.7] text-[#666666]">
              Select a guide from the sidebar or submit an application to inspect live research queries, scope audits, and verification boundaries.
            </div>
          </div>
        )}

        {activeTab === 'logs' ? (
          <div className="space-y-1">
            {events.map((event, i) => {
              const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={`${event.timestamp}-${i}`}
                  className="group relative flex items-start gap-2.5 hover:bg-[#121212] p-1.5 -mx-1.5 rounded transition-colors text-left"
                >
                  <span className="text-[#484848] flex-shrink-0 text-[10px] font-mono mt-0.5">
                    {time}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="leading-[1.55] text-[11.5px]">
                      <span className="text-[#444444] mr-1.5">&gt;</span>
                      <span
                        className={clsx(
                          event.type === 'error' && 'text-[#f87171]',
                          event.type === 'warning' && 'text-[#cccccc]',
                          event.type === 'finding' && 'text-white font-medium',
                          event.type === 'complete' && 'text-white font-medium',
                          event.type === 'step' && 'text-[#a1a1a1]',
                          event.type === 'source' && 'text-[#888888]'
                        )}
                      >
                        {event.message}
                      </span>
                    </div>

                    {event.detail && event.type !== 'complete' && (
                      <div className="text-[10.5px] text-[#666666] pl-3.5 mt-0.5 leading-[1.5]">
                        {event.detail}
                      </div>
                    )}

                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10.5px] text-[#888888] hover:text-white hover:underline pl-3.5 mt-0.5 inline-flex items-center gap-1 font-mono"
                      >
                        <span className="truncate max-w-[240px]">{event.url}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-[#555555]" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => copyLogLine(event.message, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#555555] hover:text-white"
                    title="Copy line"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 p-1.5 text-[11px] text-[#666666]">
                <span className="text-[#555555]">&gt;</span>
                <span className="animate-pulse">agent extracting oauth requirements...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sources.length === 0 ? (
              <div className="text-xs text-[#666666] py-4 text-center">No citations recorded yet for this session.</div>
            ) : (
              sources.map((src, idx) => (
                <a
                  key={`${src.url}-${idx}`}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded bg-[#121212] border border-[#222222] hover:border-[#333333] hover:bg-[#161616] transition-colors group"
                >
                  <div className="text-white text-[12px] font-medium truncate font-sans">
                    {src.message}
                  </div>
                  <div className="text-[#666666] text-[10.5px] truncate mt-0.5 flex items-center gap-1.5 font-mono">
                    <span className="truncate">{src.url}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#555555] group-hover:text-white flex-shrink-0" />
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Terminal Toolbar */}
      <div className="h-8 px-4 border-t border-[#222222] bg-[#0d0d0d] flex items-center justify-between text-[10.5px] font-mono text-[#666666] flex-shrink-0">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <span className="text-[#a1a1a1] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />
              <span>streaming events</span>
            </span>
          ) : (
            <span>{events.length} {events.length === 1 ? 'event' : 'events'} logged</span>
          )}
        </div>

        {events.length > 0 && onClearEvents && (
          <button
            onClick={onClearEvents}
            className="flex items-center gap-1 text-[#666666] hover:text-[#a1a1a1] transition-colors cursor-pointer"
            title="Clear activity log"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </aside>
  );
}
