import React, { useEffect, useState } from 'react';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { Cookie as CookieIcon } from '@mui/icons-material';
import {
  COOKIE_PREFERENCES_EVENT,
  getCookieConsent,
  saveCookieConsent,
} from '../../utils/cookieConsent';

const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);

    const openPreferences = () => setVisible(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  if (!visible) return null;

  const decide = (thirdParty: boolean) => {
    saveCookieConsent(thirdParty);
    setVisible(false);
  };

  return (
    <Paper
      elevation={8}
      role="dialog"
      aria-label="Aviso de cookies"
      sx={{
        position: 'fixed',
        bottom: { xs: 8, sm: 16 },
        left: { xs: 8, sm: 16 },
        right: { xs: 8, sm: 'auto' },
        maxWidth: 560,
        zIndex: (theme) => theme.zIndex.snackbar,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <CookieIcon color="primary" sx={{ mt: 0.25 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Este site usa cookies
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.5, fontSize: '0.85rem' }}>
            Utilizamos cookies necessários ao funcionamento do site e, com sua permissão,
            cookies de terceiros para exibir o mapa de localização (Google Maps). Saiba mais na nossa{' '}
            <Link href="/politica-de-privacidade" underline="hover">
              Política de Privacidade
            </Link>
            .
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" size="small" onClick={() => decide(true)}>
              Aceitar todos
            </Button>
            <Button variant="outlined" size="small" onClick={() => decide(false)}>
              Somente necessários
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default CookieConsentBanner;
