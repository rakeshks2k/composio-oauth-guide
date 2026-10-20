'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Guide } from '@/lib/types';
import {
  BookOpen,
  Plus,
  Search,
  X,
  FileText,
  Hash,
  Circle,
  HelpCircle,
  ArrowUpRight,
  Settings,
  ChevronDown,
  ChevronsUpDown,
  KeyRound,
  Zap,
  Activity,
  Sparkles,
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

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const PRESET_APP_ICONS: Record<string, React.ReactNode> = {
  'google-drive': <FileText className="w-3.5 h-3.5 text-[#51a2ff]" />,
  'slack': <Hash className="w-3.5 h-3.5 text-[#a855f7]" />,
  'github': <GithubIcon className="w-3.5 h-3.5 text-[#e0e0e0]" />,
  'hubspot': <Circle className="w-3.5 h-3.5 text-[#f97316]" />,
};

interface SidebarProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
  onGenerateClick: (prefillName?: string) => void;
  isGenerating: boolean;
  onOpenDocs?: () => void;
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

  // Keyboard shortcut Ctrl+K or / to focus search
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
      {/* 1. Header: Composio Logo + PLATFORM Badge */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#2c2c2c]">
        <div className="flex items-center gap-2">
          <ComposioLogoMark className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-tight text-[13px]">Composio</span>
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#0d2636] border border-[#1a5676] text-[#51a2ff] tracking-wider">
            PLATFORM
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
      </div>

      {/* 2. Project Selector Card */}
      <div className="p-2 border-b border-[#2c2c2c]">
        <div className="p-2 rounded-md bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#383838] transition-colors flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[#10b981] text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0">
              R
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] text-[#737373] uppercase tracking-wider font-medium leading-none mb-0.5">
                Project
              </div>
              <div className="text-[11px] text-white font-mono font-medium truncate leading-tight">
                oauth_workspace_prod
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-[#737373] flex-shrink-0 ml-1" />
        </div>
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
            placeholder="Search"
            className="w-full bg-[#1a1a1a] border border-[#2c2c2c] rounded-md pl-8 pr-12 py-1.5 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#51a2ff] transition-colors"
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

      {/* 4. Navigation Links (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {/* Core Actions */}
        <button
          onClick={() => {
            onGenerateClick();
            onCloseMobile?.();
          }}
          disabled={isGenerating}
          className={clsx(
            'w-full h-8 px-2.5 rounded-md flex items-center gap-2 transition-colors text-left font-medium',
            selectedGuide === null
              ? 'bg-[#1e1e1e] text-white'
              : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
          )}
        >
          {isGenerating ? (
            <div className="w-3.5 h-3.5 border-2 border-[#51a2ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
          )}
          <span className="truncate">Generate Guide</span>
          <span className="ml-auto text-[9px] font-mono text-[#51a2ff] bg-[#0d2636] border border-[#1a5676] px-1 py-0.2 rounded">
            AI
          </span>
        </button>

        {/* Section Divider */}
        <div className="pt-2 pb-1 px-2.5 flex items-center justify-between text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
          <span>Verified Toolkits</span>
          <span className="font-mono text-[9px] text-[#737373]">{presetGuides.length}</span>
        </div>

        {/* Preset Guides */}
        {presetGuides.map((guide) => {
          const isSelected = selectedGuide?.id === guide.id;
          const icon = PRESET_APP_ICONS[guide.slug] ?? <BookOpen className="w-3.5 h-3.5 text-[#737373]" />;

          return (
            <button
              key={guide.id}
              onClick={() => {
                onSelectGuide(guide);
                onCloseMobile?.();
              }}
              className={clsx(
                'w-full h-8 px-2.5 rounded-md flex items-center gap-2 transition-colors text-left group',
                isSelected
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
              )}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span className="truncate flex-1">{guide.appName}</span>
              {guide.composioManaged && (
                <span className="text-[9px] text-[#51a2ff] font-mono">managed</span>
              )}
            </button>
          );
        })}

        {/* Generated Guides Section */}
        {recentGuides.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-2.5 flex items-center justify-between text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
              <span>Custom Researched</span>
              <span className="font-mono text-[9px] text-[#737373]">{recentGuides.length}</span>
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
                    'w-full h-8 px-2.5 rounded-md flex items-center gap-2 transition-colors text-left group',
                    isSelected
                      ? 'bg-[#1e1e1e] text-white font-medium'
                      : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
                  )}
                >
                  <div className="w-3.5 h-3.5 rounded bg-[#1e1e1e] text-[#51a2ff] flex items-center justify-center text-[9px] font-bold border border-[#2c2c2c]">
                    {guide.appName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate flex-1">{guide.appName}</span>
                  <span className="text-[9px] font-mono text-[#737373]">{guide.difficulty}</span>
                </button>
              );
            })}
          </>
        )}

        {/* No Results Fallback */}
        {filteredGuides.length === 0 && (
          <div className="py-4 px-2 text-center space-y-2">
            <div className="text-[11px] text-[#737373]">No guides for &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => {
                onGenerateClick(searchQuery.trim());
                onCloseMobile?.();
              }}
              className="w-full py-1.5 px-2 rounded bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#51a2ff] text-[#51a2ff] text-[11px] font-medium flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Generate {searchQuery}</span>
            </button>
          </div>
        )}

        {/* Additional Platform Links matching Composio screenshot */}
        <div className="pt-3 pb-1 px-2.5 text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
          <span>Platform</span>
        </div>

        <div className="w-full h-8 px-2.5 rounded-md flex items-center gap-2 text-[#737373] hover:text-[#a0a0a0] transition-colors cursor-default">
          <KeyRound className="w-3.5 h-3.5 text-[#737373]" />
          <span>Auth Configs</span>
          <span className="ml-auto text-[9px] font-mono text-[#737373]">OAuth</span>
        </div>

        <div className="w-full h-8 px-2.5 rounded-md flex items-center gap-2 text-[#737373] hover:text-[#a0a0a0] transition-colors cursor-default">
          <Zap className="w-3.5 h-3.5 text-[#737373]" />
          <span>Triggers</span>
        </div>

        <div className="w-full h-8 px-2.5 rounded-md flex items-center gap-2 text-[#737373] hover:text-[#a0a0a0] transition-colors cursor-default">
          <Activity className="w-3.5 h-3.5 text-[#737373]" />
          <span>Tool Router Logs</span>
        </div>
      </div>

      {/* 5. Bottom Navigation: Support, Documentation, Settings */}
      <div className="p-2 border-t border-[#2c2c2c] space-y-0.5">
        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded-md flex items-center gap-2 text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#737373]" />
          <span>Support</span>
        </a>

        <a
          href="https://docs.composio.dev/toolkits/managed-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-2.5 rounded-md flex items-center justify-between text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#737373]" />
            <span>Documentation</span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-[#737373]" />
        </a>

        <div className="w-full h-8 px-2.5 rounded-md flex items-center gap-2 text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          <Settings className="w-3.5 h-3.5 text-[#737373]" />
          <span>Settings</span>
        </div>
      </div>

      {/* 6. User Account Footer matching Composio screenshot */}
      <div className="p-2 border-t border-[#2c2c2c]">
        <div className="p-1.5 rounded-md hover:bg-[#1a1a1a] transition-colors flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#10b981] text-black font-semibold text-[11px] flex items-center justify-center flex-shrink-0">
              R
            </div>
            <div className="min-w-0">
              <div className="text-xs text-white font-medium truncate leading-tight">
                Ryan Kane
              </div>
              <div className="text-[10px] text-[#737373] truncate leading-tight">
                ryan_workspace
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-[#737373] flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}