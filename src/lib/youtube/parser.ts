import { ParsedYouTubeURL } from './types';

export function parseYouTubeURL(url: string): ParsedYouTubeURL | null {
  try {
    // Clean up the URL
    const cleanUrl = url.trim();

    // Patterns for different YouTube URL formats
    const patterns = [
      // Channel ID: youtube.com/channel/UC...
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]+)/,
        type: 'channel' as const,
      },
      // Handle: youtube.com/@username
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w-]+)/,
        type: 'handle' as const,
      },
      // Custom URL: youtube.com/c/CustomName
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([\w-]+)/,
        type: 'custom' as const,
      },
      // User: youtube.com/user/Username
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([\w-]+)/,
        type: 'user' as const,
      },
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern.regex);
      if (match) {
        return {
          type: pattern.type,
          id: match[1],
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

export function isValidYouTubeURL(url: string): boolean {
  return parseYouTubeURL(url) !== null;
}
