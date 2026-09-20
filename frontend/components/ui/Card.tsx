// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hoverable = false,
  title,
  subtitle,
  badge,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl transition-all duration-300 ${
        hoverable ? 'illusion-card hover:border-sky-500/40 hover:shadow-sky-500/10 hover:bg-slate-900/95' : ''
      } ${className}`}
      {...props}
    >
      {(header || title) && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          {header ? (
            header
          ) : (
            <div className="flex items-center justify-between w-full">
              <div>
                {title && <h3 className="font-bold text-white text-base">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                {badge}
                {action}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
