import * as React from 'react';
import { Alert, Avatar, Box, Card, CardContent, CircularProgress, Container, Grid, Typography, useMediaQuery } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { desktopMediaQuery } from '../../theme/theme';

const AboutSection = () => {
  const isDesktop = useMediaQuery('(min-width:1024px)');

  const { data: siteSettings, isLoading, isError } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });

  const values = [
    {
      icon: <MenuBookIcon sx={{ fontSize: { xs: 22, sm: 26, md: 28 } }} />,
      title: 'Tradição',
      text: 'Preservando os ensinamentos ancestrais',
      color: 'primary.main',
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: { xs: 22, sm: 26, md: 28 } }} />,
      title: 'Caridade',
      text: 'Assistência espiritual gratuita, orientação e consolação para todos que nos procuram, sem distinção.',
      color: '#f4b400',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: { xs: 22, sm: 26, md: 28 } }} />,
      title: 'Fraternidade',
      text: 'Uma família espiritual unida pelo amor, onde todos são tratados como irmãos.',
      color: 'success.main',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: { xs: 22, sm: 26, md: 28 } }} />,
      title: 'Espiritualidade',
      text: 'Desenvolvimento espiritual através do estudo, da oração e da prática da mediunidade com responsabilidade.',
      color: 'info.main',
    },
  ];

  const historyTitle = (siteSettings as any)?.historyTitle?.trim() || 'Nossa História';
  const historySubtitle = (siteSettings as any)?.historySubtitle?.trim();
  const historyHtml = (siteSettings as any)?.historyHtml;
  const missionText = (siteSettings as any)?.historyMissionText;

  return (
    <>
      <Box
        id="nossa-historia"
        sx={{
          scrollMarginTop: { xs: 56, md: 64 },
          minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
          pt: { xs: 1.5, md: 2 },
          pb: { xs: 4, md: 8 },
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Alert severity="warning">Não foi possível carregar a história institucional no momento.</Alert>
          )}

          {!isLoading && !isError && (
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                {historyTitle}
              </Typography>
              {historySubtitle && (
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
                  {historySubtitle}
                </Typography>
              )}
            </Box>
          )}

          <Box
            sx={{
              maxWidth: isDesktop ? 1100 : 980,
              mx: 'auto',
              mb: isDesktop ? 6 : 4,
              px: { xs: 2, md: 3 },
            }}
          >
            {!isLoading && !isError && isDesktop ? (
              <Box
                sx={{
                  '& p': { lineHeight: 2, marginBottom: 2.5, textAlign: 'justify', color: 'text.primary' },
                  '& img': { display: 'none' },
                  '& ul': { pl: 3 },
                  '& a': { color: 'primary.main' },
                  '& blockquote': {
                    borderLeft: 4,
                    borderColor: 'primary.main',
                    pl: 2,
                    ml: 0,
                    color: 'text.secondary',
                  },
                }}
              >
                {historyHtml ? (
                  <Box dangerouslySetInnerHTML={{ __html: historyHtml }} />
                ) : (
                  <Alert severity="info">Conteúdo indisponível no momento.</Alert>
                )}
              </Box>
            ) : !isLoading && !isError ? (
              <Box
                sx={{
                  '& p': { lineHeight: 2, marginBottom: 2.5, textAlign: 'justify', color: 'text.primary' },
                  '& img': { display: 'none' },
                  '& ul': { pl: 3 },
                  '& a': { color: 'primary.main' },
                  '& blockquote': {
                    borderLeft: 4,
                    borderColor: 'primary.main',
                    pl: 2,
                    ml: 0,
                    color: 'text.secondary',
                  },
                }}
              >
                {historyHtml ? (
                  <Box dangerouslySetInnerHTML={{ __html: historyHtml }} />
                ) : (
                  <Alert severity="info">Conteúdo indisponível no momento.</Alert>
                )}
              </Box>
            ) : null}
          </Box>
        </Container>
      </Box>

      <Box
        id="nossa-missao"
        sx={{
          scrollMarginTop: { xs: 56, md: 64 },
          minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
          pt: { xs: 1.125, md: 2 },
          pb: { xs: 2.125, md: 6 },
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 1.5, md: 4 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
              Nossa Missão
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
              Valores que guiam nosso trabalho espiritual e social
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            <Box sx={{ maxWidth: 560, mx: 'auto', mb: { xs: 1, md: 3 } }}>
              {!isLoading && !isError && missionText ? (
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    boxShadow: 3,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.125, md: 2.25 } }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: { xs: 44, md: 60 },
                        height: { xs: 44, md: 60 },
                        mx: 'auto',
                        mb: { xs: 0.9, md: 1.5 },
                        '& svg': {
                          fontSize: { xs: 22, md: 30 },
                        },
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: { xs: 0.6, md: 1 } }}>
                      Missão
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      title={missionText}
                      sx={{
                        lineHeight: 1.45,
                        fontSize: { xs: '0.82rem', md: '0.9rem' },
                      }}
                    >
                      {missionText}
                    </Typography>
                  </CardContent>
                </Card>
              ) : !isLoading && !isError ? (
                <Alert severity="info">Conteúdo de missão indisponível no momento.</Alert>
              ) : null}
            </Box>

            <Grid container spacing={{ xs: 1, md: 2 }}>
              {values.map((item) => (
                <Grid key={item.title} size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 0.875, md: 1.75 } }}>
                      <Avatar
                        sx={{
                          bgcolor: item.color,
                          width: { xs: 40, sm: 50, md: 52 },
                          height: { xs: 40, sm: 50, md: 52 },
                          mx: 'auto',
                          mb: { xs: 0.625, md: 1.5 },
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: { xs: 0.5, md: 1 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.45,
                          fontSize: { xs: '0.78rem', sm: '0.9rem', md: '0.9rem' },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AboutSection;
