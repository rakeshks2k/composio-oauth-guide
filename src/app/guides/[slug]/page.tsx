import { getGuideByIdOrSlug } from '@/lib/db';
import { GuideView } from '@/components/GuideView';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const guide = getGuideByIdOrSlug(params.slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `${guide.appName} OAuth Guide — Composio`,
    description: guide.summary,
  };
}

export default function GuidePage({ params }: PageProps) {
  const guide = getGuideByIdOrSlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-bg-secondary border-b border-bg-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <span className="text-bg-border">|</span>
          <span className="text-sm text-text-secondary">{guide.appName} OAuth Guide</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-teal" />
          <span className="text-sm font-medium text-text-secondary">OAuth Guides by Composio</span>
        </div>
      </header>

      {/* Guide content */}
      <div className="max-w-4xl mx-auto">
        <GuideView guide={guide} />
      </div>
    </div>
  );
}
