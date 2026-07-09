import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

const variantClasses = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  gray: 'bg-white/5 text-white/60 border-white/10',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {children}
    </span>
  );
};
