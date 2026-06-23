import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { SiteSettingsDto } from '../types';


const DonationsContactPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState<SiteSettingsDto | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState<{
    institutionalEmail?: string;
    primaryPhone?: string;
    secondaryPhone?: string;
    whatsappNumber?: string;
  }>({});
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const response = await apiService.getSiteSettings();
      setSettings(response.data);
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar dados de contato e doações.',
        severity: 'error',
      });
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onlyDigits = (value: string) => value.replace(/\D/g, '');

  const formatPhoneBr = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCnpj = (value: string) => {
    const digits = onlyDigits(value).slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const validateSettings = (): typeof settingsErrors => {
    const nextErrors: typeof settingsErrors = {};
    const emailValue = (settings?.institutionalEmail || '').trim();
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.institutionalEmail = 'Informe um e-mail válido.';
    }

    const phoneDigits = onlyDigits(settings?.primaryPhone || '');
    if (settings?.primaryPhone?.trim() && !(phoneDigits.length === 10 || phoneDigits.length === 11)) {
      nextErrors.primaryPhone = 'Informe um telefone válido (DDD + número).';
    }

    const secondaryDigits = onlyDigits(settings?.secondaryPhone || '');
    if (settings?.secondaryPhone?.trim() && !(secondaryDigits.length === 10 || secondaryDigits.length === 11)) {
      nextErrors.secondaryPhone = 'Informe um telefone válido (DDD + número).';
    }

    const whatsappDigits = onlyDigits(settings?.whatsappNumber || '');
    if (settings?.whatsappNumber?.trim() && !(whatsappDigits.length === 10 || whatsappDigits.length === 11)) {
      nextErrors.whatsappNumber = 'Informe um WhatsApp válido (DDD + número).';
    }



    return nextErrors;
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    const nextErrors = validateSettings();
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ open: true, message: 'Revise os campos com erro antes de salvar.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.updateSiteSettings({
        institutionalEmail: settings.institutionalEmail,
        primaryPhone: settings.primaryPhone,
        secondaryPhone: settings.secondaryPhone,
        whatsappNumber: settings.whatsappNumber,
        serviceHours: settings.serviceHours,
        pixKey: settings.pixKey,
        pixPayload: settings.pixPayload,
        pixRecipientName: settings.pixRecipientName,
        pixCity: settings.pixCity,
        pixQrCodeBase64: settings.pixQrCodeBase64,
        bankName: settings.bankName,
        bankAgency: settings.bankAgency,
        bankAccount: settings.bankAccount,
        bankAccountType: settings.bankAccountType,
        companyDocument: settings.companyDocument,
      });
      setSettings(response.data);
      setFeedback({ open: true, message: 'Contato institucional e doações atualizados.', severity: 'success' });
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar os dados.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingSettings || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Doações e Contato
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            Administre os dados bancários, PIX e canais institucionais da Casa.
          </Typography>
        </Box>
        {!isXs && (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              Salvar
            </Button>
          </Stack>
        )}
      </Stack>

      {isXs ? (
        <Stack spacing={2}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Contato institucional</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="E-mail institucional"
                  value={settings.institutionalEmail}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, institutionalEmail: e.target.value } : prev))}
                  error={!!settingsErrors.institutionalEmail}
                  helperText={settingsErrors.institutionalEmail}
                  fullWidth
                />
                <TextField
                  label="Telefone principal"
                  value={settings.primaryPhone}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, primaryPhone: formatPhoneBr(e.target.value) } : prev))}
                  error={!!settingsErrors.primaryPhone}
                  helperText={settingsErrors.primaryPhone}
                  fullWidth
                />
                <TextField
                  label="Telefone secundário"
                  value={settings.secondaryPhone || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, secondaryPhone: formatPhoneBr(e.target.value) } : prev))}
                  error={!!settingsErrors.secondaryPhone}
                  helperText={settingsErrors.secondaryPhone}
                  fullWidth
                />
                <TextField
                  label="WhatsApp"
                  value={settings.whatsappNumber || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, whatsappNumber: formatPhoneBr(e.target.value) } : prev))}
                  error={!!settingsErrors.whatsappNumber}
                  helperText={settingsErrors.whatsappNumber}
                  fullWidth
                />
                <TextField
                  label="Horário de atendimento"
                  value={settings.serviceHours || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, serviceHours: e.target.value } : prev))}
                  fullWidth
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Doações e PIX</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Chave PIX"
                    value={settings.pixKey || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixKey: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Favorecido PIX"
                    value={settings.pixRecipientName || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixRecipientName: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Pix Copia e Cola"
                  value={settings.pixPayload || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixPayload: e.target.value } : prev))}
                  multiline
                  rows={3}
                  fullWidth
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Imagem do QR Code (PIX)
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    {settings.pixQrCodeBase64 ? (
                      <Box sx={{ position: 'relative', width: 140, height: 140, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={settings.pixQrCodeBase64}
                          alt="QR Code PIX"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ width: 140, height: 140, border: '2px dashed', borderColor: 'divider', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary">Sem imagem</Typography>
                      </Box>
                    )}
                    <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        fullWidth
                      >
                        Fazer Upload
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                setSettings((prev) => (prev ? { ...prev, pixQrCodeBase64: base64 } : prev));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </Button>
                      {settings.pixQrCodeBase64 && (
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => setSettings((prev) => (prev ? { ...prev, pixQrCodeBase64: '' } : prev))}
                          fullWidth
                        >
                          Remover Imagem
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
                <Alert severity="info">
                  O payload 'Pix Copia e Cola' e o QR Code podem ser personalizados. Se o payload for deixado em branco, ele será gerado automaticamente a partir dos dados do PIX.
                </Alert>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contato institucional
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="E-mail institucional"
                  value={settings.institutionalEmail}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, institutionalEmail: e.target.value } : prev))}
                  error={!!settingsErrors.institutionalEmail}
                  helperText={settingsErrors.institutionalEmail}
                  fullWidth
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Telefone principal"
                    value={settings.primaryPhone}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, primaryPhone: formatPhoneBr(e.target.value) } : prev))}
                    error={!!settingsErrors.primaryPhone}
                    helperText={settingsErrors.primaryPhone}
                    fullWidth
                  />
                  <TextField
                    label="Telefone secundário"
                    value={settings.secondaryPhone || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, secondaryPhone: formatPhoneBr(e.target.value) } : prev))}
                    error={!!settingsErrors.secondaryPhone}
                    helperText={settingsErrors.secondaryPhone}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="WhatsApp"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, whatsappNumber: formatPhoneBr(e.target.value) } : prev))}
                    error={!!settingsErrors.whatsappNumber}
                    helperText={settingsErrors.whatsappNumber}
                    fullWidth
                  />
                  <TextField
                    label="Horário de atendimento"
                    value={settings.serviceHours || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, serviceHours: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Doações e PIX
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Chave PIX"
                    value={settings.pixKey || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixKey: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Favorecido PIX"
                    value={settings.pixRecipientName || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixRecipientName: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Pix Copia e Cola"
                  value={settings.pixPayload || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixPayload: e.target.value } : prev))}
                  multiline
                  rows={3}
                  fullWidth
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Imagem do QR Code (PIX)
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    {settings.pixQrCodeBase64 ? (
                      <Box sx={{ position: 'relative', width: 140, height: 140, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={settings.pixQrCodeBase64}
                          alt="QR Code PIX"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ width: 140, height: 140, border: '2px dashed', borderColor: 'divider', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary">Sem imagem</Typography>
                      </Box>
                    )}
                    <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                      >
                        Fazer Upload
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                setSettings((prev) => (prev ? { ...prev, pixQrCodeBase64: base64 } : prev));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </Button>
                      {settings.pixQrCodeBase64 && (
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => setSettings((prev) => (prev ? { ...prev, pixQrCodeBase64: '' } : prev))}
                        >
                          Remover Imagem
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
                <Alert severity="info">
                  O payload 'Pix Copia e Cola' e o QR Code podem ser personalizados. Se o payload for deixado em branco, ele será gerado automaticamente a partir dos dados do PIX.
                </Alert>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {isXs && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} fullWidth>
            Salvar
          </Button>
        </Box>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DonationsContactPage;
