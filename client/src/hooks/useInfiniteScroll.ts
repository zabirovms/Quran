import { useEffect, useRef } from 'react';

/**
 * A custom hook to handle infinite scrolling
 * @param loadMore - Function to call when more items should be loaded
 * @param hasMore - Whether there are more items to load
 * @param isLoading - Whether items are currently being loaded
 * @param threshold - Distance from bottom (in px) to trigger loading more items
 * @returns - A ref to attach to the scrollable element
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
  threshold: number = 300
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Skip if no more pages or already loading
    if (!hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.1,
      }
    );
    
    const currentElement = scrollRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [loadMore, hasMore, isLoading, threshold]);
  
  return scrollRef;
}