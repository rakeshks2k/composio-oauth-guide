'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Guide } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';
import {
  Search,
  X,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SidebarProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
  onGenerateClick: (prefillName?: string) => void;
  isGenerating: boolean;
  onCloseMobile?: () => void;
  onDeleteGuide?: (guide: Guide) => void;
}

export function Sidebar({
  guides,
  selectedGuide,
  onSelectGuide,
  onGenerateClick,
  isGenerating,
  onCloseMobile,
  onDeleteGuide,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    <aside className="w-full h-full flex flex-col bg-[#141414] border-r border-[#262626] select-none text-[13px]">
      {/* 1. Header: Composio Logo + OAuth Badge (Strict 48px height aligned with center & right headers) */}
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

      {/* 2. Primary Actions & Search Area */}
      <div className="p-3 space-y-2 border-b border-[#262626] flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'relative w-full h-9 px-3 rounded-md flex items-center justify-between transition-all text-left text-[13px]',
            selectedGuide === null
              ? 'text-white font-medium'
              : 'text-[#e0e0e0] hover:bg-[#202020] border border-[#262626] bg-[#181818]'
          )}
        >
          {selectedGuide === null && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute inset-0 rounded-md bg-[#1e1e1e] border border-[#333333] shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-[#51a2ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
              )}
              <span className="font-medium">Generate Guide</span>
            </div>
            <span className="text-[10px] font-mono text-[#737373] px-1.5 py-0.5 rounded bg-[#141414] border border-[#262626]">
              AI
            </span>
          </div>
        </motion.button>

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search application"
            className="w-full h-9 bg-[#181818] border border-[#262626] rounded-md pl-9 pr-8 text-[12.5px] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#51a2ff] transition-colors"
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
            <motion.button
              key={guide.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelectGuide(guide);
                onCloseMobile?.();
              }}
              className={clsx(
                'relative w-full h-9 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left group',
                isSelected
                  ? 'text-white font-medium'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#181818]/60'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-md bg-[#1e1e1e] border border-[#303030]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2.5 w-full min-w-0">
                <div className="transition-transform duration-150 group-hover:scale-105 flex-shrink-0">
                  <AppIcon name={guide.appName} size="sm" />
                </div>
                <span className="truncate flex-1 tracking-tight text-[13px]">{guide.appName}</span>
                <span className="text-[10.5px] font-mono text-[#666666] group-hover:text-[#999999] px-1.5 py-0.5 rounded bg-[#181818] border border-[#242424] flex-shrink-0">
                  {guide.recommendedPath === 'managed' ? 'managed' : 'custom'}
                </span>
              </div>
            </motion.button>
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
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectGuide(guide);
                      onCloseMobile?.();
                    }}
                    className={clsx(
                      'relative w-full h-9 px-2.5 rounded-md flex items-center gap-2.5 transition-colors text-left',
                      isSelected
                        ? 'text-white font-medium'
                        : 'text-[#a3a3a3] hover:text-white hover:bg-[#181818]/60'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 rounded-md bg-[#1e1e1e] border border-[#303030]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2.5 w-full min-w-0 pr-6">
                      <div className="transition-transform duration-150 group-hover:scale-105 flex-shrink-0">
                        <AppIcon name={guide.appName} size="sm" />
                      </div>
                      <span className="truncate flex-1 tracking-tight text-[13px]">{guide.appName}</span>
                      <span className="text-[10.5px] font-mono text-[#737373] capitalize px-1.5 py-0.5 rounded bg-[#181818] border border-[#242424] flex-shrink-0">
                        {guide.difficulty}
                      </span>
                    </div>
                  </motion.button>

                  {/* Delete button — only visible on hover, only for non-preset */}
                  {onDeleteGuide && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGuide(guide);
                      }}
                      title="Delete guide"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity p-1 rounded text-[#555555] hover:text-[#ef4444] hover:bg-[#1c1010]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Search empty state */}
        {filteredGuides.length === 0 && (
          <div className="py-6 px-3 text-center space-y-2.5">
            <div className="text-xs text-[#737373]">No guides found for &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => {
                onGenerateClick(searchQuery.trim());
                onCloseMobile?.();
              }}
              className="w-full py-2 px-2.5 rounded-md bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#3a3a3a] text-white text-xs font-medium"
            >
              Generate guide for &quot;{searchQuery}&quot; →
            </button>
          </div>
        )}
      </div>

      {/* 4. Bottom Navigation: Real Official Documentation Links */}
      <div className="p-3.5 border-t border-[#262626] space-y-1 flex-shrink-0 bg-[#141414]">
        <div className="px-2 pt-0.5 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-[#666666]">
          Resources
        </div>
        <a
          href="https://docs.composio.dev/toolkits/managed-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded-md flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12.5px]"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#666666]" />
            <span>Managed OAuth Docs</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#555555]" />
        </a>

        <a
          href="https://github.com/ComposioHQ/composio/blob/next/docs/content/docs/authentication/custom-app-vs-managed-app.mdx"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded-md flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12.5px]"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            <span>Custom vs Managed</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#555555]" />
        </a>

        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded-md flex items-center justify-between text-[#8c8c8c] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[12.5px]"
        >
          <span className="font-mono text-[12px]">composio.dev</span>
          <ArrowUpRight className="w-3 h-3 text-[#555555]" />
        </a>
      </div>
    </aside>
  );
}
