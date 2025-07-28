import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NavigationDots from '../common/NavigationDots';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const AboutSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
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

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = 280;
      const gap = 24;
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
    <Box id="about" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.7rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Nossa História
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Uma jornada de fé, caridade e amor ao próximo
          </Typography>
        </Box>

        {/* Layout Desktop - Card flutuante */}
        <Box sx={{ mb: 6, position: 'relative', display: { xs: 'none', md: 'block' } }}>
          {/* Card Missão Flutuante */}
          <Box
            sx={{
              float: 'right',
              width: '400px',
              height: '280px',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              p: 3,
              textAlign: 'center',
              ml: 3,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: 42, mr: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.6rem' }}>
                  Missão
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                Promover a caridade, o amor fraterno e a elevação espiritual através da 
                Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo 
                assistência espiritual gratuita a todos que buscam a LUZ.
              </Typography>
            </Box>
          </Box>

          {/* Texto que envolve o card */}
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade 
            e do amor ao próximo. Fundada com base na Sabedoria Ancestral dos Orixás e no 
            Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que 
            buscam a luz, a paz e a elevação da alma.
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia 
            e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" 
            guia todas as nossas ações e nos lembra constantemente de nossa missão principal: 
            servir com amor e humildade.
          </Typography>
          
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos 
            para todos que nos procuram, independentemente de sua condição social, raça ou 
            credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade 
            se fortalece através da união, do respeito mútuo e da prática constante da caridade 
            em todas as suas formas.
          </Typography>
        </Box>

        {/* Layout Mobile - Card após o texto */}
        <Box sx={{ mb: 6, display: { xs: 'block', md: 'none' } }}>
          {/* Texto primeiro no mobile */}
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade 
            e do amor ao próximo. Fundada com base na Sabedoria Ancestral dos Orixás e no 
            Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que 
            buscam a luz, a paz e a elevação da alma.
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia 
            e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" 
            guia todas as nossas ações e nos lembra constantemente de nossa missão principal: 
            servir com amor e humildade.
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify' }}>
            Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos 
            para todos que nos procuram, independentemente de sua condição social, raça ou 
            credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade 
            se fortalece através da união, do respeito mútuo e da prática constante da caridade 
            em todas as suas formas.
          </Typography>

          {/* Card Missão após o texto no mobile */}
          <Box
            sx={{
              width: '100%',
              maxWidth: '350px',
              mx: 'auto',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              p: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: 48, mr: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.8rem' }}>
                  Missão
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Promover a caridade, o amor fraterno e a elevação espiritual através da 
                Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo 
                assistência espiritual gratuita a todos que buscam a luz.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cards com carrossel no mobile */}
        {isMobile ? (
          <Box sx={{ position: 'relative' }}>
            {canScrollLeft && (
              <IconButton
                onClick={() => scroll('left')}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
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
                  backgroundColor: 'background.paper',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
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
                gap: 3,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 2,
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {[
                { icon: MenuBookIcon, title: 'Tradição', description: 'Preservando os ensinamentos ancestrais', color: 'primary.main' },
                { icon: FavoriteIcon, title: 'Caridade', description: 'Assistência espiritual gratuita, orientação e consolação para todos que nos procuram, sem distinção.', color: 'secondary.main' },
                { icon: PeopleIcon, title: 'Fraternidade', description: 'Uma família unida no amor', color: 'success.main' },
                { icon: AutoAwesomeIcon, title: 'Espiritualidade', description: 'Desenvolvimento espiritual através do estudo, da oração e da prática da mediunidade com responsabilidade.', color: 'info.main' }
              ].map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    height: 'auto',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: item.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <item.icon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <NavigationDots
                totalItems={4}
                currentIndex={(() => {
                  const itemWidth = 280;
                  const gap = 24;
                  const itemsPerView = 1;
                  const itemWithGap = itemWidth + gap;
                  
                  if (scrollPosition >= maxScroll * 0.9) {
                    return 3;
                  }
                  
                  return Math.floor(scrollPosition / itemWithGap / itemsPerView);
                })()}
                itemsPerView={1}
                onDotClick={handleDotClick}
              />
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <MenuBookIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Tradição
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preservando os ensinamentos ancestrais
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Caridade
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assistência espiritual gratuita, orientação e consolação para todos que 
                    nos procuram, sem distinção.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'success.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Fraternidade
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uma família espiritual unida pelo amor, onde todos são tratados como 
                    irmãos.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'info.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Espiritualidade
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Desenvolvimento espiritual através do estudo, da oração e da prática 
                    da mediunidade com responsabilidade.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AboutSection;