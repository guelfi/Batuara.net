import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface NavigationDotsProps {
  totalItems: number;
  currentIndex: number;
  itemsPerView: number;
  onDotClick?: (index: number) => void;
  sx?: SxProps<Theme>;
}

const NavigationDots: React.FC<NavigationDotsProps> = ({
  totalItems,
  currentIndex,
  itemsPerView,
  onDotClick,
  sx = {},
}) => {
  // Calcular quantos dots são necessários
  const totalDots = Math.ceil(totalItems / itemsPerView);
  
  // Garantir que currentIndex está dentro dos limites e ajustar para o final
  let safeCurrentIndex = Math.max(0, Math.min(currentIndex, totalDots - 1));
  
  // Se estamos próximos do final, mostrar o último dot ativo
  if (currentIndex >= totalDots - 1) {
    safeCurrentIndex = totalDots - 1;
  }
  
  // Não mostrar indicadores se há poucos itens
  if (totalItems <= itemsPerView) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        mt: 1.5,
        ...sx,
      }}
    >
      {Array.from({ length: totalDots }).map((_, index) => (
        <Box
          key={index}
          onClick={() => onDotClick?.(index)}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: index === safeCurrentIndex 
              ? 'primary.main' 
              : 'rgba(255,255,255,0.5)',
            transition: 'background-color 0.3s ease',
            cursor: onDotClick ? 'pointer' : 'default',
            '&:hover': onDotClick ? {
              backgroundColor: index === safeCurrentIndex 
                ? 'primary.main' 
                : 'rgba(255,255,255,0.8)',
            } : {},
          }}
        />
      ))}
    </Box>
  );
};

export default NavigationDots;