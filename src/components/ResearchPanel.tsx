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
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'sources'>('logs');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  function copyLogLine(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  const sources = events.filter((e) => e.type === 'source' && e.url);

  return (
    <aside className="w-full lg:w-[32%] xl:w-[30%] min-w-[320px] max-w-[440px] flex-shrink-0 flex flex-col bg-[#0f0f0f] border-l border-[#262626] h-screen select-none font-mono">
      {/* 1. Header Tab Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={() => setActiveTab('logs')}
            className={clsx(
              'h-full flex items-center gap-1.5 text-[12px] font-mono font-medium transition-colors border-b-2 px-1 -mb-[1px]',
              activeTab === 'logs'
                ? 'border-white text-white'
                : 'border-transparent text-[#737373] hover:text-[#a3a3a3]'
            )}
          >
            <span>&gt;_</span>
            <span>Research Activity</span>
            {events.length > 0 && (
              <span className="text-[10px] text-[#737373]">({events.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={clsx(
              'h-full flex items-center gap-1.5 text-[12px] font-mono font-medium transition-colors border-b-2 px-1 -mb-[1px]',
              activeTab === 'sources'
                ? 'border-white text-white'
                : 'border-transparent text-[#737373] hover:text-[#a3a3a3]'
            )}
          >
            <span>Citations</span>
            {sources.length > 0 && (
              <span className="text-[10px] text-[#737373]">({sources.length})</span>
            )}
          </button>
        </div>

        {/* Action / Status */}
        <div className="flex items-center gap-2">
          {events.length > 0 && onClearEvents && (
            <button
              onClick={onClearEvents}
              className="text-[#737373] hover:text-white p-1 rounded transition-colors"
              title="Clear activity log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="text-[11px] font-mono">
            {isGenerating ? (
              <span className="text-[#51a2ff] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-ping" />
                researching
              </span>
            ) : (
              <span className="text-[#555555]">idle</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Console Output Area */}
      <div className="flex-1 overflow-y-auto p-4 text-[12px] font-mono bg-[#0f0f0f] space-y-2.5 leading-[1.65]">
        {events.length === 0 && !isGenerating && (
          <div className="pt-8 px-2 space-y-3 text-[#737373]">
            <div className="text-white font-medium text-[12.5px] flex items-center gap-2">
              <span className="text-[#51a2ff]">&gt;</span>
              <span>oauth-research-agent ready</span>
            </div>
            <div className="text-[11.5px] leading-[1.7] text-[#737373]">
              Generate a guide to observe live provider documentation queries, scope sensitivity audits,
              verification requirements, and architectural path recommendations.
            </div>
          </div>
        )}

        {activeTab === 'logs' ? (
          <div className="space-y-1.5">
            {events.map((event, i) => {
              const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={i}
                  className="group relative flex items-start gap-2.5 hover:bg-[#141414] p-2 -mx-2 rounded-md transition-colors text-left"
                >
                  <span className="text-[#555555] flex-shrink-0 text-[10.5px] font-mono mt-0.5">
                    {time}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="leading-[1.6] text-[12px]">
                      <span className="text-[#666666] mr-1.5">&gt;</span>
                      <span
                        className={clsx(
                          event.type === 'error' && 'text-[#ff7b72] font-medium',
                          event.type === 'warning' && 'text-[#f59e0b]',
                          event.type === 'finding' && 'text-white font-medium',
                          event.type === 'complete' && 'text-[#7ee787] font-semibold',
                          event.type === 'step' && 'text-[#d4d4d4]',
                          event.type === 'source' && 'text-[#79c0ff]'
                        )}
                      >
                        {event.message}
                      </span>
                    </div>

                    {event.detail && event.type !== 'complete' && (
                      <div className="text-[11px] text-[#737373] pl-3.5 mt-1 leading-[1.5]">
                        {event.detail}
                      </div>
                    )}

                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#51a2ff] hover:underline pl-3.5 mt-1 inline-flex items-center gap-1 font-mono"
                      >
                        <span className="truncate max-w-[240px]">{event.url}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => copyLogLine(event.message, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#737373] hover:text-white"
                    title="Copy line"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3 h-3 text-[#7ee787]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 p-2 text-[11.5px] text-[#737373]">
                <span className="text-[#51a2ff]">&gt;</span>
                <span className="animate-pulse">agent extracting oauth scopes &amp; review criteria...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sources.length === 0 ? (
              <div className="text-xs text-[#737373] py-4 text-center">No discovered citations yet.</div>
            ) : (
              sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-md bg-[#141414] border border-[#262626] hover:border-[#383838] transition-colors group"
                >
                  <div className="text-white text-[12.5px] font-medium truncate font-sans">
                    {src.message}
                  </div>
                  <div className="text-[#737373] text-[11px] truncate mt-1 flex items-center gap-1.5 font-mono">
                    <span className="truncate">{src.url}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#737373] group-hover:text-[#51a2ff] flex-shrink-0" />
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </aside>
  );
}
