import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { NavigationItem } from '../../types';
// Logo servido diretamente da pasta public
const batuaraLogo = '/batuara_logo.png';

const navigationItems: NavigationItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'Sobre', href: '#about' },
  { label: 'Eventos', href: '#events' },
  { label: 'Calendário', href: '#calendar' },
  { label: 'Orixás', href: '#orixas' },
  { label: 'Guias e Entidades', href: '#guias-entidades' },
  { label: 'Linhas da Umbanda', href: '#umbanda' },
  { label: 'Orações', href: '#prayers' },
  { label: 'Doações', href: '#donations' },
  { label: 'Contato', href: '#contact' },
  { label: 'Localização', href: '#location' },
];

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerHeight = isMobile ? 56 : 64;
      
      // Offset ajustado para aproximar as seções do header
      let offsetHeight;
      
      if (href === '#home') {
        // Hero: no mobile fica com muito mais espaço do header, no desktop vai para o topo absoluto
        offsetHeight = isMobile ? 0 : 0; // Offset zero para dar máximo espaço visual no mobile
      } else if (href === '#location') {
        // Location: mantém o offset atual (está correto)
        offsetHeight = headerHeight + 16;
      } else {
        // Outras seções: diminuir 60px do offset anterior para aproximar do header
        offsetHeight = headerHeight - 44; // headerHeight + 16 - 60 = headerHeight - 44
      }
      
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offsetHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.label}
            onClick={() => handleNavClick(item.href)}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={2}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo/Título à esquerda */}
          <Box
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              mr: isMobile ? 0 : 4,
              flexGrow: isMobile ? 1 : 0,
            }}
            onClick={() => handleNavClick('#home')}
          >
            {isMobile ? (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
              >
                Casa de Caridade Caboclo Batuara
              </Typography>
            ) : (
              <Box
                component="img"
                src={batuaraLogo}
                alt="Casa de Caridade Caboclo Batuara"
                sx={{
                  height: 40,
                  width: 'auto',
                  maxWidth: 200,
                }}
              />
            )}
          </Box>

          {/* Menu centralizado (apenas desktop) */}
          {!isMobile && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
                flexGrow: 1,
                flexWrap: 'nowrap',
              }}
            >
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 0.8,
                    py: 1,
                    minWidth: 'auto',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Menu hamburger (mobile) */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Header;