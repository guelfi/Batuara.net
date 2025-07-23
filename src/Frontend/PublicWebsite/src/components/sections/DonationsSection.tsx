import React, { useState } from 'react';
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
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HandshakeIcon from '@mui/icons-material/Handshake';

const DonationsSection: React.FC = () => {
  const theme = useTheme();
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Informações PIX da Casa Batuara (dados fictícios para demonstração)
  const pixInfo = {
    chave: 'casabatuara@exemplo.com',
    nome: 'Casa de Caridade Batuara',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '12345-6',
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setShowCopyAlert(true);
    });
  };

  const handleCloseAlert = () => {
    setShowCopyAlert(false);
  };

  return (
    <Box id="donations" sx={{ py: 8, backgroundColor: 'background.paper' }}>
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

        <Grid container spacing={4} sx={{ mb: 6 }}>
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
              <CardContent sx={{ p: 4 }}>
                <FavoriteIcon
                  sx={{
                    fontSize: 48,
                    color: 'secondary.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Assistência Espiritual
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
              <CardContent sx={{ p: 4 }}>
                <VolunteerActivismIcon
                  sx={{
                    fontSize: 48,
                    color: 'primary.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Ações Sociais
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
              <CardContent sx={{ p: 4 }}>
                <HandshakeIcon
                  sx={{
                    fontSize: 48,
                    color: 'success.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Manutenção da Casa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Suas contribuições nos ajudam a manter nossa casa funcionando,
                  cobrindo custos de energia, água, materiais e reformas necessárias.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Doação via PIX
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chave PIX (E-mail):
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={pixInfo.chave}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    size="small"
                  />
                  <IconButton
                    onClick={() => handleCopyToClipboard(pixInfo.chave, 'Chave PIX')}
                    color="primary"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nome do Beneficiário:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={pixInfo.nome}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    size="small"
                  />
                  <IconButton
                    onClick={() => handleCopyToClipboard(pixInfo.nome, 'Nome do beneficiário')}
                    color="primary"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dados Bancários:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Banco:</strong> {pixInfo.banco}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Agência:</strong> {pixInfo.agencia}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Conta:</strong> {pixInfo.conta}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                startIcon={<QrCodeIcon />}
                onClick={() => setShowQRCode(!showQRCode)}
                sx={{ mb: 2 }}
              >
                {showQRCode ? 'Ocultar QR Code' : 'Mostrar QR Code'}
              </Button>

              {showQRCode && (
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    QR Code para doação via PIX
                  </Typography>
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      backgroundColor: 'white',
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Escaneie com o app do seu banco
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Outras Formas de Contribuir
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Doações em Espécie
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Aceitamos doações de:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Alimentos não perecíveis
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Roupas em bom estado
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Produtos de higiene e limpeza
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Materiais de construção
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Livros espíritas e educativos
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Trabalho Voluntário
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Se você tem tempo disponível e deseja contribuir com nossos trabalhos,
                  oferecemos oportunidades de voluntariado em diversas áreas:
                  atendimento, organização de eventos, manutenção e projetos sociais.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  const element = document.querySelector('#contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Entre em Contato para Mais Informações
              </Button>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Card sx={{ p: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              "Fora da caridade não há salvação"
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              Sua contribuição, por menor que seja, faz a diferença na vida de muitas pessoas.
              Que Deus abençoe sua generosidade e multiplique suas bênçãos.
            </Typography>
          </Card>
        </Box>

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