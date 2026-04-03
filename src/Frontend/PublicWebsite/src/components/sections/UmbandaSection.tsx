import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import { 
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import NavigationDots from '../common/NavigationDots';
import publicApi from '../../services/api';
import { UmbandaLine } from '../../types';

const UmbandaSection: React.FC = () => {
  const [selectedLinha, setSelectedLinha] = useState<UmbandaLine | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-umbanda-lines'],
    queryFn: () => publicApi.getUmbandaLines({ pageNumber: 1, pageSize: 50, sort: 'displayOrder:asc' }),
  });

  const linhas = data?.data ?? [];

  const getLinhaColor = (index: number): string => {
    const palette = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      '#7B1FA2',
      '#455A64',
    ];
    return palette[index % palette.length];
  };

  const handleCardClick = (linha: UmbandaLine) => {
    setSelectedLinha(linha);
  };

  const handleCloseDialog = () => {
    setSelectedLinha(null);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 320 : 320;
      const gap = 24; // 3 * 8px (gap: 3)
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 320 : 320;
      const gap = 24; // 3 * 8px (gap: 3)
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = isMobile ? 320 : 320;
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
    // Atualizar estado inicial dos botões
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, []);

  return (
    <Box
      id="umbanda"
      sx={{
        py: 8,
        px: 2,
        backgroundColor: 'background.default',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.7rem', md: '2.5rem' },
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          Linhas da Umbanda
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          Conheça as sete linhas principais da Umbanda, cada uma regida por um Orixá
          e com suas características específicas de atuação espiritual.
        </Typography>

        {/* Container com botões de navegação */}
        <Box sx={{ position: 'relative' }}>
          {/* Botão de navegação esquerda */}
          {canScrollLeft && (
            <IconButton
              onClick={scrollLeft}
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
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Botão de navegação direita */}
          {canScrollRight && (
            <IconButton
              onClick={scrollRight}
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
              <ArrowForwardIcon />
            </IconButton>
          )}

          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'primary.main',
                borderRadius: 4,
              },
            }}
          >
          {linhas.map((linha, index) => (
            <Card
              key={linha.id}
              onClick={() => handleCardClick(linha)}
              sx={{
                minWidth: isMobile ? 320 : 320,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
                borderTop: `4px solid ${getLinhaColor(index)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'primary.main',
                    fontSize: '1.1rem',
                  }}
                >
                  {linha.name}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Entidade em destaque: {linha.entities[0] || 'Casa Batuara'}
                  </Typography>
                  
                  <Chip
                    label={linha.workingDays[0] || 'Atuação contínua'}
                    size="small"
                    sx={{
                      backgroundColor: getLinhaColor(index),
                      color: 'white',
                      fontWeight: 500,
                      mb: 2,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                    Entidades:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {linha.entities.slice(0, 2).map((entidade: string, chipIndex: number) => (
                      <Chip
                        key={chipIndex}
                        label={entidade}
                        size="small"
                        sx={{
                          backgroundColor: getLinhaColor(index),
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                    {linha.entities.length > 2 && (
                      <Chip
                        label={`+${linha.entities.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                    Atuação:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {linha.characteristics}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          </Box>
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
              👈 Deslize para ver mais linhas
            </Typography>
          )}
          
          {/* Indicadores de navegação */}
          <NavigationDots
            totalItems={linhas.length}
            currentIndex={(() => {
              const itemWidth = isMobile ? 320 : 320;
              const gap = 24;
              const itemsPerView = 1;
              const itemWithGap = itemWidth + gap;
              const totalDots = Math.ceil(linhas.length / itemsPerView);
              
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

      {isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {isError && (
        <Alert severity="warning" sx={{ maxWidth: 680, mx: 'auto', mt: 4 }}>
          Não foi possível carregar as linhas de Umbanda neste momento.
        </Alert>
      )}

      <Dialog open={!!selectedLinha} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{selectedLinha?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, py: 1 }}>
            <Typography variant="body1" color="text.secondary">
              {selectedLinha?.description}
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Características
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLinha?.characteristics}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Interpretação Batuara
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLinha?.batuaraInterpretation}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Entidades
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedLinha?.entities.map((entity) => (
                  <Chip key={entity} label={entity} size="small" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Dias de trabalho
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(selectedLinha?.workingDays.length ? selectedLinha.workingDays : ['Atuação contínua']).map((day) => (
                  <Chip key={day} label={day} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UmbandaSection;
