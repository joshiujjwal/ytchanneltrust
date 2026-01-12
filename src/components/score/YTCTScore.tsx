import React from 'react';

interface YTCTScoreProps {
  score: number;
  rating?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function YTCTScore({ score, rating, size = 'md', showLabel = true }: YTCTScoreProps) {
  // Size configurations
  const sizeConfig = {
    sm: { circle: 80, text: 'text-2xl', label: 'text-xs', strokeWidth: 6 },
    md: { circle: 120, text: 'text-4xl', label: 'text-sm', strokeWidth: 8 },
    lg: { circle: 160, text: 'text-6xl', label: 'text-base', strokeWidth: 10 },
  };

  const config = sizeConfig[size];
  const radius = (config.circle - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((score - 1) / 9) * 100; // Normalize 1-10 to 0-100%
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color coding based on score
  const getColor = (score: number) => {
    if (score >= 8.0) return { stroke: '#10B981', text: 'text-green-600', bg: 'bg-green-50' }; // Excellent - Green
    if (score >= 6.0) return { stroke: '#3B82F6', text: 'text-blue-600', bg: 'bg-blue-50' }; // Very Good - Blue
    if (score >= 4.0) return { stroke: '#F59E0B', text: 'text-yellow-600', bg: 'bg-yellow-50' }; // Good - Yellow
    if (score >= 2.0) return { stroke: '#F97316', text: 'text-orange-600', bg: 'bg-orange-50' }; // Fair - Orange
    return { stroke: '#EF4444', text: 'text-red-600', bg: 'bg-red-50' }; // Poor - Red
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={config.circle} height={config.circle}>
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${config.text} font-bold ${colors.text}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-gray-500 text-xs font-medium">out of 10</div>
        </div>
      </div>

      {/* Rating label */}
      {showLabel && rating && (
        <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} ${config.label} font-semibold`}>
          {rating}
        </div>
      )}
    </div>
  );
}
