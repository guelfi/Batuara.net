import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NavigationDots from '../common/NavigationDots';
import useAutoScrollToHome from '../../hooks/useAutoScrollToHome';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use the custom hook to auto-scroll to home on page load
  useAutoScrollToHome();

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      const header = document.querySelector('header');
      const fallbackHeaderHeight = window.innerWidth < 900 ? 56 : 64;
      const headerHeight = header instanceof HTMLElement ? header.offsetHeight : fallbackHeaderHeight;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const mobileCardWidth = 144;
  const mobileCardGap = 12;
  const mobileCardWithGap = mobileCardWidth + mobileCardGap;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = mobileCardWithGap;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const targetScroll = dotIndex * mobileCardWithGap;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const forcePlay = () => {
      if (video.paused) {
        video.play().catch(() => { });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forcePlay();
      }
    };

    video.addEventListener('pause', forcePlay);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('pause', forcePlay);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Pequeno delay para garantir que o container esteja renderizado
    const scrollTimer = setTimeout(() => {
      if (scrollContainerRef.current) {
        handleScroll();
      }
    }, 50);

    // Listener para redimensionamento da janela
    const handleResize = () => {
      if (scrollContainerRef.current) {
        handleScroll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Box
      id="home"
      sx={{
        // Background image for all devices (mobile and desktop)
        backgroundImage: `url(${process.env.PUBLIC_URL}/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '100vh', md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'flex-start', md: 'center' }, // mobile: topo; desktop: centrado
        justifyContent: 'center',
        mt: { xs: '-6px', md: '-64px' }, // Cancela o Toolbar spacer do Header
        pt: { xs: '6px', md: '64px' },   // Compensa a AppBar fixa
        pb: { xs: 2, md: 6 },
      }}
    >
      {/* Video background - carrega em segundo plano, só exibe quando pronto */}
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlayThrough={() => setVideoLoaded(true)}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'cover',
          zIndex: 0,
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in',
        }}
      >
        <source src={`${process.env.PUBLIC_URL}/bg.mp4`} type="video/mp4" />
      </Box>

      {/* Dark overlay for better text contrast on all devices */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.30)', // Dark overlay for better contrast
          zIndex: 1,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: { xs: 1.5, md: 3 }, // Padding menor no mobile
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start"> {/* Spacing original no mobile */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Conteúdo centralizado no espaço disponível */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                mb: 2
              }}
            >
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/batuara_logo.png`}
                alt="Casa de Caridade Caboclo Batuara"
                sx={{
                  height: { xs: 96, md: 152 }, // Restaurado tamanho original do logo
                  width: 'auto',
                  mb: { xs: 1, md: 2 },
                  filter: 'drop-shadow(rgba(0, 0, 0, 0.8) 2px 2px 4px)'
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' }, // Restaurado tamanho original do H1
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                  color: '#ffffff',
                  lineHeight: 1.2
                }}
              >
                Casa de Caridade Caboclo Batuara
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1rem', md: '1rem' }, // Restaurado tamanho original do H2
                  fontWeight: 600,
                  mb: { xs: 1.5, md: 3 },
                  lineHeight: 1.4,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                  textAlign: 'center',
                  color: '#ffffff',
                }}
              >
                Um lar espiritual dedicado à caridade, ao amor e à elevação da alma
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.9rem' },
                  mb: { xs: 2, md: 4 },
                  lineHeight: 1.5,
                  maxWidth: '600px',
                  mx: 'auto',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                Trabalhamos com a Sabedoria dos Orixás e os Ensinamentos dos Guias e Entidades,
                oferecendo assistência espiritual gratuita, orientação e consolação a todos
                que buscam a luz e a paz interior.
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: { xs: 1.5, md: 2 }, // Gap original no mobile
                flexWrap: 'wrap',
                justifyContent: 'center',
                mb: { xs: 1, md: 0 }, // Margem bottom original para separar dos cards mobile
              }}>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"} // Botão menor no mobile
                  onClick={() => handleScrollToSection('#nossa-historia')}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    px: { xs: 2.5, md: 4 }, // Padding menor no mobile
                    py: { xs: 1, md: 1.5 }, // Padding menor no mobile
                    fontSize: { xs: '0.85rem', md: '1rem' }, // Fonte menor no mobile
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Conheça Nossa História
                </Button>
                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "large"} // Botão menor no mobile
                  onClick={() => handleScrollToSection('#calendario-atendimento')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 2.5, md: 4 }, // Padding menor no mobile
                    py: { xs: 1, md: 1.5 }, // Padding menor no mobile
                    fontSize: { xs: '0.85rem', md: '1rem' }, // Fonte menor no mobile
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Calendário
                </Button>
              </Box>
            </Box>
          </Grid >

          <Grid size={{ xs: 12, md: 4 }}>
            {/* Desktop: Cards lado a lado */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 1.5,
                mt: { md: 1 }
              }}
            >
              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 0.5, px: 1.2 }}>
                  <FavoriteIcon sx={{ fontSize: 26, mb: 0.2, color: 'white' }} />
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Caridade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    "Fora da caridade não há salvação"
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 0.5, px: 1.2 }}>
                  <PeopleIcon sx={{ fontSize: 24, mb: 0.2, color: 'white' }} />
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Fraternidade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    Unidos no amor e na fé
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 0.5, px: 1.2 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 24, mb: 0.2, color: 'white' }} />
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Espiritualidade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    Elevação da alma através da fé
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 1, px: 2 }}>
                  <MenuBookIcon sx={{ fontSize: 26, mb: 0.3, color: 'white' }} />
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', mb: 0.3 }}>
                    Tradição
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                    Preservando os ensinamentos ancestrais
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Mobile: Carrossel Perpétuo */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                overflow: 'hidden',
                width: '100%',
                position: 'relative',
                py: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: '12px',
                  width: 'max-content',
                  animation: 'marquee 25s linear infinite',
                  '@keyframes marquee': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-624px)' }, // 4 cards * (144px largura + 12px gap) = 624px
                  },
                }}
              >
                {[
                  {
                    icon: <FavoriteIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Caridade',
                    description: '"Fora da caridade não há salvação"',
                  },
                  {
                    icon: <PeopleIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Fraternidade',
                    description: 'Unidos no amor e na fé',
                  },
                  {
                    icon: <AutoAwesomeIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Espiritualidade',
                    description: 'Elevação da alma através da fé',
                  },
                  {
                    icon: <MenuBookIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Tradição',
                    description: 'Preservando os ensinamentos ancestrais',
                  },
                ].concat([
                  {
                    icon: <FavoriteIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Caridade',
                    description: '"Fora da caridade não há salvação"',
                  },
                  {
                    icon: <PeopleIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Fraternidade',
                    description: 'Unidos no amor e na fé',
                  },
                  {
                    icon: <AutoAwesomeIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Espiritualidade',
                    description: 'Elevação da alma através da fé',
                  },
                  {
                    icon: <MenuBookIcon sx={{ fontSize: 25, mb: 0.3, color: 'white' }} />,
                    title: 'Tradição',
                    description: 'Preservando os ensinamentos ancestrais',
                  },
                ]).map((card, idx) => (
                  <Card
                    key={idx}
                    sx={{
                      width: 144,
                      flexShrink: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                      {card.icon}
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', mb: 0.2 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.72rem' }}>
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid >
      </Container >
    </Box >
  );
};

export default HeroSection;
