import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Search {
  id: string;
  channel_id: string;
  title: string;
  thumbnail: string | null;
  handle: string | null;
  timestamp: string;
}

interface RecentSearchesProps {
  onSearchClick: (channelUrl: string) => void;
}

export function RecentSearches({ onSearchClick }: RecentSearchesProps) {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch('/api/searches');
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
      }
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || searches.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-700">Recent Searches</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {searches.map((search) => (
          <button
            key={search.id}
            onClick={() => onSearchClick(`https://youtube.com/channel/${search.channel_id}`)}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow text-left group"
          >
            {search.thumbnail && (
              <img
                src={search.thumbnail}
                alt={search.title}
                className="w-full aspect-square rounded-md mb-2 object-cover"
              />
            )}
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
              {search.title}
            </p>
            {search.handle && (
              <p className="text-xs text-gray-500 truncate">{search.handle}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
