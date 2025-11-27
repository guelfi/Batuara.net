import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { adminTheme } from './theme/theme';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CalendarPage from './pages/CalendarPage';
import OrixasPage from './pages/OrixasPage';
import UmbandaLinesPage from './pages/UmbandaLinesPage';
import SpiritualContentPage from './pages/SpiritualContentPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import PlaceholderPage from './pages/PlaceholderPage';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rota pública de login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rota de não autorizado */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Rotas protegidas */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/history" element={<PlaceholderPage title="Nossa História" />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/orixas" element={<OrixasPage />} />
                        <Route path="/guides" element={<PlaceholderPage title="Guias e Entidades" />} />
                        <Route path="/umbanda-lines" element={<UmbandaLinesPage />} />
                        <Route path="/prayers" element={<PlaceholderPage title="Orações e Pontos" />} />
                        <Route path="/spiritual-content" element={<SpiritualContentPage />} />
                        <Route path="/members" element={<PlaceholderPage title="Filhos da Casa" />} />
                        <Route path="/donations-contact" element={<PlaceholderPage title="Doações e Contato" />} />
                        <Route path="/location" element={<PlaceholderPage title="Localização" />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;