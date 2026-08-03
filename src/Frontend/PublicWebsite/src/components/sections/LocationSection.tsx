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
        minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        pt: { xs: 1.5, md: 2 },
        pb: { xs: 1.5, md: 2 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.45rem', md: '2.5rem' }, fontWeight: 600, mb: { xs: 0.25, md: 0.5 }, color: 'primary.main' }}>
            Nossa Localização
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.35,
              fontSize: { xs: '0.85rem', md: '1.15rem' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
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
            <Card sx={{ overflow: 'hidden', borderRadius: 2, mb: { xs: 1, md: 2 } }}>
              <Box
                component="iframe"
                src={siteSettings.mapEmbedUrl || 'https://www.google.com/maps'}
                sx={{
                  width: '100%',
                  height: { xs: 150, md: 260 },
                  border: 'none',
                  display: 'block',
                  [desktopMediaQuery]: {
                    height: 300,
                  },
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>

            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#2579d1',
                color: 'white',
              }}
            >
              <Box sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 1.25, md: 2 } }}>
                <Grid container spacing={{ xs: 1, md: 2.5 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, fontSize: { xs: '0.9rem', md: '1.05rem' }, lineHeight: 1.3 }}>
                      Casa de Caridade Caboclo Batuara
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 0.25,
                        lineHeight: 1.35,
                        opacity: 0.95,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      Uma casa dedicada à caridade, ao amor e à elevação espiritual.
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 0.5, opacity: 0.95, lineHeight: 1.3, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      "Fora da caridade não há salvação"
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35, opacity: 0.98, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      {`${siteSettings.street}, ${siteSettings.number}${siteSettings.complement ? ` - ${siteSettings.complement}` : ''} - ${siteSettings.district}, ${siteSettings.city} - ${siteSettings.state}, ${siteSettings.zipCode}`}
                    </Typography>
                    {!!siteSettings.referenceNotes && (
                      <Typography variant="body2" sx={{ mt: 0.35, lineHeight: 1.3, opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.8rem' }, display: { xs: 'none', md: 'block' } }}>
                        {siteSettings.referenceNotes}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.25,
                        fontSize: { xs: '0.9rem', md: '1.05rem' },
                        lineHeight: 1.3,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      Redes Sociais
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 0.75,
                        lineHeight: 1.4,
                        opacity: 0.95,
                        fontSize: '0.875rem',
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      Acompanhe nossas atividades e fique por dentro de todos os eventos e ensinamentos.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: { xs: 0, md: 0.75 } }}>
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
                        sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, lineHeight: 1.3 }}
                      >
                        @{siteSettings?.instagram}
                      </Link>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.8rem',
                        opacity: 0.9,
                        lineHeight: 1.4,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      Siga-nos para receber atualizações sobre giras, palestras e eventos especiais.
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: { xs: 0.85, md: 1.5 }, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: { xs: 0, md: 0.25 }, opacity: 0.95, fontSize: { xs: '0.7rem', md: '0.8rem' }, lineHeight: 1.3 }}>
                    © {new Date().getFullYear()} Casa de Caridade Caboclo Batuara. Todos os direitos reservados.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.75rem',
                      opacity: 0.85,
                      lineHeight: 1.35,
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    Desenvolvido com amor e caridade para servir a comunidade espiritual.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LocationSection;
