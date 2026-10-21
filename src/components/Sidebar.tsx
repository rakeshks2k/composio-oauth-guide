'use client';

import { useState, useMemo, useRef } from 'react';
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

  // Filtered guides based on search query
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
    <aside className="w-full h-full flex flex-col bg-[#111111] border-r border-[#262626] select-none">
      {/* 1. Header Bar matching Composio Platform */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#262626] bg-[#111111] flex-shrink-0">
        <a
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={88}
            height={17}
            priority
            className="h-[17px] w-auto object-contain"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#181818] border border-[#2a2a2a] text-[#a1a1a1] tracking-wide">
            OAUTH
          </span>
        </a>

        <a
          href="https://docs.composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#737373] hover:text-white transition-colors p-1"
          title="Open Composio Docs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2. Top Action: Generate Guide Button + Search Bar */}
      <div className="p-3 border-b border-[#262626] space-y-2.5">
        <button
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'w-full h-9 px-3 rounded-md flex items-center justify-between text-left text-[13px] transition-colors border select-none',
            selectedGuide === null
              ? 'bg-[#1e1e1e] border-[#333333] text-white font-medium shadow-sm'
              : 'text-[#cccccc] hover:text-white hover:bg-[#1a1a1a] border-[#262626] bg-[#141414]'
          )}
        >
          <div className="flex items-center gap-2.5">
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-[#51a2ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
            )}
            <span>Generate Guide</span>
          </div>
          <span className="text-[10px] font-mono text-[#737373] px-1.5 py-0.5 rounded bg-[#141414] border border-[#262626]">
            AI
          </span>
        </button>

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search application"
            className="w-full h-9 bg-[#181818] border border-[#262626] rounded-md pl-9 pr-8 text-[12.5px] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#51a2ff] transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-[#737373] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Navigation Links: Guide Library & Recent Guides */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {/* Section: Researched Guide Library */}
        <div className="pt-2 pb-1.5 px-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-[#737373]">
          <span>Curated Archetypes</span>
          <span className="text-[10px] font-mono text-[#555555]">{presetGuides.length}</span>
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
                'w-full h-9 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left group select-none border',
                isSelected
                  ? 'bg-[#1e1e1e] border-[#303030] text-white font-medium'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#181818]/60 border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 w-full min-w-0">
                <div className="flex-shrink-0">
                  <AppIcon name={guide.appName} size="sm" />
                </div>
                <span className="truncate flex-1 tracking-tight text-[13px]">{guide.appName}</span>
                <span className="text-[10.5px] font-mono text-[#666666] group-hover:text-[#999999] px-1.5 py-0.5 rounded bg-[#181818] border border-[#242424] flex-shrink-0">
                  {guide.recommendedPath === 'managed' ? 'managed' : 'custom'}
                </span>
              </div>
            </button>
          );
        })}

        {/* Section: User-Generated Recent Guides */}
        {recentGuides.length > 0 && (
          <>
            <div className="pt-6 pb-1.5 px-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-[#737373]">
              <span>Custom Generated</span>
              <span className="text-[10px] font-mono text-[#555555]">{recentGuides.length}</span>
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
                      'w-full h-9 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left border select-none',
                      isSelected
                        ? 'bg-[#1e1e1e] border-[#303030] text-white font-medium'
                        : 'text-[#a3a3a3] hover:text-white hover:bg-[#181818]/60 border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5 w-full min-w-0 pr-6">
                      <div className="flex-shrink-0">
                        <AppIcon name={guide.appName} size="sm" />
                      </div>
                      <span className="truncate flex-1 tracking-tight text-[13px]">{guide.appName}</span>
                      <span className="text-[10.5px] font-mono text-[#737373] capitalize px-1.5 py-0.5 rounded bg-[#181818] border border-[#242424] flex-shrink-0">
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#555555] hover:text-[#ff7b72] hover:bg-[#202020] opacity-0 group-hover/row:opacity-100 transition-opacity"
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
          <div className="p-4 text-center text-xs text-[#737373]">
            No applications match &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* 4. Footer: Composio Quick Resources */}
      <div className="p-3 border-t border-[#262626] bg-[#0e0e0e] space-y-1 text-xs">
        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[#8c8c8c] hover:text-white px-2 py-1.5 rounded transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#737373]" />
            <span>Composio Dashboard</span>
          </span>
          <ExternalLink className="w-3 h-3 text-[#737373]" />
        </a>
      </div>
    </aside>
  );
}
