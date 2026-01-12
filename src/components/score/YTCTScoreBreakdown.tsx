import React from 'react';
import { Clock, Activity, TrendingUp, Eye } from 'lucide-react';
import { YTCTComponents } from '@/lib/scoring/types';

interface YTCTScoreBreakdownProps {
  components: YTCTComponents;
  showValues?: boolean;
}

export function YTCTScoreBreakdown({ components, showValues = true }: YTCTScoreBreakdownProps) {
  const metrics = [
    {
      name: 'Longevity',
      description: 'Channel age & staying power',
      score: components.longevity,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      progressColor: 'bg-purple-500',
    },
    {
      name: 'Consistency',
      description: 'Upload frequency & regularity',
      score: components.consistency,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progressColor: 'bg-blue-500',
    },
    {
      name: 'Growth',
      description: 'Subscriber growth per video',
      score: components.growth,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progressColor: 'bg-green-500',
    },
    {
      name: 'Engagement',
      description: 'View-to-subscriber ratio',
      score: components.engagement,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      progressColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const percentage = ((metric.score - 1) / 9) * 100; // Normalize 1-10 to 0-100%

        return (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{metric.name}</div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
                </div>
              </div>
              {showValues && (
                <div className={`text-lg font-bold ${metric.color}`}>
                  {metric.score.toFixed(1)}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${metric.progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
