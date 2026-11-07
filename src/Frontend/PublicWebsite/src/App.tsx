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
import CookieConsentBanner from './components/common/CookieConsentBanner';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import BingoCustomerPage from './pages/bingo/BingoCustomerPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { publicApi } from './services/api';
import { asVisibility, canShowSpiritual } from './utils/contentVisibility';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

const MainSections: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: siteSettings } = useQuery({
    queryKey: ['public-site-settings-sections'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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
  const path = window.location.pathname;
  const isPrivacyPage = path.startsWith('/politica-de-privacidade');
  // '/bingo/garcom' não existe mais no site (o garçom usa o AdminDashboard): cai na página inicial.
  const isBingo = (path === '/bingo' || path.startsWith('/bingo/')) && !path.startsWith('/bingo/garcom');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={batuaraTheme}>
          <CssBaseline />
          <AuthProvider>
            <LoadingProvider>
              {isBingo ? (
                <BingoCustomerPage />
              ) : isPrivacyPage ? (
                <Layout>
                  <PrivacyPolicyPage />
                </Layout>
              ) : (
                <MainSections />
              )}
              {!isBingo && <CookieConsentBanner />}
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
