export interface SentimentResult {
  totalComments: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageSentiment: number; // -1 to 1
  scores: number[]; // Individual comment scores
}

export interface TrustScoreComponents {
  sentiment: number; // 0-5
  engagement: number; // 0-5
  consistency: number; // 0-5
  transparency: number; // 0-5
  longevity: number; // 0-5
}

export interface TrustScoreResult {
  overall: number; // 0-5
  components: TrustScoreComponents;
}
