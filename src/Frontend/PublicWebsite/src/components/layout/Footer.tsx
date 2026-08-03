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
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Casa de Caridade Caboclo Batuara
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.4, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Uma casa dedicada à caridade, ao amor e à elevação espiritual.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.4, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              "Fora da caridade não há salvação"
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Redes Sociais
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.4, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Acompanhe nossas atividades e fique por dentro de todos os eventos e ensinamentos.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <IconButton
                component={Link}
                href={siteSettings?.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Casa Batuara"
                sx={{ color: 'white', p: 0.25 }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <Link
                href={siteSettings?.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
              >
                @{siteSettings?.instagram}
              </Link>
            </Box>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' }, opacity: 0.9, lineHeight: 1.4 }}>
              Siga-nos para receber atualizações sobre giras, palestras e eventos especiais.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 1.25, md: 1.5 }, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 0.25, fontSize: { xs: '0.75rem', md: '0.8rem' }, lineHeight: 1.35 }}>
            © {currentYear} Casa de Caridade Caboclo Batuara. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' }, opacity: 0.8, lineHeight: 1.35 }}>
            Desenvolvido com amor e caridade para servir a comunidade espiritual.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
