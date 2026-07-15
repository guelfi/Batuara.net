import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Paper } from '@mui/material';
import CalendarPage from './CalendarPage';
import EventsPage from './EventsPage';

const AgendaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Atendimentos e Giras" />
            <Tab label="Eventos, Cursos e Festas" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <CalendarPage hideTitle />}
          {activeTab === 1 && <EventsPage hideTitle />}
        </Box>
      </Container>
    </Box>
  );
};

export default AgendaPage;
