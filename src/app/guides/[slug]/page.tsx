import { getGuideByIdOrSlug } from '@/lib/db';
import { GuideView } from '@/components/GuideView';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const guide = getGuideByIdOrSlug(params.slug);
  if (!guide) return { title: 'Guide Not Found - Composio' };
  return {
    title: `${guide.appName} - Composio OAuth Guide`,
    description: guide.summary,
  };
}

export default function GuidePage({ params }: PageProps) {
  const guide = getGuideByIdOrSlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans">
      {/* Top Navigation Bar matching Composio Platform */}
      <header className="h-12 bg-[#141414] border-b border-[#262626] px-6 flex items-center justify-between flex-shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-white transition-colors p-1.5 rounded hover:bg-[#1e1e1e]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#737373]" />
            <span>Dashboard</span>
          </Link>
          <span className="text-[#333333]">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white font-medium">{guide.appName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[#a1a1a1] uppercase">
              {guide.recommendedPath}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Image
            src="/composio-logo-white.png"
            alt="Composio"
            width={84}
            height={16}
            priority
            className="h-[16px] w-auto object-contain"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[#a1a1a1] tracking-wider">
            OAUTH
          </span>
        </div>
      </header>

      {/* Guide View Content */}
      <div className="flex-1 flex overflow-hidden">
        <GuideView guide={guide} />
      </div>
    </div>
  );
}