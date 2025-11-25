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
  { text: 'Festas e Eventos', icon: <EventIcon />, path: '/events' },
  { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Orixás', icon: <FavoriteIcon />, path: '/orixas' },
  { text: 'Linhas da Umbanda', icon: <PeopleIcon />, path: '/umbanda-lines' },
  { text: 'Conteúdo Espiritual', icon: <InfoIcon />, path: '/spiritual-content' },
];

const systemItems = [
  { text: 'Sobre a Casa', icon: <InfoIcon />, path: '/sobre' },
  { text: 'Filhos da Casa', icon: <PeopleIcon />, path: '/filhos-casa' },
  { text: 'Mensagens', icon: <MailIcon />, path: '/contato' },
  { text: 'Localização', icon: <LocationIcon />, path: '/localizacao' },
  { text: 'Doações', icon: <FavoriteIcon />, path: '/doacoes' },
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

        {/* Sistema */}
        <List>
          <ListItem>
            <ListItemText
              primary="Sistema"
              primaryTypographyProps={{
                sx: {
                  fontWeight: 600,
                  color: 'text.secondary',
                },
              }}
            />
          </ListItem>
          {systemItems.map((item) => (
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