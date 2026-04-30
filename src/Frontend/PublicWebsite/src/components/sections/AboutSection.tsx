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
  const historyTitle = 'Nossa História';
  const historySubtitle = 'Uma jornada de fé, caridade e amor ao próximo';
  const historyParagraphs = [
    'A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Ciro na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.',
    "Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema 'Fora da caridade não há salvação' guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.",
    'Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.',
  ];

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

  const missionText =
    (siteSettings as any)?.historyMissionText ||
    'Servir a Espiritualidade através da caridade e do amor ao próximo, acolhendo a todos com respeito, humildade e fraternidade.';

  return (
    <>
      <Box
        id="nossa-historia"
        sx={{
          scrollMarginTop: { xs: 56, md: 64 },
          minHeight: { xs: '100vh', md: 'auto' },
          pt: { xs: 1.5, md: 2 },
          pb: { xs: 4, md: 8 },
          backgroundColor: 'background.default',
          [desktopMediaQuery]: {
            minHeight: 'calc(100vh - 88px)',
            pb: 10,
          },
        }}
      >
        <Container maxWidth="lg">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="warning">Não foi possível carregar a história institucional no momento.</Alert>
          ) : null}

          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
              {(siteSettings as any)?.historyTitle || historyTitle}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
              {(siteSettings as any)?.historySubtitle || historySubtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              maxWidth: isDesktop ? 1100 : 980,
              mx: 'auto',
              mb: isDesktop ? 6 : 4,
              px: { xs: 2, md: 3 },
            }}
          >
            {isDesktop ? (
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
                {(siteSettings as any)?.historyHtml ? (
                  <Box dangerouslySetInnerHTML={{ __html: (siteSettings as any)?.historyHtml }} />
                ) : (
                  historyParagraphs.map((paragraph) => (
                    <Typography key={paragraph} component="p">
                      {paragraph}
                    </Typography>
                  ))
                )}
              </Box>
            ) : (
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
                {(siteSettings as any)?.historyHtml ? (
                  <Box dangerouslySetInnerHTML={{ __html: (siteSettings as any)?.historyHtml }} />
                ) : (
                  historyParagraphs.map((paragraph) => (
                    <Typography key={paragraph} component="p">
                      {paragraph}
                    </Typography>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Box
        id="nossa-missao"
        sx={{
          scrollMarginTop: { xs: 56, md: 64 },
          minHeight: { xs: 'calc(100vh - 56px)', md: 'auto' },
          pt: { xs: 1.125, md: 2 },
          pb: { xs: 2.125, md: 6 },
          backgroundColor: 'background.paper',
          [desktopMediaQuery]: {
            minHeight: 'calc(100vh - 88px)',
            pb: 6,
          },
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
