import React from 'react';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { desktopMediaQuery } from '../../theme/theme';

const LocationSection: React.FC = () => {
  const { data: siteSettings, isLoading, isError } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });

  return (
    <Box
      id="nossa-localizacao"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: '100vh', md: 'auto' },
        pt: { xs: 1.5, md: 4 },
        pb: { xs: 4, md: 8 },
        backgroundColor: 'background.default',
        [desktopMediaQuery]: {
          minHeight: 'calc(100vh - 88px)',
          pb: 10,
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1, color: 'primary.main' }}>
            Nossa Localização
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', lineHeight: 1.5 }}>
            Venha nos visitar e conhecer nossa casa espiritual
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError || !siteSettings ? (
          <Alert severity="warning">Não foi possível carregar a localização da casa neste momento.</Alert>
        ) : (
          <>
            <Card sx={{ overflow: 'hidden', borderRadius: 2, mb: 2 }}>
              <Box
                component="iframe"
                src={siteSettings.mapEmbedUrl || 'https://www.google.com/maps'}
                sx={{
                  width: '100%',
                  height: { xs: 220, md: 340 },
                  border: 'none',
                  [desktopMediaQuery]: {
                    height: 420,
                  },
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>

            <Box
              sx={{
                mt: 3,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#2579d1',
                color: 'white',
              }}
            >
              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Casa de Caridade Caboclo Batuara
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, opacity: 0.95 }}>
                      Uma casa dedicada à caridade, ao amor e à elevação espiritual.
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, opacity: 0.95 }}>
                      "Fora da caridade não há salvação"
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.7, opacity: 0.98 }}>
                      {`${siteSettings.street}, ${siteSettings.number}${siteSettings.complement ? ` - ${siteSettings.complement}` : ''} - ${siteSettings.district}, ${siteSettings.city} - ${siteSettings.state}, ${siteSettings.zipCode}`}
                    </Typography>
                    {!!siteSettings.referenceNotes && (
                      <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.7, opacity: 0.9 }}>
                        {siteSettings.referenceNotes}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Redes Sociais
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, opacity: 0.95 }}>
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
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.95 }}>
                    © {new Date().getFullYear()} Casa de Caridade Caboclo Batuara. Todos os direitos reservados.
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Desenvolvido com amor e caridade para servir a comunidade espiritual.
                  </Typography>
                </Box>
              </Container>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LocationSection;
