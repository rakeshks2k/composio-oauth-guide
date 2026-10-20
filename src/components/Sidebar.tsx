'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Guide } from '@/lib/types';
import {
  Search,
  X,
  FileText,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

function ComposioLogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.75 8.25L12 3.5L20.25 8.25V15.75L12 20.5L3.75 15.75V8.25Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5V12M12 12L20.25 8.25M12 12L3.75 8.25M12 12V20.5M12 12L20.25 15.75M12 12L3.75 15.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

interface SidebarProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
  onGenerateClick: (prefillName?: string) => void;
  isGenerating: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  guides,
  selectedGuide,
  onSelectGuide,
  onGenerateClick,
  isGenerating,
  onCloseMobile,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredGuides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) => {
      return (
        g.appName.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.difficulty.toLowerCase().includes(q) ||
        g.recommendedPath.toLowerCase().includes(q) ||
        g.scopes.some((s) => s.scope.toLowerCase().includes(q))
      );
    });
  }, [guides, searchQuery]);

  const presetGuides = useMemo(() => filteredGuides.filter((g) => g.isPreset), [filteredGuides]);
  const recentGuides = useMemo(() => filteredGuides.filter((g) => !g.isPreset), [filteredGuides]);

  return (
    <aside className="w-[252px] flex-shrink-0 flex flex-col bg-[#141414] border-r border-[#2c2c2c] h-screen select-none text-xs">
      {/* 1. Header: Composio Logo + OAuth Guides context */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#2c2c2c]">
        <div className="flex items-center gap-2">
          <ComposioLogoMark className="w-4 h-4 text-white" />
          <span className="font-semibold text-white tracking-tight text-[13px]">Composio</span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#0d2636] border border-[#1a5676] text-[#51a2ff] tracking-wider">
            OAUTH
          </span>
        </div>
      </div>

      {/* 2. Primary Action: Generate Guide Button */}
      <div className="p-2 border-b border-[#2c2c2c]">
        <button
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'w-full h-8 px-2.5 rounded flex items-center justify-between transition-colors text-left text-xs',
            selectedGuide === null
              ? 'bg-[#1e1e1e] text-white font-medium border border-[#2c2c2c]'
              : 'bg-[#1a1a1a] hover:bg-[#222222] text-[#e0e0e0] border border-[#2c2c2c]'
          )}
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-[#51a2ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
            )}
            <span>Generate Guide</span>
          </div>
          <span className="text-[10px] font-mono text-[#51a2ff]">AI</span>
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="px-2 pt-2 pb-1">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="w-full bg-[#1a1a1a] border border-[#2c2c2c] rounded pl-8 pr-12 py-1.5 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#3a3a3a] transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#737373] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="absolute right-2 pointer-events-none text-[9px] font-mono text-[#737373] bg-[#222222] border border-[#2c2c2c] px-1 py-0.5 rounded">
              Ctrl+K
            </span>
          )}
        </div>
      </div>

      {/* 4. Navigation Links: Guide Library & Recent Guides */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {/* Section: Researched Guide Library */}
        <div className="pt-2 pb-1 px-2.5 flex items-center justify-between text-[11px] text-[#737373]">
          <span>Guide Library</span>
          <span className="font-mono text-[10px] text-[#737373]">{presetGuides.length}</span>
        </div>

        {presetGuides.map((guide) => {
          const isSelected = selectedGuide?.id === guide.id;

          return (
            <button
              key={guide.id}
              onClick={() => {
                onSelectGuide(guide);
                onCloseMobile?.();
              }}
              className={clsx(
                'w-full h-8 px-2.5 rounded flex items-center gap-2 transition-colors text-left text-xs group',
                isSelected
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-[#737373] flex-shrink-0" />
              <span className="truncate flex-1">{guide.appName}</span>
              <span className="text-[10px] text-[#737373] font-mono">
                {guide.recommendedPath === 'managed' ? 'managed' : 'custom'}
              </span>
            </button>
          );
        })}

        {/* Section: User-Generated Recent Guides */}
        {recentGuides.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-2.5 flex items-center justify-between text-[11px] text-[#737373]">
              <span>Recent Research</span>
              <span className="font-mono text-[10px] text-[#737373]">{recentGuides.length}</span>
            </div>
            {recentGuides.map((guide) => {
              const isSelected = selectedGuide?.id === guide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => {
                    onSelectGuide(guide);
                    onCloseMobile?.();
                  }}
                  className={clsx(
                    'w-full h-8 px-2.5 rounded flex items-center gap-2 transition-colors text-left text-xs group',
                    isSelected
                      ? 'bg-[#1e1e1e] text-white font-medium'
                      : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-[#737373] flex-shrink-0" />
                  <span className="truncate flex-1">{guide.appName}</span>
                  <span className="text-[10px] font-mono text-[#737373]">{guide.difficulty}</span>
                </button>
              );
            })}
          </>
        )}

        {/* Search empty state */}
        {filteredGuides.length === 0 && (
          <div className="py-4 px-2 text-center space-y-2">
            <div className="text-xs text-[#737373]">No guides for &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => {
                onGenerateClick(searchQuery.trim());
                onCloseMobile?.();
              }}
              className="w-full py-1.5 px-2 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#3a3a3a] text-white text-xs font-medium"
            >
              Generate {searchQuery}
            </button>
          </div>
        )}
      </div>

      {/* 5. Bottom Navigation: Real Official Documentation Links */}
      <div className="p-2 border-t border-[#2c2c2c] space-y-0.5">
        <a
          href="https://docs.composio.dev/toolkits/managed-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded flex items-center justify-between text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#737373]" />
            <span>Managed OAuth Docs</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#737373]" />
        </a>

        <a
          href="https://github.com/ComposioHQ/composio/blob/next/docs/content/docs/authentication/custom-app-vs-managed-app.mdx"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded flex items-center justify-between text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#737373]" />
            <span>Managed vs Custom App</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#737373]" />
        </a>

        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded flex items-center justify-between text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <span>Composio.dev</span>
          <ArrowUpRight className="w-3 h-3 text-[#737373]" />
        </a>
      </div>
    </aside>
  );
}