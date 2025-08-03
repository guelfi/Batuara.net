import React, { useState } from 'react';
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

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout selectedItem={selectedItem} onItemSelect={handleItemSelect}>
        <ContentArea selectedItem={selectedItem} onItemSelect={handleItemSelect} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;