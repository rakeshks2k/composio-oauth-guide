import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/db';

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
