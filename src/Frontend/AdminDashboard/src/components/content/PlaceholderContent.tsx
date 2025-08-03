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
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {phaseInfo.icon}
            <Typography variant="h5" sx={{ ml: 2, flexGrow: 1 }}>
              {title}
            </Typography>
            <Chip 
              label={phaseInfo.chipLabel} 
              color={phaseInfo.color} 
              size="small" 
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {description}
          </Typography>

          <Alert severity={phaseInfo.color} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{phaseLabel}:</strong> {phaseInfo.message}
            </Typography>
          </Alert>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Funcionalidades Planejadas:
          </Typography>

          <List dense>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      {feature}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Esta interface está preparada e será ativada automaticamente quando a funcionalidade for implementada.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(PlaceholderContent);