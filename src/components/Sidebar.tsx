'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Guide } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Sparkles,
  Search,
  ExternalLink,
  BookOpen,
  X,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
  onGenerateClick: (appName?: string) => void;
  isGenerating?: boolean;
  onCloseMobile?: () => void;
  onDeleteGuide?: (guide: Guide) => void;
}

export function Sidebar({
  guides,
  selectedGuide,
  onSelectGuide,
  onGenerateClick,
  isGenerating = false,
  onCloseMobile,
  onDeleteGuide,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' or Ctrl/Cmd+K to focus search
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
    let result = guides;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.appName.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q)
      );
    }

    return result;
  }, [guides, searchQuery]);

  const presetGuides = filteredGuides.filter((g) => g.isPreset);
  const recentGuides = filteredGuides.filter((g) => !g.isPreset);

  return (
    <aside className="w-full h-full flex flex-col bg-[#0f0f0f] border-r border-[#222222] select-none">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        <a
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={86}
            height={16}
            priority
            className="h-[16px] w-auto object-contain"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#161616] border border-[#242424] text-[#888888] tracking-wide">
            OAUTH
          </span>
        </a>

        <a
          href="https://docs.composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#666666] hover:text-white transition-colors p-1"
          title="Open Composio Documentation"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2. Top Action: Generate Guide Button + Search Bar */}
      <div className="p-3 border-b border-[#222222] space-y-2">
        <button
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'w-full h-8 px-2.5 rounded-md flex items-center justify-between text-left text-xs transition-colors border select-none cursor-pointer',
            selectedGuide === null
              ? 'bg-[#181818] border-[#2c2c2c] text-white font-medium'
              : 'text-[#cccccc] hover:text-white hover:bg-[#141414] border-[#222222] bg-[#121212]'
          )}
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#888888] flex-shrink-0" />
            )}
            <span>Generate Guide</span>
          </div>
          <span className="text-[10px] font-mono text-[#666666] px-1 py-0.2 rounded bg-[#161616] border border-[#242424]">
            AI
          </span>
        </button>

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#666666] absolute left-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search application"
            className="w-full h-8 bg-[#141414] border border-[#222222] rounded-md pl-8 pr-7 text-xs text-white placeholder:text-[#555555] focus:outline-none focus:border-[#333333] transition-colors font-sans"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#666666] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="absolute right-2 text-[10px] font-mono text-[#555555] px-1 rounded bg-[#181818] border border-[#262626] pointer-events-none">
              /
            </span>
          )}
        </div>
      </div>

      {/* 3. Navigation Links: Guide Library & Recent Guides */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1">
        {/* Section: Researched Guide Library */}
        <div className="pt-1.5 pb-1 px-2.5 flex items-center justify-between text-[11px] font-mono text-[#666666]">
          <span>Curated Archetypes</span>
          <span className="text-[10px]">{presetGuides.length}</span>
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
                'w-full h-8 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left group select-none border cursor-pointer',
                isSelected
                  ? 'bg-[#181818] border-[#2c2c2c] text-white font-medium'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414] border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 w-full min-w-0">
                <div className="flex-shrink-0">
                  <AppIcon name={guide.appName} size="sm" />
                </div>
                <span className="truncate flex-1 tracking-tight text-xs">{guide.appName}</span>
                <span className="text-[10px] font-mono text-[#666666] px-1.5 py-0.5 rounded bg-[#141414] border border-[#202020] flex-shrink-0">
                  {guide.recommendedPath === 'managed' ? 'managed' : 'custom'}
                </span>
              </div>
            </button>
          );
        })}

        {/* Section: User-Generated Recent Guides */}
        {recentGuides.length > 0 && (
          <>
            <div className="pt-5 pb-1 px-2.5 flex items-center justify-between text-[11px] font-mono text-[#666666]">
              <span>Custom Generated</span>
              <span className="text-[10px]">{recentGuides.length}</span>
            </div>
            {recentGuides.map((guide) => {
              const isSelected = selectedGuide?.id === guide.id;
              return (
                <div key={guide.id} className="relative group/row">
                  <button
                    onClick={() => {
                      onSelectGuide(guide);
                      onCloseMobile?.();
                    }}
                    className={clsx(
                      'w-full h-8 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left border select-none cursor-pointer',
                      isSelected
                        ? 'bg-[#181818] border-[#2c2c2c] text-white font-medium'
                        : 'text-[#888888] hover:text-white hover:bg-[#141414] border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5 w-full min-w-0 pr-6">
                      <div className="flex-shrink-0">
                        <AppIcon name={guide.appName} size="sm" />
                      </div>
                      <span className="truncate flex-1 tracking-tight text-xs">{guide.appName}</span>
                      <span className="text-[10px] font-mono text-[#666666] capitalize px-1.5 py-0.5 rounded bg-[#141414] border border-[#202020] flex-shrink-0">
                        {guide.difficulty}
                      </span>
                    </div>
                  </button>

                  {/* Delete button — only visible on hover, only for non-preset */}
                  {onDeleteGuide && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGuide(guide);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#555555] hover:text-[#ff7b72] hover:bg-[#1c1c1c] opacity-0 group-hover/row:opacity-100 transition-opacity"
                      title="Delete saved guide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Empty state for search */}
        {filteredGuides.length === 0 && (
          <div className="p-3 text-center text-xs text-[#666666] space-y-2">
            <div>No applications match &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => {
                onGenerateClick(searchQuery);
                onCloseMobile?.();
              }}
              className="text-xs text-white hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Generate for &quot;{searchQuery}&quot;</span>
              <Sparkles className="w-3 h-3 text-[#51a2ff]" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Footer: Composio Quick Resources */}
      <div className="p-2.5 border-t border-[#222222] bg-[#0c0c0c] text-xs">
        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[#737373] hover:text-white px-2 py-1.5 rounded transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#555555]" />
            <span>Composio Dashboard</span>
          </span>
          <ExternalLink className="w-3 h-3 text-[#555555]" />
        </a>
      </div>
    </aside>
  );
}
