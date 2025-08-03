import React, { memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

interface PlaceholderContentProps {
  title: string;
  description: string;
  phase: 'F1' | 'A1' | 'B1';
  phaseLabel: string;
  features: string[];
}

const PlaceholderContent: React.FC<PlaceholderContentProps> = ({
  title,
  description,
  phase,
  phaseLabel,
  features
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const getPhaseInfo = () => {
    switch (phase) {
      case 'F1':
        return {
          color: 'warning' as const,
          icon: <ScheduleIcon />,
          message: 'Esta funcionalidade será implementada na Fase Fundação quando a API estiver disponível.',
          chipLabel: 'API Necessária'
        };
      case 'A1':
        return {
          color: 'info' as const,
          icon: <BuildIcon />,
          message: 'Esta funcionalidade será implementada nos Recursos Avançados com CMS completo.',
          chipLabel: 'CMS Avançado'
        };
      case 'B1':
        return {
          color: 'info' as const,
          icon: <ScheduleIcon />,
          message: 'Esta funcionalidade será implementada nos Recursos Futuros conforme demanda.',
          chipLabel: 'Futuro'
        };
      default:
        return {
          color: 'info' as const,
          icon: <BuildIcon />,
          message: 'Esta funcionalidade está em desenvolvimento.',
          chipLabel: 'Em Desenvolvimento'
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Header responsivo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            flexDirection: isMobile ? 'column' : 'row',
            mb: 2,
            gap: isMobile ? 1 : 0
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              width: '100%'
            }}>
              {phaseInfo.icon}
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  ml: 2, 
                  flexGrow: 1,
                  fontSize: isMobile ? '1.1rem' : '1.5rem'
                }}
              >
                {title}
              </Typography>
            </Box>
            <Chip 
              label={phaseInfo.chipLabel} 
              color={phaseInfo.color} 
              size="small"
              sx={{ 
                alignSelf: isMobile ? 'flex-start' : 'center',
                ml: isMobile ? 4 : 0
              }}
            />
          </Box>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: 1.5
            }}
          >
            {description}
          </Typography>

          <Alert severity={phaseInfo.color} sx={{ mb: 3 }}>
            <Typography 
              variant="body2"
              sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              <strong>{phaseLabel}:</strong> {phaseInfo.message}
            </Typography>
          </Alert>

          <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}
          >
            Funcionalidades Planejadas:
          </Typography>

          <List dense={isMobile} sx={{ py: 0 }}>
            {features.map((feature, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: isMobile ? 0.25 : 0.5,
                  px: 0
                }}
              >
                <ListItemIcon sx={{ minWidth: isMobile ? 32 : 36 }}>
                  <CheckIcon 
                    color="success" 
                    fontSize={isMobile ? "small" : "small"} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: isMobile ? '0.85rem' : '0.875rem',
                        lineHeight: 1.4
                      }}
                    >
                      {feature}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ 
            mt: isMobile ? 2 : 3, 
            p: isMobile ? 1.5 : 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1 
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                lineHeight: 1.4
              }}
            >
              Esta interface está preparada e será ativada automaticamente quando a funcionalidade for implementada.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(PlaceholderContent);