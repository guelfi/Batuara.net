import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import publicApi from '../../services/api';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: keyof ContactForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await publicApi.createContactMessage(formData);
      setShowSuccessAlert(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Não foi possível enviar sua mensagem agora.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box id="contact" sx={{ py: 6, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 1.5,
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 28,
                color: 'primary.main',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.7rem', md: '2.5rem' },
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Entre em Contato
            </Typography>
            <AutoAwesomeIcon
              sx={{
                fontSize: 28,
                color: 'primary.main',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.3,
              mb: 0.5,
              fontSize: { xs: '0.95rem', md: '1rem' },
            }}
          >
            Estamos aqui para ajudar e esclarecer suas dúvidas
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: '500px',
              mx: 'auto',
              lineHeight: 1.3,
              fontStyle: 'italic',
              fontSize: { xs: '0.85rem', md: '0.9rem' },
            }}
          >
            Envie sua mensagem e entraremos em contato em breve
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, boxShadow: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Nome completo" value={formData.name} onChange={handleInputChange('name')} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Telefone" value={formData.phone} onChange={handleInputChange('phone')} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="E-mail" type="email" value={formData.email} onChange={handleInputChange('email')} required />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Assunto" value={formData.subject} onChange={handleInputChange('subject')} required />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Mensagem" multiline rows={4} value={formData.message} onChange={handleInputChange('message')} required />
              </Grid>
              {!!errorMessage && (
                <Grid size={12}>
                  <Alert severity="error">{errorMessage}</Alert>
                </Grid>
              )}
              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  disabled={submitting}
                  sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>

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
      </Container>
    </Box>
  );
};

export default ContactSection;
