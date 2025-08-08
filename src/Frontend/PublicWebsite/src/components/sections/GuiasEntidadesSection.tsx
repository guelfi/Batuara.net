import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import { guiasEntidadesData, GuiaEntidade } from '../../data/guiasEntidadesData';
import { convertGuiaToModalData, getColorFromAttribute } from '../../utils/spiritualDataDetail';
import NavigationDots from '../common/NavigationDots';
import SpiritualDetailModal from '../common/SpiritualDetailModal';

const GuiasEntidadesSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedGuia, setSelectedGuia] = useState<GuiaEntidade | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenDialog = (guia: GuiaEntidade) => {
    setSelectedGuia(guia);
  };

  const handleCloseDialog = () => {
    setSelectedGuia(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 370 : 400;
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

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = isMobile ? 370 : 400;
      const gap = 24;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Inicializar estado do scroll
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, []);

  // Usar a função unificada baseada no atributo 'cor'
  const getGuiaColor = (guia: GuiaEntidade): string => {
    return getColorFromAttribute(guia.cor);
  };

  return (
    <Box id="guias-entidades" sx={{ py: 8, backgroundColor: 'background.default' }}>
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
            Guias e Entidades
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            Espíritos que nos orientam e protegem em nossa jornada espiritual
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            Cada Guia e Entidade traz seus ensinamentos únicos, trabalhando conosco
            para nossa evolução e proteção espiritual na Casa de Caridade Caboclo Batuara.
          </Typography>
        </Box>

        {/* Controles do Carrossel */}
        <Box sx={{ position: 'relative', mb: 4 }}>
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

          {/* Container do Carrossel */}
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
            {guiasEntidadesData.map((guia) => (
              <Card
                key={guia.id}
                onClick={() => handleOpenDialog(guia)}
                sx={{
                  minWidth: isMobile ? 370 : 400,
                  maxWidth: isMobile ? 370 : 400,
                  height: 370,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: getGuiaColor(guia),
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: getGuiaColor(guia),
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, pt: 1.2, px: 1.2, pb: 0.4, '&:last-child': { pb: 0.4 } }}>
                  <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: getGuiaColor(guia),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: getGuiaColor(guia),
                        mb: 1,
                      }}
                    >
                      {guia.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      Comemoração: {guia.comemoracao}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.9rem',
                    }}
                  >
                    {guia.description}
                  </Typography>

                  <Box sx={{ mb: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      Saudação:
                    </Typography>
                    <Chip
                      label={guia.saudacao}
                      size="small"
                      sx={{
                        backgroundColor: getGuiaColor(guia),
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        height: '20px',
                        '& .MuiChip-label': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>

                  {/* Layout em duas colunas: Habitat | Dia da Semana */}
                  <Grid container spacing={1} sx={{ mb: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Habitat:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {guia.habitat}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Dia da Semana:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {guia.diaSemana}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Layout em duas colunas: Cor | Fruta */}
                  <Grid container spacing={1} sx={{ mb: 0 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Cor:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: getGuiaColor(guia),
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {guia.cor}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Fruta:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {guia.fruta}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Dicas de interação */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                mb: isMobile ? 1 : 0,
              }}
            >
              👆 Clique no cartão para saber mais
            </Typography>
            {isMobile && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                }}
              >
                👈 Deslize para ver mais guias
              </Typography>
            )}

            {/* Indicadores de navegação */}
            <NavigationDots
              totalItems={guiasEntidadesData.length}
              currentIndex={(() => {
                const itemWidth = isMobile ? 370 : 400;
                const gap = 24;
                const itemsPerView = 1;
                const itemWithGap = itemWidth + gap;
                const totalDots = Math.ceil(guiasEntidadesData.length / itemsPerView);

                // Se chegamos próximo do final (90% do scroll máximo), mostrar último dot
                if (scrollPosition >= maxScroll * 0.9) {
                  return totalDots - 1;
                }

                return Math.floor(scrollPosition / itemWithGap / itemsPerView);
              })()}
              itemsPerView={1}
              onDotClick={handleDotClick}
            />
          </Box>
        </Box>

        {/* Modal com detalhes da Guia/Entidade */}
        <SpiritualDetailModal
          open={!!selectedGuia}
          onClose={handleCloseDialog}
          data={selectedGuia ? convertGuiaToModalData(selectedGuia) : {} as any}
          tipo="guia"
        />
      </Container>
    </Box>
  );
};

export default GuiasEntidadesSection;