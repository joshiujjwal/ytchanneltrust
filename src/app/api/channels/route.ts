import { NextRequest, NextResponse } from 'next/server';
import { getTopChannels, searchChannels } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '100');

    let channels;

    if (query) {
      channels = await searchChannels(query, Math.min(limit, 100));
    } else {
      channels = await getTopChannels(Math.min(limit, 100));
    }

    return NextResponse.json({
      channels,
      count: channels.length,
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}
