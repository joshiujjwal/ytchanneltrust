import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { YTCTScore } from '@/components/score/YTCTScore';
import { Pagination } from '@/components/ui/pagination';
import { SearchEnhanced } from '@/lib/supabase/client';

interface RecentSearchesTableViewProps {
  searches: SearchEnhanced[];
  onSearchClick: (channelId: string) => void;
  sortBy: 'timestamp' | 'ytct_score' | 'subscriber_count';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'timestamp' | 'ytct_score' | 'subscriber_count') => void;
  pagination: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function RecentSearchesTableView({
  searches,
  onSearchClick,
  sortBy,
  sortOrder,
  onSortChange,
  pagination,
}: RecentSearchesTableViewProps) {
  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    // Ensure we're parsing the date correctly - add 'Z' if not present to force UTC interpretation
    const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(dateStr);
    const now = new Date();

    // Calculate difference using UTC timestamps to avoid timezone issues
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Handle negative values (future dates due to clock sync issues)
    if (diffMs < 0) return 'Just now';

    // Handle very recent timestamps
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    // Handle days
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  if (searches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent searches found. Start searching for channels!
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Channel Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSortChange('ytct_score')}
              >
                <div className="flex items-center gap-2">
                  YTCT Score
                  <SortIcon field="ytct_score" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSortChange('subscriber_count')}
              >
                <div className="flex items-center gap-2">
                  Subscribers
                  <SortIcon field="subscriber_count" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSortChange('timestamp')}
              >
                <div className="flex items-center gap-2">
                  Last Searched
                  <SortIcon field="timestamp" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {searches.map((search) => (
              <tr
                key={search.id}
                onClick={() => onSearchClick(search.channel_id)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {search.thumbnail && (
                      <img
                        src={search.thumbnail}
                        alt={search.title}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {search.title}
                      </p>
                      {search.handle && (
                        <p className="text-xs text-gray-500 truncate">{search.handle}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {search.ytct_score ? (
                    <YTCTScore
                      score={search.ytct_score}
                      rating={search.ytct_rating as any}
                      size="sm"
                      showLabel={false}
                    />
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(search.subscriber_count)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{formatDate(search.timestamp)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.onPageChange}
      />
    </div>
  );
}
