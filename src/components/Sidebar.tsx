'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Guide } from '@/lib/types';
import { FileText, Hash, Circle, Plus, ChevronRight, Clock, Zap, BookOpen, Search, X } from 'lucide-react';
import { clsx } from 'clsx';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const PRESET_APP_ICONS: Record<string, React.ReactNode> = {
  'google-drive': <FileText className="w-4 h-4 text-blue-400" />,
  'slack': <Hash className="w-4 h-4 text-purple-400" />,
  'github': <GithubIcon className="w-4 h-4 text-text-secondary" />,
  'hubspot': <Circle className="w-4 h-4 text-orange-400" />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'easy': 'text-green-400 bg-green-400/10 border-green-400/20',
  'medium': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'hard': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'very-hard': 'text-accent-red bg-accent-red/10 border-accent-red/20',
};

interface SidebarProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
  onGenerateClick: (prefillName?: string) => void;
  isGenerating: boolean;
}

export function Sidebar({
  guides,
  selectedGuide,
  onSelectGuide,
  onGenerateClick,
  isGenerating,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered guides based on search query
  const filteredGuides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) => {
      const matchName = g.appName.toLowerCase().includes(q);
      const matchSlug = g.slug.toLowerCase().includes(q);
      const matchSummary = g.summary.toLowerCase().includes(q);
      const matchDifficulty = g.difficulty.toLowerCase().includes(q);
      const matchPath = g.recommendedPath.toLowerCase().includes(q);
      const matchScopes = g.scopes.some((s) => s.scope.toLowerCase().includes(q));
      return matchName || matchSlug || matchSummary || matchDifficulty || matchPath || matchScopes;
    });
  }, [guides, searchQuery]);

  const presetGuides = useMemo(() => filteredGuides.filter((g) => g.isPreset), [filteredGuides]);
  const recentGuides = useMemo(() => filteredGuides.filter((g) => !g.isPreset), [filteredGuides]);

  function GuideItem({ guide }: { guide: Guide }) {
    const isSelected = selectedGuide?.id === guide.id;
    const icon = PRESET_APP_ICONS[guide.slug] ?? (
      <div className="w-4 h-4 rounded bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[10px] font-bold">
        {guide.appName.charAt(0).toUpperCase()}
      </div>
    );

    return (
      <button
        onClick={() => onSelectGuide(guide)}
        className={clsx(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group',
          isSelected
            ? 'bg-accent-teal/10 border border-accent-teal/30 text-text-primary shadow-sm'
            : 'hover:bg-bg-border/60 text-text-secondary hover:text-text-primary border border-transparent'
        )}
      >
        <span className="flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{guide.appName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={clsx('text-[9px] px-1.5 py-0.5 rounded font-medium border uppercase tracking-wide', DIFFICULTY_COLORS[guide.difficulty])}>
              {guide.difficulty === 'very-hard' ? 'Very Hard' : guide.difficulty}
            </span>
            {guide.composioManaged && (
              <span className="text-[10px] text-accent-teal font-medium flex items-center gap-0.5">
                <span>✓</span> Managed
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={clsx('w-3.5 h-3.5 flex-shrink-0 transition-opacity', isSelected ? 'opacity-100 text-accent-teal' : 'opacity-0 group-hover:opacity-60')} />
      </button>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-bg-secondary border-r border-bg-border h-screen overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent-teal" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary tracking-tight">OAuth Guides</div>
            <div className="text-[11px] text-text-muted flex items-center gap-1">
              <span>for</span>
              <span className="text-accent-teal font-medium">Composio</span>
              <span>Toolkits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Search Area */}
      <div className="p-3 space-y-2.5 border-b border-bg-border/80">
        {/* Generate CTA Button */}
        <button
          onClick={() => onGenerateClick()}
          disabled={isGenerating}
          className={clsx(
            'w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-all shadow-sm',
            isGenerating
              ? 'bg-accent-teal/20 text-accent-teal cursor-not-allowed'
              : 'bg-accent-teal text-bg-primary hover:bg-accent-teal/90 active:scale-[0.98]'
          )}
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
              <span>Researching...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Generate New Guide</span>
            </>
          )}
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides... (/)"
            className="w-full bg-bg-primary border border-bg-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Guide Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Search results notice if filtering */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between px-1 text-[11px] text-text-muted">
            <span>Matching &quot;{searchQuery}&quot;</span>
            <span className="font-mono text-accent-teal">{filteredGuides.length} found</span>
          </div>
        )}

        {/* No results empty state */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-6 px-2 space-y-3">
            <div className="text-text-muted text-xs">No guides matching &quot;{searchQuery}&quot;</div>
            <button
              onClick={() => onGenerateClick(searchQuery.trim())}
              className="w-full text-xs text-accent-teal hover:underline flex items-center justify-center gap-1 bg-accent-teal/10 border border-accent-teal/20 rounded-md py-2 px-3"
            >
              <Plus className="w-3 h-3" />
              <span>Generate {searchQuery} Guide</span>
            </button>
          </div>
        )}

        {/* Preset Guides (Searchable Library) */}
        {presetGuides.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Verified Guides
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">{presetGuides.length}</span>
            </div>
            <div className="space-y-1">
              {presetGuides.map((guide) => (
                <GuideItem key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        )}

        {/* User-generated / Recent Guides */}
        {recentGuides.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2 pt-2 border-t border-bg-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Generated Guides
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">{recentGuides.length}</span>
            </div>
            <div className="space-y-1">
              {recentGuides.map((guide) => (
                <GuideItem key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-bg-border bg-bg-secondary/50 text-[10px] text-text-muted flex items-center justify-between">
        <span>100+ App Architecture</span>
        <span className="font-mono text-accent-teal/80">SQLite Ready</span>
      </div>
    </aside>
  );
}