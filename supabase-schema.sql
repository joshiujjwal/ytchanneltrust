-- CreatorTrust Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com (Project > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Channels table (updated for vitality metrics)
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT UNIQUE NOT NULL,
  channel_url TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_handle TEXT,
  creator_name TEXT,
  subscriber_count BIGINT,
  video_count INTEGER,
  view_count BIGINT,
  channel_category TEXT,
  media_house TEXT,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP,
  country TEXT,
  custom_url TEXT,
  consistency_score NUMERIC(5, 2),
  growth_ratio NUMERIC(10, 2),
  longevity_days INTEGER,
  content_dna TEXT[],
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  api_quota_used INTEGER DEFAULT 0
);

-- Comments table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  comment_id TEXT UNIQUE NOT NULL,
  video_id TEXT,
  author TEXT,
  text TEXT,
  like_count INTEGER,
  published_at TIMESTAMP,
  sentiment_score NUMERIC(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

-- Sentiment analysis table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  total_comments_analyzed INTEGER,
  positive_count INTEGER,
  neutral_count INTEGER,
  negative_count INTEGER,
  average_sentiment NUMERIC(3, 2),
  last_analyzed TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

-- API quota tracking table
CREATE TABLE IF NOT EXISTS api_quota_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  quota_used INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 10000,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User searches table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_query TEXT,
  search_type TEXT,
  result_found INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recent searches table (NEW for CreatorTrust)
CREATE TABLE IF NOT EXISTS searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  handle TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriber_count ON channels(subscriber_count);
CREATE INDEX IF NOT EXISTS idx_channel_id ON channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_last_updated ON channels(last_updated);
CREATE INDEX IF NOT EXISTS idx_comments_channel_id ON comments(channel_id);
CREATE INDEX IF NOT EXISTS idx_sentiment ON comments(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_sentiment_channel_id ON sentiment_analysis(channel_id);
CREATE INDEX IF NOT EXISTS idx_quota_date ON api_quota_tracking(date);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON user_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_searches_timestamp ON searches(timestamp);
CREATE INDEX IF NOT EXISTS idx_searches_channel_id ON searches(channel_id);

-- Success message
SELECT 'CreatorTrust schema created successfully!' AS status;
