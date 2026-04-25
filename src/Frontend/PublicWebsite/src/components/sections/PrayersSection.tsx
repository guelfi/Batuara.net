import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Card,
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
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { SpiritualCategory, SpiritualContentType } from '../../types';

const PrayersSection: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SpiritualCategory | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<number | false>(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-spiritual-contents'],
    queryFn: () => publicApi.getSpiritualContents({ pageNumber: 1, pageSize: 100, sort: 'displayOrder:asc' }),
  });

  const normalizeType = (type: SpiritualContentType | string): SpiritualContentType => {
    if (typeof type === 'number') {
      return type;
    }

    switch (type.trim().toLowerCase()) {
      case 'prayer':
      case 'oração':
      case 'oracao':
        return SpiritualContentType.Prayer;
      case 'teaching':
      case 'ensinamento':
        return SpiritualContentType.Teaching;
      case 'doctrine':
      case 'doutrina':
        return SpiritualContentType.Doctrine;
      case 'hymn':
      case 'ponto cantado':
        return SpiritualContentType.Hymn;
      case 'ritual':
        return SpiritualContentType.Ritual;
      default:
        return SpiritualContentType.Prayer;
    }
  };

  const normalizeCategory = (category: SpiritualCategory | string): SpiritualCategory => {
    if (typeof category === 'number') {
      return category;
    }

    switch (category.trim().toLowerCase()) {
      case 'umbanda':
        return SpiritualCategory.Umbanda;
      case 'kardecismo':
      case 'espírita':
      case 'espirita':
        return SpiritualCategory.Kardecismo;
      case 'general':
      case 'geral':
        return SpiritualCategory.General;
      case 'orixás':
      case 'orixas':
        return SpiritualCategory.Orixas;
      default:
        return SpiritualCategory.General;
    }
  };

  const getCategoryLabel = (category: SpiritualCategory): string => {
    switch (category) {
      case SpiritualCategory.Umbanda:
        return 'Umbanda';
      case SpiritualCategory.Kardecismo:
        return 'Espírita';
      case SpiritualCategory.General:
        return 'Geral';
      case SpiritualCategory.Orixas:
        return 'Orixás';
      default:
        return 'Geral';
    }
  };

  const getCategoryColor = (category: SpiritualCategory): string => {
    switch (category) {
      case SpiritualCategory.Umbanda:
        return theme.palette.secondary.main;
      case SpiritualCategory.Kardecismo:
        return theme.palette.primary.main;
      case SpiritualCategory.General:
        return theme.palette.info.main;
      case SpiritualCategory.Orixas:
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getTypeLabel = (type: SpiritualContentType): string => {
    switch (type) {
      case SpiritualContentType.Prayer:
        return 'Oração';
      case SpiritualContentType.Teaching:
        return 'Ensinamento';
      case SpiritualContentType.Doctrine:
        return 'Doutrina';
      case SpiritualContentType.Hymn:
        return 'Ponto Cantado';
      case SpiritualContentType.Ritual:
        return 'Ritual';
      default:
        return 'Conteúdo';
    }
  };

  const allContents = data?.data ?? [];
  const visibleContents = allContents.filter((item) =>
    item.isActive &&
    [SpiritualContentType.Prayer, SpiritualContentType.Teaching, SpiritualContentType.Doctrine, SpiritualContentType.Hymn]
      .includes(normalizeType(item.type))
  );

  const filteredPrayers = useMemo(
    () =>
      visibleContents.filter((prayer) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          prayer.title.toLowerCase().includes(term) ||
          prayer.content.toLowerCase().includes(term) ||
          prayer.source.toLowerCase().includes(term);
        const matchesCategory = selectedCategory === null || normalizeCategory(prayer.category) === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [searchTerm, selectedCategory, visibleContents]
  );

  const handleAccordionChange = (prayerId: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPrayer(isExpanded ? prayerId : false);
  };

  return (
    <Box id="prayers" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.7rem', md: '2.5rem' },
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
              mb: 2,
            }}
          >
            Palavras de fé, esperança e amor para elevar a alma
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
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
              sx={{
                minWidth: 250,
                maxWidth: 300,
                '& .MuiInputBase-root': {
                  height: 40,
                }
              }}
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
                onClick={() => setSelectedCategory(SpiritualCategory.Umbanda)}
                color={selectedCategory === SpiritualCategory.Umbanda ? 'secondary' : 'default'}
                variant={selectedCategory === SpiritualCategory.Umbanda ? 'filled' : 'outlined'}
              />
              <Chip
                label="Espírita"
                onClick={() => setSelectedCategory(SpiritualCategory.Kardecismo)}
                color={selectedCategory === SpiritualCategory.Kardecismo ? 'primary' : 'default'}
                variant={selectedCategory === SpiritualCategory.Kardecismo ? 'filled' : 'outlined'}
              />
              <Chip
                label="Geral"
                onClick={() => setSelectedCategory(SpiritualCategory.General)}
                color={selectedCategory === SpiritualCategory.General ? 'info' : 'default'}
                variant={selectedCategory === SpiritualCategory.General ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando conteúdos espirituais...
            </Typography>
          </Box>
        ) : isError ? (
          <Alert severity="warning">
            Não foi possível carregar os conteúdos espirituais neste momento.
          </Alert>
        ) : filteredPrayers.length === 0 ? (
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
          <Grid container spacing={0.8}>
            {filteredPrayers.map((prayer) => (
              <Grid size={12} key={prayer.id}>
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
                        {normalizeCategory(prayer.category) === SpiritualCategory.Umbanda && <AutoAwesomeIcon />}
                        {normalizeCategory(prayer.category) === SpiritualCategory.Kardecismo && <MenuBookIcon />}
                        {(normalizeCategory(prayer.category) === SpiritualCategory.General || normalizeCategory(prayer.category) === SpiritualCategory.Orixas) && <FavoriteIcon />}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {prayer.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={getCategoryLabel(normalizeCategory(prayer.category))}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(normalizeCategory(prayer.category)),
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
                      <Chip label={prayer.source} size="small" variant="outlined" />
                      {prayer.isFeatured && <Chip label="Destaque" size="small" color="warning" />}
                      <Chip label={getTypeLabel(normalizeType(prayer.type))} size="small" variant="outlined" />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Card sx={{ p: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
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
