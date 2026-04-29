import React from 'react';
import { Box, Container, Divider, Grid, IconButton, Link, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const { data: siteSettings } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });

  return (
    <Box
      component="footer"
      id="redes-sociais"
      sx={{
        scrollMarginTop: { xs: 56, md: 88 },
        minHeight: 'auto',
        backgroundColor: '#2579d1',
        color: 'white',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Casa de Caridade Caboclo Batuara
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Uma casa dedicada à caridade, ao amor e à elevação espiritual.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "Fora da caridade não há salvação"
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Redes Sociais
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Acompanhe nossas atividades e fique por dentro de todos os eventos e ensinamentos.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton
                component={Link}
                href={siteSettings?.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Casa Batuara"
                sx={{ color: 'white', p: 0.5 }}
              >
                <InstagramIcon />
              </IconButton>
              <Link
                href={siteSettings?.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ fontSize: '0.95rem' }}
              >
                @{siteSettings?.instagram}
              </Link>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.6 }}>
              Siga-nos para receber atualizações sobre giras, palestras e eventos especiais.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            © {currentYear} Casa de Caridade Caboclo Batuara. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
            Desenvolvido com amor e caridade para servir a comunidade espiritual.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
