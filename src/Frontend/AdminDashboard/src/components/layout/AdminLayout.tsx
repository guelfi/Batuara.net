import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  AppBar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
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
  Event as EventIcon,
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
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 320;

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  divider?: boolean;
}

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Nossa História', icon: <HistoryIcon />, path: '/history' },
  { text: 'Calendário Atendimento', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Eventos e Festas', icon: <EventIcon />, path: '/events' },
  { text: 'Nossos Orixás', icon: <FavoriteIcon />, path: '/orixas' },
  { text: 'Guias e Entidades', icon: <GuidesIcon />, path: '/guides' },
  { text: 'Linhas da Umbanda', icon: <LinesIcon />, path: '/umbanda-lines' },
  { text: 'Orações e Pontos', icon: <PrayersIcon />, path: '/spiritual-content' },
  { text: 'Filhos da Casa', icon: <PeopleIcon />, path: '/members' },
  { text: 'Doações e Contato', icon: <DonationIcon />, path: '/donations-contact' },
  { text: 'Localização', icon: <LocationIcon />, path: '/location' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const firstNavItemRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDesktopToggle = () => {
    setDesktopOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
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
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItemButton
                  ref={index === 0 ? firstNavItemRef : undefined}
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
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
                  <ListItemIcon
                    sx={{
                      minWidth: { xs: 40, md: 56 },
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: { xs: 15, md: 16 },
                      },
                    }}
                  />
                </ListItemButton>
                {item.divider && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Divider />

        <Box sx={{ flexShrink: 0, pb: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <List disablePadding>
            <ListItemButton
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
            </ListItemButton>

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
            onClick={() => navigate('/dashboard')}
            title="Voltar ao Dashboard"
          >
            <img
              src={`${process.env.PUBLIC_URL || '/admin'}/batuara_logo.png`}
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
    </Box>
  );
};

export default AdminLayout;
