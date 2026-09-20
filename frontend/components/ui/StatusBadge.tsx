// Owner: Member A (Frontend Lead / Traveler Experience)
import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Badge, BadgeVariant } from './Badge';

export type CanonicalState =
  | 'NORMAL'
  | 'DELAYED'
  | 'CANCELLED'
  | 'ANALYZING'
  | 'SEARCHING'
  | 'APPROVAL_REQUIRED'
  | 'REBOOKING'
  | 'CONFIRMED'
  | 'FAILED';

interface StatusBadgeProps {
  status: CanonicalState | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  label,
}) => {
  const normalized = (status || 'NORMAL').toUpperCase() as CanonicalState;

  const config: Record<
    CanonicalState,
    { label: string; variant: BadgeVariant; icon: React.FC<{ className?: string }>; pulse: boolean }
  > = {
    NORMAL: {
      label: 'Normal Operation',
      variant: 'success',
      icon: CheckCircle2,
      pulse: false,
    },
    DELAYED: {
      label: 'Flight Delayed',
      variant: 'warning',
      icon: Clock,
      pulse: true,
    },
    CANCELLED: {
      label: 'Flight Cancelled',
      variant: 'danger',
      icon: XCircle,
      pulse: true,
    },
    ANALYZING: {
      label: 'AI Analyzing Impact',
      variant: 'ai',
      icon: Sparkles,
      pulse: true,
    },
    SEARCHING: {
      label: 'Searching Alternatives',
      variant: 'info',
      icon: Search,
      pulse: true,
    },
    APPROVAL_REQUIRED: {
      label: 'Approval Required',
      variant: 'warning',
      icon: HelpCircle,
      pulse: true,
    },
    REBOOKING: {
      label: 'Autonomous Rebooking',
      variant: 'ai',
      icon: RefreshCw,
      pulse: true,
    },
    CONFIRMED: {
      label: 'Rebooked & Confirmed',
      variant: 'success',
      icon: CheckCircle2,
      pulse: false,
    },
    FAILED: {
      label: 'Action Failed',
      variant: 'danger',
      icon: AlertTriangle,
      pulse: false,
    },
  };

  const current = config[normalized] || {
    label: normalized,
    variant: 'neutral',
    icon: HelpCircle,
    pulse: false,
  };

  const Icon = current.icon;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <Badge variant={current.variant} pulse={current.pulse} className={sizeClass}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label || current.label}</span>
    </Badge>
  );
};
