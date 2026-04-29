import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const navigationItems: NavigationItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'Nossa História', href: '#nossa-historia' },
  { label: 'Nossa Missão', href: '#nossa-missao' },
  { label: 'Calendário', href: '#calendario-atendimento' },
  { label: 'Eventos e Festas', href: '#eventos-e-festas' },
  { label: 'Orixás', href: '#orixas' },
  { label: 'Guias e Entidades', href: '#guias-entidades' },
  { label: 'Linhas da Umbanda', href: '#linhas-da-umbanda' },
  { label: 'Orações', href: '#oracoes' },
  { label: 'Doações', href: '#doacoes' },
  { label: 'Contato', href: '#entre-em-contato' },
  { label: 'Localização', href: '#nossa-localizacao' },
];

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('#home');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sectionIds = useMemo(() => navigationItems.map((item) => item.href.replace('#', '')), []);
  const appBarRef = useRef<HTMLDivElement | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = appBarRef.current?.offsetHeight ?? (isMobile ? 56 : 64);
      const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      window.history.replaceState(null, '', href);
      setActiveHref(href);
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleHashSync = () => {
      if (window.location.hash) {
        setActiveHref(window.location.hash);
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);

    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        const target = visible?.target as HTMLElement | undefined;
        const nextHref = target?.id ? `#${target.id}` : undefined;
        if (nextHref) {
          setActiveHref((prev) => (prev === nextHref ? prev : nextHref));
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-20% 0px -65% 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

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
                  color: item.href === activeHref ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: item.href === activeHref ? 700 : 500,
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
      <AppBar ref={appBarRef} position="fixed" elevation={2}>
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/batuara_logo.png`}
                  alt="Batuara Logo"
                  sx={{
                    height: 24,
                    width: 'auto',
                    mr: 1,
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  Casa de Caridade Caboclo Batuara
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/batuara_logo.png`}
                  alt="Batuara Logo"
                  sx={{
                    height: 40,
                    width: 'auto',
                    mr: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Casa de Caridade Caboclo Batuara
                </Typography>
              </Box>
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
                flexWrap: 'wrap',
              }}
            >
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: item.href === activeHref ? 700 : 500,
                    px: 0.7,
                    py: 0.7,
                    minWidth: 'auto',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    backgroundColor: item.href === activeHref ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
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
