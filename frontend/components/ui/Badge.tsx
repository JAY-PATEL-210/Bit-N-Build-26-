// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  pulse = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300',
    warning: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
    danger: 'bg-rose-950/60 border-rose-800/80 text-rose-300',
    info: 'bg-blue-950/60 border-blue-800/80 text-blue-300',
    purple: 'bg-purple-950/60 border-purple-800/80 text-purple-300',
    neutral: 'bg-slate-900 border-slate-700 text-slate-300',
  };

  const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}></span>
        </span>
      )}
      {children}
    </span>
  );
};
