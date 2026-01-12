import { ChannelMetrics, YTCTComponents, YTCTScoreResult } from './types';

// Weights for each component
const WEIGHTS = {
  longevity: 0.30,
  consistency: 0.30,
  growth: 0.25,
  engagement: 0.15,
};

/**
 * Normalize longevity (channel age in days) to 1-10 scale
 */
function normalizeLongevity(longevityDays: number): number {
  if (longevityDays >= 3650) return 10.0; // 10+ years
  if (longevityDays >= 2555) return 9.0;  // 7-10 years
  if (longevityDays >= 1825) return 8.0;  // 5-7 years
  if (longevityDays >= 1095) return 7.0;  // 3-5 years
  if (longevityDays >= 730) return 6.0;   // 2-3 years
  if (longevityDays >= 365) return 5.0;   // 1-2 years
  if (longevityDays >= 180) return 4.0;   // 6-12 months
  if (longevityDays >= 90) return 3.0;    // 3-6 months
  if (longevityDays >= 30) return 2.0;    // 1-3 months
  return 1.0;                             // < 1 month
}

/**
 * Normalize consistency (videos per month) to 1-10 scale
 */
function normalizeConsistency(videosPerMonth: number): number {
  if (videosPerMonth >= 8) return 10.0;
  if (videosPerMonth >= 6) return 9.0;
  if (videosPerMonth >= 4) return 8.0;
  if (videosPerMonth >= 3) return 7.0;
  if (videosPerMonth >= 2) return 6.0;
  if (videosPerMonth >= 1) return 5.0;
  if (videosPerMonth >= 0.5) return 4.0;
  if (videosPerMonth >= 0.25) return 3.0;
  if (videosPerMonth >= 0.1) return 2.0;
  return 1.0;
}

/**
 * Normalize growth ratio (subscribers per video) to 1-10 scale
 */
function normalizeGrowth(subsPerVideo: number): number {
  if (subsPerVideo >= 10000) return 10.0;
  if (subsPerVideo >= 5000) return 9.0;
  if (subsPerVideo >= 2500) return 8.0;
  if (subsPerVideo >= 1000) return 7.0;
  if (subsPerVideo >= 500) return 6.0;
  if (subsPerVideo >= 250) return 5.0;
  if (subsPerVideo >= 100) return 4.0;
  if (subsPerVideo >= 50) return 3.0;
  if (subsPerVideo >= 10) return 2.0;
  return 1.0;
}

/**
 * Normalize engagement rate (avg views per video / subscribers) to 1-10 scale
 */
function normalizeEngagement(engagementRatio: number): number {
  if (engagementRatio > 1.0) return 10.0;
  if (engagementRatio >= 0.75) return 9.0;
  if (engagementRatio >= 0.5) return 8.0;
  if (engagementRatio >= 0.35) return 7.0;
  if (engagementRatio >= 0.25) return 6.0;
  if (engagementRatio >= 0.15) return 5.0;
  if (engagementRatio >= 0.1) return 4.0;
  if (engagementRatio >= 0.05) return 3.0;
  if (engagementRatio >= 0.01) return 2.0;
  return 1.0;
}

/**
 * Get rating label based on score
 */
function getRating(score: number): 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 8.0) return 'Excellent';
  if (score >= 6.0) return 'Very Good';
  if (score >= 4.0) return 'Good';
  if (score >= 2.0) return 'Fair';
  return 'Poor';
}

/**
 * Calculate longevity in days from published date
 */
function calculateLongevityDays(publishedAt: Date | string): number {
  const publishDate = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate consistency score (videos per month)
 */
function calculateConsistency(videoCount: number, longevityDays: number): number {
  if (longevityDays === 0) return 0;
  const monthsSinceCreation = longevityDays / 30;
  return videoCount / monthsSinceCreation;
}

/**
 * Calculate growth ratio (subscribers per video)
 */
function calculateGrowthRatio(subscriberCount: number, videoCount: number): number {
  if (videoCount === 0) return 0;
  return subscriberCount / videoCount;
}

/**
 * Calculate engagement ratio (avg views per video / subscribers)
 */
function calculateEngagementRatio(
  viewCount: number,
  subscriberCount: number,
  videoCount: number
): number {
  if (videoCount === 0 || subscriberCount === 0) return 0;
  const avgViewsPerVideo = viewCount / videoCount;
  return avgViewsPerVideo / subscriberCount;
}

/**
 * Calculate YTCT Score from channel metrics
 */
export function calculateYTCTScore(metrics: ChannelMetrics): YTCTScoreResult {
  // Calculate or use pre-calculated values
  const longevityDays = metrics.longevityDays ?? calculateLongevityDays(metrics.publishedAt);
  const consistencyScore = metrics.consistencyScore ?? calculateConsistency(metrics.videoCount, longevityDays);
  const growthRatio = metrics.growthRatio ?? calculateGrowthRatio(metrics.subscriberCount, metrics.videoCount);
  const engagementRatio = calculateEngagementRatio(
    metrics.viewCount,
    metrics.subscriberCount,
    metrics.videoCount
  );

  // Normalize each metric to 1-10 scale
  const components: YTCTComponents = {
    longevity: normalizeLongevity(longevityDays),
    consistency: normalizeConsistency(consistencyScore),
    growth: normalizeGrowth(growthRatio),
    engagement: normalizeEngagement(engagementRatio),
  };

  // Calculate weighted score
  const score = Number(
    (
      components.longevity * WEIGHTS.longevity +
      components.consistency * WEIGHTS.consistency +
      components.growth * WEIGHTS.growth +
      components.engagement * WEIGHTS.engagement
    ).toFixed(1)
  );

  return {
    score,
    components,
    rating: getRating(score),
  };
}
