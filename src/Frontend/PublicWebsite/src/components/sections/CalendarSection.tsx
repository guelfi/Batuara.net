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
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { AttendanceType } from '../../types';
import {
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
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(currentMonthStart);

  const getAttendanceTypeLabel = (type: AttendanceType): string => {
    switch (type) {
      case AttendanceType.Kardecismo:
        return 'Kardecismo';
      case AttendanceType.Umbanda:
        return 'Gira de Umbanda';
      case AttendanceType.Palestra:
        return 'Palestra';
      case AttendanceType.Curso:
        return 'Curso';
      case AttendanceType.Festa:
        return 'Festa';
      default:
        return 'Atendimento';
    }
  };

  const getAttendanceTypeColor = (type: AttendanceType): string => {
    switch (type) {
      case AttendanceType.Kardecismo:
        return '#1e88e5';
      case AttendanceType.Umbanda:
        return '#8e24aa';
      case AttendanceType.Palestra:
        return '#00acc1';
      case AttendanceType.Curso:
        return '#43a047';
      case AttendanceType.Festa:
        return '#e65100';
      default:
        return '#1976d2';
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-calendar-attendances', currentMonthStart.toISOString()],
    queryFn: () =>
      publicApi.getCalendarAttendances({
        pageNumber: 1,
        pageSize: 100,
        sort: 'date:asc',
        fromDate: currentMonthStart.toISOString(),
        toDate: currentMonthEnd.toISOString(),
      }),
  });

  const currentData = useMemo(() => {
    return (data?.data ?? [])
      .filter((attendance) => attendance.isActive)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data?.data]);
  const monthDays = useMemo(() => {
    const intervalStart = startOfWeek(currentMonthStart, { locale: ptBR });
    const intervalEnd = endOfWeek(currentMonthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  }, [currentMonthEnd, currentMonthStart]);

  useEffect(() => {
    if (currentData.length > 0) {
      setSelectedDate(parseISO(currentData[0].date));
      return;
    }

    setSelectedDate(currentMonthStart);
  }, [currentData, currentMonthStart]);

  const eventsByDay = useMemo(() => {
    return monthDays.map((day) => ({
      day,
      items: currentData.filter((attendance) => isSameDay(parseISO(attendance.date), day)),
    }));
  }, [currentData, monthDays]);

  return (
    <Box id="calendar" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.7rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Calendário do Mês
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            Confira os atendimentos espirituais programados para o mês corrente
          </Typography>

          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <AlertTitle>Informações Importantes</AlertTitle>
            Todos os atendimentos são gratuitos. Recomendamos chegar com 15 minutos de antecedência.
            Para cursos, é necessário inscrição prévia.
          </Alert>
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
          <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, maxWidth: 980, mx: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              {format(currentMonthStart, "MMMM 'de' yyyy", { locale: ptBR })}
            </Typography>

            <Grid container spacing={1} sx={{ mb: 1 }}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => (
                <Grid key={label} size={{ xs: 12 / 7 }}>
                  <Box sx={{ textAlign: 'center', py: 1, fontWeight: 700, color: 'text.secondary' }}>{label}</Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={1}>
              {eventsByDay.map(({ day, items }) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonthStart);
                const today = isToday(day);

                return (
                  <Grid key={day.toISOString()} size={{ xs: 12 / 7 }}>
                    <Box
                      onClick={() => setSelectedDate(day)}
                      sx={{
                        minHeight: { xs: 84, md: 96 },
                        borderRadius: 2,
                        border: 1,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                        p: 1,
                        cursor: 'pointer',
                        opacity: isCurrentMonth ? 1 : 0.35,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: today || isSelected ? 700 : 500,
                            color: today ? 'primary.main' : 'text.primary',
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        {items.slice(0, 2).map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              px: 0.75,
                              py: 0.35,
                              borderRadius: 1,
                              backgroundColor: `${getAttendanceTypeColor(item.type)}20`,
                              borderLeft: `3px solid ${getAttendanceTypeColor(item.type)}`,
                            }}
                          >
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                              {item.startTime}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {(item.description || getAttendanceTypeLabel(item.type)).slice(0, 18)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}


      </Container>
    </Box>
  );
};

export default CalendarSection;
