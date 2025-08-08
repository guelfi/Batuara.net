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
import { getFilhosCasaStats } from '../../data/mockFilhosCasa';
import { useIsMobile } from '../../hooks/useResponsiveChips';

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  phase: 'P0' | 'F1' | 'A1';
}

const DashboardContent: React.FC = () => {
  const filhosCasaStats = getFilhosCasaStats();
  const isMobile = useIsMobile();

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
      title: 'Filhos da Casa',
      value: filhosCasaStats.total,
      icon: PeopleIcon,
      color: '#f57c00',
      trend: { value: filhosCasaStats.ativos, isPositive: true },
      phase: 'P0'
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
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        {mockMetricData.map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = metric.trend?.isPositive ? TrendingUpIcon : TrendingDownIcon;

          return (
            <Grid item xs={isMobile ? 6 : 12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: isMobile ? 120 : '100%',
                  minHeight: isMobile ? 120 : 160,
                  background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}05 100%)`,
                  border: `1px solid ${metric.color}30`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
                    <Avatar sx={{
                      bgcolor: metric.color,
                      mr: isMobile ? 1 : 2,
                      width: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40,
                    }}>
                      <IconComponent sx={{ fontSize: isMobile ? 16 : 20 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        color="textSecondary"
                        variant={isMobile ? "caption" : "body2"}
                        sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                      >
                        {metric.title}
                      </Typography>
                      {!isMobile && getPhaseChip(metric.phase)}
                    </Box>
                  </Box>

                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    component="h2"
                    sx={{ mb: 0.5, fontWeight: 'bold' }}
                  >
                    {metric.value}
                  </Typography>

                  {metric.trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendIcon
                        sx={{
                          color: metric.trend.isPositive ? 'success.main' : 'error.main',
                          mr: 0.5,
                          fontSize: isMobile ? 14 : 16
                        }}
                      />
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        sx={{
                          color: metric.trend.isPositive ? 'success.main' : 'error.main',
                          fontWeight: 'medium',
                          fontSize: isMobile ? '0.7rem' : undefined
                        }}
                      >
                        +{metric.trend.value} {isMobile ? '' : 'este mês'}
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
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Atividades Recentes */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            height: '100%',
            maxHeight: isMobile ? 300 : 'none',
            overflow: isMobile ? 'auto' : 'visible'
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
                <NotificationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Atividades Recentes
                </Typography>
                {!isMobile && <Chip label="Dados Mockados" color="success" size="small" sx={{ ml: 'auto' }} />}
              </Box>

              <List dense={isMobile}>
                {mockRecentActivities.slice(0, isMobile ? 3 : 4).map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: isMobile ? 0.5 : 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor: activity.color,
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                          }}>
                            <IconComponent sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant={isMobile ? "body2" : "body1"}
                              sx={{ fontWeight: 'medium' }}
                            >
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant={isMobile ? "caption" : "body2"}
                                color="text.secondary"
                              >
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (isMobile ? 2 : 3) && <Divider variant="inset" component="li" />}
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Resumo Rápido
                </Typography>
                {!isMobile && <Chip label="Dados Mockados" color="success" size="small" />}
              </Box>

              {isMobile ? (
                // Layout compacto para mobile (grid 2x2)
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Mensagens Pendentes
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      7
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Próxima Gira
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      Sexta, 20:00
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Filhos Ativos
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {filhosCasaStats.ativos}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Doações do Mês
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                      R$ 2.450
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                // Layout desktop (vertical)
                <>
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
                      Filhos Ativos
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {filhosCasaStats.ativos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {filhosCasaStats.afastados} afastados, {filhosCasaStats.inativos} inativos
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
                    <Chip label="Fase 0.1 - Ativo" color="success" size="small" />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informação sobre a Fase 0.1 */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="body2" color="info.dark">
          <strong>Fase 0.1 - Melhorias UX:</strong> Os dados de "Filhos da Casa" são funcionais com CRUD completo.
          Outros dados são mockados para demonstração. Na Fase Fundação, todos os dados serão integrados com a API.
        </Typography>
      </Paper>
    </Box>
  );
};

export default memo(DashboardContent);