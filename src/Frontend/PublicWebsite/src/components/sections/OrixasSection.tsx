import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { mockOrixas } from '../../data/mockData';
import { Orixa } from '../../types';
import { getOrixaColor } from '../../theme/theme';

const OrixasSection: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedOrixa, setSelectedOrixa] = useState<Orixa | null>(null);

  const handleOpenDialog = (orixa: Orixa) => {
    setSelectedOrixa(orixa);
  };

  const handleCloseDialog = () => {
    setSelectedOrixa(null);
  };

  return (
    <Box id="orixas" sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
            Os Orixás
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
            Conheça os Orixás e seus ensinamentos conforme a Casa Batuara
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            Cada Orixá representa virtudes e qualidades que devemos desenvolver em nós mesmos, 
            guiando-nos no caminho da evolução espiritual.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {mockOrixas.map((orixa) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={orixa.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: getOrixaColor(orixa.name),
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: getOrixaColor(orixa.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: getOrixaColor(orixa.name),
                        mb: 1,
                      }}
                    >
                      {orixa.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {orixa.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Cores:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {orixa.colors.slice(0, 3).map((color, index) => (
                        <Chip
                          key={index}
                          label={color}
                          size="small"
                          sx={{
                            backgroundColor: getOrixaColor(orixa.name),
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                      {orixa.colors.length > 3 && (
                        <Chip
                          label={`+${orixa.colors.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Características:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {orixa.characteristics.slice(0, 2).map((characteristic, index) => (
                        <Chip
                          key={index}
                          label={characteristic}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                      {orixa.characteristics.length > 2 && (
                        <Chip
                          label={`+${orixa.characteristics.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenDialog(orixa)}
                    sx={{
                      backgroundColor: getOrixaColor(orixa.name),
                      '&:hover': {
                        backgroundColor: getOrixaColor(orixa.name),
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    Saiba Mais
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog com detalhes do Orixá */}
        <Dialog
          open={!!selectedOrixa}
          onClose={handleCloseDialog}
          fullScreen={fullScreen}
          maxWidth="md"
          fullWidth
        >
          {selectedOrixa && (
            <>
              <DialogTitle
                sx={{
                  backgroundColor: getOrixaColor(selectedOrixa.name),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedOrixa.name}
                </Typography>
                <IconButton
                  onClick={handleCloseDialog}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Descrição
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {selectedOrixa.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Origem
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {selectedOrixa.origin}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Ensinamentos da Casa Batuara
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedOrixa.batuaraTeaching}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Cores
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedOrixa.colors.map((color, index) => (
                          <Chip
                            key={index}
                            label={color}
                            sx={{
                              backgroundColor: getOrixaColor(selectedOrixa.name),
                              color: 'white',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Elementos
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedOrixa.elements.map((element, index) => (
                          <Chip
                            key={index}
                            label={element}
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Características
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedOrixa.characteristics.map((characteristic, index) => (
                          <Chip
                            key={index}
                            label={characteristic}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleCloseDialog} variant="outlined">
                  Fechar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrixasSection;