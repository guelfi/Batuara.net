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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use the custom hook to auto-scroll to home on page load
  useAutoScrollToHome();

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      // Altura do header diferente para mobile e desktop
      const isMobileDevice = window.innerWidth < 768;
      const offsetHeight = isMobileDevice ? 48 : 32; // Offset maior para mobile para coincidir com o carregamento inicial

      const elementPosition = element.getBoundingClientRect().top + window.scrollY; // Usar scrollY ao invés de pageYOffset
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
      const scrollAmount = 172; // Ajustado para o novo tamanho (160 + 12)
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
      const itemWidth = 160; // Diminuído ainda mais os cards (de 180 para 160)
      const gap = 12; // Ajustado para o novo gap (1.5 * 8 = 12px)
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
        minHeight: { xs: '70vh', md: '100vh' }, // Reduzir altura no mobile
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: '80px', md: '84px' }, // Aumentado significativamente para dar muito mais espaço do Header no mobile
        pb: { xs: 2, md: 6 }, // Reduzir padding bottom no mobile
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
          px: { xs: 1.5, md: 3 }, // Padding menor no mobile
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start"> {/* Spacing menor no mobile */}
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
              sx={{
                fontSize: { xs: '1.5rem', md: '2.8rem' }, // Diminuído 1rem no mobile (de 2.5 para 1.5)
                fontWeight: 700,
                mb: { xs: 1, md: 2 },
                lineHeight: 1.1, // Linha mais compacta para quebra
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
                textAlign: 'center',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              >
              {isMobile ? (
                <>
                  Casa de Caridade<br />
                  Caboclo Batuara
                </>
              ) : (
                'Casa de Caridade Caboclo Batuara'
              )}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1rem', md: '1rem' }, // Aumentado 0.5rem no mobile
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
                fontSize: { xs: '0.9rem', md: '0.9rem' }, // Aumentado 0.5rem no mobile
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
              gap: { xs: 1.5, md: 2 }, // Gap menor no mobile
              flexWrap: 'wrap',
              justifyContent: 'center',
              mb: { xs: 1, md: 0 }, // Margem bottom para separar dos cards mobile
            }}>
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"} // Botão menor no mobile
                onClick={() => handleScrollToSection('#about')}
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
                onClick={() => handleScrollToSection('#calendar')}
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
                gap: 1.5, // Gap menor entre cards
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 1.5, // Padding bottom menor
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              <Card
                sx={{
                  minWidth: 160, // Cards menores
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                  <FavoriteIcon sx={{ fontSize: 28, mb: 0.3, color: 'white' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Caridade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    "Fora da caridade não há salvação"
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  minWidth: 160, // Cards menores
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                  <PeopleIcon sx={{ fontSize: 28, mb: 0.3, color: 'white' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Fraternidade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    Unidos no amor e na fé
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  minWidth: 160, // Cards menores
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 28, mb: 0.3, color: 'white' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Espiritualidade
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    Elevação da alma através da fé
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  minWidth: 160, // Cards menores
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                  <MenuBookIcon sx={{ fontSize: 28, mb: 0.3, color: 'white' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', mb: 0.2 }}>
                    Tradição
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                    Preservando os ensinamentos ancestrais
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                mt: 1, // Margem menor
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.8rem', // Fonte menor
                fontStyle: 'italic',
              }}
            >
              👆 Deslize para ver nossos valores
            </Typography>

            <Box sx={{ textAlign: 'center', mt: 0.5 }}> {/* Margem menor */}
              <NavigationDots
                totalItems={4}
                currentIndex={(() => {
                  const itemWidth = 160; // Tamanho dos cards
                  const gap = 12; // Gap entre cards (1.5 * 8 = 12px do tema MUI)
                  const itemWithGap = itemWidth + gap;

                  // Se chegou ao final do scroll, mostrar o último dot
                  if (scrollPosition >= maxScroll - 10) {
                    return 3;
                  }

                  // Calcular o índice baseado na posição do scroll
                  // Adicionar metade do itemWidth para melhor detecção do centro
                  const adjustedScrollPosition = scrollPosition + (itemWidth / 2);
                  const calculatedIndex = Math.floor(adjustedScrollPosition / itemWithGap);

                  // Garantir que o índice esteja dentro dos limites
                  return Math.min(Math.max(calculatedIndex, 0), 3);
                })()}
                itemsPerView={1}
                onDotClick={handleDotClick}
                sx={{
                  '& > div': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Dots inativos mais transparentes
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    width: '10px',
                    height: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      transform: 'scale(1.2)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }
                  },
                  '& > div[data-active="true"]': {
                    backgroundColor: '#ffffff', // Dot ativo branco sólido
                    border: '2px solid #2196f3', // Borda azul para destaque
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.6)', // Sombra azul
                    width: '12px',
                    height: '12px',
                    transform: 'scale(1.1)',
                  }
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
    </Box >
  );
};

export default HeroSection;