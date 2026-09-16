import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  GlobalStyles,
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

  // useLayoutEffect so muted/playsinline are locked before paint and before src load.
  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = `${process.env.PUBLIC_URL}/bg.mp4`;
    let cancelled = false;
    let playAttempts = 0;
    const maxPlayAttempts = 12;
    const retryTimers: number[] = [];

    // iOS WebKit (Safari + Chrome on iPhone): muted/playsinline MUST be set as
    // both properties AND attributes BEFORE src is assigned / before play().
    // React's muted prop alone does not reliably set the HTML attribute.
    const lockMutedInline = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');
      video.removeAttribute('controls');
    };

    lockMutedInline();

    const tryPlay = () => {
      if (cancelled || !video.paused) return;
      lockMutedInline();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay can still be blocked (e.g. Low Power Mode). Retries +
          // gesture fallback below maximize the chance without requiring a tap.
        });
      }
    };

    const scheduleRetries = () => {
      // Immediate + rAF + staggered retries cover Safari's deferred media pipeline.
      tryPlay();
      requestAnimationFrame(() => {
        tryPlay();
        requestAnimationFrame(tryPlay);
      });

      const delays = [0, 50, 150, 300, 600, 1000, 2000, 3500];
      delays.forEach((delay) => {
        retryTimers.push(
          window.setTimeout(() => {
            if (cancelled || playAttempts >= maxPlayAttempts) return;
            playAttempts += 1;
            tryPlay();
          }, delay)
        );
      });
    };

    const onReady = () => tryPlay();
    const onPause = () => {
      // Resume when the OS pauses background media, but only while the page is visible.
      if (document.visibilityState === 'visible') {
        tryPlay();
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tryPlay();
      }
    };
    // Gesture is fallback only (Low Power Mode / strict autoplay policies) — not primary UX.
    const onFirstGesture = () => tryPlay();

    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('canplaythrough', onReady);
    video.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
    document.addEventListener('click', onFirstGesture, { once: true });

    // Assign src only after muted/playsinline are locked, then force a fresh load.
    // Setting src in JSX before this effect can make iOS evaluate autoplay too early.
    video.setAttribute('src', videoSrc);
    video.load();
    scheduleRetries();

    return () => {
      cancelled = true;
      retryTimers.forEach((id) => window.clearTimeout(id));
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('canplaythrough', onReady);
      video.removeEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('touchstart', onFirstGesture);
      document.removeEventListener('click', onFirstGesture);
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
        justifyContent: { xs: 'flex-start', md: 'center' }, // mobile: conteúdo no topo; desktop: centralizado
        mt: { xs: '-56px', md: '-64px' }, // Cancela o Toolbar spacer do Header (56px mobile / 64px desktop)
        pt: { xs: '91px', md: '64px' },   // Compensa a AppBar fixa (56px do header + ~35px de respiro no mobile)
        pb: { xs: 2, md: 6 },
      }}
    >
      <GlobalStyles
        styles={{
          // Hide every WebKit media chrome / big play overlay on iOS.
          '.hero-bg-video::-webkit-media-controls': {
            display: 'none !important',
            opacity: '0 !important',
            pointerEvents: 'none !important',
            width: '0 !important',
            height: '0 !important',
          },
          '.hero-bg-video::-webkit-media-controls-enclosure': {
            display: 'none !important',
          },
          '.hero-bg-video::-webkit-media-controls-panel': {
            display: 'none !important',
          },
          '.hero-bg-video::-webkit-media-controls-start-playback-button': {
            display: 'none !important',
            WebkitAppearance: 'none',
            opacity: '0 !important',
            pointerEvents: 'none !important',
          },
          '.hero-bg-video::-webkit-media-controls-overlay-play-button': {
            display: 'none !important',
            opacity: '0 !important',
            pointerEvents: 'none !important',
          },
          '.hero-bg-video::-webkit-media-controls-play-button': {
            display: 'none !important',
          },
        }}
      />
      {/*
        Hero bg video: JSX declares muted/autoPlay/playsInline/loop so the first paint
        carries the right attributes. src is assigned in the effect AFTER muted is locked
        (required for iOS WebKit autoplay without a user gesture). No controls attribute.
        Low Power Mode on iPhone may still block autoplay — gesture remains fallback only.
      */}
      <Box
        component="video"
        ref={(el: HTMLVideoElement | null) => {
          videoRef.current = el;
          // Lock mute as early as the element mounts (before effect / before src).
          if (el) {
            el.muted = true;
            el.defaultMuted = true;
            el.volume = 0;
            el.playsInline = true;
            el.setAttribute('muted', '');
            el.setAttribute('playsinline', '');
            el.setAttribute('webkit-playsinline', '');
            el.removeAttribute('controls');
          }
        }}
        className="hero-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        onCanPlayThrough={() => setVideoLoaded(true)}
        onLoadedData={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = true;
          video.defaultMuted = true;
          video.volume = 0;
          video.setAttribute('muted', '');
          void video.play().catch(() => { });
        }}
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
          pointerEvents: 'none',
          // Avoid any native media UI looking like a play button.
          '&::-webkit-media-controls-start-playback-button': {
            display: 'none',
            WebkitAppearance: 'none',
          },
        }}
      />

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
