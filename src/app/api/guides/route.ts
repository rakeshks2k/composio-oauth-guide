import { NextRequest, NextResponse } from 'next/server';
import { getAllGuides, saveGuide } from '@/lib/db';
import { Guide } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guides = getAllGuides();
    return NextResponse.json({ guides });
  } catch (error) {
    console.error('Failed to fetch guides:', error);
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guide = (await req.json()) as Guide;
    if (guide && guide.id && guide.appName && guide.slug) {
      saveGuide(guide);
      return NextResponse.json({ success: true, guide });
    }
    return NextResponse.json({ error: 'Invalid guide payload' }, { status: 400 });
  } catch (error) {
    console.error('Failed to save guide:', error);
    return NextResponse.json({ error: 'Failed to save guide' }, { status: 500 });
  }
}
