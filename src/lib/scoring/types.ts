// YTCT Score System Type Definitions

export interface YTCTComponents {
  longevity: number;      // 1-10 score based on channel age
  consistency: number;    // 1-10 score based on upload frequency
  growth: number;         // 1-10 score based on subscribers per video
  engagement: number;     // 1-10 score based on views to subscribers ratio
}

export interface YTCTScoreResult {
  score: number;          // Overall YTCT Score (1-10)
  components: YTCTComponents;
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
}

export interface ChannelMetrics {
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
  publishedAt: Date | string;
  consistencyScore?: number;  // Pre-calculated videos per month
  growthRatio?: number;       // Pre-calculated subscribers per video
  longevityDays?: number;     // Pre-calculated days since creation
}
