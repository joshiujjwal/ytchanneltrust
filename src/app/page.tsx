'use client';

import { useState } from 'react';
import { VitalityCard } from '@/components/vitality/VitalityCard';
import { RecentSearches } from '@/components/search/RecentSearches';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface VitalityData {
  channel: {
    id: string;
    title: string;
    handle: string | null;
    thumbnailUrl: string;
    description: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: string;
    country: string | null;
  };
  vitality: {
    consistencyScore: number;
    consistencyDisplay: string;
    growthRatio: number;
    growthRatioDisplay: string;
    longevityDays: number;
    longevityDisplay: string;
    contentDna: string[];
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VitalityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchUrl?: string) => {
    const urlToSearch = searchUrl || url;

    if (!urlToSearch.trim()) {
      toast.error('Please enter a YouTube channel or video URL');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToSearch }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch channel data');
      }

      setData(result);

      // Add to recent searches
      await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: result.channel.id,
          title: result.channel.title,
          thumbnail: result.channel.thumbnailUrl,
          handle: result.channel.handle,
        }),
      });

      toast.success('Channel data loaded successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Toaster position="top-center" richColors />

      {/* Landing State - Centered Search */}
      {!data && !loading && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              YTChannel<span className="text-blue-600">Trust</span>
            </h1>
            <p className="text-xl text-gray-600">
              Objective metadata dashboard for YouTube channels, reviews ( coming soon... )
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-3xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Paste a YouTube channel or video URL..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 shadow-lg hover:shadow-xl transition-shadow"
              />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => handleSearch()}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Analyze Channel
              </button>
            </div>

            {/* Example URLs */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p className="mb-2">Supported formats:</p>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
                <span className="bg-gray-100 px-3 py-1 rounded">youtube.com/@handle</span>
                <span className="bg-gray-100 px-3 py-1 rounded">youtube.com/channel/UC...</span>
                <span className="bg-gray-100 px-3 py-1 rounded">youtube.com/watch?v=...</span>
              </div>
            </div>
          </div>

          {/* Recent Searches */}
          <RecentSearches onSearchClick={(channelUrl) => {
            setUrl(channelUrl);
            handleSearch(channelUrl);
          }} />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-xl text-gray-600">Analyzing channel...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Results State */}
      {data && !loading && (
        <div className="px-4 py-12">
          {/* Back to Search */}
          <div className="max-w-4xl mx-auto mb-8">
            <button
              onClick={() => {
                setData(null);
                setUrl('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← New Search
            </button>
          </div>

          {/* Vitality Card */}
          <VitalityCard data={data} />

          {/* Another Search */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search another channel..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && !data && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setUrl('');
              }}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
