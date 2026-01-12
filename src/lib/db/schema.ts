import { pgTable, text, bigint, integer, timestamp, decimal, uuid, index, date, jsonb } from 'drizzle-orm/pg-core';

export const channels = pgTable('channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: text('channel_id').unique().notNull(),
  channelUrl: text('channel_url').notNull(),
  channelName: text('channel_name').notNull(),
  channelHandle: text('channel_handle'),
  creatorName: text('creator_name'),
  subscriberCount: bigint('subscriber_count', { mode: 'number' }),
  videoCount: integer('video_count'),
  viewCount: bigint('view_count', { mode: 'number' }),
  channelCategory: text('channel_category'),
  mediaHouse: text('media_house'),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  publishedAt: timestamp('published_at'),
  country: text('country'),
  customUrl: text('custom_url'),
  consistencyScore: decimal('consistency_score', { precision: 5, scale: 2 }),
  growthRatio: decimal('growth_ratio', { precision: 10, scale: 2 }),
  longevityDays: integer('longevity_days'),
  contentDna: text('content_dna').array(),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  apiQuotaUsed: integer('api_quota_used').default(0),
  ytctScore: decimal('ytct_score', { precision: 3, scale: 1 }),
  ytctRating: text('ytct_rating'),
  ytctComponents: jsonb('ytct_components'),
}, (table) => ({
  subscriberCountIdx: index('idx_subscriber_count').on(table.subscriberCount),
  channelIdIdx: index('idx_channel_id').on(table.channelId),
  lastUpdatedIdx: index('idx_last_updated').on(table.lastUpdated),
  ytctScoreIdx: index('idx_ytct_score').on(table.ytctScore),
}));

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: text('channel_id').notNull().references(() => channels.channelId),
  commentId: text('comment_id').unique().notNull(),
  videoId: text('video_id'),
  author: text('author'),
  text: text('text'),
  likeCount: integer('like_count'),
  publishedAt: timestamp('published_at'),
  sentimentScore: decimal('sentiment_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  channelIdIdx: index('idx_comments_channel_id').on(table.channelId),
  sentimentIdx: index('idx_sentiment').on(table.sentimentScore),
}));

export const sentimentAnalysis = pgTable('sentiment_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: text('channel_id').notNull().references(() => channels.channelId),
  totalCommentsAnalyzed: integer('total_comments_analyzed'),
  positiveCount: integer('positive_count'),
  neutralCount: integer('neutral_count'),
  negativeCount: integer('negative_count'),
  averageSentiment: decimal('average_sentiment', { precision: 3, scale: 2 }),
  lastAnalyzed: timestamp('last_analyzed').defaultNow(),
}, (table) => ({
  channelIdIdx: index('idx_sentiment_channel_id').on(table.channelId),
}));

export const apiQuotaTracking = pgTable('api_quota_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').unique().notNull(),
  quotaUsed: integer('quota_used').default(0),
  quotaLimit: integer('quota_limit').default(10000),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('idx_quota_date').on(table.date),
}));

export const userSearches = pgTable('user_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  searchQuery: text('search_query'),
  searchType: text('search_type'),
  resultFound: integer('result_found'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  createdAtIdx: index('idx_searches_created_at').on(table.createdAt),
}));

// New table for recent searches feature
export const searches = pgTable('searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: text('channel_id').unique().notNull(),
  title: text('title').notNull(),
  thumbnail: text('thumbnail'),
  handle: text('handle'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  timestampIdx: index('idx_searches_timestamp').on(table.timestamp),
  channelIdIdx: index('idx_searches_channel_id').on(table.channelId),
}));
