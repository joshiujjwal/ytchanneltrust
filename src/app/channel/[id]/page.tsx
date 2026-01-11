'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrustScore } from '@/components/channel/TrustScore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatDate, formatRelativeTime } from '@/lib/utils/format';
import { ArrowLeft, ExternalLink, Users, Video, Eye, Calendar, MapPin, Loader2 } from 'lucide-react';

interface Channel {
  channelId: string;
  channelName: string;
  creatorName: string | null;
  thumbnailUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  viewCount: number | null;
  description: string | null;
  channelCategory: string | null;
  mediaHouse: string | null;
  country: string | null;
  publishedAt: string | null;
  trustScore: string | null;
  sentimentScore: string | null;
  channelUrl: string;
}

interface Sentiment {
  totalCommentsAnalyzed: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageSentiment: string;
}

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      fetchChannel();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/channels/${channelId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch channel');
      }

      setChannel(data.channel);
      setSentiment(data.sentiment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Channel Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The channel you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const trustScore = channel.trustScore ? parseFloat(channel.trustScore) : 0;
  const sentimentScore = channel.sentimentScore ? parseFloat(channel.sentimentScore) : 0;

  const positivePercentage = sentiment
    ? (sentiment.positiveCount / sentiment.totalCommentsAnalyzed) * 100
    : 0;
  const neutralPercentage = sentiment
    ? (sentiment.neutralCount / sentiment.totalCommentsAnalyzed) * 100
    : 0;
  const negativePercentage = sentiment
    ? (sentiment.negativeCount / sentiment.totalCommentsAnalyzed) * 100
    : 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Thumbnail */}
          {channel.thumbnailUrl ? (
            <img
              src={channel.thumbnailUrl}
              alt={channel.channelName}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground">
                {channel.channelName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Channel Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{channel.channelName}</h1>
            {channel.creatorName && channel.creatorName !== channel.channelName && (
              <p className="text-lg text-muted-foreground mb-2">by {channel.creatorName}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {channel.channelCategory && (
                <Badge variant="secondary">{channel.channelCategory}</Badge>
              )}
              {channel.mediaHouse && (
                <Badge variant="outline">Media House: {channel.mediaHouse}</Badge>
              )}
              {channel.country && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {channel.country}
                </Badge>
              )}
            </div>

            <a
              href={channel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline">
                View on YouTube
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trust Score */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Trust Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <TrustScore score={trustScore} size="lg" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Channel Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {channel.subscriberCount !== null && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Subscribers</span>
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(channel.subscriberCount)}</p>
                    </div>
                  )}

                  {channel.videoCount !== null && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Video className="h-4 w-4" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(channel.videoCount)}</p>
                    </div>
                  )}

                  {channel.viewCount !== null && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Views</span>
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(channel.viewCount)}</p>
                    </div>
                  )}

                  {channel.publishedAt && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Created</span>
                      </div>
                      <p className="text-sm font-medium">{formatRelativeTime(channel.publishedAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(channel.publishedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            {sentiment && sentiment.totalCommentsAnalyzed > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Based on {sentiment.totalCommentsAnalyzed} comments
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sentiment bars */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-green-600">Positive</span>
                        <span className="font-medium">
                          {sentiment.positiveCount} ({positivePercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${positivePercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Neutral</span>
                        <span className="font-medium">
                          {sentiment.neutralCount} ({neutralPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gray-600 h-2.5 rounded-full"
                          style={{ width: `${neutralPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-red-600">Negative</span>
                        <span className="font-medium">
                          {sentiment.negativeCount} ({negativePercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-red-600 h-2.5 rounded-full"
                          style={{ width: `${negativePercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Average sentiment */}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Overall Sentiment</p>
                      <p className="text-2xl font-bold">
                        {sentimentScore > 0.1 ? 'Positive' : sentimentScore < -0.1 ? 'Negative' : 'Neutral'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {sentimentScore.toFixed(2)} (range: -1 to +1)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {channel.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {channel.description.length > 500
                      ? channel.description.substring(0, 500) + '...'
                      : channel.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
