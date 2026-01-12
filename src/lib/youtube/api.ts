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
      console.log('[YouTube API] Fetching channel by ID:', channelId);
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channelId],
      });

      const channel = (response.data.items?.[0] as YouTubeChannel) || null;
      if (channel) {
        console.log('[YouTube API] Channel found:', {
          id: channel.id,
          title: channel.snippet.title,
          customUrl: channel.snippet.customUrl,
          subscriberCount: channel.statistics.subscriberCount,
        });
      } else {
        console.log('[YouTube API] No channel found for ID:', channelId);
      }

      return channel;
    } catch (error) {
      console.error('Error fetching channel by ID:', error);
      throw error;
    }
  }

  async getChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
    try {
      console.log('[YouTube API] Fetching channel by handle:', handle);

      // First, try the forHandle parameter (new YouTube API feature)
      try {
        const response = await this.youtube.channels.list({
          part: ['snippet', 'statistics', 'contentDetails'],
          forHandle: handle.startsWith('@') ? handle.substring(1) : handle,
        } as any);

        const channel = (response.data.items?.[0] as YouTubeChannel) || null;
        if (channel) {
          console.log('[YouTube API] Channel found via forHandle:', {
            id: channel.id,
            title: channel.snippet.title,
            customUrl: channel.snippet.customUrl,
          });
          return channel;
        }
      } catch (handleError) {
        console.log('[YouTube API] forHandle parameter not supported, falling back to search');
      }

      // Fallback: search for the channel by handle
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: handle,
        type: ['channel'],
        maxResults: 5,
      });

      console.log('[YouTube API] Search results for handle:', searchResponse.data.items?.map(item => ({
        channelId: item.snippet?.channelId,
        title: item.snippet?.title,
        description: item.snippet?.description?.substring(0, 100),
      })));

      const channelId = searchResponse.data.items?.[0]?.snippet?.channelId;

      if (!channelId) {
        console.log('[YouTube API] No channel found for handle:', handle);
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
      console.log('[YouTube API] Fetching channel by custom URL:', customUrl);

      // Search for channel by custom URL name
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: customUrl,
        type: ['channel'],
        maxResults: 5,
      });

      console.log('[YouTube API] Search results for custom URL:', searchResponse.data.items?.map(item => ({
        channelId: item.snippet?.channelId,
        title: item.snippet?.title,
        description: item.snippet?.description?.substring(0, 100),
      })));

      // Try to find exact match
      for (const item of searchResponse.data.items || []) {
        const channelId = item.snippet?.channelId;
        if (channelId) {
          const channel = await this.getChannelById(channelId);
          if (channel?.snippet.customUrl?.toLowerCase() === customUrl.toLowerCase()) {
            console.log('[YouTube API] Found exact custom URL match');
            return channel;
          }
        }
      }

      // If no exact match, return the first result
      console.log('[YouTube API] No exact match, using first search result');
      const channelId = searchResponse.data.items?.[0]?.snippet?.channelId;
      return channelId ? await this.getChannelById(channelId) : null;
    } catch (error) {
      console.error('Error fetching channel by custom URL:', error);
      throw error;
    }
  }

  async getChannelByUsername(username: string): Promise<YouTubeChannel | null> {
    try {
      console.log('[YouTube API] Fetching channel by username:', username);
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        forUsername: username,
      });

      const channel = (response.data.items?.[0] as YouTubeChannel) || null;
      if (channel) {
        console.log('[YouTube API] Channel found via username:', {
          id: channel.id,
          title: channel.snippet.title,
          customUrl: channel.snippet.customUrl,
        });
      } else {
        console.log('[YouTube API] No channel found for username:', username);
      }

      return channel;
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
      case 'video':
        // Resolve video to channel
        return await this.getChannelFromVideoId(parsed.id);
      default:
        return null;
    }
  }

  async getChannelFromVideoId(videoId: string): Promise<YouTubeChannel | null> {
    try {
      console.log('[YouTube API] Resolving video to channel:', videoId);

      const videoResponse = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
      });

      const video = videoResponse.data.items?.[0];
      if (!video || !video.snippet?.channelId) {
        console.log('[YouTube API] No channel found for video:', videoId);
        return null;
      }

      const channelId = video.snippet.channelId;
      console.log('[YouTube API] Video belongs to channel:', channelId);

      return await this.getChannelById(channelId);
    } catch (error) {
      console.error('Error resolving video to channel:', error);
      throw error;
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  async getRecentVideoTags(channelId: string, maxVideos: number = 10): Promise<string[]> {
    try {
      console.log('[YouTube API] Fetching tags from recent videos:', channelId);

      // Get channel's upload playlist
      const channel = await this.getChannelById(channelId);
      if (!channel) return [];

      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

      // Get recent videos from uploads playlist
      const playlistResponse = await this.youtube.playlistItems.list({
        part: ['contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults: maxVideos,
      });

      const videoIds = playlistResponse.data.items
        ?.map((item) => item.contentDetails?.videoId)
        .filter((id): id is string => !!id) || [];

      if (videoIds.length === 0) return [];

      // Get video details including tags
      const videosResponse = await this.youtube.videos.list({
        part: ['snippet'],
        id: videoIds,
      });

      // Extract all tags
      const allTags: string[] = [];
      videosResponse.data.items?.forEach((video) => {
        const tags = video.snippet?.tags || [];
        allTags.push(...tags);
      });

      console.log('[YouTube API] Extracted', allTags.length, 'tags from', videoIds.length, 'videos');

      return allTags;
    } catch (error) {
      console.error('Error fetching video tags:', error);
      return [];
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
