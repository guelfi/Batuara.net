import { useEffect } from 'react';

/**
 * Custom hook that automatically scrolls to the element with id="home"
 * when the component mounts, simulating a click on the "Início" menu item.
 */
const useAutoScrollToHome = () => {
  useEffect(() => {
    // Small delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      // Check if we're on the home page or if no hash is specified
      if (window.location.hash === '' || window.location.hash === '#home') {
        const element = document.querySelector('#home');
        if (element) {
          const isMobile = window.innerWidth < 768;
          
          // Offset ajustado para aproximar as seções do header
          // Using the same logic as in Header.tsx for #home
          const offsetHeight = isMobile ? 0 : 0; // Offset zero para dar máximo espaço visual no mobile
          
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - offsetHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'auto' // Using 'auto' instead of 'smooth' for immediate positioning on load
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);
};

export default useAutoScrollToHome;