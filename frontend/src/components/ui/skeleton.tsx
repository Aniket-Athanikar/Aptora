import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, style, ...props }, ref) => {
    const defaultStyles = {
      width: width ?? (variant === 'text' ? '100%' : undefined),
      height: height ?? (variant === 'text' ? '1em' : undefined),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-muted',
          {
            'rounded-full': variant === 'circular',
            'rounded-md': variant === 'rectangular',
            rounded: variant === 'text',
          },
          className
        )}
        style={{ ...defaultStyles, ...style }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
