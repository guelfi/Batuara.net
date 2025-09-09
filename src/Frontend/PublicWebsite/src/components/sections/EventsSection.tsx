import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { mockEvents } from '../../data/mockData';
import { EventType } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NavigationDots from '../common/NavigationDots';

const EventsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case EventType.Festa:
        return 'Festa';
      case EventType.Evento:
        return 'Evento';
      case EventType.Bazar:
        return 'Bazar';
      case EventType.Palestra:
        return 'Palestra';
      default:
        return 'Evento';
    }
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case EventType.Festa:
        return theme.palette.secondary.main;
      case EventType.Evento:
        return theme.palette.primary.main;
      case EventType.Palestra:
        return theme.palette.info.main;
      case EventType.Bazar:
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === null || event.type === selectedType;
    return matchesSearch && matchesType && event.isActive;
  });

  const formatEventDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
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
      const scrollAmount = 320;
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
      const itemWidth = 320;
      const gap = 24;
      const itemWithGap = itemWidth + gap;
      const targetScroll = dotIndex * itemWithGap;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, [filteredEvents]);

  return (
    <Box id="events" sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
            Eventos e Atividades
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
            Participe de nossas celebrações, palestras e atividades espirituais
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <TextField
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  color={selectedType === type ? 'primary' : 'default'}
                  variant={selectedType === type ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {filteredEvents.length === 0 ? (
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
          <Box sx={{ position: 'relative', mb: 4 }}>
            {canScrollLeft && (
              <IconButton
                onClick={() => scroll('left')}
                sx={{
                  position: 'absolute',
                  left: -20,
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
                  right: -20,
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
                gap: 3,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 2,
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  sx={{
                    minWidth: 320,
                    maxWidth: 320,
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3, fontSize: '1.1rem' }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={getEventTypeLabel(event.type)}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, lineHeight: 1.6, fontSize: '0.9rem' }}
                    >
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {formatEventDate(event.date)}
                        </Typography>
                      </Box>

                      {(event.startTime || event.endTime) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {formatEventTime(event.startTime, event.endTime)}
                          </Typography>
                        </Box>
                      )}

                      {event.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {event.location}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: getEventTypeColor(event.type),
                        '&:hover': {
                          backgroundColor: getEventTypeColor(event.type),
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      Mais Informações
                    </Button>
                  </CardActions>
                </Card>
              ))}
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
                  const itemWidth = 320;
                  const gap = 24;
                  const itemsPerView = 1;
                  const itemWithGap = itemWidth + gap;
                  
                  if (scrollPosition >= maxScroll * 0.9) {
                    return filteredEvents.length - 1;
                  }
                  
                  return Math.floor(scrollPosition / itemWithGap / itemsPerView);
                })()}
                itemsPerView={1}
                onDotClick={handleDotClick}
              />
            </Box>
          </Box>
        ) : (
          /* Grid para desktop */
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={getEventTypeLabel(event.type)}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, lineHeight: 1.6 }}
                    >
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatEventDate(event.date)}
                        </Typography>
                      </Box>

                      {(event.startTime || event.endTime) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {formatEventTime(event.startTime, event.endTime)}
                          </Typography>
                        </Box>
                      )}

                      {event.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {event.location}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: getEventTypeColor(event.type),
                        '&:hover': {
                          backgroundColor: getEventTypeColor(event.type),
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      Mais Informações
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Quer ficar por dentro de todos os nossos eventos?
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              const element = document.querySelector('#contact');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Entre em Contato
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default EventsSection;