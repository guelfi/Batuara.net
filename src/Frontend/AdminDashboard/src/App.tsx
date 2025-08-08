import React, { useState, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import ContentArea from './components/content/ContentArea';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);

    // Scroll para o topo quando qualquer item for selecionado, especialmente Dashboard
    if (contentRef.current) {
      // Usar setTimeout para garantir que o conteúdo foi renderizado
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }

        // Fallback para scroll da janela principal
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }

        // Fallback adicional para window scroll
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout selectedItem={selectedItem} onItemSelect={handleItemSelect}>
        <div ref={contentRef} style={{ height: '100%', overflow: 'auto' }}>
          <ContentArea selectedItem={selectedItem} onItemSelect={handleItemSelect} />
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;