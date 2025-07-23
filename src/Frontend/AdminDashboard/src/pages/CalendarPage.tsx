import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const CalendarPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Gerenciar Calendário
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Página em Desenvolvimento
          </Typography>
          <Typography variant="body1">
            Esta página permitirá gerenciar o calendário de atendimentos da Casa de Caridade Batuara, 
            incluindo sessões de Kardecismo, Umbanda, palestras e cursos.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Funcionalidades planejadas:
          </Typography>
          <ul>
            <li>Visualização em calendário mensal/semanal</li>
            <li>Criação e edição de horários de atendimento</li>
            <li>Gerenciamento de capacidade e inscrições</li>
            <li>Controle de conflitos de horários</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default CalendarPage;