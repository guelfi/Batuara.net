import React, { useCallback, useEffect, useState } from 'react';
import {
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
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
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

const ContactMessagesPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<ContactMessage | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadMessages = useCallback(async () => {
    setLoading(true);
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
      const msg = error?.response?.data?.message || 'Não foi possível carregar as mensagens recebidas.';
      setMessages([]);
      setTotalCount(0);
      setMessagesError(msg);
      setFeedback({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [messageFilter, paginationModel.page, paginationModel.pageSize, statusFilter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const openDialog = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDialogOpen(true);
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

  const handleSaveMessage = async () => {
    if (!selectedMessage) return;
    try {
      await apiService.updateContactMessageStatus(String(selectedMessage.id), {
        status: selectedMessage.status,
        adminNotes: selectedMessage.adminNotes || undefined,
      });
      setFeedback({ open: true, message: 'Status da mensagem atualizado.', severity: 'success' });
      setDialogOpen(false);
      await loadMessages();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível atualizar a mensagem.',
        severity: 'error',
      });
    }
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
            <IconButton aria-label="Ações da mensagem" onClick={(e) => openMenu(e, params.row)}>
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
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Atender" onClick={() => openDialog(params.row)} />,
          ],
        },
      ];

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Contato e Mensagens
          </Typography>
          <Typography color="text.secondary">
            Gerencie as mensagens recebidas pelo formulário de contato do site.
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md" fullScreen={isXs}>
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
              <Button onClick={() => setDialogOpen(false)} fullWidth>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSaveMessage} fullWidth>
                Salvar
              </Button>
            </Stack>
          </Box>
        ) : (
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
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
