'use client';

import { useState, useEffect, useCallback } from 'react';
import { Guide, ResearchEvent } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { GuideView } from '@/components/GuideView';
import { GenerateForm } from '@/components/GenerateForm';
import { ResearchPanel } from '@/components/ResearchPanel';

type AppView = 'guide' | 'generate';

export default function HomePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [view, setView] = useState<AppView>('guide');
  const [researchEvents, setResearchEvents] = useState<ResearchEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prefillAppName, setPrefillAppName] = useState('');

  const fetchGuides = useCallback(async (autoSelectFirst = false) => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      const loadedGuides = (data.guides as Guide[]) || [];
      setGuides(loadedGuides);
      if (autoSelectFirst && loadedGuides.length > 0) {
        setSelectedGuide(loadedGuides[0]);
        setView('guide');
      }
    } catch (err) {
      console.error('Failed to load guides:', err);
    }
  }, []);

  // Load guides on mount
  useEffect(() => {
    fetchGuides(true);
  }, [fetchGuides]);

  function handleSelectGuide(guide: Guide) {
    setSelectedGuide(guide);
    setView('guide');
  }

  function handleGenerateClick(prefillName?: string) {
    setPrefillAppName(prefillName || '');
    setView('generate');
    setSelectedGuide(null);
    setResearchEvents([]);
  }

  function handleGenerateStart() {
    setIsGenerating(true);
    setResearchEvents([]);
  }

  const handleEventsUpdate = useCallback((events: ResearchEvent[]) => {
    setResearchEvents(events);
  }, []);

  async function handleGenerateComplete(guideId: string) {
    setIsGenerating(false);
    // Reload guides to include the newly generated one
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      const updatedGuides = (data.guides as Guide[]) || [];
      setGuides(updatedGuides);
      // Find and select the newly generated guide
      const newGuide = updatedGuides.find((g) => g.id === guideId);
      if (newGuide) {
        setSelectedGuide(newGuide);
        setView('guide');
      }
    } catch (err) {
      console.error('Failed to reload guides:', err);
    }
  }

  function handleGenerateError() {
    setIsGenerating(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Left Sidebar */}
      <Sidebar
        guides={guides}
        selectedGuide={selectedGuide}
        onSelectGuide={handleSelectGuide}
        onGenerateClick={handleGenerateClick}
        isGenerating={isGenerating}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden border-x border-bg-border">
        {view === 'guide' && selectedGuide ? (
          <GuideView guide={selectedGuide} />
        ) : view === 'generate' ? (
          <GenerateForm
            initialAppName={prefillAppName}
            onEventsUpdate={handleEventsUpdate}
            onGenerateStart={handleGenerateStart}
            onGenerateComplete={handleGenerateComplete}
            onGenerateError={handleGenerateError}
          />
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🔑</div>
              <div className="text-text-secondary text-sm">Select a guide from the sidebar or generate a new one</div>
            </div>
          </div>
        )}
      </main>

      {/* Right Research Panel */}
      <ResearchPanel events={researchEvents} isGenerating={isGenerating} />
    </div>
  );
}