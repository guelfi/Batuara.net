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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { mockUmbandaLines } from '../../data/mockData';
import { UmbandaLine } from '../../types';

const UmbandaSection: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedLine, setSelectedLine] = useState<UmbandaLine | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const handleOpenDialog = (line: UmbandaLine) => {
    setSelectedLine(line);
  };

  const handleCloseDialog = () => {
    setSelectedLine(null);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const getLineColor = (index: number): string => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];
    return colors[index % colors.length];
  };

  return (
    <Box id="umbanda" sx={{ py: 8, backgroundColor: 'background.default' }}>
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
            Linhas da Umbanda
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
            As linhas espirituais que trabalham em nossa casa
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
            Cada linha possui suas características específicas e trabalha com diferentes aspectos 
            da cura e orientação espiritual, sempre com muito amor e caridade.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {mockUmbandaLines.map((line, index) => (
            <Grid item xs={12} md={6} lg={4} key={line.id}>
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
                    backgroundColor: getLineColor(index),
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
                        backgroundColor: getLineColor(index),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <GroupsIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: getLineColor(index),
                        mb: 1,
                      }}
                    >
                      {line.name}
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
                    {line.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Dias de Trabalho:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {line.workingDays.map((day, dayIndex) => (
                        <Chip
                          key={dayIndex}
                          label={day}
                          size="small"
                          sx={{
                            backgroundColor: getLineColor(index),
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Principais Entidades:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {line.entities.slice(0, 2).map((entity, entityIndex) => (
                        <Chip
                          key={entityIndex}
                          label={entity}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                      {line.entities.length > 2 && (
                        <Chip
                          label={`+${line.entities.length - 2}`}
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
                    onClick={() => handleOpenDialog(line)}
                    sx={{
                      backgroundColor: getLineColor(index),
                      '&:hover': {
                        backgroundColor: getLineColor(index),
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

        {/* Seção de Informações Gerais */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, color: 'primary.main' }}>
            Sobre as Linhas da Umbanda
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Accordion
                expanded={expandedAccordion === 'panel1'}
                onChange={handleAccordionChange('panel1')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">O que são as Linhas da Umbanda?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    As Linhas da Umbanda são grupos de entidades espirituais que trabalham juntas 
                    com características e propósitos similares. Cada linha possui sua vibração 
                    específica e atua em diferentes aspectos da vida humana, sempre com o objetivo 
                    de auxiliar na evolução espiritual e no bem-estar das pessoas.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expandedAccordion === 'panel2'}
                onChange={handleAccordionChange('panel2')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Como funcionam os trabalhos?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Os trabalhos espirituais são realizados através da incorporação mediúnica, 
                    onde as entidades se manifestam através dos médiuns para oferecer orientação, 
                    cura e consolação. Cada linha trabalha em dias específicos da semana, 
                    seguindo a tradição e a organização espiritual da casa.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12} md={6}>
              <Accordion
                expanded={expandedAccordion === 'panel3'}
                onChange={handleAccordionChange('panel3')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Posso participar dos trabalhos?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Sim! Todos são bem-vindos em nossa casa, independentemente de religião ou credo. 
                    Os trabalhos são abertos ao público e gratuitos. Recomendamos usar roupas brancas 
                    ou claras e chegar com alguns minutos de antecedência. O mais importante é vir 
                    com fé e respeito.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expandedAccordion === 'panel4'}
                onChange={handleAccordionChange('panel4')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Como desenvolver a mediunidade?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    O desenvolvimento mediúnico requer estudo, disciplina e orientação adequada. 
                    Oferecemos cursos de desenvolvimento mediúnico onde ensinamos os fundamentos 
                    da doutrina, a prática da mediunidade com segurança e responsabilidade. 
                    Entre em contato conosco para mais informações sobre os próximos cursos.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Box>

        {/* Dialog com detalhes da linha */}
        <Dialog
          open={!!selectedLine}
          onClose={handleCloseDialog}
          fullScreen={fullScreen}
          maxWidth="md"
          fullWidth
        >
          {selectedLine && (
            <>
              <DialogTitle
                sx={{
                  backgroundColor: getLineColor(mockUmbandaLines.findIndex(l => l.id === selectedLine.id)),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedLine.name}
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
                      {selectedLine.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Características
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {selectedLine.characteristics}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Interpretação da Casa Batuara
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedLine.batuaraInterpretation}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" />
                        Dias de Trabalho
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedLine.workingDays.map((day, index) => (
                          <Chip
                            key={index}
                            label={day}
                            sx={{
                              backgroundColor: getLineColor(mockUmbandaLines.findIndex(l => l.id === selectedLine.id)),
                              color: 'white',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupsIcon fontSize="small" />
                        Entidades
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedLine.entities.map((entity, index) => (
                          <Chip
                            key={index}
                            label={entity}
                            variant="outlined"
                            color="primary"
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

export default UmbandaSection;