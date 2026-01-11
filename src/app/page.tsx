'use client';

import { useEffect, useState } from 'react';
import { ChannelCard } from '@/components/dashboard/ChannelCard';
import { SearchBar } from '@/components/search/SearchBar';
import { URLInput } from '@/components/search/URLInput';
import { Loader2 } from 'lucide-react';

interface Channel {
  channelId: string;
  channelName: string;
  thumbnailUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  trustScore: string | null;
  channelCategory: string | null;
}

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChannels();
  }, [searchQuery]);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/channels?q=${encodeURIComponent(searchQuery)}`
        : '/api/channels?limit=100';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">YTReviews</h1>
          <p className="text-xl text-muted-foreground">
            Trust ratings and sentiment analysis for YouTube channels
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Add Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="lg:col-span-1">
            <URLInput />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Channels</p>
                <p className="text-3xl font-bold">{channels.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Trust Score</p>
                <p className="text-3xl font-bold">
                  {channels.length > 0
                    ? (
                        channels.reduce(
                          (sum, ch) => sum + (parseFloat(ch.trustScore || '0')),
                          0
                        ) / channels.length
                      ).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold">
                  {channels.length > 0
                    ? (
                        channels.reduce(
                          (sum, ch) => sum + (ch.subscriberCount || 0),
                          0
                        ) / 1_000_000
                      ).toFixed(0) + 'M'
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {searchQuery
                ? `No channels found for "${searchQuery}"`
                : 'No channels yet. Add your first channel above!'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Top YouTube Channels'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <ChannelCard key={channel.channelId} channel={channel} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
