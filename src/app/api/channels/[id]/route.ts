import { NextRequest, NextResponse } from 'next/server';
import { getChannelWithSentiment } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const channelId = params.id;

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const result = await getChannelWithSentiment(channelId);

    if (!result || !result.channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      channel: result.channel,
      sentiment: result.sentiment,
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}
