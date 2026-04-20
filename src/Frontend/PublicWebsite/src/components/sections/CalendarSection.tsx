import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoIcon from '@mui/icons-material/Info';
import { useQuery } from '@tanstack/react-query';
import { useTheme, useMediaQuery } from '@mui/material';
import publicApi from '../../services/api';
import { AttendanceType, CalendarAttendance, Event as BatuaraEvent, EventType } from '../../types';
import {
  addMonths,
  subMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarSection: React.FC = () => {
  // Estado para navegação mensal
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const monthStart = startOfMonth(selectedMonthDate);
  const monthEnd = endOfMonth(selectedMonthDate);

  const [selectedDate, setSelectedDate] = useState<Date>(monthStart);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handlePrevMonth = () => {
    setSelectedMonthDate((prev: Date) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate((prev: Date) => addMonths(prev, 1));
  };

  const getActivityLabel = (type: AttendanceType | EventType | any): string => {
    // Tenta converter se for string (pode vir da API como nome do enum)
    const typeValue = typeof type === 'string' ? parseInt(type) : type;

    // Mapeamento para AttendanceType
    if (typeValue === AttendanceType.Kardecismo) return 'Kardecismo';
    if (typeValue === AttendanceType.Umbanda) return 'Gira de Umbanda';
    if (typeValue === AttendanceType.Curso) return 'Curso';
    
    // Mapeamento compartilhado ou específico de EventType
    if (typeValue === EventType.Festa || typeValue === AttendanceType.Festa) return 'Festa';
    if (typeValue === EventType.Bazar) return 'Bazar';
    if (typeValue === EventType.Celebracao) return 'Celebração';
    if (typeValue === EventType.Palestra || typeValue === AttendanceType.Palestra) return 'Palestra';
    if (typeValue === EventType.Evento) return 'Evento';
    
    return 'Atendimento';
  };

  const getActivityColor = (type: AttendanceType | EventType | any): string => {
    const typeValue = typeof type === 'string' ? parseInt(type) : type;

    if (typeValue === AttendanceType.Kardecismo) return '#9c27b0'; // Roxo (conforme solicitado)
    if (typeValue === AttendanceType.Umbanda) return '#03a9f4';    // Azul Claro (conforme solicitado)
    if (typeValue === EventType.Festa || typeValue === AttendanceType.Festa) return '#e65100'; // Laranja
    if (typeValue === EventType.Bazar) return '#ef6c00';           // Laranja escuro
    if (typeValue === EventType.Celebracao) return '#d81b60';      // Rosa/Vinho
    if (typeValue === EventType.Palestra || typeValue === AttendanceType.Palestra) return '#00acc1'; // Ciano
    if (typeValue === AttendanceType.Curso) return '#43a047';      // Verde
    
    return '#1976d2'; // Padrão
  };

  // Query para Atendimentos (Giras, Kardec, etc)
  const { data: attendancesData, isLoading: loadingAttendances, isError: errorAttendances } = useQuery({
    queryKey: ['public-calendar-attendances', format(selectedMonthDate, 'yyyy-MM')],
    queryFn: () =>
      publicApi.getCalendarAttendances({
        pageNumber: 1,
        pageSize: 100,
        sort: 'date:asc',
        month: selectedMonthDate.getMonth() + 1,
        year: selectedMonthDate.getFullYear(),
      }),
  });

  // Query para Eventos (Festas, Bazares, etc)
  const { data: eventsData, isLoading: loadingEvents, isError: errorEvents } = useQuery({
    queryKey: ['public-calendar-events', format(selectedMonthDate, 'yyyy-MM')],
    queryFn: () =>
      publicApi.getEvents({
        pageNumber: 1,
        pageSize: 100,
        sort: 'date:asc',
        month: selectedMonthDate.getMonth() + 1,
        year: selectedMonthDate.getFullYear(),
      }),
  });

  const isLoading = loadingAttendances || loadingEvents;
  const isError = errorAttendances || errorEvents;

  const currentData = useMemo(() => {
    const attendances = (attendancesData?.data ?? [])
      .filter((a: CalendarAttendance) => a.isActive)
      .map((a: CalendarAttendance) => ({
        ...a,
        displayTitle: a.description || getActivityLabel(a.type),
        isEvent: false
      }));

    const events = (eventsData?.data ?? [])
      .filter((e: BatuaraEvent) => e.isActive !== false)
      .map((e: BatuaraEvent) => ({
        ...e,
        displayTitle: e.title,
        isEvent: true,
        startTime: e.startTime || '---'
      }));

    // Priorizar Eventos sobre Atendimentos em caso de duplicidade (mesma data e nome)
    const combined = [...events, ...attendances];
    const seen = new Set();
    const uniqueData = combined.filter(item => {
      const dateStr = item.date.split('T')[0];
      const key = `${dateStr}_${item.displayTitle.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueData.sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [attendancesData?.data, eventsData?.data]);

  const monthDays = useMemo(() => {
    const intervalStart = startOfWeek(monthStart, { locale: ptBR });
    const intervalEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  }, [monthEnd, monthStart]);

  useEffect(() => {
    if (currentData.length > 0) {
      setSelectedDate(parseISO(currentData[0].date));
      return;
    }

    setSelectedDate(monthStart);
  }, [currentData, monthStart]);

  const eventsByDay = useMemo(() => {
    return monthDays.map((day) => ({
      day,
      items: currentData.filter((attendance) => isSameDay(parseISO(attendance.date), day)),
    }));
  }, [currentData, monthDays]);

  return (
    <Box id="calendar" sx={{ py: { xs: 4, md: 4 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '2.2rem' },
              fontWeight: 600,
              mb: 1,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <IconButton onClick={handlePrevMonth} color="primary" size="large">
              <ArrowBackIosIcon fontSize="inherit" />
            </IconButton>
            <Box component="span" sx={{ minWidth: { xs: 200, md: 350 }, textAlign: 'center', textTransform: 'capitalize' }}>
              {format(selectedMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </Box>
            <IconButton onClick={handleNextMonth} color="primary" size="large">
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.4,
              mb: 1,
              fontSize: { xs: '0.9rem', md: '1.2rem' }
            }}
          >
            {isMobile ? 'Agenda de atendimentos' : 'Confira os atendimentos espirituais programados para o mês corrente'}
          </Typography>

          {/* Legenda de Cores */}
          <Stack 
            direction="row" 
            flexWrap="wrap" 
            justifyContent="center" 
            gap={2} 
            sx={{ mb: 4, px: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#03a9f4' }} />
              <Typography variant="caption" fontWeight={600}>Gira de Umbanda</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9c27b0' }} />
              <Typography variant="caption" fontWeight={600}>Kardecismo</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e65100' }} />
              <Typography variant="caption" fontWeight={600}>Festas/Eventos</Typography>
            </Box>
          </Stack>

          {!isMobile && (
            <Alert severity="info" icon={<InfoIcon />} sx={{ maxWidth: 800, mx: 'auto', mb: 2, py: 0.5 }}>
              <AlertTitle sx={{ mb: 0 }}>Informações Importantes</AlertTitle>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Todos os atendimentos são gratuitos. Recomendamos chegar com 15 minutos de antecedência.
              </Typography>
            </Alert>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando próximos atendimentos...
            </Typography>
          </Box>
        ) : isError ? (
          <Alert severity="warning" sx={{ maxWidth: 640, mx: 'auto' }}>
            Não foi possível carregar o calendário em tempo real. Tente novamente em instantes.
          </Alert>
        ) : currentData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarTodayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum atendimento agendado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aguarde novos horários serem publicados ou entre em contato conosco.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            <Paper sx={{ p: { xs: 1, md: 3 }, borderRadius: 3, maxWidth: 1200, mx: 'auto', boxShadow: 3, overflow: 'hidden' }}>
              <Box sx={{ overflowX: isMobile ? 'auto' : 'hidden', width: '100%', pb: isMobile ? 1 : 0 }}>
                <Box sx={{ minWidth: { xs: 450, md: '100%' } }}>
                  <Grid container spacing={0.5} sx={{ mb: 1 }}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => (
                      <Grid key={label} size={{ xs: 12 / 7 }}>
                        <Box sx={{ textAlign: 'center', py: 1, fontWeight: 700, color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{label}</Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={0.5}>
                    {eventsByDay.map(({ day, items }) => {
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const today = isToday(day);

                      return (
                        <Grid key={day.toISOString()} size={{ xs: 12 / 7 }}>
                          <Box
                            onClick={() => setSelectedDate(day)}
                            sx={{
                              minHeight: { xs: 60, md: 85 },
                              borderRadius: 2,
                              border: 1,
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                              p: { xs: 0.5, md: 1 },
                              cursor: 'pointer',
                              opacity: isCurrentMonth ? 1 : 0.35,
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: today || isSelected ? 700 : 500,
                                color: today ? 'primary.main' : 'text.primary',
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                mb: 0.5
                              }}
                            >
                              {format(day, 'd')}
                            </Typography>
                            
                            {/* Dots for Mobile / Detailed for Desktop */}
                            {isMobile ? (
                              <Stack direction="row" spacing={0.4} justifyContent="center" flexWrap="wrap" sx={{ width: '100%' }}>
                                {items.slice(0, 4).map((item) => (
                                  <Box
                                    key={item.id}
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      backgroundColor: getActivityColor(item.type),
                                    }}
                                  />
                                ))}
                              </Stack>
                            ) : (
                              <Stack spacing={0.5} sx={{ width: '100%' }}>
                                {items.slice(0, 3).map((item) => (
                                  <Box
                                    key={item.id}
                                    sx={{
                                      px: 0.75,
                                      py: 0.35,
                                      borderRadius: 1,
                                      backgroundColor: `${getActivityColor(item.type)}20`,
                                      borderLeft: `3px solid ${getActivityColor(item.type)}`,
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, fontSize: '0.65rem' }}>
                                      {item.startTime}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary" 
                                      sx={{ 
                                        display: 'block', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        fontSize: '0.65rem'
                                      }}
                                    >
                                      {(item as any).displayTitle}
                                    </Typography>
                                  </Box>
                                ))}
                                {items.length > 3 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.6rem' }}>
                                    + {items.length - 3} mais
                                  </Typography>
                                )}
                              </Stack>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            </Paper>

            {/* Detalhes do Dia Selecionado (Especialmente importante para Mobile) */}
            <Paper sx={{ p: 2, borderRadius: 3, maxWidth: 1200, mx: 'auto', boxShadow: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" />
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </Typography>
              
              {currentData.filter(item => isSameDay(parseISO(item.date), selectedDate)).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                  Nenhuma atividade programada para este dia.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {currentData
                    .filter(item => isSameDay(parseISO(item.date), selectedDate))
                    .map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: `${getActivityColor(item.type)}08`,
                          borderLeft: `5px solid ${getActivityColor(item.type)}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {(item as any).displayTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getActivityLabel(item.type)}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          {item.startTime}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}


      </Container>
    </Box>
  );
};

export default CalendarSection;
