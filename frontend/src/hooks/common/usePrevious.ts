import { useCallback, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useCallback(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
