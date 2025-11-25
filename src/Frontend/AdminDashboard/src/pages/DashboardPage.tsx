import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { DashboardStats, ActivityLog } from '../types';
import { apiService } from '../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DashboardPage mounted - Version 2.0 FIXED');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Como ainda não temos o backend, vamos usar dados mock
      const mockStats: DashboardStats = {
        totalEvents: 15,
        activeEvents: 8,
        totalAttendances: 42,
        totalUsers: 5,
        recentActivity: [
          {
            id: '1',
            userId: '1',
            userName: 'João Silva',
            action: 'Criou evento',
            entityType: 'Event',
            entityId: '1',
            timestamp: new Date().toISOString(),
            details: 'Festa de Iemanjá 2024',
          },
          {
            id: '2',
            userId: '2',
            userName: 'Maria Santos',
            action: 'Atualizou calendário',
            entityType: 'CalendarAttendance',
            entityId: '2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Gira de Umbanda - Quinta-feira',
          },
          {
            id: '3',
            userId: '1',
            userName: 'João Silva',
            action: 'Adicionou Orixá',
            entityType: 'Orixa',
            entityId: '3',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            details: 'Oxum - Orixá das águas doces',
          },
        ],
      };

      setStats(mockStats);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatActivityTime = (timestamp: string): string => {
    try {
      const date = parseISO(timestamp);
      return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
    } catch {
      return timestamp;
    }
  };

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Event':
        return <EventIcon fontSize="small" />;
      case 'CalendarAttendance':
        return <CalendarIcon fontSize="small" />;
      case 'Orixa':
      case 'UmbandaLine':
      case 'SpiritualContent':
        return <NotificationsIcon fontSize="small" />;
      default:
        return <TrendingUpIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'flex-start', maxWidth: '100%' }}>
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Eventos
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalEvents || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.activeEvents || 0} ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  Atendimentos
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalAttendances || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Usuários
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administradores
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Atividade
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.recentActivity?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoje
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Atividade recente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Atividade Recente
            </Typography>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    divider={index < stats.recentActivity.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemIcon>
                      {getActivityIcon(activity.entityType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            <strong>{activity.userName}</strong> {activity.action.toLowerCase()}
                          </Typography>
                          <Chip
                            label={activity.entityType}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.details}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatActivityTime(activity.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhuma atividade recente
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Resumo Rápido
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Próximo evento
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Festa de Iemanjá
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  02/02/2024 às 19:00
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Próximo atendimento
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Gira de Umbanda
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quinta-feira às 20:00
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status do sistema
                </Typography>
                <Chip
                  label="Online"
                  color="success"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;