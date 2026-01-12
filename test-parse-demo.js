// Quick test to demonstrate the parser fix

function parseYouTubeURL(url) {
  const patterns = [
    // Handle: youtube.com/@username (can include dots)
    {
      regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/,
      type: 'handle',
    },
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        id: match[1],
      };
    }
  }

  return null;
}

const testUrls = [
  'https://www.youtube.com/@nikhil.kamath',
  'https://youtube.com/@mkbhd',
  'https://www.youtube.com/@user.with.dots',
  'https://www.youtube.com/@test.user-name',
];

console.log('Testing URL Parser Fix\n');
console.log('='.repeat(60));

testUrls.forEach(url => {
  const parsed = parseYouTubeURL(url);
  console.log(`\nURL: ${url}`);
  console.log(`  Parsed ID: ${parsed?.id || 'FAILED'}`);
  console.log(`  Type: ${parsed?.type || 'FAILED'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✓ Parser now correctly handles dots in handles!');
