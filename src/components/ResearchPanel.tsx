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
    <aside className="w-full lg:w-[32%] xl:w-[30%] min-w-[320px] max-w-[440px] flex-shrink-0 flex flex-col bg-[#0f0f0f] border-l border-[#2c2c2c] h-screen select-none font-mono">
      {/* 1. Header Tab Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#2c2c2c] bg-[#0f0f0f] flex-shrink-0">
        <div className="flex items-center gap-5 h-full">
          <button
            onClick={() => setActiveTab('logs')}
            className={clsx(
              'h-full flex items-center gap-1.5 text-xs font-mono font-medium transition-colors border-b-2 px-0.5 -mb-[1px]',
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
              'h-full flex items-center gap-1.5 text-xs font-mono font-medium transition-colors border-b-2 px-0.5 -mb-[1px]',
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
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          <div className="text-[11px] font-mono text-[#737373]">
            {isGenerating ? (
              <span className="text-[#51a2ff]">researching...</span>
            ) : (
              <span>ready</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Console Output Area */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono bg-[#0f0f0f] space-y-2">
        {events.length === 0 && !isGenerating && (
          <div className="pt-6 space-y-2 text-[#737373]">
            <div className="text-white font-medium text-xs">
              &gt; waiting for research workflow
            </div>
            <div className="text-[11px] leading-relaxed">
              When you generate an OAuth guide, real-time agent operations, official documentation queries,
              scope classifications, and approval policy evaluations will stream here.
            </div>
          </div>
        )}

        {activeTab === 'logs' ? (
          <div className="space-y-1.5 text-xs">
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
                  className="group relative flex items-start gap-2 hover:bg-[#141414] p-1.5 -mx-1.5 rounded transition-colors text-left"
                >
                  <span className="text-[#737373] flex-shrink-0 text-[11px]">{time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="leading-relaxed">
                      <span className="text-[#737373] mr-1.5">&gt;</span>
                      <span
                        className={clsx(
                          'text-xs',
                          event.type === 'error' && 'text-[#ef4444]',
                          event.type === 'warning' && 'text-[#a3a3a3]',
                          event.type === 'finding' && 'text-white font-medium',
                          event.type === 'complete' && 'text-[#10b981]',
                          event.type === 'step' && 'text-[#e0e0e0]',
                          event.type === 'source' && 'text-[#737373]'
                        )}
                      >
                        {event.message}
                      </span>
                    </div>

                    {event.detail && event.type !== 'complete' && (
                      <div className="text-[11px] text-[#737373] pl-3 mt-0.5 leading-normal">
                        {event.detail}
                      </div>
                    )}

                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#51a2ff] hover:underline pl-3 mt-0.5 inline-flex items-center gap-1"
                      >
                        <span>{event.url}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => copyLogLine(event.message, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#737373] hover:text-white"
                    title="Copy line"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3 h-3 text-[#10b981]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 p-1.5 text-[11px] text-[#737373]">
                <span className="text-[#51a2ff]">&gt;</span>
                <span>agent analyzing provider requirements...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sources.length === 0 ? (
              <div className="text-xs text-[#737373] py-4">No discovered citations yet.</div>
            ) : (
              sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded bg-[#141414] border border-[#2c2c2c] hover:border-[#383838] transition-colors group"
                >
                  <div className="text-white text-xs truncate">
                    {src.message}
                  </div>
                  <div className="text-[#737373] text-[11px] truncate mt-0.5 flex items-center gap-1">
                    <span>{src.url}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#737373] group-hover:text-[#51a2ff]" />
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