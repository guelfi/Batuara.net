import React from 'react';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../services/api';

const LocationSection: React.FC = () => {
  const { data: siteSettings, isLoading, isError } = useQuery({
    queryKey: ['siteSettings', 'public'],
    queryFn: () => publicApi.getSiteSettings(),
  });

  return (
    <Box id="location" sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' }, fontWeight: 600, mb: 1, color: 'primary.main' }}>
            Nossa Localização
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', lineHeight: 1.5 }}>
            Venha nos visitar e conhecer nossa casa espiritual
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError || !siteSettings ? (
          <Alert severity="warning">Não foi possível carregar a localização da casa neste momento.</Alert>
        ) : (
          <>
            <Card sx={{ overflow: 'hidden', borderRadius: 2, mb: 2 }}>
              <Box
                component="iframe"
                src={siteSettings.mapEmbedUrl || 'https://www.google.com/maps'}
                sx={{ width: '100%', height: { xs: 220, md: 340 }, border: 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>

            <Box sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.7 }}>
                {`${siteSettings.street}, ${siteSettings.number}${siteSettings.complement ? ` - ${siteSettings.complement}` : ''} - ${siteSettings.district}, ${siteSettings.city} - ${siteSettings.state}, ${siteSettings.zipCode}`}
              </Typography>
              {!!siteSettings.referenceNotes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                  {siteSettings.referenceNotes}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LocationSection;
