import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import {
  COOKIE_CONSENT_EVENT,
  CookieConsent,
  hasThirdPartyConsent,
  openCookiePreferences,
} from '../../utils/cookieConsent';

const LocationSection: React.FC = () => {
  const { data: siteSettings, isLoading, isError } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });
  const [mapConsent, setMapConsent] = useState(hasThirdPartyConsent);

  useEffect(() => {
    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      setMapConsent(detail?.thirdParty === true);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  return (
    <Box
      id="nossa-localizacao"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        height: { xs: 'calc(100dvh - 56px)', md: 'calc(100dvh - 64px)' },
        minHeight: { xs: 'calc(100dvh - 56px)', md: 'calc(100dvh - 64px)' },
        maxHeight: { xs: 'calc(100dvh - 56px)', md: 'calc(100dvh - 64px)' },
        pt: { xs: 1, md: 1.5 },
        pb: { xs: 1, md: 1.5 },
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 0.75, md: 1.25 }, flexShrink: 0 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.45rem', md: '2.25rem' },
              fontWeight: 600,
              mb: { xs: 0.25, md: 0.35 },
              color: 'primary.main',
              lineHeight: 1.2,
            }}
          >
            Nossa Localização
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.3,
              fontSize: { xs: '0.85rem', md: '1.05rem' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Venha nos visitar e conhecer nossa casa espiritual
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : isError || !siteSettings ? (
          <Alert severity="warning">Não foi possível carregar a localização da casa neste momento.</Alert>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, md: 1.25 },
            }}
          >
            <Card
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                flex: 1,
                minHeight: { xs: 220, sm: 280, md: 320 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {mapConsent ? (
                <Box
                  component="iframe"
                  src={siteSettings.mapEmbedUrl || 'https://www.google.com/maps'}
                  title="Mapa da Casa de Caridade Caboclo Batuara"
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: 220, sm: 280, md: 320 },
                    border: 'none',
                    display: 'block',
                    flex: 1,
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: { xs: 220, sm: 280, md: 320 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <LocationOnIcon color="primary" sx={{ fontSize: 48 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {`${siteSettings.street}, ${siteSettings.number} - ${siteSettings.city}/${siteSettings.state}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, fontSize: '0.85rem' }}>
                    O mapa usa cookies de terceiros (Google). Aceite os cookies nas preferências
                    para visualizá-lo aqui, ou abra diretamente no Google Maps.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="contained"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${siteSettings.street}, ${siteSettings.number}, ${siteSettings.city}, ${siteSettings.state}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir no Google Maps
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openCookiePreferences()}>
                      Preferências de cookies
                    </Button>
                  </Box>
                </Box>
              )}
            </Card>

            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#2579d1',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <Box sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 1, md: 1.5 } }}>
                <Grid container spacing={{ xs: 1, md: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 0.25, fontSize: { xs: '0.9rem', md: '1.05rem' }, lineHeight: 1.3 }}
                    >
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
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: 'italic',
                        mb: 0.5,
                        opacity: 0.95,
                        lineHeight: 1.3,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      "Fora da caridade não há salvação"
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.35,
                        opacity: 0.98,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      {`${siteSettings.street}, ${siteSettings.number}${siteSettings.complement ? ` - ${siteSettings.complement}` : ''} - ${siteSettings.district}, ${siteSettings.city} - ${siteSettings.state}, ${siteSettings.zipCode}`}
                    </Typography>
                    {!!siteSettings.referenceNotes && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.35,
                          lineHeight: 1.3,
                          opacity: 0.9,
                          fontSize: { xs: '0.7rem', md: '0.8rem' },
                          display: { xs: 'none', md: 'block' },
                        }}
                      >
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: { xs: 0, md: 0.5 } }}>
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

                <Divider sx={{ my: { xs: 0.75, md: 1.25 }, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1.5, md: 2 }, mb: 0.5, flexWrap: 'wrap' }}>
                    <Link
                      href="/politica-de-privacidade"
                      color="inherit"
                      underline="hover"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.78rem' }, opacity: 0.9 }}
                    >
                      Política de Privacidade
                    </Link>
                    <Link
                      component="button"
                      type="button"
                      color="inherit"
                      underline="hover"
                      onClick={() => openCookiePreferences()}
                      sx={{ fontSize: { xs: '0.7rem', md: '0.78rem' }, opacity: 0.9, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
                    >
                      Preferências de cookies
                    </Link>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: { xs: 0, md: 0.25 },
                      opacity: 0.95,
                      fontSize: { xs: '0.7rem', md: '0.8rem' },
                      lineHeight: 1.3,
                    }}
                  >
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
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LocationSection;
