import { useState, useEffect } from 'react';

export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    let timeout: NodeJS.Timeout | null = null;

    function handleResize() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return windowSize;
}
