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
  ListSubheader,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { ContentVisibility, NavigationItem, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi } from '../../services/api';
import { asVisibility } from '../../utils/contentVisibility';

type NavAction = NavigationItem & {
  kind?: 'hash' | 'link' | 'action';
  action?: () => void;
};

const PUBLIC_LINE_BASE: NavigationItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'Nossa História', href: '#nossa-historia' },
  { label: 'Nossa Missão', href: '#nossa-missao' },
  { label: 'Calendário', href: '#calendario-atendimento' },
  { label: 'Eventos e Festas', href: '#eventos-e-festas' },
  { label: 'Doações', href: '#doacoes' },
  { label: 'Contato', href: '#entre-em-contato' },
  { label: 'Localização', href: '#nossa-localizacao' },
];

const SPIRITUAL_MODULES: Array<{
  key: 'orixas' | 'guides' | 'umbandaLines' | 'prayers';
  label: string;
  href: string;
  field: 'orixasVisibility' | 'guidesVisibility' | 'umbandaLinesVisibility' | 'prayersVisibility';
}> = [
  { key: 'orixas', label: 'Orixás', href: '#orixas', field: 'orixasVisibility' },
  { key: 'guides', label: 'Guias da Casa', href: '#guias-entidades', field: 'guidesVisibility' },
  { key: 'umbandaLines', label: 'Linhas da Umbanda', href: '#linhas-da-umbanda', field: 'umbandaLinesVisibility' },
  { key: 'prayers', label: 'Orações', href: '#oracoes', field: 'prayersVisibility' },
];

const resolveAdminBase = (): string => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (path.startsWith('/batuara-public') || path.startsWith('/batuara-admin')) {
      return '/batuara-admin';
    }
  }
  return '/admin';
};

