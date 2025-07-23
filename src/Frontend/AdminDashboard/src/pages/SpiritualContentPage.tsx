import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const SpiritualContentPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Gerenciar Conteúdo Espiritual
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Página em Desenvolvimento
          </Typography>
          <Typography variant="body1">
            Esta página permitirá gerenciar todo o conteúdo espiritual da Casa de Caridade Batuara, 
            incluindo orações, ensinamentos, estudos e meditações.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Funcionalidades planejadas:
          </Typography>
          <ul>
            <li>Lista de conteúdos com busca e filtros por categoria</li>
            <li>Editor de texto rico para criação/edição de conteúdos</li>
            <li>Gerenciamento de tags e categorias</li>
            <li>Sistema de aprovação e versionamento</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default SpiritualContentPage;