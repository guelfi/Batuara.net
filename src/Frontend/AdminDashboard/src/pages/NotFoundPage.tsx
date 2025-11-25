import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: '4rem',
              fontWeight: 700,
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Página Não Encontrada
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Desculpe, a página que você está procurando não existe ou foi movida.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleGoHome}
            sx={{
              py: 1.5,
              px: 3,
            }}
          >
            Voltar para o Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage;