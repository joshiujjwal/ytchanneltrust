'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils/format';
import { Star } from 'lucide-react';

interface ChannelCardProps {
  channel: {
    channelId: string;
    channelName: string;
    thumbnailUrl: string | null;
    subscriberCount: number | null;
    videoCount: number | null;
    trustScore: string | null;
    channelCategory: string | null;
  };
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const trustScore = channel.trustScore ? parseFloat(channel.trustScore) : 0;
  const trustStars = Math.round(trustScore);

  return (
    <Link href={`/channel/${channel.channelId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail */}
            {channel.thumbnailUrl ? (
              <img
                src={channel.thumbnailUrl}
                alt={channel.channelName}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-muted-foreground">
                  {channel.channelName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-2">
                {channel.channelName}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < trustStars
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{trustScore.toFixed(1)}</span>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {channel.subscriberCount !== null && (
                  <div>
                    <strong className="text-foreground">
                      {formatNumber(channel.subscriberCount)}
                    </strong>{' '}
                    subscribers
                  </div>
                )}
                {channel.videoCount !== null && (
                  <div>
                    <strong className="text-foreground">
                      {formatNumber(channel.videoCount)}
                    </strong>{' '}
                    videos
                  </div>
                )}
              </div>

              {channel.channelCategory && (
                <div className="mt-2">
                  <Badge variant="secondary">{channel.channelCategory}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
