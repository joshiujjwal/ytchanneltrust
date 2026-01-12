import { differenceInDays, differenceInMonths } from 'date-fns';

export interface VitalityMetrics {
  consistencyScore: number; // Videos per month
  growthRatio: number; // Subscribers per video
  longevityDays: number; // Days since channel creation
  contentDna: string[]; // Top 5 most frequent tags
}

export interface ChannelData {
  publishedAt: string | Date;
  videoCount: number;
  subscriberCount: number;
  tags: string[]; // All tags from recent videos
}

/**
 * Calculate Consistency Score: Total Videos / Months since channel creation
 */
export function calculateConsistencyScore(
  videoCount: number,
  publishedAt: string | Date
): number {
  const now = new Date();
  const createdDate = new Date(publishedAt);
  const monthsSinceCreation = differenceInMonths(now, createdDate);

  // Avoid division by zero - if less than 1 month old, use 1
  const months = monthsSinceCreation === 0 ? 1 : monthsSinceCreation;

  return videoCount / months;
}

/**
 * Calculate Growth Ratio: Subscribers / Total Videos
 * This measures "Value per Video"
 */
export function calculateGrowthRatio(
  subscriberCount: number,
  videoCount: number
): number {
  // Avoid division by zero
  if (videoCount === 0) return 0;

  return subscriberCount / videoCount;
}

/**
 * Calculate Longevity: Days since the channel was created
 */
export function calculateLongevity(publishedAt: string | Date): number {
  const now = new Date();
  const createdDate = new Date(publishedAt);
  return differenceInDays(now, createdDate);
}

/**
 * Extract Content DNA: Top 5 most frequent tags from all provided tags
 */
export function extractContentDna(tags: string[]): string[] {
  if (!tags || tags.length === 0) return [];

  // Count frequency of each tag
  const tagFrequency = new Map<string, number>();

  tags.forEach((tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag) {
      tagFrequency.set(normalizedTag, (tagFrequency.get(normalizedTag) || 0) + 1);
    }
  });

  // Sort by frequency and get top 5
  const sortedTags = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return sortedTags;
}

/**
 * Calculate all vitality metrics for a channel
 */
export function calculateVitalityMetrics(data: ChannelData): VitalityMetrics {
  return {
    consistencyScore: calculateConsistencyScore(data.videoCount, data.publishedAt),
    growthRatio: calculateGrowthRatio(data.subscriberCount, data.videoCount),
    longevityDays: calculateLongevity(data.publishedAt),
    contentDna: extractContentDna(data.tags),
  };
}

/**
 * Format vitality metrics for display
 */
export function formatVitalityMetrics(metrics: VitalityMetrics) {
  return {
    consistencyScore: metrics.consistencyScore.toFixed(2),
    growthRatio: metrics.growthRatio.toFixed(0),
    longevityDays: metrics.longevityDays.toLocaleString(),
    longevityYears: (metrics.longevityDays / 365).toFixed(1),
    contentDna: metrics.contentDna,
  };
}
