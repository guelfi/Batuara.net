import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const UmbandaLinesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Gerenciar Linhas de Umbanda
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Página em Desenvolvimento
          </Typography>
          <Typography variant="body1">
            Esta página permitirá gerenciar as informações sobre as Linhas de Umbanda 
            que trabalham na Casa de Caridade Batuara.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Funcionalidades planejadas:
          </Typography>
          <ul>
            <li>Lista de linhas com busca e filtros</li>
            <li>Formulário de criação/edição de linhas</li>
            <li>Gerenciamento de entidades e dias de trabalho</li>
            <li>Edição das interpretações específicas da casa</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default UmbandaLinesPage;