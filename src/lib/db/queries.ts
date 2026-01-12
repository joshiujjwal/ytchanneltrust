import { db } from './index';
import { channels, sentimentAnalysis, comments, apiQuotaTracking } from './schema';
import { desc, eq, ilike, sql } from 'drizzle-orm';

export interface ChannelInsert {
  channelId: string;
  channelUrl: string;
  channelName: string;
  channelHandle?: string;
  creatorName?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  channelCategory?: string;
  mediaHouse?: string;
  description?: string;
  thumbnailUrl?: string;
  publishedAt?: Date;
  country?: string;
  customUrl?: string;
  consistencyScore?: string;
  growthRatio?: string;
  longevityDays?: number;
  contentDna?: string[];
  trustScore?: string;
  sentimentScore?: string;
  ytctScore?: string;
  ytctRating?: string;
  ytctComponents?: string;
}

export interface SentimentInsert {
  channelId: string;
  totalCommentsAnalyzed: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageSentiment: string;
}

export async function getTopChannels(limit: number = 100) {
  return await db
    .select()
    .from(channels)
    .orderBy(desc(channels.subscriberCount))
    .limit(limit);
}

export async function searchChannels(query: string, limit: number = 20) {
  return await db
    .select()
    .from(channels)
    .where(ilike(channels.channelName, `%${query}%`))
    .orderBy(desc(channels.subscriberCount))
    .limit(limit);
}

export async function getChannelById(channelId: string) {
  const result = await db
    .select()
    .from(channels)
    .where(eq(channels.channelId, channelId))
    .limit(1);

  return result[0];
}

export async function getChannelWithSentiment(channelId: string) {
  const result = await db
    .select({
      channel: channels,
      sentiment: sentimentAnalysis,
    })
    .from(channels)
    .leftJoin(sentimentAnalysis, eq(channels.channelId, sentimentAnalysis.channelId))
    .where(eq(channels.channelId, channelId))
    .limit(1);

  return result[0];
}

export async function upsertChannel(data: ChannelInsert) {
  const result = await db
    .insert(channels)
    .values(data)
    .onConflictDoUpdate({
      target: channels.channelId,
      set: {
        ...data,
        lastUpdated: sql`NOW()`,
      },
    })
    .returning();

  return result[0];
}

export async function saveSentimentAnalysis(data: SentimentInsert) {
  const existing = await db
    .select()
    .from(sentimentAnalysis)
    .where(eq(sentimentAnalysis.channelId, data.channelId))
    .limit(1);

  if (existing.length > 0) {
    const result = await db
      .update(sentimentAnalysis)
      .set({
        ...data,
        lastAnalyzed: sql`NOW()`,
      })
      .where(eq(sentimentAnalysis.channelId, data.channelId))
      .returning();

    return result[0];
  } else {
    const result = await db
      .insert(sentimentAnalysis)
      .values(data)
      .returning();

    return result[0];
  }
}

export async function getOrCreateQuotaTracking(date: string) {
  const existing = await db
    .select()
    .from(apiQuotaTracking)
    .where(eq(apiQuotaTracking.date, date))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db
    .insert(apiQuotaTracking)
    .values({
      date,
      quotaUsed: 0,
      quotaLimit: 10000,
    })
    .returning();

  return result[0];
}

export async function incrementQuota(units: number) {
  const today = new Date().toISOString().split('T')[0];
  const tracking = await getOrCreateQuotaTracking(today);

  const result = await db
    .update(apiQuotaTracking)
    .set({
      quotaUsed: sql`${apiQuotaTracking.quotaUsed} + ${units}`,
    })
    .where(eq(apiQuotaTracking.date, today))
    .returning();

  return result[0];
}

export async function getQuotaUsage() {
  const today = new Date().toISOString().split('T')[0];
  return await getOrCreateQuotaTracking(today);
}
