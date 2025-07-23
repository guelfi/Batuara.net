import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  IconButton,
  useTheme,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Informações de contato da Casa Batuara
  const contactInfo = {
    address: 'Rua das Flores, 123 - Centro, Curitiba - PR, CEP: 80000-000',
    phone: '(41) 3333-4444',
    whatsapp: '(41) 99999-8888',
    email: 'contato@casabatuara.org.br',
    facebook: 'facebook.com/casabatuara',
    instagram: '@casabatuara',
  };

  const schedules = [
    { day: 'Segunda-feira', activity: 'Estudo Espírita', time: '19:30 às 21:00' },
    { day: 'Terça-feira', activity: 'Atendimento Espiritual', time: '19:00 às 21:30' },
    { day: 'Quarta-feira', activity: 'Desenvolvimento Mediúnico', time: '19:30 às 21:00' },
    { day: 'Quinta-feira', activity: 'Gira de Umbanda', time: '20:00 às 22:00' },
    { day: 'Sexta-feira', activity: 'Evangelização Infantil', time: '19:00 às 20:30' },
    { day: 'Sábado', activity: 'Trabalhos Especiais', time: '19:00 às 21:00' },
    { day: 'Domingo', activity: 'Palestra Pública', time: '19:00 às 20:30' },
  ];

  const handleInputChange = (field: keyof ContactForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Aqui seria implementada a lógica de envio do formulário
    console.log('Formulário enviado:', formData);
    setShowSuccessAlert(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyAlert(true);
    });
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre a Casa de Caridade Batuara.');
    const whatsappNumber = contactInfo.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <Box id="contact" sx={{ py: 8, backgroundColor: 'background.default' }}>
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
            Entre em Contato
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
            Estamos aqui para ajudar e esclarecer suas dúvidas
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Informações de Contato
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <LocationOnIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Endereço
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contactInfo.address}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PhoneIcon color="primary" />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Telefone
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contactInfo.phone}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(contactInfo.phone)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WhatsAppIcon color="success" />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        WhatsApp
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contactInfo.whatsapp}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={handleWhatsAppClick}
                    >
                      Conversar
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EmailIcon color="primary" />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        E-mail
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contactInfo.email}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(contactInfo.email)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Redes Sociais
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => window.open(`https://${contactInfo.facebook}`, '_blank')}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => window.open(`https://instagram.com/${contactInfo.instagram.replace('@', '')}`, '_blank')}
                  >
                    <InstagramIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Envie uma Mensagem
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome completo"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Assunto"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mensagem"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<SendIcon />}
                    >
                      Enviar Mensagem
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Horários de Funcionamento
            </Typography>
            <Grid container spacing={2}>
              {schedules.map((schedule, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {schedule.day}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
                      {schedule.activity}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {schedule.time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                * Todos os trabalhos são gratuitos e abertos ao público
              </Typography>
            </Box>
          </Card>
        </Box>

        <Snackbar
          open={showSuccessAlert}
          autoHideDuration={6000}
          onClose={() => setShowSuccessAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSuccessAlert(false)} severity="success" sx={{ width: '100%' }}>
            Mensagem enviada com sucesso! Entraremos em contato em breve.
          </Alert>
        </Snackbar>

        <Snackbar
          open={showCopyAlert}
          autoHideDuration={3000}
          onClose={() => setShowCopyAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowCopyAlert(false)} severity="info" sx={{ width: '100%' }}>
            Informação copiada para a área de transferência!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ContactSection;