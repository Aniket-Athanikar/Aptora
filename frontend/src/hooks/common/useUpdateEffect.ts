import { useEffect, useRef } from 'react';

export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}
