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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { orixasData, Orixa } from '../../data/orixasData';
import NavigationDots from '../common/NavigationDots';

const OrixasSection: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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

  const getOrixaColor = (name: string): string => {
    const colorMap: { [key: string]: string } = {
      'Oxalá': '#e8eaf6', // Azul muito claro para Oxalá (branco com toque de azul)
      'Iemanjá': '#1976d2',
      'Nanã': '#9c27b0',
      'Oxum': '#ffc107',
      'Ogum': '#d32f2f',
      'Oxóssi': '#388e3c',
      'Xangô': '#795548',
      'Iansã': '#ff9800',
      'Obaluaê': '#673ab7',
      'Exu': '#212121', // Preto para Exu
      'Pomba Gira': '#d32f2f', // Vermelho para Pomba Gira
      'Ossain': '#4caf50',
      'Oxumarê': '#ffeb3b'
    };
    return colorMap[name] || theme.palette.primary.main;
  };

  const getOrixaNameColor = (name: string): string => {
    // Para Oxalá, usar uma cor mais escura para contraste com fundo branco
    if (name === 'Oxalá') return '#1a237e'; // Azul escuro para contraste
    // Para outros Orixás, usar suas cores próprias
    return getOrixaColor(name);
  };

  const getOrixaIconColor = (name: string): string => {
    // Para Oxalá, usar texto escuro para contraste no ícone
    if (name === 'Oxalá') return '#1a237e';
    // Para Exu, usar texto branco no ícone
    if (name === 'Exu') return '#ffffff';
    // Para outros Orixás com cores claras, usar texto escuro no ícone
    if (['Oxum', 'Oxumarê'].includes(name)) return '#333333';
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
    <Box id="orixas" sx={{ py: 4, backgroundColor: 'background.paper' }}>
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
                  height: 420,
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
                    backgroundColor: getOrixaColor(orixa.name),
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
                        backgroundColor: getOrixaColor(orixa.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 40, color: getOrixaIconColor(orixa.name) }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: getOrixaNameColor(orixa.name),
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

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                      Saudação:
                    </Typography>
                    <Chip
                      label={orixa.saudacao}
                      size="small"
                      sx={{
                        backgroundColor: getOrixaColor(orixa.name),
                        color: getSaudacaoTextColor(orixa.name),
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        height: '20px',
                        '& .MuiChip-label': {
                          color: getSaudacaoTextColor(orixa.name),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                      Habitat:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {orixa.habitat}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                      Dia da Semana:
                    </Typography>
                    <Chip
                      label={orixa.diaSemana}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 600, fontSize: '0.75rem' }}>
                      Fruta:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {orixa.fruta}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                      Cor:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getOrixaColor(orixa.name),
                          border: orixa.name === 'Oxalá' ? '1px solid #ccc' : 'none',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {orixa.cor}
                      </Typography>
                    </Box>
                  </Box>
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
                const itemWidth = isMobile ? 260 : 300;
                const gap = 24;
                const itemsPerView = isMobile ? 1 : 3;
                const itemWithGap = itemWidth + gap;
                const totalDots = Math.ceil(orixasData.length / itemsPerView);
                
                // Se chegamos próximo do final (90% do scroll máximo), mostrar último dot
                if (scrollPosition >= maxScroll * 0.9) {
                  return totalDots - 1;
                }
                
                return Math.floor(scrollPosition / itemWithGap / itemsPerView);
              })()}
              itemsPerView={isMobile ? 1 : 3}
            />
          </Box>
        </Box>

        {/* Dialog com detalhes do Orixá */}
        <Dialog
          open={!!selectedOrixa}
          onClose={handleCloseDialog}
          fullScreen={fullScreen}
          maxWidth="md"
          fullWidth
        >
          {selectedOrixa && (
            <>
              <DialogTitle
                sx={{
                  backgroundColor: getOrixaColor(selectedOrixa.name),
                  color: selectedOrixa.name === 'Oxalá' ? 'black' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedOrixa.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {selectedOrixa.saudacao}
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleCloseDialog}
                  sx={{ color: selectedOrixa.name === 'Oxalá' ? 'black' : 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Sobre {selectedOrixa.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {selectedOrixa.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Elemento e Habitat
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.7 }}>
                      <strong>Elemento:</strong> {selectedOrixa.element}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      <strong>Habitat:</strong> {selectedOrixa.habitat}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Atuação na Casa Batuara
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedOrixa.name} atua principalmente na área de <strong>{selectedOrixa.atuacao}</strong>, 
                      sendo uma das forças fundamentais que orientam nossos trabalhos espirituais e 
                      ensinamentos na Casa de Caridade Caboclo Batuara.
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Informações Rituais
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Cor:
                        </Typography>
                        <Chip
                          label={selectedOrixa.cor}
                          sx={{
                            backgroundColor: getOrixaColor(selectedOrixa.name),
                            color: selectedOrixa.name === 'Oxalá' ? 'black' : 'white',
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Símbolo:
                        </Typography>
                        <Typography variant="body2">{selectedOrixa.simbolo}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Dia da Semana:
                        </Typography>
                        <Chip label={selectedOrixa.diaSemana} variant="outlined" />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Fruta:
                        </Typography>
                        <Typography variant="body2">{selectedOrixa.fruta}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Comida:
                        </Typography>
                        <Typography variant="body2">{selectedOrixa.comida}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Bebida:
                        </Typography>
                        <Typography variant="body2">{selectedOrixa.bebida}</Typography>
                      </Box>

                      {selectedOrixa.dataComemoração !== 'Data não especificada' && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Data de Comemoração:
                          </Typography>
                          <Typography variant="body2">{selectedOrixa.dataComemoração}</Typography>
                        </Box>
                      )}
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

export default OrixasSection;