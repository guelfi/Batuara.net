import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  useTheme,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import { mockCalendarAttendances } from '../../data/mockData';
import { AttendanceType } from '../../types';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarSection: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);

  const getAttendanceTypeLabel = (type: AttendanceType): string => {
    switch (type) {
      case AttendanceType.Kardecismo:
        return 'Kardecismo';
      case AttendanceType.Umbanda:
        return 'Umbanda';
      case AttendanceType.Palestra:
        return 'Palestra';
      case AttendanceType.Curso:
        return 'Curso';
      default:
        return 'Atendimento';
    }
  };

  const getAttendanceTypeColor = (type: AttendanceType): string => {
    switch (type) {
      case AttendanceType.Kardecismo:
        return theme.palette.primary.main;
      case AttendanceType.Umbanda:
        return theme.palette.secondary.main;
      case AttendanceType.Palestra:
        return theme.palette.info.main;
      case AttendanceType.Curso:
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatAttendanceDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const isAttendanceToday = (dateString: string): boolean => {
    try {
      const date = parseISO(dateString);
      return isToday(date);
    } catch {
      return false;
    }
  };

  const isAttendanceFuture = (dateString: string): boolean => {
    try {
      const date = parseISO(dateString);
      return isFuture(date);
    } catch {
      return false;
    }
  };

  const filterAttendancesByType = (type?: AttendanceType) => {
    return mockCalendarAttendances.filter(attendance => 
      attendance.isActive && 
      (type === undefined || attendance.type === type) &&
      isAttendanceFuture(attendance.date)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const allAttendances = filterAttendancesByType();
  const kardecismoAttendances = filterAttendancesByType(AttendanceType.Kardecismo);
  const umbandaAttendances = filterAttendancesByType(AttendanceType.Umbanda);
  const coursesAttendances = filterAttendancesByType(AttendanceType.Curso);

  const tabData = [
    { label: 'Todos', data: allAttendances },
    { label: 'Kardecismo', data: kardecismoAttendances },
    { label: 'Umbanda', data: umbandaAttendances },
    { label: 'Cursos', data: coursesAttendances },
  ];

  const currentData = tabData[selectedTab].data;

  return (
    <Box id="calendar" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Calendário de Atendimentos
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
            Confira nossos horários de atendimento espiritual
          </Typography>

          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <AlertTitle>Informações Importantes</AlertTitle>
            Todos os atendimentos são gratuitos. Recomendamos chegar com 15 minutos de antecedência.
            Para cursos, é necessário inscrição prévia.
          </Alert>
        </Box>

        {/* Tabs para filtrar por tipo */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            centered
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabData.map((tab, index) => (
              <Tab
                key={index}
                label={`${tab.label} (${tab.data.length})`}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Tabs>
        </Box>

        {currentData.length === 0 ? (
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
          <Grid container spacing={3}>
            {currentData.map((attendance) => (
              <Grid item xs={12} md={6} lg={4} key={attendance.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    ...(isAttendanceToday(attendance.date) && {
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: theme.shadows[4],
                    }),
                  }}
                >
                  {isAttendanceToday(attendance.date) && (
                    <Chip
                      label="HOJE"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={getAttendanceTypeLabel(attendance.type)}
                        sx={{
                          backgroundColor: getAttendanceTypeColor(attendance.type),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {attendance.description || getAttendanceTypeLabel(attendance.type)}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                          {formatAttendanceDate(attendance.date)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          das {attendance.startTime} às {attendance.endTime}
                        </Typography>
                      </Box>

                      {attendance.maxCapacity && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            Vagas limitadas: {attendance.maxCapacity} pessoas
                          </Typography>
                        </Box>
                      )}

                      {attendance.requiresRegistration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoIcon fontSize="small" color="warning" />
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                            Inscrição obrigatória
                          </Typography>
                        </Box>
                      )}

                      {attendance.observations && (
                        <Box
                          sx={{
                            backgroundColor: 'background.default',
                            p: 2,
                            borderRadius: 1,
                            mt: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <strong>Observações:</strong> {attendance.observations}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Horários Regulares */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, color: 'primary.main' }}>
            Horários Regulares
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                  Kardecismo
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Terças e Quintas-feiras
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  19h às 21h
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: 'secondary.main', mb: 2 }}>
                  Umbanda
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Sábados
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  20h às 22h
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: 'info.main', mb: 2 }}>
                  Palestras
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Domingos
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  19h30 às 21h
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CalendarSection;