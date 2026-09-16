import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fab, Box } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface NavigationButtonsProps {
  threshold?: number; // Pixels para mostrar os botões (padrão: 300)
  smooth?: boolean; // Scroll suave (padrão: true)
}

// Lista das seções na ordem (espirituais só entram se existirem no DOM)
const sections = [
  '#home',
  '#nossa-historia',
  '#nossa-missao',
  '#calendario-atendimento',
  '#eventos-e-festas',
  '#orixas',
  '#guias-entidades',
  '#linhas-da-umbanda',
  '#oracoes',
  '#doacoes',
  '#entre-em-contato',
  '#nossa-localizacao',
];

const getPresentSections = () =>
  sections.filter((sectionId) => !!document.querySelector(sectionId));

// Função de throttling
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: any[]) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  threshold = 300,
  smooth = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isOverFooter, setIsOverFooter] = useState(false);
  const throttledHandleScroll = useRef<Function | undefined>(undefined);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsVisible(scrollTop > threshold);

    const present = getPresentSections();
    let currentIndex = 0;
    present.forEach((sectionId, index) => {
      const element = document.querySelector(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) {
          currentIndex = index;
        }
      }
    });
    setCurrentSectionIndex(currentIndex);

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
    const isInLastSection = currentIndex === present.length - 1;

    setIsOverFooter(isNearBottom || isInLastSection);
  }, [threshold]);

  useEffect(() => {
    throttledHandleScroll.current = throttle(handleScroll, 100);

    const scrollHandler = () => throttledHandleScroll.current?.();
    window.addEventListener('scroll', scrollHandler);

    return () => window.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start', inline: 'nearest' });
      window.history.replaceState(null, '', sectionId);
    }
  };

  const scrollToTop = () => scrollToSection('#home');

  const scrollToPrevious = () => {
    const present = getPresentSections();
    const prevIndex = Math.max(0, currentSectionIndex - 1);
    scrollToSection(present[prevIndex] || '#home');
  };

  const scrollToNext = () => {
    const present = getPresentSections();
    const nextIndex = Math.min(present.length - 1, currentSectionIndex + 1);
    scrollToSection(present[nextIndex] || present[present.length - 1]);
  };

  const scrollToFooter = () => {
    const present = getPresentSections();
    scrollToSection(present[present.length - 1] || '#nossa-localizacao');
  };

  const getButtonStyle = () => ({
    position: 'fixed' as const,
    zIndex: 1000,
    width: { xs: 44, md: 48 },
    height: { xs: 44, md: 48 },
    backgroundColor: isOverFooter ? 'white' : 'primary.main',
    color: isOverFooter ? 'primary.main' : 'white',
    boxShadow: isOverFooter ? 4 : 2,
    border: isOverFooter ? '2px solid' : 'none',
    borderColor: isOverFooter ? 'primary.main' : 'transparent',
    transition: 'all 0.3s ease-in-out',
    transform: isVisible ? 'translateX(0)' : 'translateX(100px)',
    opacity: isVisible ? 1 : 0,
    '&:hover': {
      backgroundColor: isOverFooter ? 'rgba(255, 255, 255, 0.9)' : 'primary.dark',
      transform: isVisible ? 'translateX(-4px)' : 'translateX(100px)',
      boxShadow: isOverFooter ? 6 : 4,
    }
  });

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      {/* Botão Topo */}
      <Fab
        onClick={scrollToTop}
        aria-label="Ir ao topo"
        sx={{
          ...getButtonStyle(),
          bottom: { xs: 200, md: 220 },
          right: { xs: 16, md: 20 },
          pointerEvents: 'auto',
        }}
      >
        <KeyboardArrowUpIcon fontSize="small" />
      </Fab>

      {/* Botão Seção Anterior */}
      <Fab
        onClick={scrollToPrevious}
        aria-label="Seção anterior"
        disabled={currentSectionIndex === 0}
        sx={{
          ...getButtonStyle(),
          bottom: { xs: 150, md: 165 },
          right: { xs: 16, md: 20 },
          opacity: isVisible && currentSectionIndex > 0 ? (isOverFooter ? 1 : 1) : 0.3,
          pointerEvents: 'auto',
        }}
      >
        <NavigateBeforeIcon fontSize="small" />
      </Fab>

      {/* Botão Próxima Seção - esconde quando estiver na última seção ou no footer */}
      <Fab
        onClick={scrollToNext}
        aria-label="Próxima seção"
        disabled={currentSectionIndex === sections.length - 1}
        sx={{
          ...getButtonStyle(),
          bottom: { xs: 100, md: 110 },
          right: { xs: 16, md: 20 },
          transform: isVisible && currentSectionIndex < sections.length - 1 && !isOverFooter ? 'translateX(0)' : 'translateX(100px)',
          pointerEvents: 'auto',
        }}
      >
        <NavigateNextIcon fontSize="small" />
      </Fab>

      {/* Botão Footer - desaparece quando estamos no footer */}
      <Fab
        onClick={scrollToFooter}
        aria-label="Ir ao footer"
        sx={{
          ...getButtonStyle(),
          bottom: { xs: 50, md: 55 },
          right: { xs: 16, md: 20 },
          transform: isVisible && !isOverFooter ? 'translateX(0)' : 'translateX(100px)',
          pointerEvents: 'auto',
        }}
      >
        <KeyboardArrowDownIcon fontSize="small" />
      </Fab>
    </Box>
  );
};

export default NavigationButtons;
