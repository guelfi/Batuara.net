import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
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
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@tanstack/react-query';
import NavigationDots from '../common/NavigationDots';
import publicApi from '../../services/api';
import { UmbandaLine } from '../../types';
import { desktopMediaQuery } from '../../theme/theme';

const colorMap: Record<string, string> = {
  branco: '#e8eaf6',
  azul: '#1976d2',
  'azul claro': '#42a5f5',
  'azul marinho': '#1a237e',
  prata: '#90a4ae',
  lilás: '#9c27b0',
  roxo: '#7b1fa2',
  dourado: '#f9a825',
  amarelo: '#fbc02d',
  vermelho: '#d32f2f',
  verde: '#388e3c',
  'verde escuro': '#2e7d32',
  marrom: '#795548',
  preto: '#212121',
  rosa: '#e91e63',
  coral: '#ff7043',
  laranja: '#f57c00',
  arcoíris: '#673ab7',
  'arco-íris': '#673ab7',
};

const colorKeys = Object.keys(colorMap).sort((a, b) => b.length - a.length);

const DialogTransition = React.forwardRef(function DialogTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} timeout={{ enter: 220, exit: 180 }} />;
});

const UmbandaSection: React.FC = () => {
  const [selectedLinha, setSelectedLinha] = useState<UmbandaLine | null>(null);
  const [selectedLinhaColor, setSelectedLinhaColor] = useState<string | null>(null);
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

  const getAccentColorFromLinha = (linha: UmbandaLine, index: number): string => {
    const text = `${linha.name} ${linha.description} ${linha.characteristics} ${linha.batuaraInterpretation} ${linha.entities.join(' ')}`.toLowerCase();
    const hex = text.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i)?.[0];
    if (hex) return hex;

    const name = linha.name.toLowerCase();
    if (name.includes('oxalá') || name.includes('oxala')) return colorMap.branco;
    if (name.includes('yemanjá') || name.includes('iemanjá') || name.includes('yemanja') || name.includes('iemanja')) return colorMap['azul claro'];
    if (name.includes('caboclo')) return colorMap.verde;

    for (const key of colorKeys) {
      if (text.includes(key)) {
        return colorMap[key];
      }
    }

    return getLinhaColor(index);
  };

  const handleCardClick = (linha: UmbandaLine, accentColor: string) => {
    setSelectedLinha(linha);
    setSelectedLinhaColor(accentColor);
  };

  const handleCloseDialog = () => {
    setSelectedLinha(null);
    setSelectedLinhaColor(null);
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

  const canScrollLeft = scrollPosition > 4;
  const canScrollRight = scrollPosition < maxScroll - 4;

  useEffect(() => {
    let raf2 = 0;

    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        handleScroll();
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [linhas.length, isMobile]);

  return (
    <Box
      id="linhas-da-umbanda"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: '100vh', md: 'auto' },
        pt: { xs: 1.5, md: 4 },
        pb: { xs: 4, md: 8 },
        px: { xs: 1.5, md: 2 },
        backgroundColor: 'background.default',
        [desktopMediaQuery]: {
          minHeight: 'calc(100vh - 88px)',
          pb: 10,
        },
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
        <Box sx={{ position: 'relative', overflow: 'clip' }}>
          {/* Botão de navegação esquerda */}
          <IconButton
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            sx={{
              position: 'absolute',
              left: { xs: 4, md: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: theme.shadows[4],
              opacity: canScrollLeft ? 1 : 0.35,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Botão de navegação direita */}
          <IconButton
            onClick={scrollRight}
            disabled={!canScrollRight}
            sx={{
              position: 'absolute',
              right: { xs: 4, md: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: theme.shadows[4],
              opacity: canScrollRight ? 1 : 0.35,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>

          <Box
            id="umbanda-carousel"
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              overscrollBehaviorX: 'contain',
              WebkitOverflowScrolling: 'touch',
              pb: 2,
              px: { xs: 0.5, md: 0 },
              scrollSnapType: 'x mandatory',
              scrollbarWidth: { xs: 'none', md: 'thin' },
              '&::-webkit-scrollbar': {
                height: { xs: 0, md: 8 },
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
            (() => {
              const accentColor = getAccentColorFromLinha(linha, index);
              const accentText = accentColor === '#e8eaf6' ? '#1a237e' : accentColor;

              return (
            <Card
              key={linha.id}
              onClick={() => handleCardClick(linha, accentColor)}
              sx={{
                minWidth: isMobile ? 320 : 320,
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                  borderColor: `${accentColor}90`,
                },
                border: `1px solid ${accentColor}35`,
                borderLeft: `6px solid ${accentColor}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: accentText,
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
                      backgroundColor: `${accentColor}18`,
                      border: `1px solid ${accentColor}45`,
                      color: accentText,
                      fontWeight: 500,
                      mb: 2,
                    }}
                    variant="outlined"
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
                          backgroundColor: `${accentColor}18`,
                          border: `1px solid ${accentColor}45`,
                          color: accentText,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                        variant="outlined"
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
              );
            })()
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

      <Dialog
        open={!!selectedLinha}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        TransitionComponent={DialogTransition}
        PaperProps={{
          sx: {
            borderTop: `8px solid ${selectedLinhaColor ?? theme.palette.primary.main}`,
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            backgroundColor: `${(selectedLinhaColor ?? theme.palette.primary.main)}14`,
            borderBottom: `1px solid ${(selectedLinhaColor ?? theme.palette.primary.main)}30`,
            color: (selectedLinhaColor ?? theme.palette.primary.main) === '#e8eaf6' ? '#1a237e' : (selectedLinhaColor ?? theme.palette.primary.main),
          }}
        >
          {selectedLinha?.name}
        </DialogTitle>
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
                  <Chip
                    key={entity}
                    label={entity}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: `${(selectedLinhaColor ?? theme.palette.primary.main)}70`,
                      color: (selectedLinhaColor ?? theme.palette.primary.main) === '#e8eaf6' ? '#1a237e' : (selectedLinhaColor ?? theme.palette.primary.main),
                      backgroundColor: `${(selectedLinhaColor ?? theme.palette.primary.main)}10`,
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Dias de trabalho
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(selectedLinha?.workingDays.length ? selectedLinha.workingDays : ['Atuação contínua']).map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: `${(selectedLinhaColor ?? theme.palette.primary.main)}70`,
                      color: (selectedLinhaColor ?? theme.palette.primary.main) === '#e8eaf6' ? '#1a237e' : (selectedLinhaColor ?? theme.palette.primary.main),
                      backgroundColor: `${(selectedLinhaColor ?? theme.palette.primary.main)}10`,
                    }}
                  />
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
