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
import batuaraLogo from '../../assets/images/batuara_logo.png';
import bgImage from '../../assets/images/bg.jpg';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      // Altura do header diferente para mobile e desktop
      const isMobile = window.innerWidth < 768;
      const headerHeight = isMobile ? 56 : 64; // Mobile usa altura menor
      const offsetHeight = isMobile ? 48 : 32; // Offset maior para mobile para coincidir com o carregamento inicial

      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offsetHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220;
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
      const itemWidth = 200;
      const gap = 16;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, []);

  return (
    <Box
      id="home"
      sx={{
        // Background image for all devices (mobile and desktop)
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: '80px', md: '100px' }, // Espaço para o header + margem
        pb: { xs: 4, md: 6 },
      }}
    >
      {/* Dark overlay for better text contrast on all devices */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay for better contrast
          zIndex: 1,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: { xs: 2, md: 3 },
        }}
      >
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            {/* Conteúdo centralizado no espaço disponível */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'center' }, // Centralizado em ambos os casos
                textAlign: { xs: 'center', md: 'center' }, // Texto centralizado
                maxWidth: { xs: '100%', md: '100%' },
                mx: 'auto',
              }}
            >
              {/* Logo da Casa Batuara */}
              <Box
                sx={{
                  mb: 3,
                }}
              >
                <img
                  src={batuaraLogo}
                  alt="Casa de Caridade Caboclo Batuara"
                  style={{
                    height: '138px',
                    width: 'auto',
                    filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
                  }}
                />
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '2.8rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2,
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                Casa de Caridade Caboclo Batuara
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 600,
                  mb: 3,
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
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  lineHeight: 1.6,
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
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleScrollToSection('#about')}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Conheça Nossa História
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleScrollToSection('#calendar')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Ver Horários
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
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

            {/* Mobile: Carrossel */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                position: 'relative'
              }}
            >
              {canScrollLeft && (
                <IconButton
                  onClick={() => scroll('left')}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
              )}

              {canScrollRight && (
                <IconButton
                  onClick={() => scroll('right')}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              )}

              <Box
                ref={scrollContainerRef}
                onScroll={handleScroll}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  pb: 2,
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                }}
              >
                <Card
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <FavoriteIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Caridade
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      "Fora da caridade não há salvação"
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <PeopleIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Fraternidade
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Unidos no amor e na fé
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Espiritualidade
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Elevação da alma através da fé
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <MenuBookIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Tradição
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Preservando os ensinamentos ancestrais
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 2,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                }}
              >
                👆 Deslize para ver nossos valores
              </Typography>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <NavigationDots
                  totalItems={4}
                  currentIndex={(() => {
                    const itemWidth = 200;
                    const gap = 16;
                    const itemsPerView = 1;
                    const itemWithGap = itemWidth + gap;

                    if (scrollPosition >= maxScroll * 0.9) {
                      return 3;
                    }

                    return Math.floor(scrollPosition / itemWithGap / itemsPerView);
                  })()}
                  itemsPerView={1}
                  onDotClick={handleDotClick}
                  sx={{
                    '& > div': {
                      backgroundColor: 'rgba(33, 150, 243, 0.7)',
                      border: '1px solid rgba(33, 150, 243, 0.9)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.9)',
                        transform: 'scale(1.1)',
                      }
                    },
                    '& > div[data-active="true"]': {
                      backgroundColor: '#2196f3',
                      border: '1px solid #2196f3',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;