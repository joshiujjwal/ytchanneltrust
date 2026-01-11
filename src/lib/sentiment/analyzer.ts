import Sentiment from 'sentiment';
import { YouTubeClient, getYouTubeClient } from '../youtube/api';
import { SentimentResult } from './types';
import { getQuotaManager } from '../youtube/quota';

export class SentimentAnalyzer {
  private sentiment: Sentiment;
  private youtubeClient: YouTubeClient;

  constructor() {
    this.sentiment = new Sentiment();
    this.youtubeClient = getYouTubeClient();
  }

  async analyzeChannel(channelId: string, maxVideos: number = 5, maxCommentsPerVideo: number = 100): Promise<SentimentResult> {
    const quotaManager = getQuotaManager();

    try {
      // Check if we have enough quota
      const canFetch = await quotaManager.canFetchComments();
      if (!canFetch) {
        throw new Error('Insufficient API quota for sentiment analysis');
      }

      // Fetch top videos from the channel
      const videos = await this.youtubeClient.getChannelVideos(channelId, maxVideos);
      await quotaManager.recordChannelFetch();

      if (videos.length === 0) {
        return {
          totalComments: 0,
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
          averageSentiment: 0,
          scores: [],
        };
      }

      // Collect comments from all videos
      const allScores: number[] = [];
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;

      for (const video of videos) {
        const videoId = video.id.videoId;
        if (!videoId) continue;

        // Check quota before fetching comments
        const canFetchMore = await quotaManager.canFetchComments();
        if (!canFetchMore) {
          console.warn('Quota limit reached, stopping comment analysis');
          break;
        }

        const comments = await this.youtubeClient.getVideoComments(videoId, maxCommentsPerVideo);
        await quotaManager.recordCommentFetch();

        // Analyze sentiment for each comment
        for (const comment of comments) {
          const text = comment.snippet.topLevelComment.snippet.textDisplay;
          const analysis = this.sentiment.analyze(text);
          const normalizedScore = this.normalizeScore(analysis.score);

          allScores.push(normalizedScore);

          // Categorize sentiment
          if (normalizedScore > 0.1) {
            positiveCount++;
          } else if (normalizedScore < -0.1) {
            negativeCount++;
          } else {
            neutralCount++;
          }
        }
      }

      // Calculate average sentiment
      const averageSentiment = allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;

      return {
        totalComments: allScores.length,
        positiveCount,
        neutralCount,
        negativeCount,
        averageSentiment: Math.max(-1, Math.min(1, averageSentiment)),
        scores: allScores,
      };
    } catch (error) {
      console.error('Error analyzing channel sentiment:', error);
      throw error;
    }
  }

  analyzeText(text: string): number {
    const analysis = this.sentiment.analyze(text);
    return this.normalizeScore(analysis.score);
  }

  private normalizeScore(score: number): number {
    // sentiment.js scores typically range from -10 to +10
    // Normalize to -1 to +1 range
    return Math.max(-1, Math.min(1, score / 10));
  }
}

// Singleton instance
let sentimentAnalyzer: SentimentAnalyzer | null = null;

export function getSentimentAnalyzer(): SentimentAnalyzer {
  if (!sentimentAnalyzer) {
    sentimentAnalyzer = new SentimentAnalyzer();
  }
  return sentimentAnalyzer;
}