const memberLoginUrl = (loginUrl: string): string => {
  const joiner = loginUrl.includes('?') ? '&' : '?';
  return `${loginUrl}${joiner}mode=member`;
};

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('#home');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const appBarRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, isLoading: authLoading, role, logout, loginUrl } = useAuth();
  const adminBase = resolveAdminBase();

  const { data: siteSettings } = useQuery({
    queryKey: ['public-site-settings-nav'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const visibilityMap = useMemo(
    () => ({
      orixas: asVisibility(siteSettings?.orixasVisibility),
      guides: asVisibility(siteSettings?.guidesVisibility),
      umbandaLines: asVisibility(siteSettings?.umbandaLinesVisibility),
      prayers: asVisibility(siteSettings?.prayersVisibility),
    }),
    [siteSettings]
  );

  const publicSpiritualItems = useMemo(
    () =>
      SPIRITUAL_MODULES.filter((m) => visibilityMap[m.key] === ContentVisibility.Public).map((m) => ({
        label: m.label,
        href: m.href,
        kind: 'hash' as const,
      })),
    [visibilityMap]
  );

  const restrictedSpiritualItems = useMemo(
    () =>
      SPIRITUAL_MODULES.filter((m) => visibilityMap[m.key] === ContentVisibility.Authenticated).map((m) => ({
        label: m.label,
        href: m.href,
        kind: 'hash' as const,
      })),
    [visibilityMap]
  );

  const line1Items: NavAction[] = useMemo(() => {
    // Insert public spiritual modules after Eventos e Festas (before Doações)
    const base = [...PUBLIC_LINE_BASE] as NavAction[];
    const insertAt = base.findIndex((i) => i.href === '#doacoes');
    const withPublic = [
      ...base.slice(0, insertAt),
      ...publicSpiritualItems,
      ...base.slice(insertAt),
    ];

    // Filhos: anonymous shortcut to Admin login (Member WhatsApp / staff). Hidden when authenticated.
    if (!authLoading && !isAuthenticated) {
      withPublic.push({
        label: 'Filhos',
        href: memberLoginUrl(loginUrl),
        kind: 'link',
      });
    }

    return withPublic;
  }, [authLoading, isAuthenticated, loginUrl, publicSpiritualItems]);

  const line2Items: NavAction[] = useMemo(() => {
    if (authLoading || !isAuthenticated) return [];

    const items: NavAction[] = [...restrictedSpiritualItems];

    const profilePath = `${adminBase}/profile`;
    items.push({ label: 'Perfil', href: profilePath, kind: 'link' });

    // Painel: Admin and Editor only — Members edit Profile only
    if (role === UserRole.Admin || role === UserRole.Editor) {
      items.push({ label: 'Painel', href: `${adminBase}/`, kind: 'link' });
    }

    items.push({
      label: 'Sair',
      href: '#sair',
      kind: 'action',
      action: () => {
        void logout();
      },
    });

    return items;
  }, [adminBase, authLoading, isAuthenticated, logout, restrictedSpiritualItems, role]);

  const allHashHrefs = useMemo(() => {
    const hrefs = [
      ...line1Items.filter((i) => (i.kind ?? 'hash') === 'hash').map((i) => i.href),
      ...line2Items.filter((i) => (i.kind ?? 'hash') === 'hash').map((i) => i.href),
    ];
    return Array.from(new Set(hrefs));
  }, [line1Items, line2Items]);

  const sectionIds = useMemo(
    () => allHashHrefs.map((href) => href.replace('#', '')).filter(Boolean),
    [allHashHrefs]
  );

  const handleDrawerToggle = () => setMobileOpen((open) => !open);

  const handleNavClick = (item: NavAction) => {
    const kind = item.kind ?? 'hash';

    if (kind === 'action') {
      item.action?.();
      setMobileOpen(false);
      return;
    }

    if (kind === 'link') {
      window.location.href = item.href;
      setMobileOpen(false);
      return;
    }

    if (item.href === '#home') {
      const element = document.querySelector(item.href);
      if (element) {
        const targetTop = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        window.history.replaceState(null, '', item.href);
        setActiveHref(item.href);
      }
      setMobileOpen(false);
      return;
    }

    const element = document.querySelector(item.href);
    if (element) {
      const headerHeight = appBarRef.current?.offsetHeight ?? (isMobile ? 56 : 96);
      const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      window.history.replaceState(null, '', item.href);
      setActiveHref(item.href);
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

  const navButtonSx = (href: string) => ({
    textTransform: 'none' as const,
    fontWeight: href === activeHref ? 700 : 500,
    px: 0.7,
    py: 0.4,
    minWidth: 'auto',
    fontSize: '0.78rem',
    whiteSpace: 'nowrap' as const,
    backgroundColor: href === activeHref ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });

  const renderDesktopRow = (items: NavAction[]) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.4,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {items.map((item) => (
        <Button
          key={`${item.label}-${item.href}`}
          color="inherit"
          onClick={() => handleNavClick(item)}
          sx={navButtonSx(item.href)}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle} aria-label="Fechar menu">
          <CloseIcon />
        </IconButton>
      </Box>
      <List
        subheader={
          <ListSubheader component="div" sx={{ bgcolor: 'transparent', fontWeight: 700 }}>
            Público
          </ListSubheader>
        }
      >
        {line1Items.map((item) => (
          <ListItem key={`m1-${item.label}`} onClick={() => handleNavClick(item)} sx={{ cursor: 'pointer' }}>
            <ListItemText
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  color: item.href === activeHref ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: item.href === activeHref ? 700 : 500,
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {isAuthenticated && line2Items.length > 0 && (
        <>
          <Divider />
          <List
            subheader={
              <ListSubheader component="div" sx={{ bgcolor: 'transparent', fontWeight: 700 }}>
                Área autenticada
              </ListSubheader>
            }
          >
            {line2Items.map((item) => (
              <ListItem key={`m2-${item.label}`} onClick={() => handleNavClick(item)} sx={{ cursor: 'pointer' }}>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: item.href === activeHref ? theme.palette.primary.main : theme.palette.text.primary,
                      fontWeight: item.href === activeHref ? 700 : 500,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar ref={appBarRef} position="fixed" elevation={2}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: isMobile ? 'center' : 'flex-start',
            flexDirection: isMobile ? 'row' : 'column',
            py: isMobile ? 0 : 0.75,
            gap: isMobile ? 0 : 0.5,
            minHeight: isMobile ? 56 : undefined,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                mr: isMobile ? 0 : 2,
                flexGrow: isMobile ? 1 : 0,
                flexShrink: 0,
              }}
              onClick={() => handleNavClick({ label: 'Início', href: '#home' })}
            >
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/batuara_logo.png`}
                alt="Batuara Logo"
                sx={{
                  height: isMobile ? 24 : 36,
                  width: 'auto',
                  mr: isMobile ? 1 : 1.5,
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1rem' : '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile ? 'Casa de Caridade Caboclo Batuara' : 'Casa de Caridade Caboclo Batuara'}
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.25, ml: 1 }}>
                {renderDesktopRow(line1Items)}
                {line2Items.length > 0 && renderDesktopRow(line2Items)}
              </Box>
            )}

            {isMobile && (
              <IconButton color="inherit" aria-label="Abrir menu" onClick={handleDrawerToggle} edge="end">
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer: altura dinâmica conforme 1 ou 2 linhas */}
      <Toolbar sx={{ minHeight: isMobile ? 56 : line2Items.length > 0 ? 96 : 72 }} />

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
