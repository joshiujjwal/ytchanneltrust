import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

import { YouTubeClient } from '../src/lib/youtube/api';
import { upsertChannel, saveSentimentAnalysis } from '../src/lib/db/queries';
import { getSentimentAnalyzer } from '../src/lib/sentiment/analyzer';
import { getTrustScoreCalculator } from '../src/lib/sentiment/scorer';
import { getQuotaManager } from '../src/lib/youtube/quota';

// Top 50 YouTube Channels Worldwide (by subscriber count)
const TOP_CHANNEL_IDS = [
  // Top 10 Most Subscribed
  'UCq-Fj5jknLsUf-MWSy4_brA', // T-Series (274M+)
  'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast (250M+)
  'UCWwqHwqLSrdWMgp5DZG5Dzg', // Cocomelon - Nursery Rhymes (180M+)
  'UCkYqyOIGz89fGbi606JsH9Q', // SET India (177M+)
  'UCX7-RmM6U6jD2C1Vhm_9jzA', // Kids Diana Show (123M+)
  'UCpEhnqL0y41EpW2TvWAHD7Q', // Like Nastya (115M+)
  'UCFFbwnve3yF62-tVXkTyHqg', // Vlad and Niki (113M+)
  'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie (111M+)
  'UCq1nOwV-p1NKT4Pmfqnk8cA', // Zee Music Company (109M+)
  'UCpko_-a4wgz2u_DgDgd9fqA', // WWE (99M+)

  // 11-20: Music & Entertainment
  'UComP_epzeKzvBX156r6pm1Q', // BLACKPINK (94M+)
  'UCq8qzlMH3DChG9FqJ8NmNPA', // Zee TV (81M+)
  'UCbCmjCuTUZos6Inko4u57UQ', // 5-Minute Crafts (80M+)
  'UC-9-kyTW8ZkZNDHQJ6FgpwQ', // BANGTANTV (BTS) (78M+)
  'UCXIJgqnII2ZOINSWNOGFThA', // Sony SAB (76M+)
  'UCq19-LqvG35A-30oyAiPiqA', // Goldmines (75M+)
  'UCEdvpU2pFRCVqU6yIPyTpMQ', // HYBE Labels (74M+)
  'UCEWHPFNilsT0IfQfutVzsag', // Justin Bieber (72M+)
  'UCbLDx7fHbZfGqZfvfEKe0nQ', // Colors TV (70M+)
  'UCq0OpeKNTLb-BNvK7VdoxxQ', // Shemaroo (69M+)

  // 21-30: More Entertainment
  'UCiZKszJUUJ0BgEdLIL2CrnQ', // Tips Official (68M+)
  'UCYfdidRxbB8Qhf0Nx7ioOYw', // Canal KondZilla (66M+)
  'UCOL9ZWUqg8ZRZlL8lLJxlTQ', // Aaj Tak (67M+)
  'UCFFbwnve3yF62-tVXkTyHqg', // Pinkfong Baby Shark (65M+)
  'UCPDis9pjXuqyI7RYLJ-yOzw', // Dude Perfect (60M+)
  'UCX0kHxsVZLCHdFdj3FxXhAw', // Fernanfloo (46M+)
  'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // elrubiusOMG (40M+)
  'UC7_YxT-KID8kRbqZo7MyscQ', // Markiplier (37M+)
  'UCYzPXprvl5Y-Sf0g4vX-m6g', // jacksepticeye (31M+)
  'UC4QZ_LsYcvcq7qOsOhpAX4A', // Mark Rober (28M+)

  // 31-40: Gaming & Tech
  'UCo_IB5145EVNcf8hw1Kku7w', // VanossGaming (26M+)
  'UCkWQ0gDrqOCarmUKmppD7GQ', // Unbox Therapy (24M+)
  'UCAuUUnT6oDeKwE6v1NGQxug', // TED (24M+)
  'UCsXVk37bltHxD1rDPwtNM8Q', // Kurzgesagt (22M+)
  'UCBJycsmduvYEL83R_U4JriQ', // MKBHD (19M+)
  'UC6nSFpj9HTCZ5t-N3Rm3-HA', // Vsauce (19M+)
  'UCsooa4yRKGN_zEE8iknghZA', // TED-Ed (19M+)
  'UC295-Dw_tDNtZXFeAPAW6Aw', // Good Mythical Morning (19M+)
  'UCN1hnUccO4FD5WfM7ithXaw', // David Dobrik (18M+)
  'UCXuqSBlHAE6Xw-yeJA0Tunw', // Linus Tech Tips (16M+)

  // 41-50: Education & Lifestyle
  'UCJ0-OtVpF0wOKEqT2Z1HEtA', // Veritasium (16M+)
  'UC7cs8q-gJRlGwj4A8OmCmXg', // Doctor Mike (12M+)
  'UClgRkhTL3_hImCAmdLfDE4g', // Casey Neistat (12M+)
  'UCfMJ2MchTSW2kWaT0kK94Yw', // Khan Academy (8M+)
  'UCpko_-a4wgz2u_DgDgd9fqA', // SonyLIV (68M+)
  'UCq-Fj5jknLsUf-MWSy4_brA', // Zee Cinema (65M+)
  'UCq19-LqvG35A-30oyAiPiqA', // Wave Music (63M+)
  'UCbLDx7fHbZfGqZfvfEKe0nQ', // SET India (60M+)
  'UCq0OpeKNTLb-BNvK7VdoxxQ', // Sony Entertainment (58M+)
  'UCiZKszJUUJ0BgEdLIL2CrnQ', // Tips Music (56M+)
];

