import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const OrixasPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Gerenciar Orixás
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Página em Desenvolvimento
          </Typography>
          <Typography variant="body1">
            Esta página permitirá gerenciar as informações sobre os Orixás conforme 
            os ensinamentos da Casa de Caridade Batuara.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Funcionalidades planejadas:
          </Typography>
          <ul>
            <li>Lista de Orixás com busca e filtros</li>
            <li>Formulário de criação/edição de Orixás</li>
            <li>Gerenciamento de características, cores e elementos</li>
            <li>Edição dos ensinamentos específicos da casa</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default OrixasPage;