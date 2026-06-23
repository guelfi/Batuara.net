import React, { useMemo, useState } from 'react';
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
  Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoIcon from '@mui/icons-material/Info';
import EventIcon from '@mui/icons-material/Event';
import { useQuery } from '@tanstack/react-query';
import { useTheme, useMediaQuery } from '@mui/material';
import publicApi from '../../services/api';
import { AttendanceType, CalendarAttendance, Event as BatuaraEvent, EventType } from '../../types';
import { desktopMediaQuery } from '../../theme/theme';
import {
  addMonths,
  subMonths,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
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

  const formatTime = (time: string | undefined): string | undefined => {
    if (!time || time === '---') return undefined;
    return time.length >= 5 ? time.slice(0, 5) : time;
  };

  // Estado para navegação mensal
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const monthStart = useMemo(() => startOfMonth(selectedMonthDate), [selectedMonthDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedMonthDate), [selectedMonthDate]);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCloseDialog = () => setSelectedItem(null);

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
        isEvent: false,
      }));

    const events = (eventsData?.data ?? [])
      .filter((e: BatuaraEvent) => e.isActive !== false)
      .map((e: BatuaraEvent) => ({
        ...e,
        displayTitle: e.title,
        isEvent: true,
        startTime: e.startTime || '---',
      }));

    const combined = [...events, ...attendances];
    const seen = new Set();
    const uniqueData = combined.filter((item) => {
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

  // Agrupa itens por dia para o layout de lista
  const itemsByDay = useMemo(() => {
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return allDays
      .map((day) => ({
        day,
        items: currentData.filter((item) => isSameDay(parseISO(item.date), day)),
      }))
      .filter(({ items }) => items.length > 0);
  }, [currentData, monthStart, monthEnd]);

  const monthLabel = useMemo(() => {
    const raw = format(selectedMonthDate, 'MMMM', { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedMonthDate]);

  const yearLabel = useMemo(() => format(selectedMonthDate, 'yyyy'), [selectedMonthDate]);

  return (
    <Box
      id="calendario-atendimento"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        pt: { xs: 1, md: 1.5 },
        pb: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        {/* Cabeçalho estilo Instagram: "CALENDÁRIO | junho" */}
        <Box sx={{ mb: { xs: 0.5, md: 0.75 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: { xs: 0.5, md: 0.75 } }}
          >
            <IconButton
              onClick={handlePrevMonth}
              color="primary"
              size="medium"
              aria-label="Mês anterior"
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>

            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={1}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.34rem', md: '1.61rem' },
                    fontWeight: 900,
                    color: 'text.primary',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Calendário
                </Typography>
                <Box
                  component="span"
                  sx={{
                    width: 3,
                    height: { xs: 18, md: 24 },
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1,
                    display: 'inline-block',
                    mx: 0.5,
                    verticalAlign: 'middle',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '1.18rem', md: '1.45rem' },
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: theme.palette.primary.main,
                    lineHeight: 1,
                  }}
                >
                  {monthLabel}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                {yearLabel}
              </Typography>
            </Box>

            <IconButton
              onClick={handleNextMonth}
              color="primary"
              size="medium"
              aria-label="Próximo mês"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Alert
            severity="info"
            icon={<InfoIcon fontSize="small" />}
            sx={{
              py: 0.25,
              px: 1,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' }, lineHeight: 1.25 }}>
              {IMPORTANT_INFO_TEXT}
            </Typography>
          </Alert>
        </Box>

        {/* Estados de carregamento / erro / vazio */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando próximos atendimentos...
            </Typography>
          </Box>
        ) : isError ? (
          <Alert severity="warning">
            Não foi possível carregar o calendário em tempo real. Tente novamente em instantes.
          </Alert>
        ) : itemsByDay.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarTodayIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum atendimento agendado para este mês
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aguarde novos horários serem publicados ou entre em contato conosco.
            </Typography>
          </Box>
        ) : (
          /* Lista de dias estilo Instagram */
          <Stack spacing={0} divider={<Divider sx={{ my: 0 }} />}>
            {itemsByDay.map(({ day, items }) => {
              const dayNum = format(day, 'dd.MM', { locale: ptBR });
              const weekDay = toPtTitleCase(format(day, 'EEEE', { locale: ptBR }));

              return (
                <Box
                  key={day.toISOString()}
                  sx={{
                    py: { xs: 0.75, md: 0.9 },
                    px: { xs: 0.5, md: 1 },
                  }}
                >
                  {/* Linha da data: ícone + data + dia da semana */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <EventIcon
                      sx={{
                        fontSize: { xs: 22, md: 26 },
                        color: getItemColor(items[0]),
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.07rem', md: '1.18rem' },
                          fontWeight: 900,
                          lineHeight: 1.15,
                          color: 'text.primary',
                          letterSpacing: '-0.25px',
                        }}
                      >
                        {dayNum} | {weekDay}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Itens do dia */}
                  <Stack spacing={0.1} sx={{ pl: { xs: 3.5, md: 4.5 } }}>
                    {items.map((item: any) => {
                      const color = getItemColor(item);
                      const startT = formatTime(item.startTime);
                      const endT = formatTime(item.endTime);
                      const timeStr = startT
                        ? endT && endT !== startT
                          ? `${startT} – ${endT}`
                          : startT
                        : undefined;
                      const label = getItemLabel(item);

                      return (
                        <Box key={`${item.isEvent ? 'ev' : 'at'}-${item.id}`}>
                          <Typography
                            sx={{
                              fontSize: { xs: '0.94rem', md: '1.02rem' },
                              fontWeight: 500,
                              color: 'text.secondary',
                              lineHeight: 1.3,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{ color, fontWeight: 700 }}
                            >
                              {item.displayTitle !== label ? item.displayTitle : label}
                            </Box>
                            {timeStr && (
                              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                                {' | '}{timeStr}
                              </Box>
                            )}
                          </Typography>
                          {item.observations && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.disabled', display: 'block', lineHeight: 1.3 }}
                            >
                              {item.observations}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Dialog de detalhes ao clicar num item (mantido para compatibilidade futura) */}
      <Dialog
        open={!!selectedItem}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
            m: { xs: 1.5, sm: 3 },
            borderRadius: 3,
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
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 0 }}>
              {selectedItem.displayTitle}
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Stack spacing={1.5}>
                {(() => {
                  const color = getItemColor(selectedItem);
                  const startT = formatTime(selectedItem.startTime);
                  const endT = formatTime(selectedItem.endTime);
                  const timeStr = startT
                    ? endT && endT !== startT
                      ? `${startT} – ${endT}`
                      : startT
                    : undefined;
                  return (
                    <Paper sx={{ p: 1.5, borderRadius: 2, borderLeft: `4px solid ${color}`, backgroundColor: `${color}0D`, border: `1px solid ${color}40` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{getItemLabel(selectedItem)}</Typography>
                          {timeStr && <Typography variant="body2" color="text.secondary">{timeStr}</Typography>}
                          {selectedItem.observations && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{selectedItem.observations}</Typography>}
                        </Box>
                        <Chip label={getItemShortLabel(selectedItem)} size="small" variant="outlined" sx={{ borderColor: color, color, fontWeight: 800, flexShrink: 0 }} />
                      </Stack>
                    </Paper>
                  );
                })()}
                <Alert severity="info" sx={{ py: 0.5 }}>Recomendamos chegar com 30 minutos de antecedência</Alert>
                <Button variant="contained" fullWidth onClick={handleCloseDialog} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
                  Fechar
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarSection;