async function seedChannels() {
  const youtubeClient = new YouTubeClient();
  const sentimentAnalyzer = getSentimentAnalyzer();
  const trustScoreCalculator = getTrustScoreCalculator();
  const quotaManager = getQuotaManager();

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  console.log('🌱 Starting seed process for Top 50 YouTube channels worldwide...\n');

  for (let i = 0; i < TOP_CHANNEL_IDS.length; i++) {
    const channelId = TOP_CHANNEL_IDS[i];

    try {
      // Check quota before proceeding
      const canFetch = await quotaManager.canFetchChannel();
      if (!canFetch) {
        console.log(`⚠️  API quota exceeded. Processed ${successCount} channels.`);
        break;
      }

      console.log(`[${i + 1}/${TOP_CHANNEL_IDS.length}] Fetching channel: ${channelId}...`);

      // Fetch channel data
      const channelData = await youtubeClient.getChannelById(channelId);
      await quotaManager.recordChannelFetch();

      if (!channelData) {
        console.log(`  ❌ Channel not found: ${channelId}`);
        errorCount++;
        continue;
      }

      console.log(`  ✓ Found: ${channelData.snippet.title}`);

      // Perform sentiment analysis (optional, uses more quota)
      let sentimentResult = null;
      let trustScore = '0.00';

      // Only analyze sentiment for first 20 channels to conserve quota
      if (i < 20) {
        try {
          const canAnalyze = await quotaManager.canFetchComments();
          if (canAnalyze) {
            console.log(`  📊 Analyzing sentiment...`);
            sentimentResult = await sentimentAnalyzer.analyzeChannel(channelData.id, 3, 30);

            // Calculate trust score
            const trustScoreResult = trustScoreCalculator.calculateTrustScore(
              channelData,
              sentimentResult
            );
            trustScore = trustScoreResult.overall.toFixed(2);

            console.log(`  ✓ Trust score: ${trustScore}`);

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
          console.log(`  ⚠️  Sentiment analysis failed, continuing without it`);
        }
      } else {
        // For remaining channels, just calculate trust score without sentiment
        const trustScoreResult = trustScoreCalculator.calculateTrustScore(channelData, undefined);
        trustScore = trustScoreResult.overall.toFixed(2);
      }

      // Save channel to database
      await upsertChannel({
        channelId: channelData.id,
        channelUrl: `https://youtube.com/channel/${channelData.id}`,
        channelName: channelData.snippet.title,
        creatorName: channelData.snippet.title,
        subscriberCount: parseInt(channelData.statistics.subscriberCount),
        videoCount: parseInt(channelData.statistics.videoCount),
        viewCount: parseInt(channelData.statistics.viewCount),
        description: channelData.snippet.description,
        thumbnailUrl: channelData.snippet.thumbnails.high.url,
        publishedAt: new Date(channelData.snippet.publishedAt),
        country: channelData.snippet.country,
        customUrl: channelData.snippet.customUrl,
        trustScore,
        sentimentScore: sentimentResult?.averageSentiment.toFixed(2) || '0.00',
      });

      console.log(`  ✅ Added to database\n`);
      successCount++;

      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`  ❌ Error processing ${channelId}:`, error.message, '\n');
      errorCount++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Seeding complete!');
  console.log('='.repeat(50));
  console.log(`✅ Successfully added: ${successCount} channels`);
  console.log(`❌ Errors: ${errorCount} channels`);
  console.log(`⏭️  Skipped: ${skippedCount} channels`);

  // Show quota status
  const quotaStatus = await quotaManager.getQuotaStatus();
  console.log(`\n📊 API Quota: ${quotaStatus.used}/${quotaStatus.limit} (${quotaStatus.percentage.toFixed(1)}% used)`);

  process.exit(0);
}

// Run the seeding function
seedChannels().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
