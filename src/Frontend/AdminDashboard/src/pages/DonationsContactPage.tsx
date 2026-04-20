import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Refresh as RefreshIcon, Save as SaveIcon } from '@mui/icons-material';
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
  const [settings, setSettings] = useState<SiteSettingsDto | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messageFilter, setMessageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
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
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar as mensagens recebidas.',
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

  const handleSave = async () => {
    if (!settings) {
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
        pixRecipientName: settings.pixRecipientName,
        pixCity: settings.pixCity,
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

  const columns: GridColDef[] = [
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
      renderCell: (params) => <Chip size="small" label={getStatusLabel(params.row.status)} color={getStatusColor(params.row.status)} />,
    },
    {
      field: 'actions',
      type: 'actions',
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Atender" onClick={() => {
          setSelectedMessage(params.row);
          setMessageDialogOpen(true);
        }} />,
      ],
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
        <RefreshIcon />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Doações e Contato
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            Administre os dados bancários, PIX, canais institucionais e a fila de mensagens recebidas pelo PublicWebsite.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { loadSettings(); loadMessages(); }}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contato institucional
            </Typography>
            <Stack spacing={2}>
              <TextField label="E-mail institucional" value={settings.institutionalEmail} onChange={(e) => setSettings((prev) => prev ? { ...prev, institutionalEmail: e.target.value } : prev)} fullWidth />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Telefone principal" value={settings.primaryPhone} onChange={(e) => setSettings((prev) => prev ? { ...prev, primaryPhone: e.target.value } : prev)} fullWidth />
                <TextField label="Telefone secundário" value={settings.secondaryPhone || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, secondaryPhone: e.target.value } : prev)} fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="WhatsApp" value={settings.whatsappNumber || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, whatsappNumber: e.target.value } : prev)} fullWidth />
                <TextField label="Horário de atendimento" value={settings.serviceHours || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, serviceHours: e.target.value } : prev)} fullWidth />
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
              <TextField label="Chave PIX" value={settings.pixKey || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, pixKey: e.target.value } : prev)} fullWidth />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Favorecido PIX" value={settings.pixRecipientName || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, pixRecipientName: e.target.value } : prev)} fullWidth />
                <TextField label="Cidade PIX" value={settings.pixCity || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, pixCity: e.target.value } : prev)} fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Banco" value={settings.bankName || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, bankName: e.target.value } : prev)} fullWidth />
                <TextField label="Agência" value={settings.bankAgency || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, bankAgency: e.target.value } : prev)} fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Conta" value={settings.bankAccount || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, bankAccount: e.target.value } : prev)} fullWidth />
                <TextField label="Tipo de conta" value={settings.bankAccountType || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, bankAccountType: e.target.value } : prev)} fullWidth />
              </Stack>
              <TextField label="CNPJ" value={settings.companyDocument || ''} onChange={(e) => setSettings((prev) => prev ? { ...prev, companyDocument: e.target.value } : prev)} fullWidth />
              <Alert severity="info">
                {settings.pixPayload ? 'O payload PIX será regenerado automaticamente no backend a cada atualização.' : 'Ao salvar uma chave PIX válida, o backend gera automaticamente o payload para QR Code.'}
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mt: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Buscar mensagem" value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)} fullWidth />
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
      </Paper>

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
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Atendimento da mensagem</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveMessage}>Salvar atendimento</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DonationsContactPage;
