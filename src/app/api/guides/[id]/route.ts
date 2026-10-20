import { NextResponse } from 'next/server';
import { getGuideByIdOrSlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guide = getGuideByIdOrSlug(params.id);
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    return NextResponse.json({ guide });
  } catch (error) {
    console.error('Failed to fetch guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}
