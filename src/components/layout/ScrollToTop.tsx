import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '../../providers/SmoothScrollProvider';

/**
 * ScrollToTop Component
 * Listens to location changes (pathname, search, hash) and restores scroll position.
 * Handles both smooth scroll to anchor hashes (e.g. #work) via Lenis and instantaneous reset to top (0, 0).
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (hash) {
      // Allow slight frame delay for DOM elements to mount
      const timer = window.setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          if (lenis) {
            lenis.scrollTo(element, { offset: -64, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          }
          window.scrollTo(0, 0);
        }
      }, 60);
      return () => window.clearTimeout(timer);
    } else {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
    }
  }, [pathname, search, hash, lenis]);

  return null;
};

