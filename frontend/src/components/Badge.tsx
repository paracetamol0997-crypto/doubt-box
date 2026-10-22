import React from 'react';
import { DoubtPriority, DoubtStatus } from '../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'default';
  status?: DoubtStatus;
  priority?: DoubtPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className = '',
}) => {
  if (variant === 'status' && status) {
    const config: Record<DoubtStatus, { label: string; style: string; dot: string }> = {
      PENDING: {
        label: 'Pending Review',
        style: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      },
      IN_PROGRESS: {
        label: 'In Progress',
        style: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500 animate-pulse',
      },
      ANSWERED: {
        label: 'Answered',
        style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      },
      RESOLVED: {
        label: 'Resolved',
        style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dot: 'bg-indigo-500',
      },
      CLOSED: {
        label: 'Closed',
        style: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      },
    };

    const c = config[status] || config.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.style} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {children || c.label}
      </span>
    );
  }

  if (variant === 'priority' && priority) {
    const config: Record<DoubtPriority, { label: string; style: string }> = {
      LOW: {
        label: 'Low',
        style: 'bg-slate-100 text-slate-700 border-slate-200',
      },
      MEDIUM: {
        label: 'Medium',
        style: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      HIGH: {
        label: 'High',
        style: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      URGENT: {
        label: 'Urgent',
        style: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      },
    };

    const c = config[priority] || config.MEDIUM;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${c.style} ${className}`}
      >
        {children || c.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 ${className}`}
    >
      {children}
    </span>
  );
};
