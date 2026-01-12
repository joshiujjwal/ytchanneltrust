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

// Add a new search to the database
export async function addSearch(data: {
  channelId: string;
  title: string;
  thumbnail?: string;
  handle?: string;
}) {
  const { error } = await supabase.from('searches').insert({
    channel_id: data.channelId,
    title: data.title,
    thumbnail: data.thumbnail || null,
    handle: data.handle || null,
  });

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
