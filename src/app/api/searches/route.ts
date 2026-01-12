import { NextRequest, NextResponse } from 'next/server';
import { addSearch, getRecentSearches } from '@/lib/supabase/client';

// GET: Fetch recent searches
export async function GET() {
  try {
    const searches = await getRecentSearches();
    return NextResponse.json({ searches });
  } catch (error) {
    console.error('[Searches API] Error fetching recent searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

// POST: Add a new search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, title, thumbnail, handle } = body;

    if (!channelId || !title) {
      return NextResponse.json(
        { error: 'channelId and title are required' },
        { status: 400 }
      );
    }

    await addSearch({ channelId, title, thumbnail, handle });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Searches API] Error adding search:', error);
    return NextResponse.json(
      { error: 'Failed to add search' },
      { status: 500 }
    );
  }
}
