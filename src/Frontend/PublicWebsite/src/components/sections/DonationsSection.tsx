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
import { desktopMediaQuery } from '../../theme/theme';

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
    if (showPixDialog && qrCodeRef.current && pixValue && !siteSettings?.pixQrCodeBase64) {
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
  }, [pixValue, showPixDialog, theme.palette.primary.main, siteSettings?.pixQrCodeBase64]);

  const handleCloseAlert = () => {
    setShowCopyAlert(false);
  };

  return (
    <Box
      id="doacoes"
      sx={{
        scrollMarginTop: { xs: 56, md: 64 },
        minHeight: { xs: '100vh', md: 'auto' },
        pt: { xs: 1.5, md: 2 },
        pb: { xs: 4, md: 8 },
        backgroundColor: 'background.paper',
        [desktopMediaQuery]: {
          minHeight: 'calc(100vh - 88px)',
          pb: 10,
        },
      }}
    >
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, minmax(220px, 1fr))' },
                gap: { xs: 1.25, md: 3 },
                justifyContent: 'center',
                mb: 4,
                maxWidth: { xs: '100%', sm: 520 },
                mx: 'auto',
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<QrCodeIcon />}
                onClick={() => setShowPixDialog(true)}
                disabled={!pixValue}
                fullWidth
                sx={{
                  px: { xs: 1.25, md: 4 },
                  py: { xs: 1.1, md: 1.5 },
                  fontSize: { xs: '0.85rem', md: '1.1rem' },
                  fontWeight: 700,
                  minWidth: 0,
                }}
              >
                Doação via PIX
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HandshakeIcon />}
                onClick={() => {
                  const element = document.querySelector('#entre-em-contato');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                fullWidth
                sx={{
                  px: { xs: 1.25, md: 4 },
                  py: { xs: 1.1, md: 1.5 },
                  fontSize: { xs: '0.85rem', md: '1.1rem' },
                  fontWeight: 700,
                  minWidth: 0,
                }}
              >
                Falar com a Casa
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <FavoriteIcon sx={{ fontSize: { xs: 30, md: 36 }, color: 'secondary.main', mb: 1.25 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Assistência Espiritual
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Sua contribuição ajuda a manter atendimentos gratuitos, acolhimento fraterno e suporte espiritual contínuo.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <VolunteerActivismIcon sx={{ fontSize: { xs: 30, md: 36 }, color: 'primary.main', mb: 1.25 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Ações Sociais
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      As doações fortalecem campanhas solidárias, apoio comunitário e necessidades materiais da casa.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <HandshakeIcon sx={{ fontSize: { xs: 30, md: 36 }, color: 'success.main', mb: 1.25 }} />
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
              <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {siteSettings?.pixQrCodeBase64 ? (
                  <img
                    src={siteSettings.pixQrCodeBase64}
                    alt="QR Code PIX"
                    style={{ width: 200, height: 200, objectFit: 'contain' }}
                  />
                ) : (
                  <canvas ref={qrCodeRef} style={{ display: pixValue ? 'block' : 'none' }} />
                )}
              </Box>
            </Box>

            {siteSettings?.pixPayload && (
              <Card sx={{ mb: 2, backgroundColor: 'action.hover' }}>
                <CardContent sx={{ py: 1.5, px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" align="left" sx={{ fontWeight: 600, display: 'block' }}>
                    Pix Copia e Cola
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', textAlign: 'left', fontSize: '0.8rem', color: 'text.primary', userSelect: 'all', fontFamily: 'monospace' }}>
                      {siteSettings.pixPayload}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(siteSettings.pixPayload || '', 'Pix Copia e Cola')}
                      sx={{ color: 'primary.main', flexShrink: 0 }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Card sx={{ mb: 2, backgroundColor: 'primary.light' }}>
              <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                      Chave PIX (CNPJ):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                      {siteSettings?.pixKey || '08.488.544/0001-56'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(siteSettings?.pixKey || '08.488.544/0001-56', 'Chave PIX')}
                    sx={{ color: 'primary.contrastText' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: 1, textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                    Beneficiário:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                    {siteSettings?.pixRecipientName || 'Casa de Caridade Batuara'}
                  </Typography>
                </Box>
                
                {siteSettings?.pixCity && (
                  <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: 1, textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                      Cidade:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                      {siteSettings.pixCity}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Escaneie o QR Code ou copie os dados do PIX oficial da <br /> Casa Batuara
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
