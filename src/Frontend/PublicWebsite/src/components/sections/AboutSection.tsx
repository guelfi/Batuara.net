import React from 'react';
import { Alert, Avatar, Box, Card, CardContent, CircularProgress, Container, Grid, Typography, useMediaQuery } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { desktopMediaQuery } from '../../theme/theme';

const AboutSection: React.FC = () => {
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
    { icon: <MenuBookIcon sx={{ fontSize: 32 }} />, title: 'Tradição', text: 'Preservando os ensinamentos ancestrais', color: 'primary.main' },
    { icon: <FavoriteIcon sx={{ fontSize: 32 }} />, title: 'Caridade', text: 'Assistência espiritual gratuita, orientação e consolação para todos que nos procuram, sem distinção.', color: '#f4b400' },
    { icon: <PeopleIcon sx={{ fontSize: 32 }} />, title: 'Fraternidade', text: 'Uma família espiritual unida pelo amor, onde todos são tratados como irmãos.', color: 'success.main' },
    { icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />, title: 'Espiritualidade', text: 'Desenvolvimento espiritual através do estudo, da oração e da prática da mediunidade com responsabilidade.', color: 'info.main' },
  ];

  const missionText =
    (siteSettings as any)?.historyMissionText ||
    'Servir a Espiritualidade através da caridade e do amor ao próximo, acolhendo a todos com respeito, humildade e fraternidade.';

  return (
    <>
      <Box
        id="nossa-historia"
        sx={{
          scrollMarginTop: { xs: 56, md: 88 },
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
              <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 7 }}>
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
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    id="nossa-missao"
                    sx={{
                      scrollMarginTop: { xs: 56, md: 88 },
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.4rem', md: '2rem' },
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 2,
                        textAlign: { xs: 'center', md: 'left' },
                      }}
                    >
                      Nossa Missão
                    </Typography>
                    <Card sx={{ boxShadow: 3, borderRadius: 2, height: '100%' }}>
                      <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Missão
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                          {missionText}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
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

          {isDesktop && (
            <>
              <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                  Nossos Valores
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
                  Valores que guiam nosso trabalho espiritual e social
                </Typography>
              </Box>

              <Grid container spacing={{ xs: 2, md: 3 }} sx={{ maxWidth: 1100, mx: 'auto' }}>
                {values.map((item) => (
                  <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                        boxShadow: 3,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Avatar
                          sx={{
                            bgcolor: item.color,
                            width: { xs: 52, md: 64 },
                            height: { xs: 52, md: 64 },
                            mx: 'auto',
                            mb: 2,
                            '& svg': {
                              fontSize: { xs: 26, md: 32 },
                            },
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {item.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      </Box>

      {!isDesktop && (
        <Box
          id="nossa-missao"
          sx={{
            scrollMarginTop: { xs: 56, md: 88 },
            minHeight: { xs: '100vh', md: 'auto' },
            pt: { xs: 1.5, md: 4 },
            pb: { xs: 4, md: 8 },
            backgroundColor: 'background.paper',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                Nossa Missão
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
                Valores que guiam nosso trabalho espiritual e social
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ maxWidth: 980, mx: 'auto' }}>
              {[
                { icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />, title: 'Missão', text: missionText, color: 'primary.main' },
                ...values,
              ].map((item) => (
                <Grid
                  key={item.title}
                  size={{
                    xs: item.title === 'Missão' ? 12 : 6,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Avatar
                        sx={{
                          bgcolor: item.color,
                          width: { xs: 52, md: 64 },
                          height: { xs: 52, md: 64 },
                          mx: 'auto',
                          mb: 2,
                          '& svg': {
                            fontSize: { xs: 26, md: 32 },
                          },
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}
    </>
  );
};

export default AboutSection;
