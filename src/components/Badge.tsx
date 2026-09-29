import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'p1' | 'p2' | 'p3' | 'default';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantClasses = {
    p1: 'bg-red-100 text-red-800 font-semibold',
    p2: 'bg-yellow-100 text-yellow-800 font-semibold',
    p3: 'bg-gray-100 text-gray-800 font-semibold',
    default: 'bg-blue-100 text-blue-800 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-block px-3 py-1 rounded-full text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
