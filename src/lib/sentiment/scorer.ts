import { TrustScoreResult, TrustScoreComponents, SentimentResult } from './types';
import { YouTubeChannel } from '../youtube/types';

export class TrustScoreCalculator {
  private weights = {
    sentiment: 0.4,      // 40% - Comment sentiment
    engagement: 0.2,     // 20% - Engagement metrics
    consistency: 0.15,   // 15% - Upload frequency
    transparency: 0.15,  // 15% - Channel information quality
    longevity: 0.1,      // 10% - Channel age
  };

  calculateTrustScore(channel: YouTubeChannel, sentiment?: SentimentResult): TrustScoreResult {
    const components: TrustScoreComponents = {
      sentiment: this.calculateSentimentScore(sentiment),
      engagement: this.calculateEngagementScore(channel),
      consistency: this.calculateConsistencyScore(channel),
      transparency: this.calculateTransparencyScore(channel),
      longevity: this.calculateLongevityScore(channel),
    };

    const overall = Object.entries(this.weights).reduce((total, [key, weight]) => {
      const score = components[key as keyof TrustScoreComponents];
      return total + (score * weight);
    }, 0);

    return {
      overall: Math.max(0, Math.min(5, overall)),
      components,
    };
  }

  private calculateSentimentScore(sentiment?: SentimentResult): number {
    if (!sentiment || sentiment.totalComments === 0) {
      return 2.5; // Neutral score if no sentiment data
    }

    // Convert -1 to +1 range to 0-5 score
    const sentimentScore = ((sentiment.averageSentiment + 1) / 2) * 5;

    // Boost score if we have high percentage of positive comments
    const positivePercentage = sentiment.positiveCount / sentiment.totalComments;
    const negativePercentage = sentiment.negativeCount / sentiment.totalComments;

    let adjustedScore = sentimentScore;

    if (positivePercentage > 0.6) {
      adjustedScore += 0.5;
    }

    if (negativePercentage > 0.4) {
      adjustedScore -= 0.5;
    }

    return Math.max(0, Math.min(5, adjustedScore));
  }

  private calculateEngagementScore(channel: YouTubeChannel): number {
    const views = parseInt(channel.statistics.viewCount);
    const subscribers = parseInt(channel.statistics.subscriberCount);
    const videos = parseInt(channel.statistics.videoCount);

    if (videos === 0) return 0;

    // Calculate average views per video
    const avgViewsPerVideo = views / videos;

    // Calculate engagement ratio (avg views per subscriber)
    const engagementRatio = subscribers > 0 ? avgViewsPerVideo / subscribers : 0;

    // Score based on engagement ratio
    let score = 2.5; // Base score

    if (engagementRatio > 0.5) {
      score = 5;
    } else if (engagementRatio > 0.3) {
      score = 4;
    } else if (engagementRatio > 0.2) {
      score = 3.5;
    } else if (engagementRatio > 0.1) {
      score = 3;
    }

    return score;
  }

  private calculateConsistencyScore(channel: YouTubeChannel): number {
    const videos = parseInt(channel.statistics.videoCount);
    const publishedAt = new Date(channel.snippet.publishedAt);
    const now = new Date();
    const ageInDays = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays === 0 || videos === 0) return 0;

    // Calculate average videos per month
    const ageInMonths = ageInDays / 30;
    const videosPerMonth = videos / ageInMonths;

    // Score based on upload frequency
    let score = 2.5; // Base score

    if (videosPerMonth >= 4) {
      score = 5; // 1+ per week
    } else if (videosPerMonth >= 2) {
      score = 4; // 2-3 per month
    } else if (videosPerMonth >= 1) {
      score = 3.5; // 1 per month
    } else if (videosPerMonth >= 0.5) {
      score = 3; // 1 every 2 months
    } else {
      score = 2; // Less frequent
    }

    return score;
  }

  private calculateTransparencyScore(channel: YouTubeChannel): number {
    let score = 0;

    // Has description
    if (channel.snippet.description && channel.snippet.description.length > 100) {
      score += 1.5;
    } else if (channel.snippet.description && channel.snippet.description.length > 20) {
      score += 1;
    }

    // Has custom URL
    if (channel.snippet.customUrl) {
      score += 1;
    }

    // Has country
    if (channel.snippet.country) {
      score += 0.5;
    }

    // Description quality (has links, social media, etc.)
    if (channel.snippet.description) {
      const hasLinks = /https?:\/\//i.test(channel.snippet.description);
      const hasSocialMedia = /(twitter|facebook|instagram|tiktok)/i.test(channel.snippet.description);

      if (hasLinks) score += 1;
      if (hasSocialMedia) score += 1;
    }

    return Math.min(5, score);
  }

  private calculateLongevityScore(channel: YouTubeChannel): number {
    const publishedAt = new Date(channel.snippet.publishedAt);
    const now = new Date();
    const ageInYears = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 365);

    // Score based on channel age
    if (ageInYears >= 10) {
      return 5;
    } else if (ageInYears >= 5) {
      return 4.5;
    } else if (ageInYears >= 3) {
      return 4;
    } else if (ageInYears >= 2) {
      return 3.5;
    } else if (ageInYears >= 1) {
      return 3;
    } else {
      return 2;
    }
  }
}

// Singleton instance
let trustScoreCalculator: TrustScoreCalculator | null = null;

export function getTrustScoreCalculator(): TrustScoreCalculator {
  if (!trustScoreCalculator) {
    trustScoreCalculator = new TrustScoreCalculator();
  }
  return trustScoreCalculator;
}
