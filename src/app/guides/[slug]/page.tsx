import { getGuideByIdOrSlug } from '@/lib/db';
import { GuideClientShell } from './GuideClientShell';
import { decodeGuide } from '@/lib/guide-codec';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
  searchParams?: { data?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  let guide = getGuideByIdOrSlug(params.slug);
  if (!guide && searchParams?.data) {
    guide = await decodeGuide(searchParams.data);
  }

  if (!guide) {
    const formattedTitle = params.slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      title: `${formattedTitle} - Composio OAuth Guide`,
    };
  }

  return {
    title: `${guide.appName} - Composio OAuth Guide`,
    description: guide.summary,
  };
}

export default async function GuidePage({ params, searchParams }: PageProps) {
  let guide = getGuideByIdOrSlug(params.slug);

  if (!guide && searchParams?.data) {
    guide = await decodeGuide(searchParams.data);
  }

  return <GuideClientShell initialGuide={guide} slug={params.slug} />;
}
