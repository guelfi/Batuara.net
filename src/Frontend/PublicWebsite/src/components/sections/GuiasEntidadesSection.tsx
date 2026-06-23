import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  IconButton,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@tanstack/react-query';
import NavigationDots from '../common/NavigationDots';
import publicApi from '../../services/api';
import { Guide } from '../../types';

type DisplayGuide = {
  id: string | number;
  name: string;
  description: string;
  highlight: string;
  cor?: string;
  tags: string[];
  saudacao?: string;
  diaDaSemana?: string;
  fruta?: string;
  comida?: string;
};

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

const GuiasEntidadesSection: React.FC = () => {
  const [selectedGuia, setSelectedGuia] = useState<DisplayGuide | null>(null);
  const [selectedAccentColor, setSelectedAccentColor] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-guides'],
    queryFn: () => publicApi.getGuides(),
  });

  const guides = useMemo<DisplayGuide[]>(() => {
    return [...(data ?? [])]
      .filter((item) => item.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      .map((item: Guide) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        highlight: 'Guia da Casa Batuara',
        cor: item.cor,
        tags: item.specialties,
        saudacao: item.saudacao,
        diaDaSemana: item.diaDaSemana,
        fruta: item.fruta,
        comida: item.comida,
      }));
  }, [data]);

  const getAccentColorFromGuide = (guia: DisplayGuide): string => {
    if (guia.cor) {
      const corLower = guia.cor.toLowerCase().trim();
      if (colorMap[corLower]) return colorMap[corLower];
      for (const key of colorKeys) {
        if (corLower.includes(key)) return colorMap[key];
      }
    }
    return theme.palette.primary.main;
  };

  const handleOpenDialog = (guia: DisplayGuide, accentColor: string) => {
    setSelectedGuia(guia);
    setSelectedAccentColor(accentColor);
  };

  const handleCloseDialog = () => {
    setSelectedGuia(null);
    setSelectedAccentColor(null);
  };

  const dialogAccentColor = selectedAccentColor ?? theme.palette.primary.main;
  const dialogTitleColor = dialogAccentColor === '#e8eaf6' ? '#1a237e' : dialogAccentColor;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 300 : 340;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 300 : 340;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = isMobile ? 300 : 340;
      const gap = 24;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const canScrollLeft = scrollPosition > 4;
  const canScrollRight = scrollPosition < maxScroll - 4;

  useEffect(() => {
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      handleScroll();
      raf2 = window.requestAnimationFrame(() => {
        handleScroll();
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [guides.length, isMobile]);

  return (
    <Box
      id="guias-entidades"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        pt: { xs: 1.5, md: 2 },
        pb: { xs: 4, md: 8 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
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
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
            Conheça os guias e entidades que trabalham em nossa casa e suas orientações espirituais
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="warning">Não foi possível carregar os guias e entidades neste momento.</Alert>
        ) : guides.length === 0 ? (
          <Alert severity="info">Nenhum guia ou entidade ativo foi cadastrado até o momento.</Alert>
        ) : (
          <>
            <Box sx={{ position: 'relative', overflow: 'clip' }}>
              <IconButton
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                sx={{
                  position: 'absolute',
                  left: { xs: 4, md: 8 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: theme.shadows[6],
                  opacity: canScrollLeft ? 1 : 0.35,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <IconButton
                onClick={scrollRight}
                disabled={!canScrollRight}
                sx={{
                  position: 'absolute',
                  right: { xs: 4, md: 8 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: theme.shadows[6],
                  opacity: canScrollRight ? 1 : 0.35,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>

              <Box
                id="guides-carousel"
                ref={scrollContainerRef}
                onScroll={handleScroll}
                sx={{
                  display: 'flex',
                  gap: 3,
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  overscrollBehaviorX: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  pb: 2,
                  px: { xs: 0.5, md: 0 },
                  scrollSnapType: 'x mandatory',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                {guides.map((guia) => (
                  (() => {
                    const accentColor = getAccentColorFromGuide(guia);
                    const accentText = accentColor === '#e8eaf6' ? '#1a237e' : accentColor;

                    return (
                      <Card
                        key={guia.id}
                        onClick={() => handleOpenDialog(guia, accentColor)}
                        sx={{
                          minWidth: { xs: 300, md: 340 },
                          maxWidth: { xs: 300, md: 340 },
                          cursor: 'pointer',
                          scrollSnapAlign: 'start',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                          border: `1px solid ${accentColor}35`,
                          borderLeft: `6px solid ${accentColor}`,
                          boxShadow: 3,
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6,
                            borderColor: `${accentColor}90`,
                          },
                        }}
                      >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: accentColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 34, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: accentText }}>
                            {guia.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {guia.highlight}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        {guia.description}
                      </Typography>

                      <Stack spacing={0.75} sx={{ mb: 2 }}>
                        {guia.saudacao && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Saudação:</strong> {guia.saudacao}
                          </Typography>
                        )}
                        {guia.diaDaSemana && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Dia:</strong> {guia.diaDaSemana}
                          </Typography>
                        )}
                        {guia.fruta && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Fruta:</strong> {guia.fruta}
                          </Typography>
                        )}
                        {guia.comida && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Comida:</strong> {guia.comida}
                          </Typography>
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {guia.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: `${accentColor}70`,
                              color: accentText,
                              backgroundColor: `${accentColor}10`,
                            }}
                          />
                        ))}
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        <Button variant="text" sx={{ px: 0 }}>
                          Ver detalhes
                        </Button>
                      </Box>
                    </CardContent>
                      </Card>
                    );
                  })()
                ))}
              </Box>
              <NavigationDots
                totalItems={guides.length}
                currentIndex={(() => {
                  const itemWidth = isMobile ? 300 : 340;
                  const gap = 24;
                  const itemWithGap = itemWidth + gap;
                  const totalDots = guides.length;

                  if (scrollPosition >= maxScroll * 0.9) {
                    return totalDots - 1;
                  }

                  return Math.floor(scrollPosition / itemWithGap);
                })()}
                itemsPerView={1}
                onDotClick={handleDotClick}
              />
            </Box>

            <Dialog
              open={!!selectedGuia}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="sm"
              TransitionComponent={DialogTransition}
              PaperProps={{
                sx: {
                  borderTop: `8px solid ${dialogAccentColor}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 800,
                  backgroundColor: `${dialogAccentColor}14`,
                  borderBottom: `1px solid ${dialogAccentColor}30`,
                  color: dialogTitleColor,
                }}
              >
                {selectedGuia?.name}
              </DialogTitle>
              <DialogContent>
                {selectedGuia && (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {selectedGuia.description}
                    </Typography>
                    {(selectedGuia.saudacao || selectedGuia.diaDaSemana || selectedGuia.fruta || selectedGuia.comida) && (
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${dialogAccentColor}30`,
                          backgroundColor: `${dialogAccentColor}08`,
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: dialogTitleColor }}>
                          Oferendas e Saudação
                        </Typography>
                        <Grid container spacing={1.5}>
                          {selectedGuia.saudacao && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Saudação:</strong> {selectedGuia.saudacao}
                              </Typography>
                            </Grid>
                          )}
                          {selectedGuia.diaDaSemana && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Dia:</strong> {selectedGuia.diaDaSemana}
                              </Typography>
                            </Grid>
                          )}
                          {selectedGuia.fruta && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Fruta:</strong> {selectedGuia.fruta}
                              </Typography>
                            </Grid>
                          )}
                          {selectedGuia.comida && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Comida:</strong> {selectedGuia.comida}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Especialidades
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {selectedGuia.tags.map((specialty) => (
                          <Chip
                            key={specialty}
                            label={specialty}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: `${dialogAccentColor}70`,
                              color: dialogTitleColor,
                              backgroundColor: `${dialogAccentColor}10`,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
};

export default GuiasEntidadesSection;
