import React from 'react';
import { Alert, Box, Container, Tab, Tabs, Paper } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import CalendarPage from './CalendarPage';
import EventsPage from './EventsPage';
import BingoPage from './BingoPage';
import useIsMobile from '../hooks/useIsMobile';

const ABAS = ['atendimentos', 'eventos', 'bingos', 'bazares'] as const;

const AgendaPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const isMobile = useIsMobile();
  const found = ABAS.indexOf((params.get('aba') ?? '') as (typeof ABAS)[number]);
  const activeTab = found < 0 ? 0 : found;
  // Bingos e Bazares usam a tela toda (o menu lateral recolhe sozinho)
  const wide = activeTab >= 2;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setParams(newValue === 0 ? {} : { aba: ABAS[newValue] });
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth={wide ? false : 'xl'}>
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Atendimentos e Giras" />
            <Tab label="Eventos, Cursos e Festas" />
            <Tab label="Bingos" />
            <Tab label="Bazares" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <CalendarPage hideTitle />}
          {activeTab === 1 && <EventsPage hideTitle />}
          {activeTab === 2 && <BingoPage />}
          {activeTab === 3 && <Alert severity="info">Bazares: em breve.</Alert>}
        </Box>
      </Container>
    </Box>
  );
};

export default AgendaPage;
