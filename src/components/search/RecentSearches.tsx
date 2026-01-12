'use client';

import { useEffect, useState } from 'react';
import { Clock, Grid3x3, List } from 'lucide-react';
import { SearchEnhanced } from '@/lib/supabase/client';
import { RecentSearchesTableView } from './RecentSearchesTableView';

interface RecentSearchesProps {
  onSearchClick: (channelId: string) => void;
}

export function RecentSearches({ onSearchClick }: RecentSearchesProps) {
  const [searches, setSearches] = useState<SearchEnhanced[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'timestamp' | 'ytct_score' | 'subscriber_count'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  useEffect(() => {
    fetchRecentSearches();
  }, [viewMode, sortBy, sortOrder, page]);

  const fetchRecentSearches = async () => {
    setLoading(true);
    try {
      const limit = viewMode === 'grid' ? 5 : 10;
      const response = await fetch(
        `/api/searches?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
        if (data.pagination) {
          setPagination({
            totalPages: data.pagination.totalPages,
            totalCount: data.pagination.totalCount,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (field: 'timestamp' | 'ytct_score' | 'subscriber_count') => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewToggle = () => {
    setViewMode(viewMode === 'grid' ? 'table' : 'grid');
    setPage(1); // Reset to first page when view changes
  };

  if (loading && searches.length === 0) {
    return null;
  }

  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-700">Recent Searches</h3>
          <span className="text-sm text-gray-500">({pagination.totalCount} total)</span>
        </div>
        <button
          onClick={handleViewToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          {viewMode === 'grid' ? (
            <>
              <List className="w-4 h-4" />
              Table View
            </>
          ) : (
            <>
              <Grid3x3 className="w-4 h-4" />
              Grid View
            </>
          )}
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {searches.map((search) => (
            <button
              key={search.id}
              onClick={() => onSearchClick(search.channel_id)}
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
              {search.ytct_score && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-semibold text-blue-600">
                    {search.ytct_score.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">/ 10</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <RecentSearchesTableView
          searches={searches}
          onSearchClick={onSearchClick}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          pagination={{
            page,
            totalPages: pagination.totalPages,
            onPageChange: handlePageChange,
          }}
        />
      )}
    </div>
  );
}
