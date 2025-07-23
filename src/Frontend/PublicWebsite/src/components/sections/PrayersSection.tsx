import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface Prayer {
  id: string;
  title: string;
  content: string;
  category: 'umbanda' | 'espirita' | 'geral';
  tags: string[];
}

const prayers: Prayer[] = [
  {
    id: '1',
    title: 'Pai Nosso da Umbanda',
    content: `Pai nosso que estais no infinito,
Santificado seja o vosso reino de amor e caridade,
Venha a nós a vossa luz,
Seja feita a vossa vontade assim na Terra como no infinito.

O pão nosso espiritual de cada dia nos dai hoje,
Perdoai as nossas dívidas assim como nós perdoamos aos nossos devedores,
E não nos deixeis cair em tentação,
Mas livrai-nos de todo mal.

Porque vosso é o reino, o poder e a glória,
Para todo o sempre.
Saravá!`,
    category: 'umbanda',
    tags: ['oração', 'fundamental', 'pai nosso']
  },
  {
    id: '2',
    title: 'Oração de Caritas',
    content: `Deus, nosso Pai, que sois todo poder e bondade,
Dai força àquele que passa pela provação,
Dai luz àquele que procura a verdade,
Ponde no coração do homem a compaixão e a caridade.

Deus! Dai ao viajor a estrela guia,
Ao aflito a consolação,
Ao doente o repouso.

Pai! Dai ao culpado o arrependimento,
Ao espírito a verdade,
À criança o guia,
Ao órfão o pai.

Senhor! Que a vossa bondade se estenda sobre tudo o que criastes.
Piedade, Senhor, para aqueles que vos não conhecem,
Esperança para aqueles que sofrem.

Que a vossa bondade permita aos espíritos consoladores
Derramarem por toda parte a paz, a esperança e a fé.

Deus! Um raio, uma faísca do vosso amor pode abrasar a Terra;
Deixai-nos beber nas fontes dessa bondade fecunda e infinita,
E todas as lágrimas secarão, todas as dores se acalmarão.

Um só coração, um só pensamento subirá até vós,
Como um grito de reconhecimento e de amor.

Como Moisés sobre a montanha, nós vos esperamos de braços abertos,
Ó Poder! Ó Bondade! Ó Beleza! Ó Perfeição!
E queremos de alguma sorte merecer a vossa misericórdia.

Deus! Dai-nos a força de ajudar o progresso,
A fim de subirmos até vós;
Dai-nos a caridade pura,
Dai-nos a fé e a razão;
Dai-nos a simplicidade que fará de nossas almas
O espelho onde se refletirá a vossa santa imagem.

Assim seja, Senhor!`,
    category: 'espirita',
    tags: ['caritas', 'allan kardec', 'oração']
  },
  {
    id: '3',
    title: 'Oração a Oxalá',
    content: `Salve Oxalá, Pai de todos os Orixás,
Senhor da paz e da harmonia,
Que vossa luz ilumine nossos caminhos,
E vossa sabedoria guie nossos passos.

Oxalá, Pai da criação,
Dai-nos força para vencer as dificuldades,
Paciência para suportar as provações,
E amor para perdoar as ofensas.

Que vossa benção esteja sempre conosco,
Protegendo nossa família e nossos irmãos,
Iluminando nossa mente e nosso coração,
Para que possamos servir com humildade e caridade.

Salve Oxalá!
Epa Babá!`,
    category: 'umbanda',
    tags: ['oxalá', 'orixá', 'proteção']
  },
  {
    id: '4',
    title: 'Oração do Médium',
    content: `Senhor Jesus, que sois o caminho, a verdade e a vida,
Iluminai-me para que eu possa ser um instrumento de vossa paz.

Que os espíritos de luz me assistam nesta tarefa sagrada,
E que eu possa transmitir apenas palavras de consolação,
Esperança e amor aos corações aflitos.

Afastai de mim toda vaidade e orgulho,
Para que eu seja apenas um canal humilde
De vossa infinita misericórdia.

Protegei-me, Senhor, de toda influência negativa,
E fazei com que apenas espíritos elevados
Se aproximem para o trabalho de caridade.

Que eu possa servir com humildade e dedicação,
Sempre lembrando que sem vós nada posso fazer.

Assim seja, Senhor!`,
    category: 'espirita',
    tags: ['médium', 'trabalho espiritual', 'proteção']
  }
];

const PrayersSection: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<string | false>(false);

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'umbanda':
        return 'Umbanda';
      case 'espirita':
        return 'Espírita';
      case 'geral':
        return 'Geral';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'umbanda':
        return theme.palette.secondary.main;
      case 'espirita':
        return theme.palette.primary.main;
      case 'geral':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch = prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prayer.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prayer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === null || prayer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAccordionChange = (prayerId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPrayer(isExpanded ? prayerId : false);
  };

  return (
    <Box id="prayers" sx={{ py: 8, backgroundColor: 'background.default' }}>
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
            Orações e Preces
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Palavras de fé, esperança e amor para elevar a alma
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <TextField
              placeholder="Buscar orações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label="Todas"
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? 'primary' : 'default'}
                variant={selectedCategory === null ? 'filled' : 'outlined'}
              />
              <Chip
                label="Umbanda"
                onClick={() => setSelectedCategory('umbanda')}
                color={selectedCategory === 'umbanda' ? 'secondary' : 'default'}
                variant={selectedCategory === 'umbanda' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Espírita"
                onClick={() => setSelectedCategory('espirita')}
                color={selectedCategory === 'espirita' ? 'primary' : 'default'}
                variant={selectedCategory === 'espirita' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Geral"
                onClick={() => setSelectedCategory('geral')}
                color={selectedCategory === 'geral' ? 'info' : 'default'}
                variant={selectedCategory === 'geral' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
        </Box>

        {filteredPrayers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma oração encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros de busca.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredPrayers.map((prayer) => (
              <Grid item xs={12} key={prayer.id}>
                <Accordion
                  expanded={expandedPrayer === prayer.id}
                  onChange={handleAccordionChange(prayer.id)}
                  sx={{
                    '&:before': {
                      display: 'none',
                    },
                    boxShadow: theme.shadows[2],
                    '&.Mui-expanded': {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'background.paper',
                      '&.Mui-expanded': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {prayer.category === 'umbanda' && <AutoAwesomeIcon />}
                        {prayer.category === 'espirita' && <MenuBookIcon />}
                        {prayer.category === 'geral' && <FavoriteIcon />}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {prayer.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={getCategoryLabel(prayer.category)}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(prayer.category),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        color: 'text.primary',
                      }}
                    >
                      {prayer.content}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {prayer.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Card sx={{ p: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              "A oração é o mais poderoso meio de cura que existe"
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              - Emmanuel (psicografado por Francisco Cândido Xavier)
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default PrayersSection;