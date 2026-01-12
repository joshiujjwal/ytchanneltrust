import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the searches table
export interface Search {
  id: string;
  channel_id: string;
  title: string;
  thumbnail: string | null;
  handle: string | null;
  timestamp: string;
}

// Enhanced search interface with YTCT score and metrics
export interface SearchEnhanced extends Search {
  ytct_score: number | null;
  ytct_rating: string | null;
  subscriber_count: number | null;
  video_count: number | null;
}

// Add a new search to the database
// Uses UPSERT to prevent duplicates - if channel already exists, updates timestamp
export async function addSearch(data: {
  channelId: string;
  title: string;
  thumbnail?: string;
  handle?: string;
}) {
  const { error } = await supabase.from('searches').upsert(
    {
      channel_id: data.channelId,
      title: data.title,
      thumbnail: data.thumbnail || null,
      handle: data.handle || null,
      timestamp: new Date().toISOString(),
    },
    {
      onConflict: 'channel_id',
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error('Error adding search:', error);
    throw error;
  }
}

// Get the 5 most recent searches
export async function getRecentSearches(): Promise<Search[]> {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }

  return data || [];
}

// Clear all searches (optional utility)
export async function clearSearches() {
  const { error } = await supabase.from('searches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error clearing searches:', error);
    throw error;
  }
}

// Add a new search with YTCT score and metrics
export async function addSearchEnhanced(data: {
  channelId: string;
  title: string;
  thumbnail?: string;
  handle?: string;
  ytctScore?: number;
  ytctRating?: string;
  subscriberCount?: number;
  videoCount?: number;
}) {
  const { error } = await supabase.from('searches').upsert(
    {
      channel_id: data.channelId,
      title: data.title,
      thumbnail: data.thumbnail || null,
      handle: data.handle || null,
      ytct_score: data.ytctScore || null,
      ytct_rating: data.ytctRating || null,
      subscriber_count: data.subscriberCount || null,
      video_count: data.videoCount || null,
      timestamp: new Date().toISOString(),
    },
    {
      onConflict: 'channel_id',
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error('Error adding search:', error);
    throw error;
  }
}

// Get recent searches with pagination and sorting
export async function getRecentSearchesPaginated(options: {
  limit: number;
  offset: number;
  sortBy: 'timestamp' | 'ytct_score' | 'subscriber_count';
  sortOrder: 'asc' | 'desc';
}): Promise<SearchEnhanced[]> {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .order(options.sortBy, { ascending: options.sortOrder === 'asc' })
    .range(options.offset, options.offset + options.limit - 1);

  if (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }

  return data || [];
}

// Get total count of searches for pagination
export async function getTotalSearchesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('searches')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting searches:', error);
    return 0;
  }

  return count || 0;
}

// Get a single search by channel ID
export async function getSearchByChannelId(channelId: string): Promise<SearchEnhanced | null> {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .eq('channel_id', channelId)
    .single();

  if (error) {
    console.error('Error fetching search:', error);
    return null;
  }

  return data;
}
