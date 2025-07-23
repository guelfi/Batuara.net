import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const EventsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Gerenciar Eventos
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Página em Desenvolvimento
          </Typography>
          <Typography variant="body1">
            Esta página permitirá gerenciar todos os eventos da Casa de Caridade Batuara, 
            incluindo criação, edição, exclusão e visualização de eventos.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Funcionalidades planejadas:
          </Typography>
          <ul>
            <li>Lista de eventos com filtros e busca</li>
            <li>Formulário de criação/edição de eventos</li>
            <li>Gerenciamento de status (ativo/inativo)</li>
            <li>Visualização de detalhes dos eventos</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default EventsPage;