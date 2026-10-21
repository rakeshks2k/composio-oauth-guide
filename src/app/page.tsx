'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Guide, ResearchEvent } from '@/lib/types';
import { getGuideResearchEvents } from '@/lib/research-events';
import { Sidebar } from '@/components/Sidebar';
import { GuideView } from '@/components/GuideView';
import { GenerateForm } from '@/components/GenerateForm';
import { ResearchPanel } from '@/components/ResearchPanel';
import { Menu, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

type AppView = 'guide' | 'generate';

export default function HomePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [view, setView] = useState<AppView>('generate');
  const [researchEvents, setResearchEvents] = useState<ResearchEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prefillAppName, setPrefillAppName] = useState('');

  // Mobile drawer states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileLogsOpen, setMobileLogsOpen] = useState(false);

  const fetchGuides = useCallback(async (autoSelectFirst = false) => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      const loadedGuides = (data.guides as Guide[]) || [];
      setGuides(loadedGuides);
      if (autoSelectFirst && loadedGuides.length > 0) {
        setSelectedGuide(loadedGuides[0]);
        setResearchEvents(getGuideResearchEvents(loadedGuides[0]));
        setView('guide');
      }
    } catch (err) {
      console.error('Failed to load guides:', err);
    }
  }, []);

  // Load guides on mount — user lands on 'generate' guide page first
  useEffect(() => {
    fetchGuides(false);
  }, [fetchGuides]);

  function handleSelectGuide(guide: Guide) {
    setSelectedGuide(guide);
    setResearchEvents(getGuideResearchEvents(guide));
    setView('guide');
    setMobileSidebarOpen(false);
  }

  function handleGenerateClick(prefillName?: string) {
    setPrefillAppName(prefillName || '');
    setView('generate');
    setSelectedGuide(null);
    setResearchEvents([]);
    setMobileSidebarOpen(false);
  }

  function handleGenerateStart() {
    setIsGenerating(true);
    setResearchEvents([]);
  }

  const handleEventsUpdate = useCallback((events: ResearchEvent[]) => {
    setResearchEvents(events);
  }, []);

  // Synchronous, seamless transition into newly generated guide with zero delay or flicker
  function handleGenerateComplete(newGuide: Guide) {
    setIsGenerating(false);
    setSelectedGuide(newGuide);
    setGuides((prev) => [newGuide, ...prev.filter((g) => g.id !== newGuide.id)]);
    setView('guide');
  }

  function handleGenerateError() {
    setIsGenerating(false);
  }

  async function handleDeleteGuide(guide: Guide) {
    if (guide.isPreset) return;
    try {
      await fetch(`/api/guides/${guide.id}`, { method: 'DELETE' });
      setGuides((prev) => prev.filter((g) => g.id !== guide.id));
      if (selectedGuide?.id === guide.id) {
        setSelectedGuide(null);
        setResearchEvents([]);
        setView('generate');
      }
    } catch (err) {
      console.error('Failed to delete guide:', err);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f0f] text-white">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-[#141414] border-b border-[#262626] px-4 flex items-center justify-between z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#a0a0a0] hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={84}
            height={16}
            priority
            className="h-4 w-auto object-contain"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[#a1a1a1]">
            OAUTH
          </span>
        </div>

        <button
          onClick={() => setMobileLogsOpen(!mobileLogsOpen)}
          className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#a0a0a0] hover:text-white flex items-center gap-1 text-[11px] font-mono"
        >
          <Terminal className="w-3.5 h-3.5 text-[#888888]" />
          <span>Logs</span>
        </button>
      </div>

      {/* 1. Left Sidebar (Fixed 272px on desktop, drawer on mobile) */}
      <div
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 lg:z-auto transition-transform duration-200 w-[272px] flex-shrink-0 h-screen',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar
          guides={guides}
          selectedGuide={selectedGuide}
          onSelectGuide={handleSelectGuide}
          onGenerateClick={handleGenerateClick}
          isGenerating={isGenerating}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onDeleteGuide={handleDeleteGuide}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
        />
      )}

      {/* 2. Main Workspace (Solid, Rock-Stable Center Pane with Zero Blank Flashes) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-12 lg:pt-0 min-w-0 relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {view === 'guide' && selectedGuide ? (
            <GuideView guide={selectedGuide} />
          ) : (
            <GenerateForm
              initialAppName={prefillAppName}
              onEventsUpdate={handleEventsUpdate}
              onGenerateStart={handleGenerateStart}
              onGenerateComplete={handleGenerateComplete}
              onGenerateError={handleGenerateError}
            />
          )}
        </div>
      </main>

      {/* 3. Right Activity / Research Panel (Fixed 360px-380px on desktop, drawer on mobile) */}
      <div
        className={clsx(
          'fixed lg:static inset-y-0 right-0 z-40 lg:z-auto transition-transform duration-200 w-[360px] xl:w-[380px] flex-shrink-0 h-screen',
          mobileLogsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <ResearchPanel
          events={researchEvents}
          isGenerating={isGenerating}
          onCloseMobile={() => setMobileLogsOpen(false)}
          onClearEvents={() => setResearchEvents([])}
        />
      </div>

      {/* Mobile Logs Overlay */}
      {mobileLogsOpen && (
        <div
          onClick={() => setMobileLogsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
        />
      )}
    </div>
  );
}
