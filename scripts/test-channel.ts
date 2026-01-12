#!/usr/bin/env tsx

/**
 * Test script to fetch and display channel information from YouTube
 * Usage: npm run test-channel <youtube-url>
 */

import { getYouTubeClient } from '../src/lib/youtube/api';
import { parseYouTubeURL } from '../src/lib/youtube/parser';

const url = process.argv[2];

if (!url) {
  console.error('Usage: npm run test-channel <youtube-url>');
  console.error('Example: npm run test-channel "https://youtube.com/@mkbhd"');
  process.exit(1);
}

async function testChannel() {
  try {
    console.log('Testing URL:', url);
    console.log('');

    // Parse URL
    const parsed = parseYouTubeURL(url);
    console.log('Parsed URL:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('');

    if (!parsed) {
      console.error('Failed to parse URL');
      process.exit(1);
    }

    // Fetch channel
    console.log('Fetching channel from YouTube...');
    const youtubeClient = getYouTubeClient();
    const channel = await youtubeClient.getChannelByParsedURL(parsed);

    if (!channel) {
      console.error('Channel not found');
      process.exit(1);
    }

    // Display channel info
    console.log('');
    console.log('='.repeat(80));
    console.log('CHANNEL INFORMATION');
    console.log('='.repeat(80));
    console.log('');
    console.log('Channel ID:', channel.id);
    console.log('Title:', channel.snippet.title);
    console.log('Custom URL:', channel.snippet.customUrl || 'N/A');
    console.log('Handle:', channel.snippet.customUrl ? `@${channel.snippet.customUrl}` : 'N/A');
    console.log('');
    console.log('Statistics:');
    console.log('  Subscribers:', parseInt(channel.statistics.subscriberCount || '0').toLocaleString());
    console.log('  Videos:', parseInt(channel.statistics.videoCount || '0').toLocaleString());
    console.log('  Views:', parseInt(channel.statistics.viewCount || '0').toLocaleString());
    console.log('');
    console.log('Published:', channel.snippet.publishedAt);
    console.log('Country:', channel.snippet.country || 'N/A');
    console.log('');
    console.log('Description:');
    console.log(channel.snippet.description?.substring(0, 200) + '...');
    console.log('');
    console.log('='.repeat(80));
    console.log('');
    console.log('✓ Channel found successfully');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testChannel();
