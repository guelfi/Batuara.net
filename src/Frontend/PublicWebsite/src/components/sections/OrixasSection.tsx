import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { orixasData, Orixa } from '../../data/orixasData';
import NavigationDots from '../common/NavigationDots';
import SpiritualDetailModal from '../common/SpiritualDetailModal';
import { convertOrixaToModalData, getColorFromAttribute } from '../../utils/spiritualDataDetail';

const OrixasSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedOrixa, setSelectedOrixa] = useState<Orixa | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenDialog = (orixa: Orixa) => {
    setSelectedOrixa(orixa);
  };

  const handleCloseDialog = () => {
    setSelectedOrixa(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 280 : 320;
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
      const itemWidth = isMobile ? 280 : 320;
      const gap = 24;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;

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

  useEffect(() => {
    // Inicializar estado do scroll
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, []);

  // Usar a função unificada baseada no atributo 'cor'
  const getOrixaColor = (orixa: Orixa): string => {
    return getColorFromAttribute(orixa.cor);
  };

  const getOrixaNameColor = (orixa: Orixa): string => {
    // Para Oxalá, usar uma cor mais escura para contraste com fundo branco
    if (orixa.cor === 'Branco') return '#1a237e'; // Azul escuro para contraste
    // Para outros Orixás, usar suas cores próprias
    return getOrixaColor(orixa);
  };

  const getOrixaIconColor = (orixa: Orixa): string => {
    // Para Oxalá, usar texto escuro para contraste no ícone
    if (orixa.cor === 'Branco') return '#1a237e';
    // Para Exu, usar texto branco no ícone
    if (orixa.cor === 'Preto') return '#ffffff';
    // Para outros Orixás com cores claras, usar texto escuro no ícone
    if (['Amarelo'].includes(orixa.cor)) return '#333333';
    // Para o resto, usar branco no ícone
    return '#ffffff';
  };

  const getSaudacaoTextColor = (name: string): string => {
    // Para Orixás com cores claras, usar texto escuro para melhor contraste
    if (['Oxalá', 'Oxum', 'Oxumarê'].includes(name)) return '#333333';
    // Para o resto, usar branco
    return '#ffffff';
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
            Forças da Natureza que regem nossa Casa e orientam nossos trabalhos
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
            Cada Orixá possui seu habitat natural, elemento e campo de força específico, 
            atuando diretamente em nossas vidas através de seus ensinamentos ancestrais.
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

            {orixasData.map((orixa) => (
              <Card
                key={orixa.id}
                onClick={() => handleOpenDialog(orixa)}
                sx={{
                  minWidth: isMobile ? 260 : 300,
                  maxWidth: isMobile ? 260 : 300,
                  height: 310,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: theme.shadows[6], // Sombra padrão mais visível
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[16], // Sombra ainda mais forte no hover
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: getOrixaColor(orixa),
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: getOrixaColor(orixa),
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
                        backgroundColor: getOrixaColor(orixa),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 40, color: getOrixaIconColor(orixa) }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: getOrixaNameColor(orixa),
                        mb: 0.5,
                      }}
                    >
                      {orixa.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      {orixa.element} • {orixa.atuacao}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      Saudação:
                    </Typography>
                    <Chip
                      label={orixa.saudacao}
                      size="small"
                      sx={{
                        backgroundColor: getOrixaColor(orixa),
                        color: getOrixaIconColor(orixa),
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        height: '20px',
                        '& .MuiChip-label': {
                          color: getOrixaIconColor(orixa),
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
                        {orixa.habitat}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Dia da Semana:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {orixa.diaSemana}
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
                            backgroundColor: getOrixaColor(orixa),
                          border: orixa.cor === 'Branco' ? '1px solid #ccc' : 'none',
                        }}
                      />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {orixa.cor}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                        Fruta:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {orixa.fruta}
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
                👈 Deslize para ver mais orixás
              </Typography>
            )}
            
            {/* Indicadores de navegação */}
            <NavigationDots
              totalItems={orixasData.length}
              currentIndex={(() => {
                const itemWidth = isMobile ? 280 : 320;
                const gap = 24;
                const itemsPerView = 1;
                const itemWithGap = itemWidth + gap;
                const totalDots = Math.ceil(orixasData.length / itemsPerView);
                
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

        {/* Modal fullscreen com detalhes do Orixá */}
        {selectedOrixa && (
          <SpiritualDetailModal
            open={!!selectedOrixa}
            onClose={handleCloseDialog}
            data={convertOrixaToModalData(selectedOrixa)}
            tipo="orixa"
          />
        )}
      </Container>
    </Box>
  );
};

export default OrixasSection;