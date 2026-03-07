'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS_MAP = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
} as const;

const LoadingSpinner = ({
  label = 'Loading...',
  className,
  fullScreen = false,
  size = 'md',
}: LoadingSpinnerProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'fixed inset-0 z-[120] bg-gray-950/70 backdrop-blur-[1px]' : 'w-full py-10',
        className
      )}
    >
      <div className="inline-flex items-center gap-3 rounded-md border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-gray-300">
        <Loader2 className={cn('animate-spin text-violet-500', SIZE_CLASS_MAP[size])} />
        <span>{label}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
