export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  contentDetails: {
    relatedPlaylists: {
      uploads: string;
    };
  };
}

export interface YouTubeVideo {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
  };
}

export interface YouTubeComment {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        authorDisplayName: string;
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
      };
    };
  };
}

export interface ParsedYouTubeURL {
  type: 'channel' | 'handle' | 'custom' | 'user' | 'video';
  id: string;
}

export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}
