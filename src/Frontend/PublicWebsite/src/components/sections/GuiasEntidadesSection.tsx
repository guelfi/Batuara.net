import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';
import { Guide } from '../../types';

type DisplayGuide = {
  id: string | number;
  name: string;
  description: string;
  highlight: string;
  metadata: Array<{ label: string; value: string }>;
  tags: string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  photoUrl?: string;
};

const GuiasEntidadesSection: React.FC = () => {
  const [selectedGuia, setSelectedGuia] = useState<DisplayGuide | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-guides'],
    queryFn: () => publicApi.getGuides(),
  });

  const guides = useMemo<DisplayGuide[]>(() => {
    return [...(data ?? [])]
      .filter((item) => item.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      .map((item: Guide) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        highlight: 'Guia da Casa Batuara',
        metadata: [
          { label: 'Especialidades', value: item.specialties.join(' • ') || 'Não informado' },
          ...(item.whatsapp || item.phone || item.email
            ? [{ label: 'Contato', value: item.whatsapp || item.phone || item.email || '' }]
            : []),
        ],
        tags: item.specialties,
        email: item.email,
        phone: item.phone,
        whatsapp: item.whatsapp,
        photoUrl: item.photoUrl,
      }));
  }, [data]);

  const handleOpenDialog = (guia: DisplayGuide) => {
    setSelectedGuia(guia);
  };

  const handleCloseDialog = () => {
    setSelectedGuia(null);
  };

  return (
    <Box id="guias-entidades" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.7rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Guias e Entidades
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="warning">Não foi possível carregar os guias e entidades neste momento.</Alert>
        ) : guides.length === 0 ? (
          <Alert severity="info">Nenhum guia ou entidade ativo foi cadastrado até o momento.</Alert>
        ) : (
          <>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => {
                  const container = document.getElementById('guides-carousel');
                  container?.scrollBy({ left: -340, behavior: 'smooth' });
                }}
                sx={{
                  position: 'absolute',
                  left: -18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: 3,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  const container = document.getElementById('guides-carousel');
                  container?.scrollBy({ left: 340, behavior: 'smooth' });
                }}
                sx={{
                  position: 'absolute',
                  right: -18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: 3,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>

              <Box
                id="guides-carousel"
                sx={{
                  display: 'flex',
                  gap: 3,
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  pb: 2,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                {guides.map((guia) => (
                  <Card
                    key={guia.id}
                    onClick={() => handleOpenDialog(guia)}
                    sx={{
                      minWidth: { xs: 300, md: 340 },
                      maxWidth: { xs: 300, md: 340 },
                      cursor: 'pointer',
                      borderTop: '3px solid',
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {guia.photoUrl ? (
                            <Box component="img" src={guia.photoUrl} alt={guia.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <PeopleIcon sx={{ fontSize: 34, color: 'white' }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {guia.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {guia.highlight}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        {guia.description}
                      </Typography>

                      <Stack spacing={1.2} sx={{ mb: 2 }}>
                        {guia.metadata.slice(0, 4).map((item) => (
                          <Typography key={`${guia.id}-${item.label}`} variant="body2" color="text.secondary">
                            <strong>{item.label}:</strong> {item.value}
                          </Typography>
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {guia.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                        ))}
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        <Button variant="text" sx={{ px: 0 }}>
                          Ver detalhes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            <Dialog open={!!selectedGuia} onClose={handleCloseDialog} fullWidth maxWidth="sm">
              <DialogTitle>{selectedGuia?.name}</DialogTitle>
              <DialogContent>
                {selectedGuia && (
                  <Stack spacing={2}>
                    {!!selectedGuia.photoUrl && (
                      <Box
                        component="img"
                        src={selectedGuia.photoUrl}
                        alt={selectedGuia.name}
                        sx={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 3 }}
                      />
                    )}
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {selectedGuia.description}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Detalhes
                      </Typography>
                      <Stack spacing={1}>
                        {selectedGuia.metadata.map((item) => (
                          <Typography key={`${selectedGuia.id}-${item.label}`} variant="body2" color="text.secondary">
                            <strong>{item.label}:</strong> {item.value}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Características
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {selectedGuia.tags.map((specialty) => (
                          <Chip key={specialty} label={specialty} size="small" color="primary" />
                        ))}
                      </Stack>
                    </Box>
                    {!!selectedGuia.email && (
                      <Typography variant="body2" color="text.secondary">
                        E-mail: <Link href={`mailto:${selectedGuia.email}`}>{selectedGuia.email}</Link>
                      </Typography>
                    )}
                    {!!selectedGuia.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Telefone: {selectedGuia.phone}
                      </Typography>
                    )}
                    {!!selectedGuia.whatsapp && (
                      <Typography variant="body2" color="text.secondary">
                        WhatsApp: {selectedGuia.whatsapp}
                      </Typography>
                    )}
                  </Stack>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
};

export default GuiasEntidadesSection;
