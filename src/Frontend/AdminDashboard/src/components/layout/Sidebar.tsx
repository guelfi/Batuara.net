import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AccountCircle as ProfileIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  MenuBook as HistoryIcon,
  Groups as GuidesIcon,
  Timeline as LinesIcon,
  MusicNote as PrayersIcon,
  VolunteerActivism as DonationIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  selectedItem?: string;
  onItemSelect?: (itemId: string) => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Nossa História', icon: <HistoryIcon />, path: '/history' },
  { text: 'Calendário Giras', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Eventos e Festas', icon: <EventIcon />, path: '/events' },
  { text: 'Nossos Orixás', icon: <FavoriteIcon />, path: '/orixas' },
  { text: 'Guias e Entidades', icon: <GuidesIcon />, path: '/guides' },
  { text: 'Linhas da Umbanda', icon: <LinesIcon />, path: '/umbanda-lines' },
  { text: 'Orações e Pontos', icon: <PrayersIcon />, path: '/prayers' },
  { text: 'Filhos da Casa', icon: <PeopleIcon />, path: '/members' },
  { text: 'Doações e Contato', icon: <DonationIcon />, path: '/donations-contact' },
  { text: 'Localização', icon: <LocationIcon />, path: '/location' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerWidth = 320;

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', pt: isMobile ? 7 : 8 }}>
        {/* Perfil do Usuário */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" noWrap>
            Casa de Caridade Batuara
          </Typography>
        </Box>

        <Divider />

        {/* Menu Principal */}
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
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
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Configurações e Perfil */}
        <List>
          <ListItem
            button
            onClick={() => handleItemClick('/profile')}
            selected={location.pathname === '/profile'}
            sx={{
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
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;