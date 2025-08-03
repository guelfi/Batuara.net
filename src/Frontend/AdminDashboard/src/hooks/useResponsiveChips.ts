import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook para controle inteligente de exibição de chips no Sidebar
 * 
 * Lógica de exibição:
 * - Desktop/Tablet (>= 768px): Sempre exibe chips
 * - Mobile (< 768px) + Desenvolvimento: Exibe chips
 * - Mobile (< 768px) + Produção: Oculta chips
 * 
 * @returns boolean - true se deve exibir chips, false caso contrário
 */
export const useResponsiveChips = (): boolean => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 768px
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Oculta chips apenas em: mobile + produção
  // Em todos os outros casos (desktop, tablet, mobile em dev), exibe chips
  const shouldShowChips = !(isMobile && isProduction);
  
  return shouldShowChips;
};

/**
 * Hook adicional para detectar se está em mobile
 * Útil para outros ajustes de responsividade
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
};

/**
 * Hook para detectar ambiente de produção
 * Útil para outras funcionalidades condicionais
 */
export const useIsProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};