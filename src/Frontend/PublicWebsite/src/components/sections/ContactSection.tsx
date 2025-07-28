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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

  return (
    <Box id="contact" sx={{ py: 5.875, backgroundColor: 'background.default' }}>
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
                fontSize: { xs: '1.7rem', md: '1.9rem' },
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

        <Card 
          sx={{ 
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            boxShadow: theme.shadows[6],
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assunto"
                  value={formData.subject}
                  onChange={handleInputChange('subject')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mensagem"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="medium"
                  startIcon={<SendIcon />}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Enviar Mensagem
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