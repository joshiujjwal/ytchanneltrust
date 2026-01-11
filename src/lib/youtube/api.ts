import { google } from 'googleapis';
import { YouTubeChannel, YouTubeVideo, YouTubeComment, ParsedYouTubeURL } from './types';

export class YouTubeClient {
  private youtube;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.YOUTUBE_API_KEY;

    if (!key) {
      throw new Error('YouTube API key is required');
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: key,
    });
  }

  async getChannelById(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channelId],
      });

      return (response.data.items?.[0] as YouTubeChannel) || null;
    } catch (error) {
      console.error('Error fetching channel by ID:', error);
      throw error;
    }
  }

  async getChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
    try {
      // First, search for the channel by handle
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: handle,
        type: ['channel'],
        maxResults: 1,
      });

      const channelId = searchResponse.data.items?.[0]?.snippet?.channelId;

      if (!channelId) {
        return null;
      }

      // Then get full channel details
      return await this.getChannelById(channelId);
    } catch (error) {
      console.error('Error fetching channel by handle:', error);
      throw error;
    }
  }

  async getChannelByCustomUrl(customUrl: string): Promise<YouTubeChannel | null> {
    try {
      // Search for channel by custom URL name
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: customUrl,
        type: ['channel'],
        maxResults: 5,
      });

      // Try to find exact match
      for (const item of searchResponse.data.items || []) {
        const channelId = item.snippet?.channelId;
        if (channelId) {
          const channel = await this.getChannelById(channelId);
          if (channel?.snippet.customUrl?.toLowerCase() === customUrl.toLowerCase()) {
            return channel;
          }
        }
      }

      // If no exact match, return the first result
      const channelId = searchResponse.data.items?.[0]?.snippet?.channelId;
      return channelId ? await this.getChannelById(channelId) : null;
    } catch (error) {
      console.error('Error fetching channel by custom URL:', error);
      throw error;
    }
  }

  async getChannelByUsername(username: string): Promise<YouTubeChannel | null> {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        forUsername: username,
      });

      return (response.data.items?.[0] as YouTubeChannel) || null;
    } catch (error) {
      console.error('Error fetching channel by username:', error);
      throw error;
    }
  }

  async getChannelByParsedURL(parsed: ParsedYouTubeURL): Promise<YouTubeChannel | null> {
    switch (parsed.type) {
      case 'channel':
        return await this.getChannelById(parsed.id);
      case 'handle':
        return await this.getChannelByHandle(parsed.id);
      case 'custom':
        return await this.getChannelByCustomUrl(parsed.id);
      case 'user':
        return await this.getChannelByUsername(parsed.id);
      default:
        return null;
    }
  }

  async searchChannelsByName(query: string, maxResults: number = 10): Promise<YouTubeChannel[]> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['channel'],
        maxResults,
      });

      const channels: YouTubeChannel[] = [];

      for (const item of searchResponse.data.items || []) {
        const channelId = item.snippet?.channelId;
        if (channelId) {
          const channel = await this.getChannelById(channelId);
          if (channel) {
            channels.push(channel);
          }
        }
      }

      return channels;
    } catch (error) {
      console.error('Error searching channels:', error);
      throw error;
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['id', 'snippet'],
        channelId,
        type: ['video'],
        order: 'viewCount',
        maxResults,
      });

      return (response.data.items as YouTubeVideo[]) || [];
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }

  async getVideoComments(videoId: string, maxResults: number = 100): Promise<YouTubeComment[]> {
    try {
      const response = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults,
        order: 'relevance',
        textFormat: 'plainText',
      });

      return (response.data.items as YouTubeComment[]) || [];
    } catch (error) {
      // Some videos have comments disabled
      console.error('Error fetching video comments:', error);
      return [];
    }
  }
}

// Singleton instance
let youtubeClient: YouTubeClient | null = null;

export function getYouTubeClient(): YouTubeClient {
  if (!youtubeClient) {
    youtubeClient = new YouTubeClient();
  }
  return youtubeClient;
}
