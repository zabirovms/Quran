import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SmartStickyProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export default function SmartSticky({ 
  children, 
  className,
  threshold = 10 // Reduced threshold for more responsive behavior
}: SmartStickyProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // Update visibility based on scroll direction
      if (Math.abs(scrollDifference) > threshold) {
        // Show when scrolling up or at the top
        setIsVisible(scrollDifference < 0 || currentScrollY < 10);
        lastScrollY.current = currentScrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <div 
      className={cn(
        'sticky top-0 z-50 transition-transform duration-200 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
    >
      {children}
    </div>
  );
} 
