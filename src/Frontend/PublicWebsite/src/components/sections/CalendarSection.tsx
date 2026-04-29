import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
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
  const IMPORTANT_INFO_TEXT =
    'Informações Importantes: Todos os atendimentos são gratuitos. Recomendamos chegar com 30 minutos de antecedência';

  const toPtTitleCase = (value: string): string => {
    const stopWords = new Set(['de']);
    return value
      .replace(/,/g, '')
      .split(/\s+/g)
      .filter(Boolean)
      .map((token) => {
        const lower = token.toLocaleLowerCase('pt-BR');
        if (stopWords.has(lower)) return lower;

        if (token.includes('-')) {
          return token
            .split('-')
            .map((part) => {
              const partLower = part.toLocaleLowerCase('pt-BR');
              if (!partLower) return partLower;
              return partLower.charAt(0).toLocaleUpperCase('pt-BR') + partLower.slice(1);
            })
            .join('-');
        }

        if (!lower) return lower;
        return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
      })
      .join(' ');
  };

  // Estado para navegação mensal
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const monthStart = useMemo(() => startOfMonth(selectedMonthDate), [selectedMonthDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedMonthDate), [selectedMonthDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfMonth(new Date()));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);

  const handleCloseDayDialog = (_event: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick') return;
    setIsDayDialogOpen(false);
  };

  const handlePrevMonth = () => {
    setSelectedMonthDate((prev: Date) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate((prev: Date) => addMonths(prev, 1));
  };

  const attendanceColors: Record<AttendanceType, string> = {
    [AttendanceType.Kardecismo]: '#6a1b9a',
    [AttendanceType.Umbanda]: '#0097a7',
    [AttendanceType.Palestra]: '#1e88e5',
    [AttendanceType.Curso]: '#212121',
    [AttendanceType.Festa]: '#fb8c00',
  };

  const eventColors: Record<EventType, string> = {
    [EventType.Festa]: '#fb8c00',
    [EventType.Evento]: '#1976d2',
    [EventType.Celebracao]: '#d81b60',
    [EventType.Bazar]: '#ef6c00',
    [EventType.Palestra]: '#1e88e5',
  };

  const normalizeString = (value: string) => value.trim().toLowerCase();

  const normalizeAttendanceType = (type: unknown): AttendanceType | undefined => {
    if (typeof type === 'number') {
      return [AttendanceType.Kardecismo, AttendanceType.Umbanda, AttendanceType.Palestra, AttendanceType.Curso, AttendanceType.Festa].includes(type as AttendanceType)
        ? (type as AttendanceType)
        : undefined;
    }

    if (typeof type !== 'string') return undefined;

    const numeric = parseInt(type, 10);
    if (!Number.isNaN(numeric)) {
      return normalizeAttendanceType(numeric);
    }

    switch (normalizeString(type)) {
      case 'kardecismo':
      case 'kardec':
      case 'espirita':
      case 'espírita':
        return AttendanceType.Kardecismo;
      case 'umbanda':
      case 'gira':
      case 'gira de umbanda':
        return AttendanceType.Umbanda;
      case 'palestra':
        return AttendanceType.Palestra;
      case 'curso':
        return AttendanceType.Curso;
      case 'festa':
        return AttendanceType.Festa;
      default:
        return undefined;
    }
  };

  const normalizeEventType = (type: unknown): EventType | undefined => {
    if (typeof type === 'number') {
      return [EventType.Festa, EventType.Evento, EventType.Celebracao, EventType.Bazar, EventType.Palestra].includes(type as EventType)
        ? (type as EventType)
        : undefined;
    }

    if (typeof type !== 'string') return undefined;

    const numeric = parseInt(type, 10);
    if (!Number.isNaN(numeric)) {
      return normalizeEventType(numeric);
    }

    switch (normalizeString(type)) {
      case 'festa':
        return EventType.Festa;
      case 'evento':
        return EventType.Evento;
      case 'celebração':
      case 'celebracao':
        return EventType.Celebracao;
      case 'bazar':
        return EventType.Bazar;
      case 'palestra':
        return EventType.Palestra;
      default:
        return undefined;
    }
  };

  const getAttendanceLabel = (type: unknown): string => {
    switch (normalizeAttendanceType(type)) {
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
        return typeof type === 'string' && type.trim() ? type.trim() : 'Atendimento';
    }
  };

  const getEventLabel = (type: unknown): string => {
    switch (normalizeEventType(type)) {
      case EventType.Festa:
        return 'Festa';
      case EventType.Evento:
        return 'Evento';
      case EventType.Celebracao:
        return 'Celebração';
      case EventType.Bazar:
        return 'Bazar';
      case EventType.Palestra:
        return 'Palestra';
      default:
        return typeof type === 'string' && type.trim() ? type.trim() : 'Evento';
    }
  };

  const getAttendanceShortLabel = (type: unknown): string => {
    switch (normalizeAttendanceType(type)) {
      case AttendanceType.Umbanda:
        return 'Gira';
      case AttendanceType.Kardecismo:
        return 'Kardec';
      case AttendanceType.Palestra:
        return 'Palestra';
      case AttendanceType.Curso:
        return 'Curso';
      case AttendanceType.Festa:
        return 'Festa';
      default:
        return typeof type === 'string' && type.trim() ? type.trim() : 'Atendimento';
    }
  };

  const getEventShortLabel = (type: unknown): string => {
    switch (normalizeEventType(type)) {
      case EventType.Festa:
        return 'Festa';
      case EventType.Evento:
        return 'Evento';
      case EventType.Celebracao:
        return 'Celebração';
      case EventType.Bazar:
        return 'Bazar';
      case EventType.Palestra:
        return 'Palestra';
      default:
        return typeof type === 'string' && type.trim() ? type.trim() : 'Evento';
    }
  };

  const getItemColor = (item: any): string => {
    if (item?.isEvent) {
      const normalized = normalizeEventType(item?.type);
      return (normalized ? eventColors[normalized] : undefined) ?? '#1976d2';
    }

    const normalized = normalizeAttendanceType(item?.type);
    return (normalized ? attendanceColors[normalized] : undefined) ?? '#1976d2';
  };

  const getItemLabel = (item: any): string => {
    return item?.isEvent ? getEventLabel(item?.type) : getAttendanceLabel(item?.type);
  };

  const getItemShortLabel = (item: any): string => {
    return item?.isEvent ? getEventShortLabel(item?.type) : getAttendanceShortLabel(item?.type);
  };

  const getPrimaryItem = (items: any[]) => {
    if (!items || items.length === 0) return undefined;
    const eventItem = items.find((item) => item.isEvent);
    return eventItem || items[0];
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
        displayTitle: a.description || getAttendanceLabel(a.type),
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

  const firstItemDate = useMemo(() => (currentData.length > 0 ? currentData[0].date : undefined), [currentData]);

  const monthDays = useMemo(() => {
    const intervalStart = startOfWeek(monthStart, { locale: ptBR });
    const intervalEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  }, [monthEnd, monthStart]);

  useEffect(() => {
    const nextDate = firstItemDate ? parseISO(firstItemDate) : monthStart;
    setSelectedDate((prev) => (isSameDay(prev, nextDate) ? prev : nextDate));
  }, [firstItemDate, monthStart]);

  const eventsByDay = useMemo(() => {
    return monthDays.map((day) => ({
      day,
      items: currentData.filter((attendance) => isSameDay(parseISO(attendance.date), day)),
    }));
  }, [currentData, monthDays]);

  const selectedDayItems = useMemo(() => {
    return currentData.filter((attendance) => isSameDay(parseISO(attendance.date), selectedDate));
  }, [currentData, selectedDate]);

  const selectedDayAccentColor = useMemo(() => {
    const primaryItem = getPrimaryItem(selectedDayItems);
    return primaryItem ? getItemColor(primaryItem) : theme.palette.primary.main;
  }, [selectedDayItems, theme]);

  const monthLabel = useMemo(() => {
    const raw = format(selectedMonthDate, "MMMM 'de' yyyy", { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedMonthDate]);

  return (
    <Box
      id="calendario-atendimento"
      sx={{
        scrollMarginTop: { xs: 56, md: 88 },
        minHeight: { xs: '100vh', md: 'auto' },
        pt: { xs: 1.5, md: 6 },
        pb: { xs: 4, md: 4 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 1.5, md: 3 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '2.2rem' },
              fontWeight: 600,
              mb: { xs: 0.5, md: 1 },
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1, md: 2 },
            }}
          >
            <IconButton onClick={handlePrevMonth} color="primary" size="large" sx={{ p: { xs: 0.75, md: 1 } }}>
              <ArrowBackIosIcon fontSize="inherit" />
            </IconButton>
            <Box component="span" sx={{ minWidth: { xs: 170, md: 350 }, textAlign: 'center' }}>
              {monthLabel}
            </Box>
            <IconButton onClick={handleNextMonth} color="primary" size="large" sx={{ p: { xs: 0.75, md: 1 } }}>
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Alert
            severity="info"
            icon={<InfoIcon />}
            sx={{
              maxWidth: 900,
              mx: 'auto',
              mb: { xs: 1.25, md: 2 },
              py: 0.5,
              px: { xs: 1.25, md: 2 },
              textAlign: 'left',
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography
              variant="body2"
              title={IMPORTANT_INFO_TEXT}
              sx={{
                fontSize: { xs: '0.85rem', md: '0.95rem' },
                lineHeight: 1.35,
                whiteSpace: 'normal',
                overflow: 'visible',
              }}
            >
              {IMPORTANT_INFO_TEXT}
            </Typography>
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
          <Stack spacing={3}>
            <Paper
              sx={{
                p: { xs: 0.75, md: 1.5 },
                borderRadius: 2,
                maxWidth: 1200,
                mx: 'auto',
                boxShadow: 3,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
                justifyContent="center"
                sx={{ px: { xs: 0.5, md: 0 }, pb: { xs: 0.75, md: 1 } }}
              >
                {[
                  { label: 'Giras', color: attendanceColors[AttendanceType.Umbanda] },
                  { label: 'Kardec', color: attendanceColors[AttendanceType.Kardecismo] },
                  { label: 'Festas', color: eventColors[EventType.Festa] },
                  { label: 'Bazares', color: eventColors[EventType.Bazar] },
                  { label: 'Cursos', color: attendanceColors[AttendanceType.Curso] },
                ].map((item) => (
                  <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  columnGap: { xs: 0.5, md: 0.75 },
                  rowGap: { xs: 0.5, md: 0.75 },
                  width: '100%',
                }}
              >
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      textAlign: 'center',
                      py: { xs: 0.5, md: 0.75 },
                      fontWeight: 700,
                      color: 'text.secondary',
                      fontSize: { xs: '0.65rem', md: '0.78rem' },
                      userSelect: 'none',
                    }}
                  >
                    {label}
                  </Box>
                ))}

                {eventsByDay.map(({ day, items }) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const today = isToday(day);
                  const primaryItem = getPrimaryItem(items);
                  const accentColor = primaryItem ? getItemColor(primaryItem) : undefined;
                  const primaryBadgeLabel = primaryItem
                    ? (() => {
                      const shortLabel = getItemShortLabel(primaryItem);
                      if (shortLabel === 'Atendimento' || shortLabel === 'Evento') {
                        return primaryItem.displayTitle || shortLabel;
                      }
                      return shortLabel;
                    })()
                    : '';

                  return (
                    <Box
                      key={day.toISOString()}
                      role="button"
                      tabIndex={0}
                      aria-label={`Selecionar dia ${format(day, "dd 'de' MMMM", { locale: ptBR })}`}
                      onClick={() => {
                        setSelectedDate(day);
                        if (items.length > 0) setIsDayDialogOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDate(day);
                          if (items.length > 0) setIsDayDialogOpen(true);
                        }
                      }}
                      sx={{
                        minHeight: { xs: 50, md: 76 },
                        borderRadius: 1,
                        border: accentColor ? 2 : 1,
                        borderColor: accentColor || (isSelected ? 'primary.main' : 'divider'),
                        backgroundColor: isSelected
                          ? 'rgba(25, 118, 210, 0.08)'
                          : accentColor
                            ? `${accentColor}1F`
                            : 'background.paper',
                        p: { xs: 0.5, md: 1 },
                        cursor: 'pointer',
                        opacity: isCurrentMonth ? 1 : 0.35,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        outline: 'none',
                        '&:hover': { borderColor: 'primary.main', transform: { xs: 'none', md: 'translateY(-1px)' } },
                        '&:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.main}33` },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: today || isSelected ? 700 : 500,
                          color: today ? 'primary.main' : 'text.primary',
                          fontSize: { xs: '0.72rem', md: '0.8rem' },
                          mb: 0.25,
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>

                      {isMobile ? (
                        <>
                          <Stack
                            direction="row"
                            spacing={0.4}
                            justifyContent="center"
                            flexWrap="wrap"
                            sx={{ width: '100%', minHeight: 8 }}
                          >
                            {items.slice(0, 4).map((item) => (
                              <Box
                                key={item.id}
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: getItemColor(item),
                                }}
                              />
                            ))}
                          </Stack>
                          {accentColor && (
                            <Box
                              sx={{
                                mt: 0.35,
                                px: 0.6,
                                py: 0.15,
                                borderRadius: 0.75,
                                border: `1px solid ${accentColor}80`,
                                backgroundColor: `${accentColor}1A`,
                                maxWidth: '100%',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontSize: '0.55rem',
                                  fontWeight: 800,
                                  color: accentColor,
                                  lineHeight: 1.1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {primaryBadgeLabel}
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Stack spacing={0.5} sx={{ width: '100%' }}>
                          {items.slice(0, 3).map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                px: 0.75,
                                py: 0.35,
                                borderRadius: 1,
                                backgroundColor: `${getItemColor(item)}20`,
                                borderLeft: `3px solid ${getItemColor(item)}`,
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
                  );
                })}
              </Box>
            </Paper>
            {isMobile && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Clique na data desejada para obter maiores informações sobre o atendimento
              </Typography>
            )}
          </Stack>
        )}

        <Dialog
          open={isDayDialogOpen}
          onClose={handleCloseDayDialog}
          fullWidth
          maxWidth="sm"
          fullScreen={false}
          PaperProps={{
            sx: {
              display: 'flex',
              flexDirection: 'column',
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
              m: { xs: 1.5, sm: 3 },
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0,0,0,0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          }}
        >
          {!isMobile && (
            <DialogTitle
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                mt: 0.75,
                fontSize: '1.25rem',
              }}
            >
              {toPtTitleCase(format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }))}
            </DialogTitle>
          )}
          <DialogContent
            sx={{
              pt: isMobile ? 0 : 1.5,
              pb: { xs: 2, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {isMobile && (
              <Typography
                sx={{
                  fontWeight: 800,
                  textAlign: 'center',
                  mt: 0,
                  mb: 2,
                  fontSize: '1.2rem',
                }}
              >
                {toPtTitleCase(format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }))}
              </Typography>
            )}
            <Paper
              sx={{
                width: '100%',
                maxWidth: 560,
                mx: 'auto',
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                border: `2px solid ${selectedDayAccentColor}`,
                boxShadow: 3,
              }}
            >
              <Stack spacing={1.25} sx={{ width: '100%' }}>
                {selectedDayItems.map((item: any) => {
                  const color = getItemColor(item);
                  const label = getItemLabel(item);
                  const time = item.startTime && item.startTime !== '---' ? item.startTime : undefined;
                  const endTime = item.endTime && item.endTime !== '---' ? item.endTime : undefined;
                  const timeLabel = time ? (endTime ? `${time} – ${endTime}` : time) : undefined;

                  return (
                    <Paper
                      key={`${item.isEvent ? 'event' : 'attendance'}-${item.id}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        borderLeft: `4px solid ${color}`,
                        backgroundColor: `${color}0D`,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                            {item.displayTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, mt: 0.25 }}>
                            {timeLabel ? `${timeLabel} • ${label}` : label}
                          </Typography>
                        </Box>
                        <Chip
                          label={getItemShortLabel(item)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: color,
                            color,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Paper>
                  );
                })}

                {selectedDayItems.length === 0 && (
                  <Alert severity="info">Não há eventos/atendimentos cadastrados para esta data.</Alert>
                )}

                <Alert severity="info">
                  Recomendamos chegar com 30 minutos de antecedência
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleCloseDayDialog(undefined)}
                  sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                >
                  Fechar
                </Button>
              </Stack>
            </Paper>
          </DialogContent>
        </Dialog>


      </Container>
    </Box>
  );
};

export default CalendarSection;
