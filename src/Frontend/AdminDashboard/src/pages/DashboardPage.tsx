import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import { ChevronRight as ChevronRightIcon, Notifications as NotificationsIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiService from '../services/api';
import { DashboardStats } from '../types';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [nextEvent, setNextEvent] = useState<{ title: string; when: string } | null>(null);
  const [nextAttendance, setNextAttendance] = useState<{ title: string; when: string } | null>(null);
  const [activityItems, setActivityItems] = useState<DashboardStats['recentActivity']>([]);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityLoadingMore, setActivityLoadingMore] = useState(false);
  const [activityDetailsOpen, setActivityDetailsOpen] = useState(false);
  const [activityDetailsItem, setActivityDetailsItem] = useState<DashboardStats['recentActivity'][number] | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDashboardStats();
      setStats(response.data);

      const today = new Date();
      const todayIso = today.toISOString().slice(0, 10);

      try {
        const events = await apiService.getEvents({
          isActive: true,
          fromDate: todayIso,
          pageNumber: 1,
          pageSize: 1,
          sort: 'date:asc',
        });

        const upcoming = events.data?.[0];
        if (upcoming) {
          const label = new Date(upcoming.date).toLocaleDateString('pt-BR');
          const timeLabel = upcoming.startTime ? ` às ${(upcoming.startTime || '').slice(0, 5)}` : '';
          setNextEvent({ title: upcoming.title, when: `${label}${timeLabel}` });
        } else {
          setNextEvent(null);
        }
      } catch (_) {
        setNextEvent(null);
      }

      try {
        const candidates: { title: string; when: string; sortKey: string }[] = [];

        for (let i = 0; i < 2; i += 1) {
          const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
          const month = monthDate.getMonth() + 1;
          const year = monthDate.getFullYear();

          const attendances = await apiService.getAttendances({
            isActive: true,
            pageNumber: 1,
            pageSize: 50,
            sort: 'date:asc',
            month,
            year,
          });

          for (const item of attendances.data || []) {
            if (!item.date) continue;
            const day = item.date.slice(0, 10);
            if (day < todayIso) continue;
            const when = `${new Date(item.date).toLocaleDateString('pt-BR')}${item.startTime ? ` às ${(item.startTime || '').slice(0, 5)}` : ''}`;
            candidates.push({
              title: item.description || 'Atendimento',
              when,
              sortKey: `${day}T${(item.startTime || '00:00').slice(0, 5)}`,
            });
          }
        }

        candidates.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        const first = candidates[0];
        setNextAttendance(first ? { title: first.title, when: first.when } : null);
      } catch (_) {
        setNextAttendance(null);
      }

      try {
        const logs = await apiService.getActivityLogs({ pageNumber: 1, pageSize: 10, sort: 'timestamp:desc' });
        setActivityItems(logs.data || []);
        setActivityPage(logs.pageNumber || 1);
        setActivityTotalPages(logs.totalPages || 1);
        setActivityError(null);
      } catch (_) {
        setActivityItems(response.data.recentActivity || []);
        setActivityPage(1);
        setActivityTotalPages(1);
        setActivityError('Não foi possível carregar o histórico completo de atividades.');
      }
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
        return <CalendarMonthIcon fontSize="small" />;
      case 'Orixa':
      case 'UmbandaLine':
      case 'SpiritualContent':
        return <NotificationsIcon fontSize="small" />;
      default:
        return <TrendingUpIcon fontSize="small" />;
    }
  };

  const handleLoadMoreActivity = async () => {
    if (activityLoadingMore) return;
    if (activityPage >= activityTotalPages) return;

    setActivityLoadingMore(true);
    try {
      const nextPage = activityPage + 1;
      const logs = await apiService.getActivityLogs({ pageNumber: nextPage, pageSize: 10, sort: 'timestamp:desc' });
      setActivityItems((prev) => [...prev, ...(logs.data || [])]);
      setActivityPage(logs.pageNumber || nextPage);
      setActivityTotalPages(logs.totalPages || activityTotalPages);
    } catch (_) {
      setActivityError('Não foi possível carregar mais atividades.');
    } finally {
      setActivityLoadingMore(false);
    }
  };

  const buildStatCardProps = (path: string) => ({
    onClick: () => navigate(path),
    role: 'button' as const,
    tabIndex: 0,
  });

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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2, md: 4 } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Chip
          label="Online"
          color="success"
          size="small"
          aria-label="Status do sistema: online"
        />
      </Stack>

      {/* Cards de estatísticas */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: { xs: 2, md: 4 }, justifyContent: 'flex-start', maxWidth: '100%' }}>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea {...buildStatCardProps('/events')}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <EventIcon sx={{ color: 'primary.main', mr: { xs: 0.75, sm: 1 } }} fontSize="small" />
                  <Typography variant={isXs ? 'subtitle1' : 'h6'} color="primary" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    Eventos
                  </Typography>
                  <ChevronRightIcon fontSize="small" color="action" />
                </Box>
                <Typography
                  variant={isXs ? 'h4' : 'h3'}
                  sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.75rem', sm: '3rem' } }}
                >
                  {stats?.eventsUntilEndOfYear ?? 0}
                </Typography>
                <Typography variant={isXs ? 'caption' : 'body2'} color="text.secondary">
                  Até o final do ano
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea {...buildStatCardProps('/calendar')}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <CalendarMonthIcon sx={{ color: 'secondary.main', mr: { xs: 0.75, sm: 1 } }} fontSize="small" />
                  <Typography variant={isXs ? 'subtitle1' : 'h6'} color="secondary" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    Atendimentos
                  </Typography>
                  <ChevronRightIcon fontSize="small" color="action" />
                </Box>
                <Typography
                  variant={isXs ? 'h4' : 'h3'}
                  sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.75rem', sm: '3rem' } }}
                >
                  {stats?.attendancesUntilEndOfYear ?? 0}
                </Typography>
                <Typography variant={isXs ? 'caption' : 'body2'} color="text.secondary">
                  Espirituais até o final do ano
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea {...buildStatCardProps('/members')}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <PeopleIcon sx={{ color: 'success.main', mr: { xs: 0.75, sm: 1 } }} fontSize="small" />
                  <Typography variant={isXs ? 'subtitle1' : 'h6'} color="success.main" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    Filhos da Casa
                  </Typography>
                  <ChevronRightIcon fontSize="small" color="action" />
                </Box>
                <Typography
                  variant={isXs ? 'h4' : 'h3'}
                  sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.75rem', sm: '3rem' } }}
                >
                  {stats?.activeHouseMembers ?? 0}
                </Typography>
                <Typography variant={isXs ? 'caption' : 'body2'} color="text.secondary">
                  Cadastrados e ativos
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea {...buildStatCardProps('/profile')}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <TrendingUpIcon sx={{ color: 'info.main', mr: { xs: 0.75, sm: 1 } }} fontSize="small" />
                  <Typography variant={isXs ? 'subtitle1' : 'h6'} color="info.main" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    Atividade
                  </Typography>
                  <ChevronRightIcon fontSize="small" color="action" />
                </Box>
                <Typography
                  variant={isXs ? 'h4' : 'h3'}
                  sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.75rem', sm: '3rem' } }}
                >
                  {stats?.currentMonthActivity ?? 0}
                </Typography>
                <Typography variant={isXs ? 'caption' : 'body2'} color="text.secondary">
                  Eventos e atendimentos este mês
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Atividade recente */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Resumo Rápido
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Próximo evento
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {nextEvent?.title || 'Nenhum evento agendado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nextEvent?.when || '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Próximo atendimento
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {nextAttendance?.title || 'Nenhum atendimento agendado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nextAttendance?.when || '—'}
                </Typography>
              </Box>

            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Atividade Recente
            </Typography>
            {activityError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {activityError}
              </Alert>
            )}
            {activityItems.length > 0 ? (
              <>
                <List>
                  {activityItems.map((activity, index) => (
                    <ListItem
                      key={activity.id}
                      divider={index < activityItems.length - 1}
                      sx={{ px: 0, alignItems: 'flex-start' }}
                    >
                      <ListItemButton
                        onClick={() => {
                          setActivityDetailsItem(activity);
                          setActivityDetailsOpen(true);
                        }}
                        sx={{ px: 0, alignItems: 'flex-start' }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          {getActivityIcon(activity.entityType)}
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body1" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                <Box component="span" sx={{ fontWeight: 700 }}>
                                  {activity.userName}
                                </Box>{' '}
                                {activity.action.toLowerCase()}
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
                              {activity.details && (
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                  {activity.details}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {formatActivityTime(activity.timestamp)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {activityPage < activityTotalPages && (
                  <Button
                    variant="outlined"
                    onClick={handleLoadMoreActivity}
                    disabled={activityLoadingMore}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {activityLoadingMore ? 'Carregando...' : 'Ver mais'}
                  </Button>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhuma atividade recente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={activityDetailsOpen} onClose={() => setActivityDetailsOpen(false)} fullWidth maxWidth="sm" fullScreen={isXs}>
        <DialogTitle>Detalhes da atividade</DialogTitle>
        <DialogContent sx={{ pb: isXs ? 10 : 2 }}>
          {activityDetailsItem && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {activityDetailsItem.userName} {activityDetailsItem.action.toLowerCase()}
              </Typography>
              <Chip label={activityDetailsItem.entityType} size="small" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {formatActivityTime(activityDetailsItem.timestamp)}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {activityDetailsItem.details || 'Sem detalhes.'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        {isXs ? (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button variant="contained" onClick={() => setActivityDetailsOpen(false)} fullWidth>
              Fechar
            </Button>
          </Box>
        ) : (
          <DialogActions>
            <Button onClick={() => setActivityDetailsOpen(false)}>Fechar</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
