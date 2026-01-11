'use client';

import { Star } from 'lucide-react';

interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustScore({ score, size = 'md' }: TrustScoreProps) {
  const stars = Math.round(score);
  const percentage = (score / 5) * 100;

  // Color based on score
  const getColor = () => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRating = () => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4) return 'Very Good';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Poor';
  };

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const textSizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Circular background */}
        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.827} 282.7`}
            className={getColor()}
            strokeLinecap="round"
          />
        </svg>

        {/* Score text */}
        <div className="relative flex flex-col items-center">
          <span className={`${textSizeClasses[size]} font-bold ${getColor()}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">out of 5</span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 ${
              i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Rating label */}
      <p className={`mt-2 text-lg font-semibold ${getColor()}`}>{getRating()}</p>
    </div>
  );
}
