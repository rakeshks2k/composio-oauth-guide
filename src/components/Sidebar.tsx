'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
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
    <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[#141414] border-r border-[#262626] h-screen select-none text-[13px]">
      {/* 1. Header: Composio Logo + OAuth Guides Context */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#262626] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={94}
            height={18}
            priority
            className="h-[18px] w-auto object-contain"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[#a1a1a1] tracking-wider">
            OAUTH
          </span>
        </div>
      </div>

      {/* 2. Primary Action: Generate Guide Button */}
      <div className="p-3 border-b border-[#262626] flex-shrink-0">
        <button
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'w-full h-8.5 px-3 rounded-md flex items-center justify-between transition-all text-left text-[12.5px]',
            selectedGuide === null
              ? 'bg-[#1e1e1e] text-white font-medium border border-[#333333] shadow-sm'
              : 'bg-[#1a1a1a] hover:bg-[#202020] text-[#e0e0e0] border border-[#262626]'
          )}
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-[#51a2ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
            )}
            <span className="font-medium">Generate Guide</span>
          </div>
          <span className="text-[10px] font-mono text-[#a1a1a1] px-1.5 py-0.5 rounded bg-[#181818] border border-[#2c2c2c]">
            AI
          </span>
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="w-full bg-[#1a1a1a] border border-[#262626] rounded-md pl-8 pr-12 py-1.5 text-[12.5px] text-white placeholder:text-[#6e6e6e] focus:outline-none focus:border-[#51a2ff] transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#737373] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="absolute right-2 pointer-events-none text-[9.5px] font-mono text-[#6e6e6e] bg-[#222222] border border-[#2c2c2c] px-1.5 py-0.5 rounded">
              Ctrl+K
            </span>
          )}
        </div>
      </div>

      {/* 4. Navigation Links: Guide Library & Recent Guides */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
        {/* Section: Researched Guide Library */}
        <div className="pt-2 pb-1 px-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#737373]">
          <span>Guide Library</span>
          <span className="text-[10px] text-[#555555]">{presetGuides.length}</span>
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
                'w-full h-8 px-2.5 rounded-md flex items-center gap-2 transition-colors text-left text-[12.5px] group',
                isSelected
                  ? 'bg-[#1f1f1f] text-white font-medium border border-[#303030]'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] border border-transparent'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#a0a0a0] flex-shrink-0" />
              <span className="truncate flex-1 tracking-tight">{guide.appName}</span>
              <span className="text-[10px] font-mono text-[#666666] group-hover:text-[#8c8c8c]">
                {guide.recommendedPath === 'managed' ? 'managed' : 'custom'}
              </span>
            </button>
          );
        })}

        {/* Section: User-Generated Recent Guides */}
        {recentGuides.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#737373]">
              <span>Recent Research</span>
              <span className="text-[10px] text-[#555555]">{recentGuides.length}</span>
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
                    'w-full h-8 px-2.5 rounded-md flex items-center gap-2 transition-colors text-left text-[12.5px] group',
                    isSelected
                      ? 'bg-[#1f1f1f] text-white font-medium border border-[#303030]'
                      : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] border border-transparent'
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#a0a0a0] flex-shrink-0" />
                  <span className="truncate flex-1 tracking-tight">{guide.appName}</span>
                  <span className="text-[10px] font-mono text-[#737373] capitalize">{guide.difficulty}</span>
                </button>
              );
            })}
          </>
        )}

        {/* Search empty state */}
        {filteredGuides.length === 0 && (
          <div className="py-5 px-3 text-center space-y-2.5">
            <div className="text-xs text-[#737373]">No guides for &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => {
                onGenerateClick(searchQuery.trim());
                onCloseMobile?.();
              }}
              className="w-full py-1.5 px-2.5 rounded-md bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#3a3a3a] text-white text-xs font-medium"
            >
              Generate {searchQuery}
            </button>
          </div>
        )}
      </div>

      {/* 5. Bottom Navigation: Real Official Documentation Links */}
      <div className="p-2.5 border-t border-[#262626] space-y-0.5 flex-shrink-0">
        <a
          href="https://docs.composio.dev/toolkits/managed-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-7.5 px-2.5 rounded flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12px]"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#666666]" />
            <span>Managed OAuth Docs</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#666666]" />
        </a>

        <a
          href="https://github.com/ComposioHQ/composio/blob/next/docs/content/docs/authentication/custom-app-vs-managed-app.mdx"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-7.5 px-2.5 rounded flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12px]"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            <span>Custom vs Managed</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#666666]" />
        </a>

        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-7.5 px-2.5 rounded flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12px]"
        >
          <span className="font-mono text-[11.5px]">composio.dev</span>
          <ArrowUpRight className="w-3 h-3 text-[#666666]" />
        </a>
      </div>
    </aside>
  );
}
