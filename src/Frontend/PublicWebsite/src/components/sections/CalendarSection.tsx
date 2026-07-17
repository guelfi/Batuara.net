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
import { useTheme } from '@mui/material';
import publicApi from '../../services/api';
import { AttendanceType, CalendarAttendance, Event as BatuaraEvent, EventType } from '../../types';
import { orixaColorMap } from '../../utils/orixaColors';
import {
  addMonths,
  subMonths,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Ícone de calendário reproduzindo o estilo usado nas postagens do Instagram da Casa
// (quadrado arredondado, dois furos no topo e grade de dias), colorido conforme o Orixá do mês.
const CalendarGridIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#43a047' }) => {
  const isLight = color === orixaColorMap['branco'];
  const detailColor = isLight ? 'rgba(33, 33, 33, 0.35)' : 'rgba(255, 255, 255, 0.85)';

  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: size, height: size, flexShrink: 0 }}
    >
      <rect
        x="2" y="3" width="20" height="19" rx="3.5"
        fill={color}
        stroke={isLight ? 'rgba(33, 33, 33, 0.2)' : 'none'}
        strokeWidth={isLight ? 0.6 : 0}
      />
      <circle cx="7.5" cy="3" r="1.4" fill={detailColor} />
      <circle cx="16.5" cy="3" r="1.4" fill={detailColor} />
      <g fill={detailColor}>
        <rect x="5" y="9.2" width="2.3" height="2.3" rx="0.6" />
        <rect x="10.85" y="9.2" width="2.3" height="2.3" rx="0.6" />
        <rect x="16.7" y="9.2" width="2.3" height="2.3" rx="0.6" />
        <rect x="5" y="13.7" width="2.3" height="2.3" rx="0.6" />
        <rect x="10.85" y="13.7" width="2.3" height="2.3" rx="0.6" />
        <rect x="16.7" y="13.7" width="2.3" height="2.3" rx="0.6" />
        <rect x="5" y="18.2" width="2.3" height="2.3" rx="0.6" />
        <rect x="10.85" y="18.2" width="2.3" height="2.3" rx="0.6" />
      </g>
    </Box>
  );
};

// Orixá do mês, conforme datas comemorativas da apostila da Casa (confirmado com a direção em 2026-07-17).
// Meses sem Orixá com data comemorativa própria usam Iemanjá (azul), Orixá padroeira da Casa.
const getMonthAccentColor = (date: Date): string => {
  switch (date.getMonth()) {
    case 0: return orixaColorMap['verde'];    // Janeiro - Oxóssi (20/01)
    case 1: return orixaColorMap['azul'];     // Fevereiro - Iemanjá (02/02)
    case 3: return orixaColorMap['vermelho']; // Abril - Ogum (23/04)
    case 6: return orixaColorMap['lilás'];    // Julho - Nanã (27/07)
    case 7: return orixaColorMap['dourado'];  // Agosto - Oxum (15/08)
    case 8: return orixaColorMap['marrom'];   // Setembro - Xangô (30/09)
    case 11: // Dezembro: Iansã (04/12) na 1ª quinzena, Oxalá (25/12) na 2ª
      return date.getDate() <= 15 ? orixaColorMap['laranja'] : orixaColorMap['branco'];
    default: return orixaColorMap['azul'];    // Sem Orixá com data própria: Iemanjá, padroeira da Casa
  }
};

const CalendarSection: React.FC = () => {
  const IMPORTANT_INFO_TEXT =
    'Todos atendimentos são gratuitos. Recomendamos chegar com 30 minutos de antecedência';

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

  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const monthStart = useMemo(() => startOfMonth(selectedMonthDate), [selectedMonthDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedMonthDate), [selectedMonthDate]);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const theme = useTheme();

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
    [EventType.Curso]: '#388e3c',
    [EventType.Treinamento]: '#7b1fa2',
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
    if (!Number.isNaN(numeric)) return normalizeAttendanceType(numeric);
    switch (normalizeString(type)) {
      case 'kardecismo': case 'kardec': case 'espirita': case 'espírita': return AttendanceType.Kardecismo;
      case 'umbanda': case 'gira': case 'gira de umbanda': return AttendanceType.Umbanda;
      case 'palestra': return AttendanceType.Palestra;
      case 'curso': return AttendanceType.Curso;
      case 'festa': return AttendanceType.Festa;
      default: return undefined;
    }
  };

  const normalizeEventType = (type: unknown): EventType | undefined => {
    if (typeof type === 'number') {
      return [EventType.Festa, EventType.Evento, EventType.Celebracao, EventType.Bazar, EventType.Palestra, EventType.Curso, EventType.Treinamento].includes(type as EventType)
        ? (type as EventType) : undefined;
    }
    if (typeof type !== 'string') return undefined;
    const numeric = parseInt(type, 10);
    if (!Number.isNaN(numeric)) return normalizeEventType(numeric);
    switch (normalizeString(type)) {
      case 'festa': return EventType.Festa;
      case 'evento': return EventType.Evento;
      case 'celebração': case 'celebracao': return EventType.Celebracao;
      case 'bazar': return EventType.Bazar;
      case 'palestra': return EventType.Palestra;
      case 'curso': return EventType.Curso;
      case 'treinamento': return EventType.Treinamento;
      default: return undefined;
    }
  };

  const getAttendanceLabel = (type: unknown): string => {
    switch (normalizeAttendanceType(type)) {
      case AttendanceType.Kardecismo: return 'Kardecismo';
      case AttendanceType.Umbanda: return 'Gira de Umbanda';
      case AttendanceType.Palestra: return 'Palestra';
      case AttendanceType.Curso: return 'Curso';
      case AttendanceType.Festa: return 'Festa';
      default: return typeof type === 'string' && type.trim() ? type.trim() : 'Atendimento';
    }
  };

  const getEventLabel = (type: unknown): string => {
    switch (normalizeEventType(type)) {
      case EventType.Festa: return 'Festa';
      case EventType.Evento: return 'Evento';
      case EventType.Celebracao: return 'Celebração';
      case EventType.Bazar: return 'Bazar';
      case EventType.Palestra: return 'Palestra';
      case EventType.Curso: return 'Curso';
      case EventType.Treinamento: return 'Treinamento';
      default: return typeof type === 'string' && type.trim() ? type.trim() : 'Evento';
    }
  };

  const getAttendanceShortLabel = (type: unknown): string => {
    switch (normalizeAttendanceType(type)) {
      case AttendanceType.Umbanda: return 'Gira';
      case AttendanceType.Kardecismo: return 'Kardec';
      case AttendanceType.Palestra: return 'Palestra';
      case AttendanceType.Curso: return 'Curso';
      case AttendanceType.Festa: return 'Festa';
      default: return typeof type === 'string' && type.trim() ? type.trim() : 'Atendimento';
    }
  };

  const getEventShortLabel = (type: unknown): string => {
    switch (normalizeEventType(type)) {
      case EventType.Festa: return 'Festa';
      case EventType.Evento: return 'Evento';
      case EventType.Celebracao: return 'Celebração';
      case EventType.Bazar: return 'Bazar';
      case EventType.Palestra: return 'Palestra';
      case EventType.Curso: return 'Curso';
      case EventType.Treinamento: return 'Treinamento';
      default: return typeof type === 'string' && type.trim() ? type.trim() : 'Evento';
    }
  };

  const getItemColor = (item: any): string => {
    if (item?.isEvent) {
      // Prioriza cardColor individual definido no banco; fallback para cor do tipo
      if (item?.cardColor && typeof item.cardColor === 'string' && item.cardColor.trim()) {
        return item.cardColor.trim();
      }
      const normalized = normalizeEventType(item?.type);
      return (normalized ? eventColors[normalized] : undefined) ?? '#1976d2';
    }
    const normalized = normalizeAttendanceType(item?.type);
    return (normalized ? attendanceColors[normalized] : undefined) ?? '#1976d2';
  };

  const getItemLabel = (item: any): string =>
    item?.isEvent ? getEventLabel(item?.type) : getAttendanceLabel(item?.type);

  const getItemShortLabel = (item: any): string =>
    item?.isEvent ? getEventShortLabel(item?.type) : getAttendanceShortLabel(item?.type);



  const { data: attendancesData, isLoading: loadingAttendances, isError: errorAttendances } = useQuery({
    queryKey: ['public-calendar-attendances', format(selectedMonthDate, 'yyyy-MM')],
    queryFn: () => publicApi.getCalendarAttendances({
      pageNumber: 1, pageSize: 100, sort: 'date:asc',
      month: selectedMonthDate.getMonth() + 1, year: selectedMonthDate.getFullYear(),
    }),
  });

  const { data: eventsData, isLoading: loadingEvents, isError: errorEvents } = useQuery({
    queryKey: ['public-calendar-events', format(selectedMonthDate, 'yyyy-MM')],
    queryFn: () => publicApi.getEvents({
      pageNumber: 1, pageSize: 100, sort: 'date:asc',
      month: selectedMonthDate.getMonth() + 1, year: selectedMonthDate.getFullYear(),
    }),
  });

  const isLoading = loadingAttendances || loadingEvents;
  const isError = errorAttendances || errorEvents;

  const currentData = useMemo(() => {
    const attendances = (attendancesData?.data ?? [])
      .filter((a: CalendarAttendance) => a.isActive)
      .map((a: CalendarAttendance) => ({ ...a, displayTitle: a.description || getAttendanceLabel(a.type), isEvent: false }));

    const events = (eventsData?.data ?? [])
      .filter((e: BatuaraEvent) => e.isActive !== false)
      .map((e: BatuaraEvent) => ({ ...e, displayTitle: e.title, isEvent: true, startTime: e.startTime || '---' }));

    const combined = [...events, ...attendances];
    const seen = new Set();
    const uniqueData = combined.filter((item) => {
      const key = `${item.date.split('T')[0]}_${item.displayTitle.toLowerCase().trim()}`;
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

  const itemsByDay = useMemo(() => {
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return allDays
      .map((day) => ({ day, items: currentData.filter((item) => isSameDay(parseISO(item.date.split('T')[0]), day)) }))
      .filter(({ items }) => items.length > 0);
  }, [currentData, monthStart, monthEnd]);

  const monthLabel = useMemo(() => {
    const raw = format(selectedMonthDate, 'MMMM', { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedMonthDate]);

  const yearLabel = useMemo(() => format(selectedMonthDate, 'yyyy'), [selectedMonthDate]);

  const monthAccentColor = useMemo(() => getMonthAccentColor(selectedMonthDate), [selectedMonthDate]);
  const isLightAccent = monthAccentColor === orixaColorMap['branco'];

  const isPastDay = (day: Date): boolean => isBefore(day, startOfDay(new Date()));

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
        {/* Cabecalho: CALENDARIO | Mes / Ano com setas alinhadas ao titulo */}
        <Box sx={{ mb: { xs: 0.5, md: 0.75 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: { xs: 0.5, md: 0.75 } }}
          >
            <IconButton onClick={handlePrevMonth} color="primary" size="medium" aria-label="Mes anterior">
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>

            {/* Titulo central: icone + CALENDARIO | Mes / Ano manuscrito na cor do Orixa do mes */}
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              <CalendarGridIcon size={20} color={monthAccentColor} />
              <Typography
                sx={{
                  fontSize: { xs: '1.34rem', md: '1.75rem' },
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
                  height: { xs: 18, md: 26 },
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1,
                  display: 'inline-block',
                  mx: 0.5,
                }}
              />
              {/* Mes / Ano em fonte manuscrita, colorido conforme o Orixa do mes */}
              <Typography
                sx={{
                  fontFamily: '"Dancing Script", cursive',
                  fontSize: { xs: '1.55rem', md: '2rem' },
                  fontWeight: 700,
                  color: monthAccentColor,
                  lineHeight: 1,
                  ...(isLightAccent && {
                    WebkitTextStroke: '1px rgba(33, 33, 33, 0.35)',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
                  }),
                }}
              >
                {monthLabel}&nbsp;/&nbsp;{yearLabel}
              </Typography>
            </Stack>

            <IconButton onClick={handleNextMonth} color="primary" size="medium" aria-label="Proximo mes">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Alert
            severity="info"
            icon={<InfoIcon fontSize="small" />}
            sx={{ py: 0.25, px: 1, '& .MuiAlert-message': { width: '100%' } }}
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
          /* Lista: UMA linha por evento
             [Icone] Data | Dia semana - Nome Evento | Horario */
          <Stack spacing={0} divider={<Divider sx={{ my: 0 }} />}>
            {itemsByDay.flatMap(({ day, items }) => {
              const dayNum = format(day, 'dd.MM', { locale: ptBR });
              const weekDay = toPtTitleCase(format(day, 'EEEE', { locale: ptBR }));
              const past = isPastDay(day);

              return items.map((item: any) => {
                const color = getItemColor(item);
                const startT = formatTime(item.startTime);
                const endT = formatTime(item.endTime);
                const timeStr = startT
                  ? (endT && endT !== startT ? `${startT} – ${endT}` : startT)
                  : undefined;

                return (
                  <Box
                    key={`${item.isEvent ? 'ev' : 'at'}-${item.id}`}
                    sx={{ py: { xs: 0.65, md: 0.85 }, px: { xs: 0.5, md: 1 } }}
                  >
                    {/* Linha 1: layout colunar com larguras fixas para alinhamento entre linhas */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'nowrap', minWidth: 0 }}>
                      {/* Coluna 1: Ícone — largura fixa */}
                      <Box sx={{ flexShrink: 0, width: { xs: '24px', md: '28px' }, display: 'flex', alignItems: 'center', pt: '1px' }}>
                        <EventIcon
                          sx={{
                            fontSize: { xs: 19, md: 22 },
                            color: past ? 'text.disabled' : color,
                          }}
                        />
                      </Box>
                      {/* Coluna 2: Data | Dia da semana — largura fixa */}
                      <Box sx={{ flexShrink: 0, width: { xs: '148px', md: '178px' } }}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: { xs: '0.9rem', md: '1.05rem' },
                            fontWeight: 700,
                            color: past ? 'text.disabled' : 'text.primary',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.35,
                          }}
                        >
                          {dayNum} | {weekDay}
                        </Typography>
                      </Box>
                      {/* Coluna 3: Bullet colorido — mesma cor do ícone */}
                      <Box sx={{ flexShrink: 0, width: { xs: '14px', md: '18px' }, display: 'flex', alignItems: 'center', pt: '2px' }}>
                        <Box
                          sx={{
                            width: { xs: 7, md: 8 },
                            height: { xs: 7, md: 8 },
                            borderRadius: '50%',
                            backgroundColor: past ? 'text.disabled' : color,
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                      {/* Coluna 4: Nome do Evento — ocupa o restante, pode quebrar linha */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: { xs: '0.9rem', md: '1.05rem' },
                            fontWeight: 700,
                            color: past ? 'text.disabled' : color,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            lineHeight: 1.35,
                            display: 'block',
                          }}
                        >
                          {item.displayTitle}
                        </Typography>
                        {/* Linha 2: horário logo abaixo do nome, alinhado na mesma coluna */}
                        {timeStr && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: { xs: '0.82rem', md: '0.97rem' },
                              fontWeight: 500,
                              color: past ? 'text.disabled' : 'text.secondary',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.3,
                              display: 'block',
                              mt: 0.1,
                            }}
                          >
                            🕐 {timeStr}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              });
            })}
          </Stack>
        )}
      </Container>

      {/* Dialog de detalhes */}
      <Dialog
        open={!!selectedItem}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: '100%' }, m: { xs: 1.5, sm: 3 }, borderRadius: 3 } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } }}
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
                  const timeStr = startT ? (endT && endT !== startT ? `${startT} – ${endT}` : startT) : undefined;
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