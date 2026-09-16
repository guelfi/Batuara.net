import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { batuaraTheme } from './theme/theme';
import Layout from './components/layout/Layout';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import CalendarSection from './components/sections/CalendarSection';
import EventsSection from './components/sections/EventsSection';
import OrixasSection from './components/sections/OrixasSection';
import GuiasEntidadesSection from './components/sections/GuiasEntidadesSection';
import UmbandaSection from './components/sections/UmbandaSection';
import PrayersSection from './components/sections/PrayersSection';
import DonationsSection from './components/sections/DonationsSection';
import ContactSection from './components/sections/ContactSection';
import LocationSection from './components/sections/LocationSection';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingProvider from './components/common/LoadingProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContentVisibility } from './types';
import { publicApi } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

const asVisibility = (value?: number | ContentVisibility | null): ContentVisibility => {
  if (
    value === ContentVisibility.Public ||
    value === ContentVisibility.Authenticated ||
    value === ContentVisibility.Hidden
  ) {
    return value;
  }
  return ContentVisibility.Hidden;
};

const canShowSpiritual = (visibility: ContentVisibility, isAuthenticated: boolean): boolean => {
  if (visibility === ContentVisibility.Public) return true;
  if (visibility === ContentVisibility.Authenticated) return isAuthenticated;
  return false;
};

const MainSections: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: siteSettings } = useQuery({
    queryKey: ['public-site-settings-sections'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 60_000,
  });

  const show = useMemo(
    () => ({
      orixas: canShowSpiritual(asVisibility(siteSettings?.orixasVisibility), isAuthenticated),
      guides: canShowSpiritual(asVisibility(siteSettings?.guidesVisibility), isAuthenticated),
      umbanda: canShowSpiritual(asVisibility(siteSettings?.umbandaLinesVisibility), isAuthenticated),
      prayers: canShowSpiritual(asVisibility(siteSettings?.prayersVisibility), isAuthenticated),
    }),
    [isAuthenticated, siteSettings]
  );

  return (
    <Layout>
      <HeroSection />
      <AboutSection />
      <CalendarSection />
      <EventsSection />
      {show.orixas && <OrixasSection />}
      {show.guides && <GuiasEntidadesSection />}
      {show.umbanda && <UmbandaSection />}
      {show.prayers && <PrayersSection />}
      <DonationsSection />
      <ContactSection />
      <LocationSection />
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={batuaraTheme}>
          <CssBaseline />
          <AuthProvider>
            <LoadingProvider>
              <MainSections />
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
