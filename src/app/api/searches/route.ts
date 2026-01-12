import { NextRequest, NextResponse } from 'next/server';
import {
  addSearch,
  getRecentSearches,
  addSearchEnhanced,
  getRecentSearchesPaginated,
  getTotalSearchesCount
} from '@/lib/supabase/client';

// GET: Fetch recent searches with pagination and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'timestamp') as 'timestamp' | 'ytct_score' | 'subscriber_count';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fallback to simple search for backward compatibility (no params)
    if (!searchParams.has('page') && !searchParams.has('limit')) {
      const searches = await getRecentSearches();
      return NextResponse.json({ searches });
    }

    const offset = (page - 1) * limit;

    const searches = await getRecentSearchesPaginated({
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    const totalCount = await getTotalSearchesCount();

    return NextResponse.json({
      searches,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error('[Searches API] Error fetching recent searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

// POST: Add a new search with YTCT score and metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      channelId,
      title,
      thumbnail,
      handle,
      ytctScore,
      ytctRating,
      subscriberCount,
      videoCount
    } = body;

    if (!channelId || !title) {
      return NextResponse.json(
        { error: 'channelId and title are required' },
        { status: 400 }
      );
    }

    // Use enhanced function if YTCT data is provided
    if (ytctScore !== undefined || subscriberCount !== undefined) {
      await addSearchEnhanced({
        channelId,
        title,
        thumbnail,
        handle,
        ytctScore,
        ytctRating,
        subscriberCount,
        videoCount
      });
    } else {
      // Fallback to basic function for backward compatibility
      await addSearch({ channelId, title, thumbnail, handle });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Searches API] Error adding search:', error);
    return NextResponse.json(
      { error: 'Failed to add search' },
      { status: 500 }
    );
  }
}
