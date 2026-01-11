import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

import { YouTubeClient } from '../src/lib/youtube/api';
import { upsertChannel, saveSentimentAnalysis } from '../src/lib/db/queries';
import { getSentimentAnalyzer } from '../src/lib/sentiment/analyzer';
import { getTrustScoreCalculator } from '../src/lib/sentiment/scorer';
import { getQuotaManager } from '../src/lib/youtube/quota';

// Top 100 YouTube Channel IDs (manually curated list)
const TOP_CHANNEL_IDS = [
  // Entertainment & Music
  'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie
  'UCq-Fj5jknLsUf-MWSy4_brA', // T-Series
  'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
  'UCpEhnqL0y41EpW2TvWAHD7Q', // Alan Walker
  'UComP_epzeKzvBX156r6pm1Q', // Marshmello
  'UCEdvpU2pFRCVqU6yIPyTpMQ', // Blackpink
  'UCqECaJ8Gagnn7YCbPEzWH6g', // Taylor Swift (VEVO)
  'UCHkj014U2CQ2Nv0UZeYpE_A', // Ariana Grande (VEVO)
  'UCQR-t-d4UiQzJzb7Dq7bthg', // Ed Sheeran
  'UCzmRILu7d7XwS4kcH0e_pog', // Billie Eilish

  // Gaming
  'UCYzPXprvl5Y-Sf0g4vX-m6g', // Jacksepticeye
  'UC-9-kyTW8ZkZNDHQJ6FgpwQ', // Music
  'UCupvZG-5ko_eiXAupbDfxWw', // Corp
  'UCKuHWsV6cQ-RqsdJ-qD7qpQ', // Tommyinnit
  'UCFAiFyGs6oDiF1Nf-rRJpZA', // Sapnap
  'UC7_YxT-KID8kRbqZo7MyscQ', // Markiplier
  'UCbCmjCuTUZos6Inko4u57UQ', // Valkyrae
  'UCo_IB5145EVNcf8hw1Kku7w', // VanossGaming

  // Education & How-To
  'UCJ0-OtVpF0wOKEqT2Z1HEtA', // Veritasium
  'UC6nSFpj9HTCZ5t-N3Rm3-HA', // Vsauce
  'UCsooa4yRKGN_zEE8iknghZA', // TED-Ed
  'UC4QZ_LsYcvcq7qOsOhpAX4A', // Mark Rober
  'UCsXVk37bltHxD1rDPwtNM8Q', // Kurzgesagt
  'UC7cs8q-gJRlGwj4A8OmCmXg', // Doctor Mike
  'UCfMJ2MchTSW2kWaT0kK94Yw', // Khan Academy
  'UCHnyfMqiRRG1u-2MsSQLbXA', // Veritasium
  'UCQcQSzZb1KP_JAL_nNDkviA', // Primitive Technology

  // Comedy & Entertainment
  'UCPDis9pjXuqyI7RYLJ-yOzw', // Dude Perfect
  'UC295-Dw_tDNtZXFeAPAW6Aw', // Good Mythical Morning
  'UCyWDmyZRjrGHeKF-ofFsT5Q', // Lilly Singh
  'UC8hL6o5UGrTEP5jK9PovbYg', // Ryan Higa (nigahiga)
  'UCYzPXprvl5Y-Sf0g4vX-m6g', // Jacksepticeye
  'UCEWHPFNilsT0IfQfutVzsag', // Liza Koshy
  'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie

  // News & Politics
  'UCupvZG-5ko_eiXAupbDfxWw', // CNN
  'UCeY0bbntWzzVIaj2z3QigXg', // NBC News
  'UC16niRr50-MSBwiO3YDb3RA', // VICE
  'UCesFnORqTKzdZ1eHJh0T_Gg', // The Late Show
  'UCAuUUnT6oDeKwE6v1NGQxug', // TED

  // Tech
  'UCBJycsmduvYEL83R_U4JriQ', // MKBHD
  'UCXuqSBlHAE6Xw-yeJA0Tunw', // Linus Tech Tips
  'UCl2mFZoRqjw_ELax4Yisf6w', // Veritasium
  'UC7YOGHUfC1Tb6E4pudI9STA', // Mental Outlaw
  'UCkWQ0gDrqOCarmUKmppD7GQ', // Unbox Therapy

  // Lifestyle & Vlog
  'UClgRkhTL3_hImCAmdLfDE4g', // Casey Neistat
  'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
  'UCN1hnUccO4FD5WfM7ithXaw', // David Dobrik
  'UCeY0bbntWzzVIaj2z3QigXg', // Emma Chamberlain
  'UCnhfQz5F6gq1PxT48ORGJlQ', // Zoella
];

async function seedChannels() {
  const youtubeClient = new YouTubeClient();
  const sentimentAnalyzer = getSentimentAnalyzer();
  const trustScoreCalculator = getTrustScoreCalculator();
  const quotaManager = getQuotaManager();

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  console.log('🌱 Starting seed process for top YouTube channels...\n');

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
