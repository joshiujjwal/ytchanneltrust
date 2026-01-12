import { ParsedYouTubeURL } from './types';

export function parseYouTubeURL(url: string): ParsedYouTubeURL | null {
  try {
    // Clean up the URL
    const cleanUrl = url.trim();

    // Patterns for different YouTube URL formats
    const patterns = [
      // Video URLs: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
      {
        regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
        type: 'video' as const,
      },
      // Channel ID: youtube.com/channel/UC...
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]+)/,
        type: 'channel' as const,
      },
      // Handle: youtube.com/@username (can include dots)
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/,
        type: 'handle' as const,
      },
      // Custom URL: youtube.com/c/CustomName (can include dots)
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([\w.-]+)/,
        type: 'custom' as const,
      },
      // User: youtube.com/user/Username (can include dots)
      {
        regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([\w.-]+)/,
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
