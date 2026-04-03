import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon, Save as SaveIcon } from '@mui/icons-material';
import apiService from '../services/api';
import { SiteSettingsDto } from '../types';

const LocationPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getSiteSettings();
      setSettings(response.data);
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar os dados de localização.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (field: keyof SiteSettingsDto, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.updateSiteSettings({
        street: settings.street,
        number: settings.number,
        complement: settings.complement,
        district: settings.district,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        referenceNotes: settings.referenceNotes,
        mapEmbedUrl: settings.mapEmbedUrl,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        youtubeUrl: settings.youtubeUrl,
        whatsappUrl: settings.whatsappUrl,
      });
      setSettings(response.data);
      setFeedback({ open: true, message: 'Localização e redes sociais atualizadas.', severity: 'success' });
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar os dados de localização.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Localização e Redes Sociais
          </Typography>
          <Typography color="text.secondary">
            Cadastre o endereço completo, referências e links institucionais que abastecem o PublicWebsite.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSettings}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Endereço da Casa Batuara
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Logradouro" value={settings.street} onChange={(e) => updateField('street', e.target.value)} fullWidth />
                <TextField label="Número" value={settings.number} onChange={(e) => updateField('number', e.target.value)} sx={{ minWidth: 140 }} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Complemento" value={settings.complement || ''} onChange={(e) => updateField('complement', e.target.value)} fullWidth />
                <TextField label="Bairro" value={settings.district} onChange={(e) => updateField('district', e.target.value)} fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Cidade" value={settings.city} onChange={(e) => updateField('city', e.target.value)} fullWidth />
                <TextField label="UF" value={settings.state} onChange={(e) => updateField('state', e.target.value.toUpperCase())} sx={{ minWidth: 120 }} />
                <TextField label="CEP" value={settings.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} sx={{ minWidth: 160 }} />
              </Stack>
              <TextField
                label="Referências"
                value={settings.referenceNotes || ''}
                onChange={(e) => updateField('referenceNotes', e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <TextField
                label="Mapa incorporado"
                value={settings.mapEmbedUrl || ''}
                onChange={(e) => updateField('mapEmbedUrl', e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Redes sociais
            </Typography>
            <Stack spacing={2}>
              <TextField label="Facebook" value={settings.facebookUrl || ''} onChange={(e) => updateField('facebookUrl', e.target.value)} fullWidth />
              <TextField label="Instagram" value={settings.instagramUrl || ''} onChange={(e) => updateField('instagramUrl', e.target.value)} fullWidth />
              <TextField label="YouTube" value={settings.youtubeUrl || ''} onChange={(e) => updateField('youtubeUrl', e.target.value)} fullWidth />
              <TextField label="WhatsApp" value={settings.whatsappUrl || ''} onChange={(e) => updateField('whatsappUrl', e.target.value)} fullWidth />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview do rodapé
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {`${settings.street}, ${settings.number}${settings.complement ? ` - ${settings.complement}` : ''}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${settings.district} • ${settings.city}/${settings.state} • ${settings.zipCode}`}
              </Typography>
              {!!settings.referenceNotes && (
                <Typography variant="body2" color="text.secondary">
                  {settings.referenceNotes}
                </Typography>
              )}
              <Alert severity="info" sx={{ mt: 1 }}>
                Links cadastrados aqui alimentam os ícones dinâmicos do site público e o rodapé institucional.
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationPage;
