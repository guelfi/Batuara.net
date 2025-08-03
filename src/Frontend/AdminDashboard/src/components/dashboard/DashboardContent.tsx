import React, { memo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Psychology as SpiritualIcon,
  Event as EventIcon,
  People as PeopleIcon,
  SupervisorAccount as LeadershipIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  ContactMail as ContactIcon,
  Favorite as DonationIcon,
} from '@mui/icons-material';

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  phase: 'P0' | 'F1' | 'A1';
}

const mockMetricData: MetricCardData[] = [
  {
    title: 'Giras/Atendimento',
    value: '24',
    icon: SpiritualIcon,
    color: '#1976d2',
    trend: { value: 12, isPositive: true },
    phase: 'F1'
  },
  {
    title: 'Festas e Eventos',
    value: '8',
    icon: EventIcon,
    color: '#388e3c',
    trend: { value: 3, isPositive: true },
    phase: 'F1'
  },
  {
    title: 'Filhos Casa',
    value: '156',
    icon: PeopleIcon,
    color: '#f57c00',
    trend: { value: 8, isPositive: true },
    phase: 'A1'
  },
  {
    title: 'Dirigentes',
    value: '12',
    icon: LeadershipIcon,
    color: '#7b1fa2',
    trend: { value: 1, isPositive: true },
    phase: 'A1'
  }
];

const mockRecentActivities = [
  {
    id: 1,
    title: 'Nova mensagem de contato recebida',
    description: 'Maria Silva enviou uma mensagem sobre consulta',
    time: '2 horas atrás',
    icon: ContactIcon,
    color: '#1976d2'
  },
  {
    id: 2,
    title: 'Gira de Oxalá agendada',
    description: 'Próxima sexta-feira às 20:00',
    time: '5 horas atrás',
    icon: ScheduleIcon,
    color: '#388e3c'
  },
  {
    id: 3,
    title: 'Doação recebida',
    description: 'R$ 50,00 via PIX',
    time: '1 dia atrás',
    icon: DonationIcon,
    color: '#f57c00'
  },
  {
    id: 4,
    title: 'Evento "Festa de Iemanjá" criado',
    description: 'Programado para 2 de fevereiro',
    time: '2 dias atrás',
    icon: EventIcon,
    color: '#7b1fa2'
  }
];

const DashboardContent: React.FC = () => {
  const getPhaseChip = (phase: string) => {
    switch (phase) {
      case 'P0':
        return <Chip label="Dados Mockados" color="success" size="small" />;
      case 'F1':
        return <Chip label="API na Fundação" color="warning" size="small" />;
      case 'A1':
        return <Chip label="Sistema Avançado" color="info" size="small" />;
      default:
        return <Chip label="Mockado" color="default" size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Dashboard Administrativo
      </Typography>

      {/* Cards de Métricas Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockMetricData.map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = metric.trend?.isPositive ? TrendingUpIcon : TrendingDownIcon;
          
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}05 100%)`,
                  border: `1px solid ${metric.color}30`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: metric.color, mr: 2 }}>
                      <IconComponent />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" variant="body2">
                        {metric.title}
                      </Typography>
                      {getPhaseChip(metric.phase)}
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {metric.value}
                  </Typography>
                  
                  {metric.trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendIcon 
                        sx={{ 
                          color: metric.trend.isPositive ? 'success.main' : 'error.main',
                          mr: 0.5,
                          fontSize: 16
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: metric.trend.isPositive ? 'success.main' : 'error.main',
                          fontWeight: 'medium'
                        }}
                      >
                        +{metric.trend.value} este mês
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Cards Adicionais */}
      <Grid container spacing={3}>
        {/* Atividades Recentes */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Atividades Recentes
                </Typography>
                <Chip label="Dados Mockados" color="success" size="small" sx={{ ml: 'auto' }} />
              </Box>
              
              <List>
                {mockRecentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: activity.color }}>
                            <IconComponent fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < mockRecentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumo Rápido */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Resumo Rápido
                </Typography>
                <Chip label="Dados Mockados" color="success" size="small" />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mensagens Pendentes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  7
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Próxima Gira
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Sexta, 20:00
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gira de Oxalá
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Doações do Mês
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  R$ 2.450,00
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status do Sistema
                </Typography>
                <Chip label="Fase 0 - Ativo" color="success" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informação sobre a Fase 0 */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="body2" color="info.dark">
          <strong>Fase 0 - Melhorias de Interface:</strong> Todos os dados exibidos são mockados para demonstração. 
          Na Fase Fundação, estes dados serão substituídos por informações reais da API.
        </Typography>
      </Paper>
    </Box>
  );
};

export default memo(DashboardContent);