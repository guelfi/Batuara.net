import React, { memo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { useResponsiveChips, useIsMobile } from '../../hooks/useResponsiveChips';
import {
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  LocationOn as LocationIcon,
  Favorite as DonationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Psychology as SpiritualIcon,
  Group as GuideIcon,
  AccountBalance as UmbandaIcon,
  MenuBook as PrayerIcon,
} from '@mui/icons-material';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  description: string;
  implemented: boolean;
  priority: 'P0' | 'F1' | 'A1' | 'B1';
}

const sidebarItems: SidebarItem[] = [
  // ✅ INTERFACE IMPLEMENTADA (dados mockados)
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    description: 'Interface completa com dados mockados',
    implemented: true,
    priority: 'P0'
  },
  // 🔄 INTERFACE PARCIAL (apenas visual, sem funcionalidade)
  {
    id: 'sobre',
    label: 'Sobre / História',
    icon: InfoIcon,
    description: 'Interface visual - funcionalidade em desenvolvimento',
    implemented: false,
    priority: 'P0'
  },
  {
    id: 'filhos-casa',
    label: 'Filhos da Casa',
    icon: PeopleIcon,
    description: 'CRUD completo com dados mockados',
    implemented: true,
    priority: 'P0'
  },
  {
    id: 'mensagens',
    label: 'Mensagens',
    icon: ContactIcon,
    description: 'Interface visual - funcionalidade em desenvolvimento',
    implemented: false,
    priority: 'P0'
  },
  {
    id: 'localizacao',
    label: 'Localização',
    icon: LocationIcon,
    description: 'Interface visual - funcionalidade em desenvolvimento',
    implemented: false,
    priority: 'P0'
  },
  {
    id: 'doacoes',
    label: 'Doações',
    icon: DonationIcon,
    description: 'Interface visual - funcionalidade em desenvolvimento',
    implemented: false,
    priority: 'P0'
  },
  // 📋 PLACEHOLDERS PARA FUNDAÇÃO
  {
    id: 'calendario',
    label: 'Calendário',
    icon: CalendarIcon,
    description: 'Aguardando API - Fase Fundação',
    implemented: false,
    priority: 'F1'
  },
  {
    id: 'eventos',
    label: 'Festas e Eventos',
    icon: EventIcon,
    description: 'Aguardando API - Fase Fundação',
    implemented: false,
    priority: 'F1'
  },
  // 📋 PLACEHOLDERS PARA RECURSOS AVANÇADOS
  {
    id: 'orixas',
    label: 'Orixás',
    icon: SpiritualIcon,
    description: 'Planejado para Fase Avançada',
    implemented: false,
    priority: 'A1'
  },
  {
    id: 'guias',
    label: 'Guias e Entidades',
    icon: GuideIcon,
    description: 'Planejado para Fase Avançada',
    implemented: false,
    priority: 'A1'
  },
  {
    id: 'linhas',
    label: 'Linhas da Umbanda',
    icon: UmbandaIcon,
    description: 'Planejado para Fase Avançada',
    implemented: false,
    priority: 'A1'
  },
  {
    id: 'oracoes',
    label: 'Orações',
    icon: PrayerIcon,
    description: 'Planejado para Fase Avançada',
    implemented: false,
    priority: 'A1'
  }
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
  variant?: 'permanent' | 'temporary';
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  selectedItem,
  onItemSelect,
  variant = 'permanent'
}) => {
  const isMobile = useIsMobile();
  const shouldShowChips = useResponsiveChips();

  const getChipProps = (item: SidebarItem) => {
    // Usar hook para controle inteligente de chips
    if (!shouldShowChips) {
      return null;
    }
    
    if (item.implemented) {
      return { label: 'Funcional', color: 'success' as const, size: 'small' as const };
    }
    switch (item.priority) {
      case 'P0':
        return { label: 'Interface Apenas', color: 'warning' as const, size: 'small' as const };
      case 'F1':
        return { label: 'Aguardando API', color: 'info' as const, size: 'small' as const };
      case 'A1':
        return { label: 'Planejado', color: 'default' as const, size: 'small' as const };
      case 'B1':
        return { label: 'Futuro', color: 'default' as const, size: 'small' as const };
      default:
        return { label: 'Em Desenvolvimento', color: 'warning' as const, size: 'small' as const };
    }
  };

  const handleItemClick = (itemId: string) => {
    onItemSelect(itemId);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ width: { xs: 280, sm: 280 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header removido - foco apenas na navegação */}

      {/* Lista de itens */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {sidebarItems.map((item, index) => {
          const IconComponent = item.icon;
          const chipProps = getChipProps(item);
          const isSelected = selectedItem === item.id;

          return (
            <React.Fragment key={item.id}>
              {/* Divider entre seções */}
              {index === 6 && (
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fundação (F1)
                  </Typography>
                </Divider>
              )}
              {index === 8 && (
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Recursos Avançados (A1)
                  </Typography>
                </Divider>
              )}

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.15)', // Fundo mais claro
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.25)',
                      },
                      '& .MuiTypography-root': {
                        color: '#1565c0',      // Fonte mais escura (primary.dark)
                        fontWeight: 600,       // Peso maior para melhor legibilidade
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#1565c0',      // Ícone mais escuro
                      }
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ 
                      color: isSelected ? '#1565c0' : 'text.secondary',
                      opacity: item.implemented ? 1 : 0.6
                    }}
                  >
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 'normal',
                            color: isSelected ? '#1565c0' : 'text.primary',
                            opacity: item.implemented ? 1 : 0.8
                          }}
                        >
                          {item.label}
                        </Typography>
                        {chipProps && <Chip {...chipProps} />}
                      </Box>
                    }
                    secondary={
                      shouldShowChips ? (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            opacity: 0.8,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </Typography>
                      ) : null
                    }
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      {/* Footer do Sidebar */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Fase 0 - Melhorias de Interface
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: { xs: 280, sm: 280 },
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default memo(Sidebar);