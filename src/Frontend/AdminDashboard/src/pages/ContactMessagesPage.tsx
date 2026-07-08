import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  MoreVert as MoreVertIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { ContactMessage, ContactMessageStatus } from '../types';

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

const getWhatsAppChip = (message: ContactMessage) => {
  if (message.whatsAppResponseSentAt) {
    return <Chip size="small" color="success" icon={<WhatsAppIcon />} label="Respondida" />;
  }

  if (message.wantsWhatsAppResponse) {
    return <Chip size="small" color="info" icon={<WhatsAppIcon />} label="Solicitou" />;
  }

  return <Chip size="small" variant="outlined" label="Não solicitou" />;
};

const ContactMessagesPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [whatsAppResponse, setWhatsAppResponse] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<ContactMessage | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await apiService.getContactMessagesUnreadCount();
      setUnreadCount(count);
    } catch (_) {}
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setMessagesError(null);
    try {
      const response = await apiService.getContactMessages({
        q: messageFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        isRead: readFilter === 'all' ? undefined : readFilter === 'read',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'receivedAt:desc',
      });
      setMessages(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Não foi possível carregar as mensagens recebidas.';
      setMessages([]);
      setTotalCount(0);
      setMessagesError(msg);
      setFeedback({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [messageFilter, paginationModel.page, paginationModel.pageSize, statusFilter, readFilter]);

  useEffect(() => {
    loadUnreadCount();
    loadMessages();
  }, [loadUnreadCount, loadMessages]);

  const closeDialog = async () => {
    setDialogOpen(false);
    await loadUnreadCount();
  };

  const openDialog = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setWhatsAppResponse('');
    setDialogOpen(true);
    if (!msg.isRead) {
      try {
        await apiService.markContactMessageAsRead(String(msg.id), true);
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent('unread-count-changed'));
      } catch (_) {}
    }
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, row: ContactMessage) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  };

  const updateField = (field: keyof ContactMessage, value: string | number) => {
    setSelectedMessage((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    const newRead = !msg.isRead;
    try {
      await apiService.markContactMessageAsRead(String(msg.id), newRead);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: newRead } : m)));
      setSelectedMessage((prev) => (prev && prev.id === msg.id ? { ...prev, isRead: newRead } : prev));
      setUnreadCount((prev) => (newRead ? Math.max(0, prev - 1) : prev + 1));
      window.dispatchEvent(new CustomEvent('unread-count-changed'));
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível atualizar a mensagem.',
        severity: 'error',
      });
    }
  };

  const handleSaveMessage = async () => {
    if (!selectedMessage) return;
    try {
      await apiService.updateContactMessageStatus(String(selectedMessage.id), {
        status: selectedMessage.status,
        adminNotes: selectedMessage.adminNotes || undefined,
      });
      setFeedback({ open: true, message: 'Status da mensagem atualizado.', severity: 'success' });
      await closeDialog();
      await loadMessages();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível atualizar a mensagem.',
        severity: 'error',
      });
    }
  };

  const handleSendWhatsAppResponse = async () => {
    if (!selectedMessage) return;
    if (!whatsAppResponse.trim()) {
      setFeedback({ open: true, message: 'Informe a resposta para enviar por WhatsApp.', severity: 'error' });
      return;
    }

    setSendingWhatsApp(true);
    try {
      const response = await apiService.sendContactWhatsAppResponse(String(selectedMessage.id), whatsAppResponse.trim());
      setSelectedMessage(response.data);
      setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? response.data : m)));
      setWhatsAppResponse('');
      setFeedback({ open: true, message: 'Resposta enviada por WhatsApp e mensagem marcada como resolvida.', severity: 'success' });
      await loadUnreadCount();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível enviar a resposta por WhatsApp.',
        severity: 'error',
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const columns: GridColDef[] = isXs
    ? [
        {
          field: 'name',
          headerName: 'Nome',
          flex: 1,
          minWidth: 160,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!params.row.isRead && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: params.row.isRead ? 400 : 700 }}>
                {params.row.name}
              </Typography>
            </Box>
          ),
        },
        { field: 'subject', headerName: 'Assunto', flex: 1.2, minWidth: 180 },
        {
          field: 'wantsWhatsAppResponse',
          headerName: 'WhatsApp',
          width: 140,
          sortable: false,
          renderCell: (params) => getWhatsAppChip(params.row),
        },
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
            <IconButton aria-label="Ações da mensagem" onClick={(e) => openMenu(e, params.row)}>
              <MoreVertIcon />
            </IconButton>
          ),
        },
      ]
    : [
        {
          field: 'actions',
          type: 'actions',
          width: 56,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Atender" onClick={() => openDialog(params.row)} />,
          ],
        },
        {
          field: 'name',
          headerName: 'Nome',
          flex: 1,
          minWidth: 180,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!params.row.isRead && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: params.row.isRead ? 400 : 700 }}>
                {params.row.name}
              </Typography>
            </Box>
          ),
        },
        {
          field: 'subject',
          headerName: 'Assunto',
          flex: 1,
          minWidth: 220,
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontWeight: params.row.isRead ? 400 : 600 }}>
              {params.row.subject}
            </Typography>
          ),
        },
        { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220 },
        {
          field: 'wantsWhatsAppResponse',
          headerName: 'WhatsApp',
          width: 150,
          sortable: false,
          renderCell: (params) => getWhatsAppChip(params.row),
        },
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
      ];

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Contato e Mensagens
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography color="text.secondary">
            Gerencie as mensagens recebidas pelo formulário de contato do site.
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            value={readFilter}
            exclusive
            onChange={(_e, val) => { if (val !== null) { setReadFilter(val); setPaginationModel((prev) => ({ ...prev, page: 0 })); } }}
            size="small"
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="unread">
              <Badge badgeContent={unreadCount} color="primary" max={99}>
                <Box sx={{ pr: unreadCount > 0 ? 1 : 0 }}>Não lidas</Box>
              </Badge>
            </ToggleButton>
            <ToggleButton value="read">Lidas</ToggleButton>
          </ToggleButtonGroup>

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
              onClick={() => setMobileFiltersOpen(true)}
              fullWidth
            >
              Filtrar
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
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
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ContactMessageStatus)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value={ContactMessageStatus.New}>Nova</MenuItem>
                <MenuItem value={ContactMessageStatus.InProgress}>Em atendimento</MenuItem>
                <MenuItem value={ContactMessageStatus.Resolved}>Resolvida</MenuItem>
                <MenuItem value={ContactMessageStatus.Archived}>Arquivada</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
        </Stack>
      </Paper>

      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
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
                setMobileFiltersOpen(false);
              }}
              fullWidth
            >
              Limpar
            </Button>
            <Button variant="contained" onClick={() => setMobileFiltersOpen(false)} fullWidth>
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

      {loading && !messages.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 1 }}>
          <DataGrid
            autoHeight
            rows={messages}
            columns={columns}
            rowCount={totalCount}
            loading={loading}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            getRowHeight={isXs ? () => 'auto' : undefined}
            slots={{
              noRowsOverlay: () => (
                <Stack sx={{ height: 140 }} alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">Nenhuma mensagem encontrada.</Typography>
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
      )}

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) openDialog(menuRow);
            closeMenu();
          }}
        >
          Atender
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md" fullScreen={isXs}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Atendimento da mensagem</span>
            {selectedMessage && (
              <Tooltip title={selectedMessage.isRead ? 'Marcar como não lida' : 'Marcar como lida'}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleRead(selectedMessage)}
                  color={selectedMessage.isRead ? 'default' : 'primary'}
                >
                  {selectedMessage.isRead ? <MarkUnreadIcon /> : <MarkReadIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogTitle>
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
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  color={selectedMessage.isRead ? 'default' : 'primary'}
                  label={selectedMessage.isRead ? 'Lida' : 'Não lida'}
                />
                <Chip
                  size="small"
                  color={selectedMessage.wantsWhatsAppResponse ? 'success' : 'default'}
                  label={selectedMessage.wantsWhatsAppResponse ? 'Aceita resposta por WhatsApp' : 'Não solicitou WhatsApp'}
                />
                {selectedMessage.whatsAppResponseSentAt && (
                  <Chip size="small" color="success" label={`Respondida em ${new Date(selectedMessage.whatsAppResponseSentAt).toLocaleString('pt-BR')}`} />
                )}
              </Stack>
              <Alert severity={selectedMessage.isRead ? 'info' : 'warning'}>
                {selectedMessage.isRead
                  ? 'Esta mensagem já foi marcada como lida.'
                  : 'Esta mensagem ainda está marcada como não lida.'}{' '}
                <Button size="small" onClick={() => handleToggleRead(selectedMessage)} sx={{ ml: 1 }}>
                  {selectedMessage.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                </Button>
              </Alert>
              <TextField label="Mensagem" value={selectedMessage.message} multiline minRows={5} fullWidth InputProps={{ readOnly: true }} />
              <Paper variant="outlined" sx={{ p: 2, borderColor: selectedMessage.wantsWhatsAppResponse ? 'success.light' : 'divider' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <WhatsAppIcon color={selectedMessage.wantsWhatsAppResponse ? 'success' : 'disabled'} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Resposta por WhatsApp
                    </Typography>
                    {getWhatsAppChip(selectedMessage)}
                  </Stack>

                  {!selectedMessage.wantsWhatsAppResponse ? (
                    <Alert severity="info">
                      O visitante não marcou a opção para receber resposta por WhatsApp no formulário público. Use o e-mail ou atualize apenas o atendimento interno.
                    </Alert>
                  ) : !selectedMessage.phone ? (
                    <Alert severity="warning">
                      O visitante autorizou WhatsApp, mas a mensagem não possui telefone salvo. Não é possível enviar resposta por WhatsApp.
                    </Alert>
                  ) : (
                    <>
                      {selectedMessage.whatsAppResponseText && (
                        <Alert severity="success">
                          Última resposta enviada em {selectedMessage.whatsAppResponseSentAt ? new Date(selectedMessage.whatsAppResponseSentAt).toLocaleString('pt-BR') : 'data não registrada'}: {selectedMessage.whatsAppResponseText}
                        </Alert>
                      )}
                      <TextField
                        label="Mensagem de resposta"
                        value={whatsAppResponse}
                        onChange={(e) => setWhatsAppResponse(e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                        disabled={sendingWhatsApp}
                        helperText="Ao enviar, a mensagem será marcada como resolvida e lida."
                      />
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={sendingWhatsApp ? <CircularProgress size={18} color="inherit" /> : <WhatsAppIcon />}
                        onClick={handleSendWhatsAppResponse}
                        disabled={sendingWhatsApp || !whatsAppResponse.trim()}
                        sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}
                      >
                        Enviar resposta por WhatsApp
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedMessage.status}
                    label="Status"
                    onChange={(e) => updateField('status', Number(e.target.value))}
                  >
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
                onChange={(e) => updateField('adminNotes', e.target.value)}
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
              <Button onClick={closeDialog} fullWidth>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSaveMessage} fullWidth>
                Salvar
              </Button>
            </Stack>
          </Box>
        ) : (
          <DialogActions>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveMessage}>
              Salvar atendimento
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: dialogOpen ? 'top' : 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactMessagesPage;
