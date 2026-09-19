// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500 shadow-blue-600/20 active:scale-[0.98]',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-rose-600/20 active:scale-[0.98]',
    outline:
      'border border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white focus:ring-slate-600',
    ghost:
      'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 shadow-none',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
};

