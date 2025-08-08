import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';
import { linhasUmbandaData, LinhaUmbanda } from '../../data/linhasUmbandaData';
import { convertLinhaToModalData, getColorFromAttribute } from '../../utils/spiritualDataDetail';
import NavigationDots from '../common/NavigationDots';
import SpiritualDetailModal from '../common/SpiritualDetailModal';

const UmbandaSection: React.FC = () => {
  const [selectedLinha, setSelectedLinha] = useState<LinhaUmbanda | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const formatLinhaName = (name: string): string => {
    // Remove "Linha de " e "Linha da " do início
    return name.replace(/^Linha de |^Linha da /, '');
  };

  // Usar a função unificada baseada no atributo 'cor'
  const getLinhaColor = (linha: LinhaUmbanda): string => {
    return getColorFromAttribute(linha.cor);
  };

  const getChipTextColor = (cor: string): string => {
    // Para cores claras, usar texto escuro
    const lightColors = ['Branco', 'Amarelo', 'Azul-claro'];
    return lightColors.includes(cor) ? '#333333' : 'white';
  };

  const getBorderColor = (linha: LinhaUmbanda): string => {
    // Para branco, usar uma borda mais visível
    if (linha.cor === 'Branco') {
      return '#e0e0e0';
    }
    return getLinhaColor(linha);
  };

  const handleCardClick = (linha: LinhaUmbanda) => {
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
          {linhasUmbandaData.map((linha) => (
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
                borderTop: `4px solid ${getBorderColor(linha)}`,
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
                  {formatLinhaName(linha.name)}
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
                    Regida por: {linha.regidaPor}
                  </Typography>
                  
                  <Chip
                    label={linha.cor}
                    size="small"
                    sx={{
                      backgroundColor: getLinhaColor(linha),
                      color: getChipTextColor(linha.cor),
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
                    {linha.entidades.slice(0, 2).map((entidade: string, index: number) => (
                      <Chip
                        key={index}
                        label={entidade}
                        size="small"
                        sx={{
                          backgroundColor: getLinhaColor(linha),
                          color: getChipTextColor(linha.cor),
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                    {linha.entidades.length > 2 && (
                      <Chip
                        label={`+${linha.entidades.length - 2}`}
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
                    {linha.atuacao}
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
            totalItems={linhasUmbandaData.length}
            currentIndex={(() => {
              const itemWidth = isMobile ? 320 : 320;
              const gap = 24;
              const itemsPerView = 1;
              const itemWithGap = itemWidth + gap;
              const totalDots = Math.ceil(linhasUmbandaData.length / itemsPerView);
              
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

      {/* Modal com informações detalhadas */}
      <SpiritualDetailModal
        open={!!selectedLinha}
        onClose={handleCloseDialog}
        data={selectedLinha ? convertLinhaToModalData(selectedLinha) : {} as any}
        tipo="linha"
      />
    </Box>
  );
};

export default UmbandaSection;