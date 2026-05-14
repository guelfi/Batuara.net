import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Toolbar,
} from '@mui/material';
import {
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  onLogout: () => void;
}

const menuItems = [
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

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant = 'permanent', onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const drawerWidth = 320;
  const isTemporary = variant === 'temporary';
  const appBarHeight = 64;

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: isTemporary ? 'block' : 'none', md: isTemporary ? 'none' : 'block' },
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          top: isTemporary ? 0 : appBarHeight,
          height: isTemporary ? '100%' : `calc(100% - ${appBarHeight}px)`,
        },
      }}
    >
      <Toolbar />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: { xs: 1.5, md: 2 }, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" noWrap>
            Casa de Caridade Batuara
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ py: { xs: 0.5, md: 1 } }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => handleItemClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  py: { xs: 0.75, md: 1 },
                  minHeight: { xs: 42, md: 48 },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
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
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Divider />

        <Box sx={{ flexShrink: 0 }}>
          <List sx={{ py: { xs: 0.5, md: 1 } }}>
            <ListItemButton
              onClick={() => handleItemClick('/profile')}
              selected={location.pathname === '/profile'}
              sx={{
                py: { xs: 0.75, md: 1 },
                minHeight: { xs: 42, md: 48 },
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: { xs: 40, md: 56 },
                  color: location.pathname === '/profile' ? 'primary.main' : 'inherit',
                }}
              >
                <ProfileIcon />
              </ListItemIcon>
              <ListItemText
                primary="Meu Perfil"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: location.pathname === '/profile' ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>

            <ListItemButton onClick={handleLogout} sx={{ py: { xs: 0.75, md: 1 }, minHeight: { xs: 42, md: 48 } }}>
              <ListItemIcon sx={{ minWidth: { xs: 40, md: 56 } }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
