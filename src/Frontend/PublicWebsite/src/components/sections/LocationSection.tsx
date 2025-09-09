import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
} from '@mui/material';

const LocationSection: React.FC = () => {

  // Casa de Caridade Batuara - Coordenadas reais
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.8!2d-46.5213317!3d-23.4310269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cef4d679ef9ab5%3A0x79a018e2faeb00d7!2sCASA%20DE%20CARIDADE%20BATUARA!5e0!3m2!1spt-BR!2sbr!4v1642000000000";

  return (
    <Box id="location" sx={{ py: 1, backgroundColor: 'background.default' }}>
      {/* Desktop Layout */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Container maxWidth="lg">
          {/* Header da seção */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.7rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 0.5,
                color: 'primary.main',
              }}
            >
              Nossa Localização
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.4,
                fontSize: '1.1rem',
              }}
            >
              Venha nos visitar e conhecer nossa casa espiritual
            </Typography>
          </Box>

          {/* Mapa com altura reduzida para 80% */}
          <Box sx={{ mb: 0 }}>
            <Card sx={{ overflow: 'hidden' }}>
              <Box
                component="iframe"
                src={mapSrc}
                sx={{
                  width: '100%',
                  height: '320px', // Reduzido de 400px para 320px (80%)
                  border: 'none',
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </Box>
        </Container>


      </Box>

      {/* Mobile Layout */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Container maxWidth="sm">
          {/* Header da seção */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.7rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 0.5,
                color: 'primary.main',
              }}
            >
              Nossa Localização
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.4,
                mb: 1,
                fontSize: '1rem',
              }}
            >
              Venha nos visitar e conhecer nossa casa espiritual
            </Typography>
          </Box>

          {/* Mapa com altura reduzida para 80% */}
          <Card sx={{ mb: 0, overflow: 'hidden' }}>
            <Box
              component="iframe"
              src={mapSrc}
              sx={{
                width: '100%',
                height: '160px', // Reduzido de 200px para 160px (80%)
                border: 'none',
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default LocationSection;