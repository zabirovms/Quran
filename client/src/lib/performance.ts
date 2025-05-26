/**
 * Performance monitoring utilities for tracking Core Web Vitals
 */

// Track Largest Contentful Paint (LCP)
export function trackLCP(callback: (value: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry.startTime);
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }
}

// Track First Input Delay (FID)
export function trackFID(callback: (value: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        callback(entry.processingStart - entry.startTime);
      });
    });
    observer.observe({ type: 'first-input', buffered: true });
  }
}

// Track Cumulative Layout Shift (CLS)
export function trackCLS(callback: (value: number) => void) {
  if ('PerformanceObserver' in window) {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      callback(clsValue);
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/api/surahs',
    'https://fonts.gstatic.com/s/scheherazadenew/v13/4UaerFhTvxVnHDvUkUiHg8jprP4DM7-HY8_ME1SqvcM.woff2'
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    if (url.includes('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else {
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
    }
    link.href = url;
    document.head.appendChild(link);
  });
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;

  // Preload critical resources
  preloadCriticalResources();

  // Track Core Web Vitals
  trackLCP((value) => {
    console.log('LCP:', value);
  });

  trackFID((value) => {
    console.log('FID:', value);
  });

  trackCLS((value) => {
    console.log('CLS:', value);
  });
}