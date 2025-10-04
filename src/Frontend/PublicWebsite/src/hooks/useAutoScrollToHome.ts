import { useEffect, useRef } from 'react';

/**
 * Custom hook that automatically scrolls to the element with id="home"
 * when the component mounts, with robust production support.
 */
const useAutoScrollToHome = () => {
  const hasScrolled = useRef(false);

  useEffect(() => {
    // Prevent multiple scrolls
    if (hasScrolled.current) return;

    const scrollToHome = () => {
      // Check if we're on the home page or if no hash is specified
      if (window.location.hash === '' || window.location.hash === '#home') {
        const element = document.querySelector('#home');
        if (element) {
          hasScrolled.current = true;
          
          // Use scrollIntoView for better cross-browser compatibility
          element.scrollIntoView({ 
            behavior: 'auto',
            block: 'start',
            inline: 'nearest'
          });
          
          return true;
        }
      }
      return false;
    };

    // Try immediate scroll first
    if (scrollToHome()) return;

    // If element not found, try with progressive delays for production
    const delays = [50, 100, 200, 500, 1000];
    const timers: NodeJS.Timeout[] = [];

    delays.forEach((delay) => {
      const timer = setTimeout(() => {
        if (!hasScrolled.current && scrollToHome()) {
          // Clear remaining timers if successful
          timers.forEach(t => clearTimeout(t));
        }
      }, delay);
      timers.push(timer);
    });

    // Also try when DOM content is fully loaded
    const handleDOMContentLoaded = () => {
      if (!hasScrolled.current) {
        scrollToHome();
      }
    };

    // Also try when all resources are loaded
    const handleLoad = () => {
      if (!hasScrolled.current) {
        scrollToHome();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    }
    
    if (document.readyState !== 'complete') {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.removeEventListener('load', handleLoad);
    };
  }, []);
};

export default useAutoScrollToHome;