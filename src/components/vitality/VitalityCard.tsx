import { Activity, TrendingUp, Clock, Tag } from 'lucide-react';

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

export function VitalityCard({ data }: { data: VitalityData }) {
  const { channel, vitality } = data;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Channel Identity */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b">
        <div className="flex items-start gap-6">
          <img
            src={channel.thumbnailUrl}
            alt={channel.title}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{channel.title}</h2>
            {channel.handle && (
              <p className="text-lg text-gray-600 mb-2">{channel.handle}</p>
            )}
            <a
              href={`https://youtube.com/channel/${channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View on YouTube →
            </a>
          </div>
        </div>
      </div>

      {/* The Big Three */}
      <div className="grid grid-cols-3 gap-4 p-8 bg-gray-50 border-b">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Subscribers</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(channel.subscriberCount)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Videos</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(channel.videoCount)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Views</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(channel.viewCount)}</p>
        </div>
      </div>

      {/* Vitality Metrics */}
      <div className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Vitality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Consistency Score */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Consistency</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vitality.consistencyScore.toFixed(1)}</p>
            <p className="text-sm text-gray-600 mt-1">videos/month</p>
          </div>

          {/* Growth Ratio */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Growth Ratio</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(vitality.growthRatio)}</p>
            <p className="text-sm text-gray-600 mt-1">subs/video</p>
          </div>

          {/* Longevity */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Longevity</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vitality.longevityDisplay}</p>
            <p className="text-sm text-gray-600 mt-1">{vitality.longevityDays.toLocaleString()} days</p>
          </div>
        </div>

        {/* Content DNA */}
        {vitality.contentDna.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Content DNA</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {vitality.contentDna.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Top 5 most frequent tags from the last 10 videos
            </p>
          </div>
        )}

        {/* Description */}
        {channel.description && (
          <div className="mt-8 pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
              {channel.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
