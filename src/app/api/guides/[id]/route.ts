import { NextRequest, NextResponse } from 'next/server';
import { getGuideByIdOrSlug, deleteGuide } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const guide = getGuideByIdOrSlug(params.id);
    if (!guide) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    return NextResponse.json({ guide });
  } catch (error) {
    console.error('Failed to fetch guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const guide = getGuideByIdOrSlug(params.id);
    if (!guide) return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    if (guide.isPreset) return NextResponse.json({ error: 'Cannot delete preset guides' }, { status: 403 });
    deleteGuide(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete guide:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
