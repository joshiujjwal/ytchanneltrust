#!/usr/bin/env tsx

/**
 * Test script to verify URL parsing
 */

import { parseYouTubeURL } from '../src/lib/youtube/parser';

const testUrls = [
  'https://www.youtube.com/@nikhil.kamath',
  'https://youtube.com/@mkbhd',
  'https://www.youtube.com/@username-with-dash',
  'https://www.youtube.com/@user.with.dots',
  'https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ',
  'https://www.youtube.com/c/CustomName',
  'https://www.youtube.com/user/Username',
  'https://www.youtube.com/@test.user-name_123',
];

console.log('Testing URL Parser');
console.log('='.repeat(80));
console.log('');

for (const url of testUrls) {
  const parsed = parseYouTubeURL(url);
  console.log(`URL: ${url}`);
  console.log(`  Type: ${parsed?.type || 'FAILED'}`);
  console.log(`  ID:   ${parsed?.id || 'FAILED'}`);
  console.log('');
}

console.log('='.repeat(80));
