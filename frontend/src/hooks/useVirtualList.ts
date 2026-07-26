import { useState, useCallback, useTransition } from "react";

interface UseVirtualListProps {
  totalItems: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualList({
  totalItems,
  itemHeight,
  containerHeight,
  overscan = 10,
}: UseVirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [, startTransition] = useTransition();

  const totalHeight = totalItems * itemHeight;

  // Calculate index range to render
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const offset = startIndex * itemHeight;
  
  // Generate list of indexes to render
  const visibleIndexes: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleIndexes.push(i);
  }

  // Optimized scroll handler using transition to avoid blocking critical interactions
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const targetScrollTop = e.currentTarget.scrollTop;
    startTransition(() => {
      setScrollTop(targetScrollTop);
    });
  }, []);

  return {
    visibleIndexes,
    totalHeight,
    offset,
    handleScroll,
    startIndex,
    endIndex,
  };
}
