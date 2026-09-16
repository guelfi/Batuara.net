import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  AppBar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AccountCircle as ProfileIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  MenuBook as HistoryIcon,
  Groups as GuidesIcon,
  Timeline as LinesIcon,
  MusicNote as PrayersIcon,
  VolunteerActivism as DonationIcon,
  Email as MessagesIcon,
  ManageAccounts as UsersIcon,
  Logout as LogoutIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ContentVisibilityProvider,
  useContentVisibility,
} from '../../hooks/useContentVisibility';
import apiService from '../../services/api';
import {
  ContentVisibility,
  ContentVisibilityModule,
  UserRole,
} from '../../types';
import { isAdmin, isEditorOrAdmin, isMember } from '../../utils/roles';

const drawerWidth = 280;
const batuaraLogoSrc = `${process.env.PUBLIC_URL || '/admin'}/batuara_logo.png`;

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  externalHref?: string;
  requiredRole?: UserRole;
  memberOnly?: boolean;
  alwaysVisible?: boolean;
  divider?: boolean;
  visibilityModule?: ContentVisibilityModule;
}

const VISIBILITY_STATUS: Record<
  ContentVisibility,
  { icon: React.ReactElement; label: string }
> = {
  [ContentVisibility.Hidden]: {
    icon: <VisibilityOffIcon sx={{ fontSize: 17 }} />,
    label: 'Oculto',
  },
  [ContentVisibility.Authenticated]: {
    icon: <LockIcon sx={{ fontSize: 17 }} />,
    label: 'Restrito',
  },
  [ContentVisibility.Public]: {
    icon: <PublicIcon sx={{ fontSize: 17 }} />,
    label: 'Público',
  },
};

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', requiredRole: UserRole.Editor },
  { text: 'Nossa História', icon: <HistoryIcon />, path: '/history', requiredRole: UserRole.Editor },
  { text: 'Agenda e Eventos', icon: <CalendarIcon />, path: '/agenda', requiredRole: UserRole.Editor },
  {
    text: 'Nossos Orixás',
    icon: <FavoriteIcon />,
    path: '/orixas',
    requiredRole: UserRole.Editor,
    visibilityModule: 'orixas',
  },
  {
    text: 'Guias da Casa',
    icon: <GuidesIcon />,
    path: '/guides',
    requiredRole: UserRole.Editor,
    visibilityModule: 'guides',
  },
  {
    text: 'Linhas da Umbanda',
    icon: <LinesIcon />,
    path: '/umbanda-lines',
    requiredRole: UserRole.Editor,
    visibilityModule: 'umbandaLines',
  },
  {
    text: 'Orações e Pontos',
    icon: <PrayersIcon />,
    path: '/spiritual-content',
    requiredRole: UserRole.Editor,
    visibilityModule: 'prayers',
  },
  { text: 'Filhos da Casa', icon: <PeopleIcon />, path: '/members', requiredRole: UserRole.Editor },
  { text: 'Doações e Contato', icon: <DonationIcon />, path: '/donations-contact', requiredRole: UserRole.Admin },
  { text: 'Contato e Mensagens', icon: <MessagesIcon />, path: '/contact-messages', requiredRole: UserRole.Editor },
  { text: 'Localização', icon: <LocationIcon />, path: '/location', requiredRole: UserRole.Admin },
  { text: 'Usuários', icon: <UsersIcon />, path: '/users', requiredRole: UserRole.Admin },
  {
    text: 'Site',
    icon: (
      <Box
        component="img"
        src={batuaraLogoSrc}
        alt=""
        sx={{ width: 24, height: 24, objectFit: 'contain', borderRadius: '50%' }}
      />
    ),
    externalHref: '/',
    alwaysVisible: true,
  },
  { text: 'Meu Cadastro', icon: <PeopleIcon />, path: '/profile', memberOnly: true },
];

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    error: visibilityError,
    successMessage,
    clearFeedback,
    getVisibility,
  } = useContentVisibility();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const visibleNavigationItems = navigationItems.filter((item) => {
    if (item.alwaysVisible) return true;
    if (item.memberOnly) return isMember(user?.role);
    if (isMember(user?.role)) return false;
    if (item.requiredRole === UserRole.Admin) return isAdmin(user?.role);
    if (item.requiredRole === UserRole.Editor) return isEditorOrAdmin(user?.role);
    return true;
  });

  const firstNavItemRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDesktopToggle = () => {
    setDesktopOpen((prev) => !prev);
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!isEditorOrAdmin(user?.role)) return;
    try {
      const count = await apiService.getContactMessagesUnreadCount();
      setUnreadMessages(count);
    } catch (_) {}
  }, [user?.role]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    window.addEventListener('unread-count-changed', fetchUnreadCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('unread-count-changed', fetchUnreadCount);
    };
  }, [fetchUnreadCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileDrawer = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileDrawer();
  };

  const handleExternalNavigation = (href: string) => {
    closeMobileDrawer();
    window.location.assign(href);
  };

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const timer = window.setTimeout(() => {
      firstNavItemRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!isMdUp || !desktopOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      setDesktopOpen(false);
      window.setTimeout(() => {
        menuButtonRef.current?.focus();
      }, 0);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [desktopOpen, isMdUp]);

  // Sidebar inicia no topo (top: 0) para alinhar verticalmente com o HEADER em todas as resoluções.
  // O conteúdo principal mantém o espaçamento do AppBar via <Toolbar /> dentro do <main>.
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box
          sx={(theme) => ({
            ...theme.mixins.toolbar,
            px: { xs: 1.5, md: 2 },
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <List disablePadding>
            {visibleNavigationItems.map((item, index) => {
              const isSelected = !!item.path && location.pathname === item.path;
              const status =
                item.visibilityModule != null
                  ? VISIBILITY_STATUS[getVisibility(item.visibilityModule)]
                  : null;
              return (
                <React.Fragment key={item.text}>
                  <ListItemButton
                    ref={index === 0 ? firstNavItemRef : undefined}
                    onClick={() => {
                      if (item.externalHref) {
                        handleExternalNavigation(item.externalHref);
                        return;
                      }
                      if (item.path) {
                        handleNavigation(item.path);
                      }
                    }}
                    selected={isSelected}
                    sx={{
                      mx: 1,
                      my: 0.15,
                      px: { xs: 1.5, md: 2 },
                      py: { xs: 0.25, md: 0.3 },
                      minHeight: { xs: 33, md: 34 },
                      borderRadius: 1.5,
                      alignItems: 'center',
                      gap: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        borderRadius: 1.5,
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, md: 40 },
                        color: isSelected ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.path === '/contact-messages' ? (
                        <Badge badgeContent={unreadMessages} color="error" max={99}>
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: {
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: { xs: 13, md: 13 },
                        },
                      }}
                      sx={{ flex: '1 1 auto', minWidth: 0, mr: 0.5 }}
                    />
                    {status && (
                      <Tooltip title={status.label}>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexShrink: 0,
                            ml: 0.5,
                            color: isSelected ? 'primary.main' : 'text.secondary',
                            lineHeight: 0,
                          }}
                          aria-label={status.label}
                        >
                          {status.icon}
                        </Box>
                      </Tooltip>
                    )}
                  </ListItemButton>
                  {item.divider && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        <Divider />

        <Box sx={{ flexShrink: 0, pb: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <List disablePadding>
            {!isMember(user?.role) && <ListItemButton
              onClick={() => handleNavigation('/profile')}
              selected={location.pathname === '/profile'}
              sx={{
                mx: 1,
                my: { xs: 0.4, md: 0.5 },
                px: { xs: 1.5, md: 2 },
                py: { xs: 0.5, md: 0.75 },
                minHeight: { xs: 36, md: 44 },
                borderRadius: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 40, md: 56 }, color: location.pathname === '/profile' ? 'primary.main' : 'inherit' }}>
                <ProfileIcon />
              </ListItemIcon>
              <ListItemText
                primary="Meu Perfil"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: location.pathname === '/profile' ? 600 : 400,
                    fontSize: { xs: 15, md: 16 },
                  },
                }}
              />
            </ListItemButton>}

            <ListItemButton
              onClick={handleLogout}
              sx={{ mx: 1, my: { xs: 0.4, md: 0.5 }, px: { xs: 1.5, md: 2 }, py: { xs: 0.5, md: 0.75 }, minHeight: { xs: 36, md: 44 }, borderRadius: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 40, md: 56 } }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" primaryTypographyProps={{ sx: { fontSize: { xs: 15, md: 16 } } }} />
            </ListItemButton>
          </List>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: desktopOpen ? `${drawerWidth}px` : 0 },
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ px: { xs: 1, md: 2 } }}>
          <IconButton
            ref={menuButtonRef}
            color="inherit"
            aria-label={isMdUp ? (desktopOpen ? 'Fechar menu' : 'Abrir menu') : 'Abrir menu'}
            edge="start"
            onClick={isMdUp ? handleDesktopToggle : handleDrawerToggle}
            sx={{ mr: 2, width: 48, height: 48 }}
          >
            {isMdUp && desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.02)'
              },
              '&:active': {
                transform: 'scale(0.98)'
              }
            }}
            onClick={() => navigate(isMember(user?.role) ? '/profile' : '/dashboard')}
            title={isMember(user?.role) ? 'Voltar ao Meu Cadastro' : 'Voltar ao Dashboard'}
          >
            <img
              src={batuaraLogoSrc}
              alt="Batuara Logo"
              style={{
                height: isMobile ? '24px' : '32px',
                marginRight: isMobile ? '8px' : '12px',
              }}
            />
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              noWrap
              component="div"
              sx={{
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.25rem',
              }}
            >
              Casa de Caridade Caboclo Batuara
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {user?.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: desktopOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            position: 'fixed',
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: 0,
              left: 0,
              height: '100vh',
              '@supports (height: 100svh)': {
                height: '100svh',
              },
              '@supports (height: 100dvh)': {
                height: '100dvh',
              },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            position: 'fixed',
            display: { xs: 'none', md: desktopOpen ? 'block' : 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: 0,
              left: 0,
              height: '100vh',
              '@supports (height: 100svh)': {
                height: '100svh',
              },
              '@supports (height: 100dvh)': {
                height: '100dvh',
              },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflowX: 'hidden',
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Snackbar
        open={!!visibilityError || !!successMessage}
        autoHideDuration={4000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={clearFeedback}
          severity={visibilityError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {visibilityError || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <ContentVisibilityProvider>
    <AdminLayoutInner>{children}</AdminLayoutInner>
  </ContentVisibilityProvider>
);

export default AdminLayout;
