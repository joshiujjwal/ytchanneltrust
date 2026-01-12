import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/api';
import { parseYouTubeURL } from '@/lib/youtube/parser';
import { upsertChannel, saveSentimentAnalysis } from '@/lib/db/queries';
import { getQuotaManager } from '@/lib/youtube/quota';
import { getSentimentAnalyzer } from '@/lib/sentiment/analyzer';
import { getTrustScoreCalculator } from '@/lib/sentiment/scorer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid YouTube URL is required' },
        { status: 400 }
      );
    }

    // Parse the YouTube URL
    const parsed = parseYouTubeURL(url);
    console.log('[Add Channel] Parsed URL:', { url, parsed });
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    // Check API quota
    const quotaManager = getQuotaManager();
    const canFetch = await quotaManager.canFetchChannel();

    if (!canFetch) {
      return NextResponse.json(
        { error: 'Daily API quota exceeded. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Fetch channel data from YouTube
    const youtubeClient = getYouTubeClient();
    const channelData = await youtubeClient.getChannelByParsedURL(parsed);
    await quotaManager.recordChannelFetch();

    if (!channelData) {
      console.log('[Add Channel] Channel not found on YouTube');
      return NextResponse.json(
        { error: 'Channel not found on YouTube' },
        { status: 404 }
      );
    }

    console.log('[Add Channel] Channel data received:', {
      id: channelData.id,
      title: channelData.snippet.title,
      customUrl: channelData.snippet.customUrl,
      subscriberCount: channelData.statistics.subscriberCount,
      originalUrl: url,
    });

    // Extract channel category (simplified - YouTube API doesn't directly provide this)
    // We could use topic IDs or other methods, but for now, we'll leave it as undefined
    const channelCategory = undefined;

    // Perform sentiment analysis (if quota allows)
    let sentimentResult = null;
    let trustScore = '0.00';

    try {
      const canAnalyze = await quotaManager.canFetchComments();
      if (canAnalyze) {
        const sentimentAnalyzer = getSentimentAnalyzer();
        sentimentResult = await sentimentAnalyzer.analyzeChannel(channelData.id, 5, 50);

        // Calculate trust score
        const trustScoreCalculator = getTrustScoreCalculator();
        const trustScoreResult = trustScoreCalculator.calculateTrustScore(
          channelData,
          sentimentResult
        );

        trustScore = trustScoreResult.overall.toFixed(2);

        // Save sentiment analysis
        if (sentimentResult.totalComments > 0) {
          await saveSentimentAnalysis({
            channelId: channelData.id,
            totalCommentsAnalyzed: sentimentResult.totalComments,
            positiveCount: sentimentResult.positiveCount,
            neutralCount: sentimentResult.neutralCount,
            negativeCount: sentimentResult.negativeCount,
            averageSentiment: sentimentResult.averageSentiment.toFixed(2),
          });
        }
      }
    } catch (sentimentError) {
      console.error('Error during sentiment analysis:', sentimentError);
      // Continue without sentiment data
    }

    // Save channel to database
    const channelToSave = {
      channelId: channelData.id,
      channelUrl: url,
      channelName: channelData.snippet.title,
      creatorName: channelData.snippet.title, // YouTube doesn't separate creator name
      subscriberCount: parseInt(channelData.statistics.subscriberCount),
      videoCount: parseInt(channelData.statistics.videoCount),
      viewCount: parseInt(channelData.statistics.viewCount),
      channelCategory,
      description: channelData.snippet.description,
      thumbnailUrl: channelData.snippet.thumbnails.high.url,
      publishedAt: new Date(channelData.snippet.publishedAt),
      country: channelData.snippet.country,
      customUrl: channelData.snippet.customUrl,
      trustScore,
      sentimentScore: sentimentResult?.averageSentiment.toFixed(2) || '0.00',
    };

    console.log('[Add Channel] Saving to database:', {
      channelId: channelToSave.channelId,
      channelUrl: channelToSave.channelUrl,
      channelName: channelToSave.channelName,
      customUrl: channelToSave.customUrl,
    });

    const channel = await upsertChannel(channelToSave);

    return NextResponse.json({
      success: true,
      channel,
      message: 'Channel added successfully',
    });
  } catch (error: any) {
    console.error('Error adding channel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add channel' },
      { status: 500 }
    );
  }
}
