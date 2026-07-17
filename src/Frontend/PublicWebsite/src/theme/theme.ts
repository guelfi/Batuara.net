import { createTheme } from '@mui/material/styles';

// Cores da Casa Batuara baseadas em Yemanjá (azul oceano) como cor principal e Oxum (dourado) como secundária
const batuaraColors = {
  yemanja: {
    main: '#1976d2', // Azul oceano principal
    light: '#42a5f5', // Azul claro
    dark: '#1565c0', // Azul escuro
    contrastText: '#ffffff',
  },
  oxum: {
    main: '#ffc107', // Dourado
    light: '#ffeb3b',
    dark: '#ff8f00',
    contrastText: '#000000',
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
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--batuara-calendar-event-festa': '#fb8c00',
          '--batuara-calendar-event-evento': '#1976d2',
          '--batuara-calendar-event-celebracao': '#d81b60',
          '--batuara-calendar-event-bazar': '#ef6c00',
          '--batuara-calendar-event-palestra': '#1e88e5',
        },
        html: {
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        body: {
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        'body::-webkit-scrollbar': {
          display: 'none',
        },
      },
    },
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

export const desktopMinWidth = 1024;
export const desktopMediaQuery = `@media (min-width:${desktopMinWidth}px)`;
