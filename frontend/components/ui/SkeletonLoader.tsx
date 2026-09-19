// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = 'h-4 w-full',
  variant = 'text',
  count = 1,
}) => {
  const variantStyles = {
    text: 'rounded-md',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  };

  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-800/70 border border-slate-700/30 ${variantStyles[variant]} ${className}`}
        />
      ))}
    </div>
  );
};
