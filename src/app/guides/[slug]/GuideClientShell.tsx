'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Guide } from '@/lib/types';
import { GuideView } from '@/components/GuideView';
import { AppIcon } from '@/components/AppIcon';
import { decodeGuide, saveStoredGuide, findStoredGuide } from '@/lib/guide-codec';

interface GuideClientShellProps {
  initialGuide: Guide | null;
  slug: string;
}

export function GuideClientShell({ initialGuide, slug }: GuideClientShellProps) {
  const [guide, setGuide] = useState<Guide | null>(initialGuide);
  const [loading, setLoading] = useState<boolean>(!initialGuide);

  useEffect(() => {
    // If the server already provided the guide, ensure it's saved locally
    if (initialGuide) {
      saveStoredGuide(initialGuide);
      setGuide(initialGuide);
      setLoading(false);
      return;
    }

    // Try resolving from client-side state
    async function resolveClientGuide() {
      // 1. Try URL Hash #data=...
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.startsWith('#data=')) {
          const raw = hash.slice('#data='.length);
          const decoded = await decodeGuide(raw);
          if (decoded) {
            setGuide(decoded);
            saveStoredGuide(decoded);
            setLoading(false);
            // Cache on server in background
            try {
              fetch('/api/guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decoded),
              });
            } catch {}
            return;
          }
        }

        // 2. Try URL Search Params ?data=...
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get('data');
        if (dataParam) {
          const decoded = await decodeGuide(dataParam);
          if (decoded) {
            setGuide(decoded);
            saveStoredGuide(decoded);
            setLoading(false);
            try {
              fetch('/api/guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decoded),
              });
            } catch {}
            return;
          }
        }

        // 3. Try LocalStorage
        const stored = findStoredGuide(slug);
        if (stored) {
          setGuide(stored);
          setLoading(false);
          try {
            fetch('/api/guides', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(stored),
            });
          } catch {}
          return;
        }
      }

      setLoading(false);
    }

    resolveClientGuide();
  }, [initialGuide, slug]);

  const displayAppName = guide?.appName || slug.replace(/-/g, ' ');

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Navigation Bar matching Composio Platform */}
      <header className="h-12 bg-[#0f0f0f] border-b border-[#222222] px-3.5 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors p-1.5 rounded hover:bg-[#161616] flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#666666]" />
            <span className="hidden xs:inline sm:inline">Dashboard</span>
          </Link>
          <span className="text-[#333333] flex-shrink-0">/</span>
          {guide ? (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <AppIcon name={guide.appName} size="sm" />
              <span className="text-xs text-white font-medium truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">
                {guide.appName}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161616] border border-[#242424] text-[#888888] uppercase flex-shrink-0">
                {guide.recommendedPath}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#888888] font-mono capitalize truncate">
              {displayAppName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={84}
            height={16}
            priority
            className="h-[15px] sm:h-[16px] w-auto object-contain"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#161616] border border-[#242424] text-[#888888] tracking-wider">
            OAUTH
          </span>
        </div>
      </header>

      {/* Main Content Area — Strictly bounded to remaining viewport height with min-h-0 so GuideView can scroll */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Loader2 className="w-6 h-6 text-[#51a2ff] animate-spin" />
            <p className="text-xs font-mono text-[#888888]">Loading OAuth integration guide...</p>
          </div>
        ) : guide ? (
          <GuideView guide={guide} />
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-[#121212] border border-[#222222] rounded-lg p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto text-[#888888]">
                <AlertCircle className="w-5 h-5 text-[#888888]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-medium text-white">
                  Guide Not Found
                </h2>
                <p className="text-xs text-[#888888] leading-relaxed">
                  No existing OAuth integration guide was found for{' '}
                  <span className="text-[#ededed] font-mono">{slug}</span>. You can generate a comprehensive, production-ready guide with AI in seconds.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                <Link
                  href={`/?generate=${encodeURIComponent(slug)}`}
                  className="h-8 px-3.5 rounded bg-white text-black hover:bg-[#ededed] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Guide with AI</span>
                </Link>

                <Link
                  href="/"
                  className="h-8 px-3.5 rounded bg-[#181818] border border-[#2c2c2c] hover:border-[#383838] text-[#cccccc] hover:text-white text-xs font-medium flex items-center justify-center transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

