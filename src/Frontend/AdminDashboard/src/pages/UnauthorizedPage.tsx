import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate('/login');
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
            403
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Acesso Não Autorizado
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Você não tem permissão para acessar esta página. 
            Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleGoBack}
              sx={{
                py: 1.5,
                px: 3,
              }}
            >
              Voltar para o Dashboard
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleLogin}
              sx={{
                py: 1.5,
                px: 3,
              }}
            >
              Fazer Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;