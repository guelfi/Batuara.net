import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { EventType, Event as BatuaraEvent } from '../../types';
import { addMonths, subMonths, format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NavigationDots from '../common/NavigationDots';

const CARD_WIDTH = 320;
const CARD_GAP = 24;

const EventsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado para navegação mensal
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  const handlePrevMonth = () => {
    setSelectedDate((prev: Date) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((prev: Date) => addMonths(prev, 1));
  };

  const monthLabel = useMemo(() => {
    const raw = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedDate]);

  const normalizeEventType = (type: EventType | string): EventType => {
    if (typeof type === 'number') {
      return type;
    }

    switch (type.trim().toLowerCase()) {
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
      case 'curso':
        return EventType.Curso;
      case 'treinamento':
        return EventType.Treinamento;
      default:
        return EventType.Evento;
    }
  };

  const getEventTypeLabel = (type: EventType | string): string => {
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
      case EventType.Curso:
        return 'Curso';
      case EventType.Treinamento:
        return 'Treinamento';
      default:
        return 'Evento';
    }
  };

  const getEventColor = (event: BatuaraEvent): string =>
    event.cardColor || getEventTypeColor(event.type);

  const getEventTypeColor = (type: EventType | string): string => {
    switch (normalizeEventType(type)) {
      case EventType.Festa:
        return '#2e7d32';
      case EventType.Evento:
        return '#1976d2';
      case EventType.Celebracao:
        return '#d81b60';
      case EventType.Palestra:
        return '#00acc1';
      case EventType.Bazar:
        return '#ef6c00';
      case EventType.Curso:
        return '#388e3c';
      case EventType.Treinamento:
        return '#7b1fa2';
      default:
        return '#1976d2';
    }
  };

  /** Retorna true se a data do evento já passou (anterior ao início de hoje) */
  const isEventPast = (event: BatuaraEvent): boolean => {
    try {
      const eventDate = parseISO(event.date.split('T')[0]);
      return isBefore(eventDate, startOfDay(new Date()));
    } catch {
      return false;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-events', format(selectedDate, 'yyyy-MM'), selectedType],
    queryFn: () =>
      publicApi.getEvents({
        pageNumber: 1,
        pageSize: 100,
        sort: 'date:asc',
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
        type: selectedType || undefined,
      }),
  });

  const filteredEvents = useMemo(
    () => (data?.data ?? []).filter((event: BatuaraEvent) => event.isActive !== false),
    [data?.data]
  );

  /** Índice do primeiro evento futuro (ou do último se todos forem passados) */
  const firstUpcomingIndex = useMemo(() => {
    const idx = filteredEvents.findIndex((e: BatuaraEvent) => !isEventPast(e));
    if (idx === -1) return Math.max(0, filteredEvents.length - 1);
    return idx;
  }, [filteredEvents]);

  const formatEventDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString.split('T')[0]);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatEventTime = (startTime?: string, endTime?: string): string => {
    if (!startTime) return '';
    if (!endTime) return `às ${startTime}`;
    return `das ${startTime} às ${endTime}`;
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = CARD_WIDTH + CARD_GAP;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (scrollContainerRef.current) {
      const targetScroll = dotIndex * (CARD_WIDTH + CARD_GAP);

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  /* Scroll automático no mobile: posicionar no primeiro evento futuro */
  useEffect(() => {
    hasAutoScrolled.current = false;
  }, [selectedDate, selectedType]);

  useEffect(() => {
    if (!isMobile) return;
    if (hasAutoScrolled.current) return;
    if (filteredEvents.length === 0) return;
    if (!scrollContainerRef.current) return;

    // Aguarda um tick para o DOM estar pronto
    const timeout = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const targetScroll = firstUpcomingIndex * (CARD_WIDTH + CARD_GAP);
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      handleScroll();
      hasAutoScrolled.current = true;
    }, 100);

    return () => clearTimeout(timeout);
  }, [filteredEvents, firstUpcomingIndex, isMobile]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, [filteredEvents.length]);

  /* Renderiza um card de evento — comportamento igual em mobile e desktop,
     apenas o container externo difere. */
  const renderEventCard = (event: BatuaraEvent, cardSx: object = {}) => {
    const past = isEventPast(event);
    const cancelled = !!event.isCancelled;
    const color = getEventColor(event);

    // Estilo do card quando passado
    const pastCardSx = past
      ? {
          opacity: 0.72,
          filter: 'grayscale(60%)',
          borderTopColor: '#9e9e9e',
        }
      : {};

    return (
      <Card
        key={event.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderTop: `4px solid ${past ? '#9e9e9e' : color}`,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: past ? 'none' : 'translateY(-4px)',
            boxShadow: past ? theme.shadows[1] : theme.shadows[8],
          },
          ...pastCardSx,
          ...cardSx,
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Cabeçalho: título + chip tipo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Badge REALIZADO / CANCELADO — exibido somente se passado */}
              {past && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  {cancelled ? (
                    <CancelOutlinedIcon sx={{ fontSize: 15, color: 'error.main' }} />
                  ) : (
                    <CheckCircleOutlineIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  )}
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: cancelled ? 'error.main' : 'text.disabled',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cancelled ? 'Cancelado' : 'Realizado'}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: past ? 'text.disabled' : 'text.primary',
                }}
              >
                {event.title}
              </Typography>
            </Box>
            <Chip
              label={getEventTypeLabel(event.type)}
              size="small"
              sx={{
                backgroundColor: past ? '#e0e0e0' : color,
                color: past ? '#757575' : 'white',
                fontWeight: 500,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              fontSize: '0.9rem',
              color: past ? 'text.disabled' : 'text.secondary',
            }}
          >
            {event.description}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" sx={{ color: past ? 'text.disabled' : 'primary.main' }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: '0.85rem', color: past ? 'text.disabled' : 'text.primary' }}
              >
                {formatEventDate(event.date)}
              </Typography>
            </Box>

            {(event.startTime || event.endTime) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ color: past ? 'text.disabled' : 'primary.main' }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.85rem', color: past ? 'text.disabled' : 'text.primary' }}
                >
                  {formatEventTime(event.startTime, event.endTime)}
                </Typography>
              </Box>
            )}

            {event.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ color: past ? 'text.disabled' : 'primary.main' }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.85rem', color: past ? 'text.disabled' : 'text.primary' }}
                >
                  {event.location}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant={past ? 'outlined' : 'contained'}
            fullWidth
            size="small"
            disabled={past}
            sx={
              past
                ? { borderColor: '#bdbdbd', color: '#9e9e9e' }
                : {
                    backgroundColor: color,
                    '&:hover': {
                      backgroundColor: color,
                      filter: 'brightness(0.9)',
                    },
                  }
            }
          >
            {past ? (cancelled ? 'Cancelado' : 'Realizado') : 'Mais Informações'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box
      id="eventos-e-festas"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        pt: { xs: 1.5, md: 2 },
        pb: { xs: 4, md: 8 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.7rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1, md: 2 },
              flexWrap: 'wrap',
            }}
          >
            <IconButton onClick={handlePrevMonth} color="primary" size={isMobile ? 'medium' : 'large'} sx={{ p: { xs: 0.75, md: 1 } }}>
              <ArrowBackIosIcon fontSize="inherit" />
            </IconButton>
            <Box component="span" sx={{ minWidth: { xs: 170, md: 350 }, textAlign: 'center' }}>
              {monthLabel}
            </Box>
            <IconButton onClick={handleNextMonth} color="primary" size={isMobile ? 'medium' : 'large'} sx={{ p: { xs: 0.75, md: 1 } }}>
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Acompanhe as festas, celebrações e atividades programadas para o período selecionado
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FilterListIcon color="action" />
              <Chip
                label="Todos"
                onClick={() => setSelectedType(null)}
                color={selectedType === null ? 'primary' : 'default'}
                variant={selectedType === null ? 'filled' : 'outlined'}
              />
              {Object.values(EventType).filter(v => typeof v === 'number').map((type) => (
                <Chip
                  key={type}
                  label={getEventTypeLabel(type as EventType)}
                  onClick={() => setSelectedType(type as EventType)}
                  variant={selectedType === type ? 'filled' : 'outlined'}
                  sx={
                    selectedType === type
                      ? {
                          backgroundColor: getEventTypeColor(type as EventType),
                          color: 'white',
                          borderColor: getEventTypeColor(type as EventType),
                          fontWeight: 700,
                        }
                      : undefined
                  }
                />
              ))}
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Não foi possível carregar os eventos atualizados da API.
          </Alert>
        ) : filteredEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum evento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros ou aguarde novos eventos serem publicados.
            </Typography>
          </Box>
        ) : isMobile ? (
          /* Carrossel para mobile */
          <Box sx={{ position: 'relative', mb: 4, overflow: 'clip' }}>
            {canScrollLeft && (
              <IconButton
                onClick={() => scroll('left')}
                sx={{
                  position: 'absolute',
                  left: { xs: 4, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
            )}

            {canScrollRight && (
              <IconButton
                onClick={() => scroll('right')}
                sx={{
                  position: 'absolute',
                  right: { xs: 4, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}

            <Box
              ref={scrollContainerRef}
              onScroll={handleScroll}
              sx={{
                display: 'flex',
                gap: `${CARD_GAP}px`,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                overscrollBehaviorX: 'contain',
                WebkitOverflowScrolling: 'touch',
                pb: 2,
                px: { xs: 0.5, md: 0 },
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {filteredEvents.map((event: BatuaraEvent) =>
                renderEventCard(event, {
                  minWidth: CARD_WIDTH,
                  maxWidth: CARD_WIDTH,
                  scrollSnapAlign: 'start',
                })
              )}
            </Box>

            {/* Dicas de navegação e bullets */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  mb: 1,
                }}
              >
                👈 Deslize para ver mais eventos
              </Typography>

              <NavigationDots
                totalItems={filteredEvents.length}
                currentIndex={(() => {
                  const itemWithGap = CARD_WIDTH + CARD_GAP;

                  if (scrollPosition >= maxScroll * 0.9) {
                    return filteredEvents.length - 1;
                  }

                  return Math.floor(scrollPosition / itemWithGap);
                })()}
                itemsPerView={1}
                onDotClick={handleDotClick}
              />
            </Box>
          </Box>
        ) : (
          /* Grid para desktop */
          <Grid container spacing={3}>
            {filteredEvents.map((event: BatuaraEvent) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
                {renderEventCard(event)}
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </Box>
  );
};

export default EventsSection;
