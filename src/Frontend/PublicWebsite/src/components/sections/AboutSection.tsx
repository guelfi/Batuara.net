import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const AboutSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box id="about" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Nossa História
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Uma jornada de fé, caridade e amor ao próximo
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              A Casa de Caridade Batuara nasceu do desejo de servir a Deus através da caridade 
              e do amor ao próximo. Fundada com base nos ensinamentos de Jesus Cristo e na 
              sabedoria ancestral dos Orixás, nossa casa é um lar espiritual para todos que 
              buscam a luz, a paz e a elevação da alma.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Trabalhamos com a Doutrina Espírita e a Umbanda, unindo a ciência, a filosofia 
              e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" 
              guia todas as nossas ações e nos lembra constantemente de nossa missão principal: 
              servir com amor e humildade.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos 
              para todos que nos procuram, independentemente de sua condição social, raça ou 
              credo religioso. Aqui, todos são bem-vindos e tratados como irmãos.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Box>
                <AutoAwesomeIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                  Missão
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Promover a caridade, o amor fraterno e a elevação espiritual através dos 
                  ensinamentos de Jesus e da sabedoria dos Orixás, oferecendo assistência 
                  espiritual gratuita a todos que buscam a luz.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <HistoryIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Tradição
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Anos de experiência na prática espírita e umbandista, mantendo viva a 
                  tradição e os ensinamentos ancestrais.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Caridade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assistência espiritual gratuita, orientação e consolação para todos que 
                  nos procuram, sem distinção.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Fraternidade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uma família espiritual unida pelo amor, onde todos são tratados como 
                  irmãos em Cristo.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'info.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Espiritualidade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Desenvolvimento espiritual através do estudo, da oração e da prática 
                  da mediunidade com responsabilidade.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutSection;