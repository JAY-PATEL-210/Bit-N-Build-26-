// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl transition-all duration-200 ${
        hoverable ? 'hover:border-slate-700 hover:shadow-2xl hover:bg-slate-900' : ''
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          {header}
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
