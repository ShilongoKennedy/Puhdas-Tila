import { useEffect } from 'react';

/**
 * Custom React hook to trigger viewport entry reveal animation classes on scroll.
 */
export function useIntersectionObserver(selector = '.reveal', threshold = 0.12) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve once shown to prevent repeat triggering
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // slight offset for realistic scroll feel
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selector, threshold]);
}
