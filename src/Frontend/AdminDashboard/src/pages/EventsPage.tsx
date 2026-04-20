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
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
import { Event as BatuaraEvent, EventType } from '../types';

type EventFormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  location: string;
  imageUrl: string;
  isActive: boolean;
};

const initialFormState: EventFormState = {
  title: '',
  description: '',
  date: '',
  startTime: '19:00',
  endTime: '21:00',
  type: EventType.Evento,
  location: '',
  imageUrl: '',
  isActive: true,
};

const eventLabels: Record<EventType, string> = {
  [EventType.Festa]: 'Festa',
  [EventType.Evento]: 'Evento',
  [EventType.Celebracao]: 'Celebração',
  [EventType.Bazar]: 'Bazar',
  [EventType.Palestra]: 'Palestra',
};

const EventsPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<BatuaraEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BatuaraEvent | null>(null);
  const [form, setForm] = useState<EventFormState>(initialFormState);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getEvents({
        q: query || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'date:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar os eventos.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [fromDate, paginationModel.page, paginationModel.pageSize, query, statusFilter, toDate, typeFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Data',
      minWidth: 120,
      flex: 0.9,
      renderCell: (params) => new Date(params.row.date).toLocaleDateString('pt-BR'),
    },
    {
      field: 'title',
      headerName: 'Título',
      minWidth: 220,
      flex: 1.5,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      minWidth: 140,
      flex: 0.9,
      renderCell: (params) => <Chip size="small" color="primary" label={eventLabels[params.row.type as EventType]} />,
    },
    {
      field: 'schedule',
      headerName: 'Horário',
      minWidth: 130,
      flex: 0.9,
      valueGetter: (_, row) => {
        if (!row.startTime && !row.endTime) {
          return 'Dia inteiro';
        }

        return `${(row.startTime || '').slice(0, 5)} - ${(row.endTime || '').slice(0, 5)}`;
      },
    },
    {
      field: 'location',
      headerName: 'Local',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => params.row.location || 'Não informado',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.7,
      renderCell: (params) => <Chip size="small" label={params.row.isActive ? 'Ativo' : 'Inativo'} color={params.row.isActive ? 'success' : 'default'} />,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Excluir" onClick={() => handleDelete(params.row.id)} />,
      ],
    },
  ];

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialFormState);
  };

  const handleOpenDialog = (item?: BatuaraEvent) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        description: item.description,
        date: item.date.slice(0, 10),
        startTime: (item.startTime || '').slice(0, 5),
        endTime: (item.endTime || '').slice(0, 5),
        type: item.type,
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        isActive: item.isActive,
      });
    } else {
      resetForm();
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        type: form.type,
        location: form.location || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      };

      if (editingItem) {
        await apiService.updateEvent(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Evento atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createEvent(payload);
        setFeedback({ open: true, message: 'Evento criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadEvents();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o evento.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteEvent(String(id));
      setFeedback({ open: true, message: 'Evento removido com sucesso.', severity: 'success' });
      await loadEvents();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível remover o evento.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Eventos
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            Gerencie eventos públicos, datas especiais, horários, local e disponibilidade no portal.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadEvents}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Novo evento
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={typeFilter} label="Tipo" onChange={(e) => setTypeFilter(e.target.value as 'all' | EventType)}>
              <MenuItem value="all">Todos</MenuItem>
              {Object.entries(eventLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Ativos</MenuItem>
              <MenuItem value="false">Inativos</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="De"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Até"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          columnVisibilityModel={{
            type: !isXs,
            location: !isXs,
            isActive: !isXs,
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar evento' : 'Novo evento'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Data"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={form.type} label="Tipo" onChange={(e) => setForm((prev) => ({ ...prev, type: Number(e.target.value) as EventType }))}>
                  {Object.entries(eventLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Local"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="URL da imagem"
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              fullWidth
            />
            {editingItem && (
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
                label="Evento ativo"
              />
            )}
            <Alert severity="info">
              Os eventos alimentam diretamente o PublicWebsite, então alterações publicadas aparecem para os visitantes após a atualização da consulta.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar evento'}
          </Button>
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

export default EventsPage;
