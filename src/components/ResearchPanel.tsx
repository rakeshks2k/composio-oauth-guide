'use client';

import { useState, useRef, useEffect } from 'react';
import { ResearchEvent } from '@/lib/types';
import {
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ResearchPanelProps {
  events: ResearchEvent[];
  isGenerating: boolean;
  onCloseMobile?: () => void;
}

export function ResearchPanel({ events, isGenerating }: ResearchPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'sources'>('logs');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-scroll on new events
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
    <aside className="w-full lg:w-[32%] xl:w-[30%] min-w-[320px] max-w-[440px] flex-shrink-0 flex flex-col bg-[#0f0f0f] border-l border-[#2c2c2c] h-screen select-none relative font-mono">
      {/* Top Header Tab Bar matching Composio screenshot */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#2c2c2c] bg-[#141414]">
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={() => setActiveTab('logs')}
            className={clsx(
              'h-full flex items-center gap-1.5 text-xs font-mono font-medium transition-colors border-b-2 px-1 -mb-[1px]',
              activeTab === 'logs'
                ? 'border-[#51a2ff] text-white'
                : 'border-transparent text-[#737373] hover:text-[#a0a0a0]'
            )}
          >
            <span className="text-[#51a2ff]">&gt;_</span>
            <span>Logs</span>
            {events.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e1e1e] text-[#a0a0a0] border border-[#2c2c2c]">
                {events.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={clsx(
              'h-full flex items-center gap-1.5 text-xs font-mono font-medium transition-colors border-b-2 px-1 -mb-[1px]',
              activeTab === 'sources'
                ? 'border-[#51a2ff] text-white'
                : 'border-transparent text-[#737373] hover:text-[#a0a0a0]'
            )}
          >
            <span>Sources</span>
            {sources.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e1e1e] text-[#a0a0a0] border border-[#2c2c2c]">
                {sources.length}
              </span>
            )}
          </button>
        </div>

        {/* Live Pipeline Activity Pill */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {isGenerating ? (
            <div className="flex items-center gap-1.5 text-[#51a2ff] bg-[#0d2636] border border-[#1a5676] px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-ping" />
              <span>researching</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#737373]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Console Output Area */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono bg-[#0f0f0f] space-y-3">
        {events.length === 0 && !isGenerating && (
          <div className="pt-8 space-y-1.5">
            <div className="text-white font-medium text-xs flex items-center gap-2">
              <span className="text-[#51a2ff]">&gt;</span>
              <span>waiting for your tool calls</span>
            </div>
            <div className="text-[#737373] text-[11px] pl-4">
              run your agent code or generate a guide to see execution logs
            </div>
          </div>
        )}

        {activeTab === 'logs' ? (
          <div className="space-y-2">
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
                  className="group relative rounded p-2 bg-[#141414] border border-[#222222] hover:border-[#2c2c2c] transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className="text-[#51a2ff] flex-shrink-0">&gt;</span>
                      <span
                        className={clsx(
                          'text-[11px] leading-relaxed break-words',
                          event.type === 'error' && 'text-[#ef4444]',
                          event.type === 'warning' && 'text-[#f59e0b]',
                          event.type === 'finding' && 'text-[#51a2ff]',
                          event.type === 'complete' && 'text-[#10b981]',
                          event.type === 'step' && 'text-white',
                          event.type === 'source' && 'text-[#a0a0a0]'
                        )}
                      >
                        {event.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#737373] flex-shrink-0 font-mono">
                      {time}
                    </span>
                  </div>

                  {event.detail && event.type !== 'complete' && (
                    <div className="mt-1.5 pl-3 text-[10px] text-[#737373] border-l border-[#2c2c2c] break-all leading-normal">
                      {event.detail}
                    </div>
                  )}

                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 pl-3 flex items-center gap-1 text-[10px] text-[#51a2ff] hover:underline"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="truncate">{event.url}</span>
                    </a>
                  )}

                  {/* Copy button on hover */}
                  <button
                    onClick={() => copyLogLine(event.message, i)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-[#1e1e1e] border border-[#2c2c2c] text-[#737373] hover:text-white"
                    title="Copy line"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-2.5 h-2.5 text-[#10b981]" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 p-2 text-[11px] text-[#737373]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-bounce [animation-delay:0.3s]" />
                </div>
                <span>executing retrieval pipeline...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sources.length === 0 ? (
              <div className="text-[11px] text-[#737373] py-4">No discovered sources yet.</div>
            ) : (
              sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded bg-[#141414] border border-[#2c2c2c] hover:border-[#51a2ff] transition-colors group"
                >
                  <div className="text-white text-xs font-medium group-hover:text-[#51a2ff] transition-colors truncate">
                    {src.message}
                  </div>
                  <div className="text-[#737373] text-[10px] truncate mt-1 flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5 text-[#51a2ff]" />
                    <span>{src.url}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating Chat / Help Bubble matching Composio screenshot */}
      <button
        type="button"
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#51a2ff] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="Agent Assistant"
      >
        <MessageSquare className="w-4 h-4 text-white" />
      </button>
    </aside>
  );
}