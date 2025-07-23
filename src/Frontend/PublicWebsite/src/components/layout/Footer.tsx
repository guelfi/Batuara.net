import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { mockContactInfo } from '../../data/mockData';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Informações da Casa */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Casa de Caridade Batuara
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Uma casa espírita e umbandista dedicada à caridade, ao amor e à 
              elevação espiritual. Trabalhamos com os ensinamentos de Jesus e 
              a sabedoria dos Orixás.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "Fora da caridade não há salvação"
            </Typography>
          </Grid>

          {/* Contato */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contato
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">
                  {mockContactInfo.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Link 
                  href={`tel:${mockContactInfo.phone}`} 
                  color="inherit" 
                  underline="hover"
                >
                  {mockContactInfo.phone}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Link 
                  href={`mailto:${mockContactInfo.email}`} 
                  color="inherit" 
                  underline="hover"
                >
                  {mockContactInfo.email}
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Horários e Redes Sociais */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Horários de Atendimento
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Kardecismo:</strong> Terças e Quintas - 19h às 21h
              </Typography>
              <Typography variant="body2">
                <strong>Umbanda:</strong> Sábados - 20h às 22h
              </Typography>
              <Typography variant="body2">
                <strong>Palestras:</strong> Domingos - 19h30 às 21h
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Redes Sociais
            </Typography>
            <Box>
              <IconButton
                component={Link}
                href={`https://instagram.com/${mockContactInfo.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', p: 0.5 }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            © {currentYear} Casa de Caridade Batuara. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
            Desenvolvido com amor e caridade para servir a comunidade espiritual.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;