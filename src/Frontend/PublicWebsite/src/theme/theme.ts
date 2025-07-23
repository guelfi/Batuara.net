import { createTheme } from '@mui/material/styles';

// Cores da Casa Batuara baseadas em Yemanjá (azul oceano) como cor principal
const batuaraColors = {
  // Cores principais de Yemanjá
  yemanja: {
    main: '#1976d2', // Azul oceano principal
    light: '#42a5f5', // Azul claro
    dark: '#1565c0', // Azul escuro
    contrastText: '#ffffff',
  },
  // Cores dos Orixás para uso contextual
  oxala: {
    main: '#ffffff',
    light: '#f5f5f5',
    dark: '#e0e0e0',
    contrastText: '#1976d2',
  },
  iansa: {
    main: '#ff9800', // Amarelo/laranja
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#ffffff',
  },
  ogum: {
    main: '#1565c0', // Azul escuro
    light: '#1976d2',
    dark: '#0d47a1',
    contrastText: '#ffffff',
  },
  oxossi: {
    main: '#4caf50', // Verde
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  xango: {
    main: '#d32f2f', // Vermelho
    light: '#f44336',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  oxum: {
    main: '#ffc107', // Dourado
    light: '#ffeb3b',
    dark: '#ff8f00',
    contrastText: '#000000',
  },
  nana: {
    main: '#9c27b0', // Roxo
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
};

// Tema personalizado da Casa Batuara
export const batuaraTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: batuaraColors.yemanja.main,
      light: batuaraColors.yemanja.light,
      dark: batuaraColors.yemanja.dark,
      contrastText: batuaraColors.yemanja.contrastText,
    },
    secondary: {
      main: batuaraColors.oxum.main,
      light: batuaraColors.oxum.light,
      dark: batuaraColors.oxum.dark,
      contrastText: batuaraColors.oxum.contrastText,
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: batuaraColors.yemanja.main,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      color: batuaraColors.yemanja.main,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: batuaraColors.yemanja.dark,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: batuaraColors.yemanja.dark,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 24px',
          fontSize: '1rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: batuaraColors.yemanja.main,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Cores específicas dos Orixás para uso em componentes
export const orixaColors = batuaraColors;

// Função para obter cor do Orixá
export const getOrixaColor = (orixaName: string): string => {
  const colorMap: { [key: string]: string } = {
    'oxala': batuaraColors.oxala.main,
    'yemanja': batuaraColors.yemanja.main,
    'iansa': batuaraColors.iansa.main,
    'ogum': batuaraColors.ogum.main,
    'oxossi': batuaraColors.oxossi.main,
    'xango': batuaraColors.xango.main,
    'oxum': batuaraColors.oxum.main,
    'nana': batuaraColors.nana.main,
  };
  
  return colorMap[orixaName.toLowerCase()] || batuaraColors.yemanja.main;
};