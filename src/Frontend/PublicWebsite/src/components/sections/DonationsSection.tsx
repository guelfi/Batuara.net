import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import QRCode from 'qrcode';

const DonationsSection: React.FC = () => {
  const theme = useTheme();
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [showOtherDonationsDialog, setShowOtherDonationsDialog] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  // Informações PIX da Casa Batuara (dados fictícios para demonstração)
  const pixInfo = {
    chave: 'casabatuara@exemplo.com',
    nome: 'Casa de Caridade Batuara',
  };

  // Lista de itens que podem ser doados
  const donationItems = [
    'Alimentos não perecíveis',
    'Roupas em bom estado',
    'Materiais de higiene',
    'Produtos de limpeza',
    'Livros espirituais',
    'Velas e incensos',
    'Materiais para rituais',
    'Cobertores e agasalhos',
  ];

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setShowCopyAlert(true);
    });
  };

  const handleScrollToContact = () => {
    setShowOtherDonationsDialog(false);
    const element = document.querySelector('#contact');
    if (element) {
      const headerHeight = 32;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Gerar QR Code quando o dialog PIX abrir
  useEffect(() => {
    if (showPixDialog && qrCodeRef.current) {
      setQrCodeLoading(true);
      
      // Aguardar um pouco para o canvas estar pronto
      setTimeout(() => {
        if (qrCodeRef.current) {
          // Limpar canvas antes de gerar novo QR Code
          const canvas = qrCodeRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          // Gerar QR Code
          QRCode.toCanvas(canvas, pixInfo.chave, {
            width: 200,
            margin: 2,
            color: {
              dark: theme.palette.primary.main,
              light: '#ffffff',
            },
          }).then(() => {
            setQrCodeLoading(false);
          }).catch((err: any) => {
            console.error('Erro ao gerar QR Code:', err);
            setQrCodeLoading(false);
          });
        }
      }, 100);
    }
  }, [showPixDialog, theme.palette.primary.main, pixInfo.chave]);

  const handleCloseAlert = () => {
    setShowCopyAlert(false);
  };

  return (
    <Box id="donations" sx={{ py: 6, backgroundColor: 'background.paper' }}>
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
            Contribua com Nossa Missão
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
            Sua doação nos ajuda a continuar oferecendo assistência espiritual gratuita
          </Typography>
        </Box>

        {/* Botões de Doação */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<QrCodeIcon />}
            onClick={() => setShowPixDialog(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              minWidth: 200,
            }}
          >
            Doação via PIX
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HandshakeIcon />}
            onClick={() => setShowOtherDonationsDialog(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              minWidth: 200,
            }}
          >
            Outras Formas de Doação
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 2.5 }}>
                <FavoriteIcon
                  sx={{
                    fontSize: 36,
                    color: 'secondary.main',
                    mb: 1.5,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                  Assistência Espiritual
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.9rem' }}>
                  Mantemos nossos trabalhos espirituais gratuitos para todos que nos procuram,
                  oferecendo consultas, passes e orientação sem custo algum.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 2.5 }}>
                <VolunteerActivismIcon
                  sx={{
                    fontSize: 36,
                    color: 'primary.main',
                    mb: 1.5,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                  Ações Sociais
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.9rem' }}>
                  Desenvolvemos projetos sociais para ajudar famílias em situação de
                  vulnerabilidade, distribuindo alimentos, roupas e materiais de higiene.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
              <CardContent sx={{ p: 2.5 }}>
                <HandshakeIcon
                  sx={{
                    fontSize: 36,
                    color: 'success.main',
                    mb: 1.5,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                  Manutenção da Casa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.9rem' }}>
                  Suas contribuições nos ajudam a manter nossa casa funcionando,
                  cobrindo custos de energia, água, materiais e reformas necessárias.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Card sx={{ p: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              "Fora da caridade não há salvação"
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              Sua contribuição, por menor que seja, faz a diferença na vida de muitas pessoas.
              Que os Orixás abençoem sua generosidade e a multipliquem.
            </Typography>
          </Card>
        </Box>

        {/* Dialog PIX */}
        <Dialog
          open={showPixDialog}
          onClose={() => setShowPixDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Doação via PIX
              </Typography>
            </Box>
            <IconButton onClick={() => setShowPixDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            {/* QR Code Mock */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 2 }}>
                <Box sx={{
                  width: 200,
                  height: 200,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  position: 'relative'
                }}>
                  {/* Mock QR Code Pattern */}
                  <Box sx={{
                    width: '80%',
                    height: '80%',
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        ${theme.palette.primary.main} 0px,
                        ${theme.palette.primary.main} 8px,
                        white 8px,
                        white 16px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        ${theme.palette.primary.main} 0px,
                        ${theme.palette.primary.main} 8px,
                        white 8px,
                        white 16px
                      )
                    `,
                    borderRadius: 1
                  }} />
                  
                  {/* QR Code corners */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 24,
                    height: 24,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 0.5
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 0.5
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    width: 24,
                    height: 24,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 0.5
                  }} />
                </Box>
              </Box>
            </Box>

            {/* Chave PIX */}
            <Card sx={{ mb: 2, backgroundColor: 'primary.light' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                      Chave PIX:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.contrastText', wordBreak: 'break-all' }}>
                      {pixInfo.chave}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(pixInfo.chave, 'Chave PIX')}
                    sx={{ color: 'primary.contrastText' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Escaneie o QR Code ou copie a chave PIX
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShowPixDialog(false)} variant="outlined" fullWidth>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Outras Doações */}
        <Dialog
          open={showOtherDonationsDialog}
          onClose={() => setShowOtherDonationsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HandshakeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Outras Formas de Doação
              </Typography>
            </Box>
            <IconButton onClick={() => setShowOtherDonationsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            {/* Doações Presenciais */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                Doações Presenciais
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Para doações presenciais, entre em contato conosco para agendamento:
              </Typography>
              <Button
                variant="contained"
                startIcon={<ContactMailIcon />}
                onClick={handleScrollToContact}
                fullWidth
                sx={{ mb: 1 }}
              >
                Entrar em Contato para Agendamento
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Itens que podem ser doados */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', textAlign: 'center' }}>
                Itens que Aceitamos
              </Typography>
              <Grid container spacing={0.5}>
                {donationItems.map((item, index) => (
                  <Grid item xs={6} sm={6} key={index}>
                    <Chip
                      label={item}
                      variant="outlined"
                      color="primary"
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 'auto',
                        py: 0.3,
                        px: 1,
                        '& .MuiChip-label': {
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Card sx={{ mt: 2, backgroundColor: 'success.light' }}>
                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'success.contrastText', fontWeight: 600 }}>
                    💝 Toda doação é bem-vinda e faz a diferença!
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setShowOtherDonationsDialog(false)} variant="outlined" fullWidth>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showCopyAlert}
          autoHideDuration={3000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {copiedText} copiado para a área de transferência!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default DonationsSection;