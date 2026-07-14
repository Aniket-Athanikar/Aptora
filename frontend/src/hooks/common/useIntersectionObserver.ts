import { useState, useCallback, useRef, useEffect } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean, IntersectionObserverEntry | undefined] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  const ref = useCallback(
    (node: Element | null) => {
      if (frozen.current) return;

      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setEntry(entry);
          setIsVisible(entry.isIntersecting);

          if (entry.isIntersecting && freezeOnceVisible) {
            frozen.current = true;
            observer.unobserve(node);
          }
        },
        { threshold, root, rootMargin }
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    },
    [freezeOnceVisible, root, rootMargin, threshold]
  );

  return [ref, isVisible, entry];
}
