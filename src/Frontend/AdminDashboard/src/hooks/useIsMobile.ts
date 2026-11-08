import { useMediaQuery, useTheme } from '@mui/material';

/** true em celular/tablet estreito (< md). No desktop a UI continua como sempre. */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
};

export default useIsMobile;
