import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useQuery } from '@tanstack/react-query';
import NavigationDots from '../common/NavigationDots';
import publicApi from '../../services/api';
import { Orixa } from '../../types';

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

const OrixasSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedOrixa, setSelectedOrixa] = useState<Orixa | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-orixas'],
    queryFn: () => publicApi.getOrixas(),
  });

  const orixas = [...(data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  const handleOpenDialog = (orixa: Orixa) => {
    setSelectedOrixa(orixa);
  };

  const handleCloseDialog = () => {
    setSelectedOrixa(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 284 : 324;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = isMobile ? 260 : 300;
      const gap = 24;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
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

  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, [orixas.length]);

  const getOrixaColor = (orixa: Orixa): string => {
    const primaryColor = orixa.colors[0]?.toLowerCase();

    if (primaryColor && colorMap[primaryColor]) {
      return colorMap[primaryColor];
    }

    return theme.palette.primary.main;
  };

  const getIconColor = (backgroundColor: string): string => {
    return ['#e8eaf6', '#fbc02d', '#90a4ae'].includes(backgroundColor) ? '#1a237e' : '#ffffff';
  };

  return (
    <Box id="orixas" sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
            Os Orixás
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
            Forças da Natureza que regem nossa Casa e orientam nossos trabalhos.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            Conheça os ensinamentos, cores, elementos e fundamentos espirituais cultivados pela Casa Batuara.
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : isError ? (
          <Alert severity="error">Não foi possível carregar os Orixás atualizados da API.</Alert>
        ) : orixas.length === 0 ? (
          <Alert severity="info">Nenhum Orixá ativo foi encontrado para exibição pública.</Alert>
        ) : (
          <>
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
                {orixas.map((orixa) => {
                  const accentColor = getOrixaColor(orixa);

                  return (
                    <Card
                      key={orixa.id}
                      onClick={() => handleOpenDialog(orixa)}
                      sx={{
                        minWidth: isMobile ? 260 : 300,
                        maxWidth: isMobile ? 260 : 300,
                        height: 340,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        border: '2px solid transparent',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[8],
                          borderColor: accentColor,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            boxShadow: theme.shadows[4],
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 40, color: getIconColor(accentColor) }} />
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: accentColor === '#e8eaf6' ? '#1a237e' : accentColor,
                          }}
                        >
                          {orixa.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mb: 2,
                            minHeight: 40,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {orixa.description}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
                          {orixa.colors.slice(0, 2).map((color) => (
                            <Chip
                              key={color}
                              label={color}
                              size="small"
                              sx={{
                                backgroundColor: `${accentColor}20`,
                                color: accentColor === '#e8eaf6' ? '#1a237e' : accentColor,
                                border: `1px solid ${accentColor}50`,
                              }}
                            />
                          ))}
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                            flexGrow: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {orixa.batuaraTeaching}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

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
                    👈 Deslize para ver mais orixás
                  </Typography>
                )}
                <NavigationDots
                  totalItems={orixas.length}
                  currentIndex={(() => {
                    const itemWidth = isMobile ? 260 : 300;
                    const gap = 24;
                    const itemWithGap = itemWidth + gap;
                    const totalDots = orixas.length;

                    if (scrollPosition >= maxScroll * 0.9) {
                      return totalDots - 1;
                    }

                    return Math.floor(scrollPosition / itemWithGap);
                  })()}
                  itemsPerView={1}
                  onDotClick={handleDotClick}
                />
              </Box>
            </Box>

          </>
        )}

        <Dialog open={Boolean(selectedOrixa)} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>{selectedOrixa?.name}</DialogTitle>
          <DialogContent>
            {selectedOrixa && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  {selectedOrixa.description}
                </Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Origem e fundamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrixa.origin}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Ensinamento na Casa Batuara
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedOrixa.batuaraTeaching}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Características
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedOrixa.characteristics.map((item) => (
                        <Chip key={item} label={item} size="small" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Cores
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedOrixa.colors.map((item) => (
                        <Chip key={item} label={item} size="small" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Elementos
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedOrixa.elements.map((item) => (
                        <Chip key={item} label={item} size="small" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrixasSection;
