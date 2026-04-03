import React from 'react';
import { Alert, Avatar, Box, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';

const AboutSection: React.FC = () => {
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

  return (
    <Box id="about" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError || !siteSettings ? (
          <Alert severity="warning">Não foi possível carregar a história institucional no momento.</Alert>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                {siteSettings.historyTitle || historyTitle}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
                {siteSettings.historySubtitle || historySubtitle}
              </Typography>
            </Box>

            <Box
              sx={{
                maxWidth: 980,
                mx: 'auto',
                mb: 4,
                px: { xs: 2, md: 3 },
              }}
            >
              <Box sx={{ overflow: 'hidden' }}>
                <Box
                  sx={{
                    float: { xs: 'none', md: 'right' },
                    width: { xs: '100%', md: 320 },
                    minHeight: { xs: 180, md: 220 },
                    background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                    borderRadius: 1,
                    color: 'white',
                    p: { xs: 3, md: 2.5 },
                    textAlign: 'center',
                    ml: { xs: 0, md: 3 },
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                      ✦ Missão
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                      {siteSettings.historyMissionText}
                    </Typography>
                  </Box>
                </Box>

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
                  {siteSettings.historyHtml ? (
                    <Box dangerouslySetInnerHTML={{ __html: siteSettings.historyHtml }} />
                  ) : (
                    historyParagraphs.map((paragraph) => (
                      <Typography key={paragraph} component="p">
                        {paragraph}
                      </Typography>
                    ))
                  )}
                </Box>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 980, mx: 'auto' }}>
              {[
                { icon: <MenuBookIcon sx={{ fontSize: 32 }} />, title: 'Tradição', text: 'Preservando os ensinamentos ancestrais', color: 'primary.main' },
                { icon: <FavoriteIcon sx={{ fontSize: 32 }} />, title: 'Caridade', text: 'Assistência espiritual gratuita, orientação e consolação para todos que nos procuram, sem distinção.', color: '#f4b400' },
                { icon: <PeopleIcon sx={{ fontSize: 32 }} />, title: 'Fraternidade', text: 'Uma família espiritual unida pelo amor, onde todos são tratados como irmãos.', color: 'success.main' },
                { icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />, title: 'Espiritualidade', text: 'Desenvolvimento espiritual através do estudo, da oração e da prática da mediunidade com responsabilidade.', color: 'info.main' },
              ].map((item) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: item.color,
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
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
  );
};

export default AboutSection;
