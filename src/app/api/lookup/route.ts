import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/api';
import { parseYouTubeURL } from '@/lib/youtube/parser';
import { calculateVitalityMetrics, formatVitalityMetrics } from '@/lib/vitality/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('[Lookup API] Processing URL:', url);

    // Step 1: Parse the URL
    const parsed = parseYouTubeURL(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please provide a valid channel or video URL.' },
        { status: 400 }
      );
    }

    console.log('[Lookup API] Parsed URL:', parsed);

    // Step 2: Resolve to channel (handles video URLs too)
    const youtube = getYouTubeClient();
    const channel = await youtube.getChannelByParsedURL(parsed);

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found. Please check the URL and try again.' },
        { status: 404 }
      );
    }

    console.log('[Lookup API] Channel found:', channel.snippet.title);

    // Step 3: Get recent video tags for Content DNA
    const tags = await youtube.getRecentVideoTags(channel.id, 10);

    // Step 4: Calculate vitality metrics
    const vitalityMetrics = calculateVitalityMetrics({
      publishedAt: channel.snippet.publishedAt,
      videoCount: parseInt(channel.statistics.videoCount),
      subscriberCount: parseInt(channel.statistics.subscriberCount),
      tags,
    });

    const formatted = formatVitalityMetrics(vitalityMetrics);

    // Step 5: Prepare response
    const response = {
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        handle: channel.snippet.customUrl || null,
        thumbnailUrl: channel.snippet.thumbnails.high.url,
        description: channel.snippet.description,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount),
        viewCount: parseInt(channel.statistics.viewCount),
        publishedAt: channel.snippet.publishedAt,
        country: channel.snippet.country || null,
      },
      vitality: {
        consistencyScore: parseFloat(formatted.consistencyScore),
        consistencyDisplay: `${formatted.consistencyScore} videos/month`,
        growthRatio: parseFloat(formatted.growthRatio),
        growthRatioDisplay: `${formatted.growthRatio} subs/video`,
        longevityDays: vitalityMetrics.longevityDays,
        longevityDisplay: `${formatted.longevityYears} years`,
        contentDna: vitalityMetrics.contentDna,
      },
    };

    console.log('[Lookup API] Success! Returning vitality data');

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Lookup API] Error:', error);

    // Handle YouTube API quota errors
    if (error.message?.includes('quotaExceeded')) {
      return NextResponse.json(
        { error: 'YouTube API quota exceeded. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while fetching channel data. Please try again.' },
      { status: 500 }
    );
  }
}
