import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Menu,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { ContactMessage, ContactMessageStatus, SiteSettingsDto } from '../types';

const getStatusLabel = (status: ContactMessageStatus) => {
  switch (status) {
    case ContactMessageStatus.New:
      return 'Nova';
    case ContactMessageStatus.InProgress:
      return 'Em atendimento';
    case ContactMessageStatus.Resolved:
      return 'Resolvida';
    case ContactMessageStatus.Archived:
      return 'Arquivada';
    default:
      return 'Nova';
  }
};

const getStatusColor = (status: ContactMessageStatus): 'default' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case ContactMessageStatus.New:
      return 'warning';
    case ContactMessageStatus.InProgress:
      return 'info';
    case ContactMessageStatus.Resolved:
      return 'success';
    default:
      return 'default';
  }
};

const DonationsContactPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState<SiteSettingsDto | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState<{
    institutionalEmail?: string;
    primaryPhone?: string;
    secondaryPhone?: string;
    whatsappNumber?: string;
    companyDocument?: string;
  }>({});
  const [messageFilter, setMessageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [mobileMessageFiltersOpen, setMobileMessageFiltersOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageMenuAnchorEl, setMessageMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [messageMenuRow, setMessageMenuRow] = useState<ContactMessage | null>(null);
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

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    setMessagesError(null);
    try {
      const response = await apiService.getContactMessages({
        q: messageFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'receivedAt:desc',
      });
      setMessages(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar as mensagens recebidas.';
      setMessages([]);
      setTotalCount(0);
      setMessagesError(message);
      setFeedback({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [messageFilter, paginationModel.page, paginationModel.pageSize, statusFilter]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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

    const cnpjDigits = onlyDigits(settings?.companyDocument || '');
    if (settings?.companyDocument?.trim() && cnpjDigits.length !== 14) {
      nextErrors.companyDocument = 'CNPJ deve conter 14 dígitos.';
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

  const openMessageDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };

  const openMessageMenu = (event: React.MouseEvent<HTMLElement>, row: ContactMessage) => {
    setMessageMenuAnchorEl(event.currentTarget);
    setMessageMenuRow(row);
  };

  const closeMessageMenu = () => {
    setMessageMenuAnchorEl(null);
    setMessageMenuRow(null);
  };

  const columns: GridColDef[] = isXs
    ? [
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 160 },
        { field: 'subject', headerName: 'Assunto', flex: 1.2, minWidth: 180 },
        {
          field: 'status',
          headerName: 'Status',
          width: 130,
          renderCell: (params) => (
            <Chip size="small" label={getStatusLabel(params.row.status)} color={getStatusColor(params.row.status)} />
          ),
        },
        {
          field: 'receivedAt',
          headerName: 'Data',
          width: 150,
          valueFormatter: (value) => new Date(value).toLocaleDateString('pt-BR'),
        },
        {
          field: 'actions',
          headerName: '',
          width: 64,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <IconButton aria-label="Ações da mensagem" onClick={(e) => openMessageMenu(e, params.row)}>
              <MoreVertIcon />
            </IconButton>
          ),
        },
      ]
    : [
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180 },
        { field: 'subject', headerName: 'Assunto', flex: 1, minWidth: 220 },
        { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220 },
        {
          field: 'receivedAt',
          headerName: 'Recebida em',
          width: 170,
          valueFormatter: (value) => new Date(value).toLocaleString('pt-BR'),
        },
        {
          field: 'status',
          headerName: 'Status',
          width: 150,
          renderCell: (params) => (
            <Chip size="small" label={getStatusLabel(params.row.status)} color={getStatusColor(params.row.status)} />
          ),
        },
        {
          field: 'actions',
          type: 'actions',
          width: 90,
          getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Atender" onClick={() => openMessageDialog(params.row)} />],
        },
      ];

  const updateMessageField = (field: keyof ContactMessage, value: string | number) => {
    setSelectedMessage((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveMessage = async () => {
    if (!selectedMessage) {
      return;
    }

    try {
      await apiService.updateContactMessageStatus(String(selectedMessage.id), {
        status: selectedMessage.status,
        adminNotes: selectedMessage.adminNotes || undefined,
      });
      setFeedback({ open: true, message: 'Status da mensagem atualizado.', severity: 'success' });
      setMessageDialogOpen(false);
      await loadMessages();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível atualizar a mensagem.',
        severity: 'error',
      });
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
            Administre os dados bancários, PIX, canais institucionais e a fila de mensagens recebidas pelo PublicWebsite.
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
                <TextField
                  label="Cidade PIX"
                  value={settings.pixCity || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixCity: e.target.value } : prev))}
                  fullWidth
                />
                <TextField
                  label="Banco"
                  value={settings.bankName || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankName: e.target.value } : prev))}
                  fullWidth
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Agência"
                    value={settings.bankAgency || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAgency: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Conta"
                    value={settings.bankAccount || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAccount: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Tipo de conta"
                  value={settings.bankAccountType || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAccountType: e.target.value } : prev))}
                  fullWidth
                />
                <TextField
                  label="CNPJ"
                  value={settings.companyDocument || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, companyDocument: formatCnpj(e.target.value) } : prev))}
                  error={!!settingsErrors.companyDocument}
                  helperText={settingsErrors.companyDocument}
                  fullWidth
                />
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
                <TextField
                  label="Chave PIX"
                  value={settings.pixKey || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixKey: e.target.value } : prev))}
                  fullWidth
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Favorecido PIX"
                    value={settings.pixRecipientName || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixRecipientName: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Cidade PIX"
                    value={settings.pixCity || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, pixCity: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Banco"
                    value={settings.bankName || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankName: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Agência"
                    value={settings.bankAgency || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAgency: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Conta"
                    value={settings.bankAccount || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAccount: e.target.value } : prev))}
                    fullWidth
                  />
                  <TextField
                    label="Tipo de conta"
                    value={settings.bankAccountType || ''}
                    onChange={(e) => setSettings((prev) => (prev ? { ...prev, bankAccountType: e.target.value } : prev))}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="CNPJ"
                  value={settings.companyDocument || ''}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, companyDocument: formatCnpj(e.target.value) } : prev))}
                  error={!!settingsErrors.companyDocument}
                  helperText={settingsErrors.companyDocument}
                  fullWidth
                />
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

      <Paper sx={{ p: 2, mt: 3, mb: 2 }}>
        {isXs ? (
          <Stack spacing={1.5}>
            <TextField
              label="Buscar mensagem"
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              InputProps={{
                endAdornment: messageFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      size="small"
                      onClick={() => {
                        setMessageFilter('');
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      }}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
              fullWidth
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setMobileMessageFiltersOpen(true)}
              fullWidth
            >
              Filtrar
            </Button>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Buscar mensagem"
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              InputProps={{
                endAdornment: messageFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      size="small"
                      onClick={() => {
                        setMessageFilter('');
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      }}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
              fullWidth
            />
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | ContactMessageStatus)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value={ContactMessageStatus.New}>Nova</MenuItem>
                <MenuItem value={ContactMessageStatus.InProgress}>Em atendimento</MenuItem>
                <MenuItem value={ContactMessageStatus.Resolved}>Resolvida</MenuItem>
                <MenuItem value={ContactMessageStatus.Archived}>Arquivada</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
      </Paper>

      <Drawer
        anchor="bottom"
        open={mobileMessageFiltersOpen}
        onClose={() => setMobileMessageFiltersOpen(false)}
        PaperProps={{ sx: { p: 2, pb: 3, borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ContactMessageStatus)}
              sx={{ minHeight: 48 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value={ContactMessageStatus.New}>Nova</MenuItem>
              <MenuItem value={ContactMessageStatus.InProgress}>Em atendimento</MenuItem>
              <MenuItem value={ContactMessageStatus.Resolved}>Resolvida</MenuItem>
              <MenuItem value={ContactMessageStatus.Archived}>Arquivada</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              variant="text"
              onClick={() => {
                setStatusFilter('all');
                setMobileMessageFiltersOpen(false);
              }}
              fullWidth
            >
              Limpar
            </Button>
            <Button variant="contained" onClick={() => setMobileMessageFiltersOpen(false)} fullWidth>
              Aplicar
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {messagesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {messagesError}
        </Alert>
      )}

      <Paper sx={{ p: 1 }}>
        <DataGrid
          autoHeight
          rows={messages}
          columns={columns}
          rowCount={totalCount}
          loading={loadingMessages}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          getRowHeight={isXs ? () => 'auto' : undefined}
          slots={{
            noRowsOverlay: () => (
              <Stack sx={{ height: 140 }} alignItems="center" justifyContent="center">
                <Typography color="text.secondary">Nenhum registro encontrado.</Typography>
              </Stack>
            ),
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-cell .MuiIconButton-root': {
              width: 48,
              height: 48,
            },
          }}
        />
      </Paper>

      <Menu
        anchorEl={messageMenuAnchorEl}
        open={Boolean(messageMenuAnchorEl)}
        onClose={closeMessageMenu}
      >
        <MenuItem
          onClick={() => {
            if (messageMenuRow) {
              openMessageDialog(messageMenuRow);
            }
            closeMessageMenu();
          }}
        >
          Atender
        </MenuItem>
      </Menu>

      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isXs}
      >
        <DialogTitle>Atendimento da mensagem</DialogTitle>
        <DialogContent sx={{ pb: isXs ? 12 : 2 }}>
          {selectedMessage && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Nome" value={selectedMessage.name} fullWidth InputProps={{ readOnly: true }} />
                <TextField label="E-mail" value={selectedMessage.email} fullWidth InputProps={{ readOnly: true }} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Telefone" value={selectedMessage.phone || ''} fullWidth InputProps={{ readOnly: true }} />
                <TextField label="Assunto" value={selectedMessage.subject} fullWidth InputProps={{ readOnly: true }} />
              </Stack>
              <TextField label="Mensagem" value={selectedMessage.message} multiline minRows={5} fullWidth InputProps={{ readOnly: true }} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={selectedMessage.status} label="Status" onChange={(e) => updateMessageField('status', Number(e.target.value))}>
                    <MenuItem value={ContactMessageStatus.New}>Nova</MenuItem>
                    <MenuItem value={ContactMessageStatus.InProgress}>Em atendimento</MenuItem>
                    <MenuItem value={ContactMessageStatus.Resolved}>Resolvida</MenuItem>
                    <MenuItem value={ContactMessageStatus.Archived}>Arquivada</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Recebida em"
                  value={new Date(selectedMessage.receivedAt).toLocaleString('pt-BR')}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <TextField
                label="Notas administrativas"
                value={selectedMessage.adminNotes || ''}
                onChange={(e) => updateMessageField('adminNotes', e.target.value)}
                multiline
                minRows={4}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        {isXs ? (
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
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setMessageDialogOpen(false)} fullWidth>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSaveMessage} fullWidth>
                Salvar
              </Button>
            </Stack>
          </Box>
        ) : (
          <DialogActions>
            <Button onClick={() => setMessageDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveMessage}>Salvar atendimento</Button>
          </DialogActions>
        )}
      </Dialog>

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
        anchorOrigin={{ vertical: messageDialogOpen ? 'top' : 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DonationsContactPage;
