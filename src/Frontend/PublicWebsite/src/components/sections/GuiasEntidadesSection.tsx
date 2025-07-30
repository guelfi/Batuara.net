import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import { guiasEntidadesData, GuiaEntidade } from '../../data/guiasEntidadesData';
import NavigationDots from '../common/NavigationDots';

const GuiasEntidadesSection: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
      const scrollAmount = isMobile ? 350 : 400;
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
      const itemWidth = isMobile ? 350 : 400;
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

  const getGuiaColor = (name: string): string => {
    const colorMap: { [key: string]: string } = {
      'Baiano': '#ff9800',
      'Preto Velho': '#795548',
      'Erês': '#e91e63',
      'Boiadeiro': '#8bc34a',
      'Marinheiro': '#2196f3',
      'Cigano': '#9c27b0',
      'Malandro': '#f44336'
    };
    return colorMap[name] || theme.palette.primary.main;
  };

  return (
    <Box id="guias-entidades" sx={{ py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              lineHeight: 1.6,
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
                  minWidth: isMobile ? 350 : 400,
                  maxWidth: isMobile ? 350 : 400,
                  height: 'auto',
                  minHeight: isMobile ? 480 : 520,
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
                    backgroundColor: getGuiaColor(guia.name),
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: getGuiaColor(guia.name),
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
                        color: getGuiaColor(guia.name),
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

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.9rem' }}>
                      Saudação:
                    </Typography>
                    <Chip
                      label={guia.saudacao}
                      size="medium"
                      sx={{
                        backgroundColor: getGuiaColor(guia.name),
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}
                    />
                  </Box>

                  {/* Layout otimizado em pares */}
                  <Grid container spacing={1} sx={{ mb: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.25 }}>
                        Habitat:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.3 }}>
                        {guia.habitat}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.25 }}>
                        Cor:
                      </Typography>
                      <Chip
                        label={guia.cor}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.25 }}>
                        Dia:
                      </Typography>
                      <Chip
                        label={guia.diaSemana}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.25 }}>
                        Fruta:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.3 }}>
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
                const itemWidth = isMobile ? 350 : 400;
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

        {/* Dialog com detalhes da Guia/Entidade */}
        <Dialog
          open={!!selectedGuia}
          onClose={handleCloseDialog}
          fullScreen={fullScreen}
          maxWidth="md"
          fullWidth
        >
          {selectedGuia && (
            <>
              <DialogTitle
                sx={{
                  backgroundColor: getGuiaColor(selectedGuia.name),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedGuia.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {selectedGuia.saudacao}
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleCloseDialog}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Sobre {selectedGuia.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {selectedGuia.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Características
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {selectedGuia.caracteristicas.map((caracteristica, index) => (
                        <Chip
                          key={index}
                          label={caracteristica}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Trabalho na Casa Batuara
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedGuia.name} é uma das entidades que trabalham conosco na Casa de Caridade Caboclo Batuara, 
                      trazendo seus ensinamentos e proteção espiritual para todos que buscam orientação e auxílio.
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Informações Rituais
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Data de Comemoração:
                        </Typography>
                        <Typography variant="body2">{selectedGuia.comemoracao}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Habitat:
                        </Typography>
                        <Typography variant="body2">{selectedGuia.habitat}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Cor:
                        </Typography>
                        <Chip
                          label={selectedGuia.cor}
                          sx={{
                            backgroundColor: getGuiaColor(selectedGuia.name),
                            color: 'white',
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Dia da Semana:
                        </Typography>
                        <Chip label={selectedGuia.diaSemana} variant="outlined" />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Fruta:
                        </Typography>
                        <Typography variant="body2">{selectedGuia.fruta}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Bebida:
                        </Typography>
                        <Typography variant="body2">{selectedGuia.bebida}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Comida:
                        </Typography>
                        <Typography variant="body2">{selectedGuia.comida}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleCloseDialog} variant="outlined">
                  Fechar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default GuiasEntidadesSection;