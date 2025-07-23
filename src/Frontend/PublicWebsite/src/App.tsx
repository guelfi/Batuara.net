import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { batuaraTheme } from './theme/theme';
import Layout from './components/layout/Layout';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import EventsSection from './components/sections/EventsSection';
import CalendarSection from './components/sections/CalendarSection';
import OrixasSection from './components/sections/OrixasSection';
import UmbandaSection from './components/sections/UmbandaSection';
import PrayersSection from './components/sections/PrayersSection';
import DonationsSection from './components/sections/DonationsSection';
import ContactSection from './components/sections/ContactSection';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingProvider from './components/common/LoadingProvider';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={batuaraTheme}>
          <CssBaseline />
          <LoadingProvider>
            <Layout>
              <HeroSection />
              <AboutSection />
              <EventsSection />
              <CalendarSection />
              <OrixasSection />
              <UmbandaSection />
              <PrayersSection />
              <DonationsSection />
              <ContactSection />
            </Layout>
          </LoadingProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
