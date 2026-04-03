import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HandshakeIcon from '@mui/icons-material/Handshake';
import QRCode from 'qrcode';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';

const DonationsSection: React.FC = () => {
  const theme = useTheme();
  const { data: siteSettings, isLoading, isError } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const pixValue = siteSettings?.pixPayload || siteSettings?.pixKey || '';

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setShowCopyAlert(true);
    });
  };

  useEffect(() => {
    if (showPixDialog && qrCodeRef.current && pixValue) {
      setTimeout(() => {
        if (qrCodeRef.current) {
          const canvas = qrCodeRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          QRCode.toCanvas(canvas, pixValue, {
            width: 200,
            margin: 2,
            color: {
              dark: theme.palette.primary.main,
              light: '#ffffff',
            },
          }).catch(() => undefined);
        }
      }, 100);
    }
  }, [pixValue, showPixDialog, theme.palette.primary.main]);

  const handleCloseAlert = () => {
    setShowCopyAlert(false);
  };

  return (
    <Box id="donations" sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError || !siteSettings ? (
          <Alert severity="warning">Os dados de doação não puderam ser carregados neste momento.</Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<QrCodeIcon />}
                onClick={() => setShowPixDialog(true)}
                disabled={!pixValue}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, minWidth: 200 }}
              >
                Doação via PIX
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HandshakeIcon />}
                onClick={() => {
                  const element = document.querySelector('#contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, minWidth: 200 }}
              >
                Falar com a Casa
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <FavoriteIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Assistência Espiritual
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Sua contribuição ajuda a manter atendimentos gratuitos, acolhimento fraterno e suporte espiritual contínuo.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <VolunteerActivismIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Ações Sociais
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      As doações fortalecem campanhas solidárias, apoio comunitário e necessidades materiais da casa.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <HandshakeIcon sx={{ fontSize: 36, color: 'success.main', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Transparência
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Os dados bancários e o QR Code PIX são gerados dinamicamente a partir das informações oficiais da Casa Batuara.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

          </>
        )}

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 2 }}>
                <canvas ref={qrCodeRef} />
              </Box>
            </Box>

            <Card sx={{ mb: 2, backgroundColor: 'primary.light' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                      Chave PIX:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.contrastText', wordBreak: 'break-all' }}>
                      {siteSettings?.pixKey || 'Não informado'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(siteSettings?.pixKey || '', 'Chave PIX')}
                    sx={{ color: 'primary.contrastText' }}
                    disabled={!siteSettings?.pixKey}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Escaneie o QR Code ou copie a chave PIX oficial da Casa Batuara
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShowPixDialog(false)} variant="outlined" fullWidth>
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
