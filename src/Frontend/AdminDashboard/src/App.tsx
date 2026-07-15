import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { adminTheme } from './theme/theme';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import OrixasPage from './pages/OrixasPage';
import GuidesPage from './pages/GuidesPage';
import HistoryPage from './pages/HistoryPage';
import MembersPage from './pages/MembersPage';
import DonationsContactPage from './pages/DonationsContactPage';
import LocationPage from './pages/LocationPage';
import UmbandaLinesPage from './pages/UmbandaLinesPage';
import SpiritualContentPage from './pages/SpiritualContentPage';
import ProfilePage from './pages/ProfilePage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import UsersPage from './pages/UsersPage';
import MemberProfilePage from './pages/MemberProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import { UserRole } from './types';

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

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === UserRole.Member ? '/member-profile' : '/dashboard'} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router basename={process.env.PUBLIC_URL || '/'}>
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
                        <Route path="/" element={<HomeRedirect />} />
                        <Route path="/dashboard" element={<ProtectedRoute requiredRole={UserRole.Editor}><DashboardPage /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute requiredRole={UserRole.Editor}><HistoryPage /></ProtectedRoute>} />
                        <Route path="/agenda" element={<ProtectedRoute requiredRole={UserRole.Editor}><AgendaPage /></ProtectedRoute>} />
                        <Route path="/events" element={<Navigate to="/agenda" replace />} />
                        <Route path="/calendar" element={<Navigate to="/agenda" replace />} />
                        <Route path="/orixas" element={<ProtectedRoute requiredRole={UserRole.Editor}><OrixasPage /></ProtectedRoute>} />
                        <Route path="/guides" element={<ProtectedRoute requiredRole={UserRole.Editor}><GuidesPage /></ProtectedRoute>} />
                        <Route path="/umbanda-lines" element={<ProtectedRoute requiredRole={UserRole.Editor}><UmbandaLinesPage /></ProtectedRoute>} />
                        <Route path="/prayers" element={<ProtectedRoute requiredRole={UserRole.Editor}><SpiritualContentPage /></ProtectedRoute>} />
                        <Route path="/spiritual-content" element={<ProtectedRoute requiredRole={UserRole.Editor}><SpiritualContentPage /></ProtectedRoute>} />
                        <Route path="/members" element={<ProtectedRoute requiredRole={UserRole.Editor}><MembersPage /></ProtectedRoute>} />
                        <Route path="/donations-contact" element={<ProtectedRoute requiredRole={UserRole.Admin}><DonationsContactPage /></ProtectedRoute>} />
                        <Route path="/contact-messages" element={<ProtectedRoute requiredRole={UserRole.Editor}><ContactMessagesPage /></ProtectedRoute>} />
                        <Route path="/location" element={<ProtectedRoute requiredRole={UserRole.Admin}><LocationPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/users" element={<ProtectedRoute requiredRole={UserRole.Admin}><UsersPage /></ProtectedRoute>} />
                        <Route path="/member-profile" element={<ProtectedRoute allowedRoles={[UserRole.Member]}><MemberProfilePage /></ProtectedRoute>} />
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
