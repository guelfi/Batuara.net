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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Add as AddIcon, ArrowBackIos as ArrowBackIosIcon, ArrowForwardIos as ArrowForwardIosIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IconButton from '@mui/material/IconButton';
import apiService from '../services/api';
import GridPager from '../components/common/GridPager';
import { Event as BatuaraEvent, EventType } from '../types';

type EventFormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  location: string;
  cardColor: string;
};

const CARD_COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Padrão (por tipo)', value: '' },
  { label: 'Branco', value: '#ffffff' },
  { label: 'Verde escuro', value: '#2e7d32' },
  { label: 'Azul', value: '#1565c0' },
  { label: 'Azul claro', value: '#0288d1' },
  { label: 'Roxo', value: '#6a1b9a' },
  { label: 'Lilás', value: '#9c27b0' },
  { label: 'Laranja', value: '#e65100' },
  { label: 'Vermelho', value: '#b71c1c' },
  { label: 'Verde água', value: '#00695c' },
  { label: 'Rosa', value: '#880e4f' },
  { label: 'Dourado', value: '#f57f17' },
  { label: 'Amarelo', value: '#f9a825' },
  { label: 'Marrom', value: '#4e342e' },
  { label: 'Preto', value: '#212121' },
];

const initialFormState: EventFormState = {
  title: '',
  description: '',
  date: '',
  startTime: '19:00',
  endTime: '21:00',
  type: EventType.Evento,
  location: '',
  cardColor: '',
};

const eventLabels: Record<EventType, string> = {
  [EventType.Festa]: 'Festa',
  [EventType.Evento]: 'Evento',
  [EventType.Celebracao]: 'Celebração',
  [EventType.Bazar]: 'Bazar',
  [EventType.Palestra]: 'Palestra',
};

const eventTypeNameMap: Record<string, EventType> = {
  Festa: EventType.Festa,
  Evento: EventType.Evento,
  Celebracao: EventType.Celebracao,
  Celebração: EventType.Celebracao,
  Bazar: EventType.Bazar,
  Palestra: EventType.Palestra,
};

const normalizeEventType = (type: unknown): EventType | undefined => {
  if (typeof type === 'number') {
    return [EventType.Festa, EventType.Evento, EventType.Celebracao, EventType.Bazar, EventType.Palestra].includes(type as EventType)
      ? (type as EventType)
      : undefined;
  }

  if (typeof type !== 'string') return undefined;

  const numeric = parseInt(type, 10);
  if (!Number.isNaN(numeric)) {
    return normalizeEventType(numeric);
  }

  const raw = type.trim().toLowerCase();
  switch (raw) {
    case 'festa':
      return EventType.Festa;
    case 'evento':
      return EventType.Evento;
    case 'celebração':
    case 'celebracao':
      return EventType.Celebracao;
    case 'bazar':
      return EventType.Bazar;
    case 'palestra':
      return EventType.Palestra;
    default:
      return undefined;
  }
};

const getEventTypeAccentVarName = (type: unknown): string => {
  switch (normalizeEventType(type)) {
    case EventType.Festa:
      return '--batuara-calendar-event-festa';
    case EventType.Evento:
      return '--batuara-calendar-event-evento';
    case EventType.Celebracao:
      return '--batuara-calendar-event-celebracao';
    case EventType.Bazar:
      return '--batuara-calendar-event-bazar';
    case EventType.Palestra:
      return '--batuara-calendar-event-palestra';
    default:
      return '--batuara-calendar-event-evento';
  }
};

const getEventTypeAccentColor = (type: unknown): string => `var(${getEventTypeAccentVarName(type)}, #1976d2)`;

const pad2 = (value: number) => String(value).padStart(2, '0');

const formatDateOnlyPtBr = (value?: string | Date | null) => {
  if (!value) return '';

  if (value instanceof Date) {
    return `${pad2(value.getDate())}/${pad2(value.getMonth() + 1)}/${value.getFullYear()}`;
  }

  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';

  return `${pad2(parsed.getUTCDate())}/${pad2(parsed.getUTCMonth() + 1)}/${parsed.getUTCFullYear()}`;
};

const parseTimeToDate = (time: string) => {
  const parts = time.split(':');
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
};

const parseIsoDateOnlyToDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const toIsoDateOnly = (value: Date) => {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
};

const EventsPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [rows, setRows] = useState<BatuaraEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BatuaraEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [form, setForm] = useState<EventFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handlePrevMonth = () => setSelectedMonthDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonthDate((prev) => addMonths(prev, 1));

  const monthLabel = React.useMemo(() => {
    const raw = format(selectedMonthDate, "MMMM 'de' yyyy", { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedMonthDate]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [selectedMonthDate]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const normalizedQuery = query.trim();
      const isSearching = normalizedQuery.length > 0;
      const selectedYear = selectedMonthDate.getFullYear();
      const fromDate = isSearching ? `${selectedYear}-01-01` : format(startOfMonth(selectedMonthDate), 'yyyy-MM-dd');
      const toDate = isSearching ? `${selectedYear}-12-31` : format(endOfMonth(selectedMonthDate), 'yyyy-MM-dd');

      const response = await apiService.getEvents({
        q: normalizedQuery || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        fromDate,
        toDate,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'date:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os eventos.';
      setRows([]);
      setTotalCount(0);
      setGridError(message);
      setFeedback({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, query, selectedMonthDate, statusFilter, typeFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const columns: GridColDef[] = isXs
    ? [
        {
          field: 'actions',
          type: 'actions',
          width: 56,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
        {
          field: 'summary',
          headerName: 'Evento',
          flex: 1,
          minWidth: 200,
          renderCell: (params) => {
            const dateLabel = formatDateOnlyPtBr(params.row.date);
            const scheduleLabel =
              !params.row.startTime && !params.row.endTime
                ? 'Dia inteiro'
                : `${(params.row.startTime || '').slice(0, 5)} - ${(params.row.endTime || '').slice(0, 5)}`;
            return (
              <Stack spacing={0.25} sx={{ py: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{dateLabel}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.25 }}>{params.row.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{scheduleLabel}</Typography>
              </Stack>
            );
          },
        },
      ]
    : [
        {
          field: 'actions',
          type: 'actions',
          width: 56,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
        {
          field: 'date',
          headerName: 'Data',
          minWidth: 120,
          flex: 0.9,
          renderCell: (params) => formatDateOnlyPtBr(params.row.date),
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
          renderCell: (params) => {
            const normalized = normalizeEventType(params.row.type);
            const accentColor = getEventTypeAccentColor(params.row.type);
            return (
              <Chip
                size="small"
                variant="outlined"
                label={normalized !== undefined ? eventLabels[normalized] : String(params.row.type)}
                sx={{
                  color: accentColor,
                  borderColor: `color-mix(in srgb, ${accentColor} 50%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                  fontWeight: 700,
                }}
              />
            );
          },
        },
        {
          field: 'schedule',
          headerName: 'Horário',
          minWidth: 130,
          flex: 0.9,
          valueGetter: (_, row) => {
            if (!row.startTime && !row.endTime) return 'Dia inteiro';
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
      ];

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialFormState);
  };

  const handleOpenDialog = (item?: BatuaraEvent) => {
    if (item) {
      setEditingItem(item);
      const normalized = normalizeEventType(item.type);
      setForm({
        title: item.title,
        description: item.description,
        date: item.date.slice(0, 10),
        startTime: (item.startTime || '').slice(0, 5),
        endTime: (item.endTime || '').slice(0, 5),
        type: normalized !== undefined ? normalized : EventType.Evento,
        location: item.location || '',
        cardColor: item.cardColor || '',
      });
    } else {
      resetForm();
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
    setFormErrors({});
  };

  const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

  const validateForm = (): typeof formErrors => {
    const nextErrors: typeof formErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Título é obrigatório.';
    if (!form.date) nextErrors.date = 'Data é obrigatória.';
    if (form.date && Number.isNaN(new Date(form.date).getTime())) nextErrors.date = 'Informe uma data válida.';
    if (!form.startTime) nextErrors.startTime = 'Horário de início é obrigatório.';
    else if (!isValidTime(form.startTime)) nextErrors.startTime = 'Formato inválido. Use HH:MM.';
    if (!form.endTime) nextErrors.endTime = 'Horário de fim é obrigatório.';
    else if (!isValidTime(form.endTime)) nextErrors.endTime = 'Formato inválido. Use HH:MM.';
    if (form.startTime && form.endTime && isValidTime(form.startTime) && isValidTime(form.endTime) && form.startTime >= form.endTime) {
      nextErrors.endTime = 'Horário de término deve ser maior que o horário de início.';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ open: true, message: 'Revise os campos obrigatórios antes de salvar.', severity: 'error' });
      return;
    }

    try {
      if (editingItem) {
        const originalDate = (editingItem.date || '').slice(0, 10);
        const originalStart = (editingItem.startTime || '').slice(0, 5);
        const originalEnd = (editingItem.endTime || '').slice(0, 5);

        const payload: any = {};

        const nextTitle = form.title.trim();
        if (nextTitle !== (editingItem.title || '')) payload.title = nextTitle;
        if ((form.description || '') !== (editingItem.description || '')) payload.description = form.description || null;
        if (form.date && form.date !== originalDate) payload.date = form.date;
        if (form.startTime !== originalStart) payload.startTime = form.startTime;
        if (form.endTime !== originalEnd) payload.endTime = form.endTime;
        const normalizedType = normalizeEventType(editingItem.type);
        if (form.type !== normalizedType) payload.type = form.type;
        if ((form.location || '') !== (editingItem.location || '')) payload.location = form.location ? form.location : null;
        if ((form.cardColor || '') !== (editingItem.cardColor || '')) payload.cardColor = form.cardColor || null;

        await apiService.updateEvent(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Evento atualizado com sucesso.', severity: 'success' });
      } else {
        const payload = {
          title: form.title.trim(),
          description: form.description,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          type: form.type,
          location: form.location || undefined,
          cardColor: form.cardColor || undefined,
        };
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

  const handleDeleteEvent = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteEvent(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Evento excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadEvents();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o evento.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Eventos e Festas
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Paper
            variant="outlined"
            sx={{
              px: 2,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <IconButton onClick={handlePrevMonth} size="small" sx={{ width: 48, height: 48 }}>
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ minWidth: { xs: 0, sm: 140 }, flex: 1, textAlign: 'center', fontWeight: 600 }}>
              {monthLabel}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small" sx={{ width: 48, height: 48 }}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Paper>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} fullWidth={isXs}>
            Novo evento
          </Button>
        </Stack>
      </Stack>

      {gridError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {gridError}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        {isXs ? (
          <Stack spacing={1.5}>
            <TextField
              label="Buscar"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQuery(e.target.value)}
              InputProps={{
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      size="small"
                      onClick={() => {
                        setQuery('');
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
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Buscar"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQuery(e.target.value)}
              InputProps={{
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      size="small"
                      onClick={() => {
                        setQuery('');
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
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter === 'all' ? 'all' : String(typeFilter)}
                label="Tipo"
                onChange={(e: SelectChangeEvent) =>
                  setTypeFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as EventType))
                }
              >
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(eventLabels).map(([value, label]) => (
                  <MenuItem key={value} value={String(Number(value))}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 1 }}>
        <GridPager
          page={paginationModel.page}
          pageSize={paginationModel.pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setPaginationModel((prev) => ({ ...prev, page }))}
        />
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10]}
          hideFooter
          disableRowSelectionOnClick
          columnVisibilityModel={
            isXs
              ? undefined
              : {
                  type: !isXs,
                  location: !isXs,
                }
          }
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
            '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
              width: 48,
              height: 48,
            },
          }}
        />
      </Paper>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md" fullScreen={isXs}>
          <DialogTitle>{editingItem ? 'Editar evento' : 'Novo evento'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              sx={formErrors.title ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
            />
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <DatePicker
                label="Data *"
                value={form.date ? parseIsoDateOnlyToDate(form.date) : null}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, date: value ? toIsoDateOnly(value) : '' }))
                }
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.date,
                    helperText: formErrors.date,
                    sx: formErrors.date ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {},
                  },
                }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth error={!!formErrors.startTime}>
                <TimePicker
                  label="Início *"
                  value={form.startTime ? parseTimeToDate(form.startTime) : null}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, startTime: value ? format(value, 'HH:mm') : '' }))
                  }
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.startTime,
                      helperText: formErrors.startTime,
                      sx: formErrors.startTime ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {},
                    },
                  }}
                />
              </FormControl>
              <FormControl fullWidth error={!!formErrors.endTime}>
                <TimePicker
                  label="Fim *"
                  value={form.endTime ? parseTimeToDate(form.endTime) : null}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, endTime: value ? format(value, 'HH:mm') : '' }))
                  }
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.endTime,
                      helperText: formErrors.endTime,
                      sx: formErrors.endTime ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {},
                    },
                  }}
                />
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={String(form.type)}
                  label="Tipo"
                  onChange={(e: SelectChangeEvent) =>
                    setForm((prev) => ({ ...prev, type: Number(e.target.value) as EventType }))
                  }
                >
                  {Object.entries(eventLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Local"
                value={form.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                fullWidth
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Cor do card (PublicWebsite)</InputLabel>
              <Select
                value={form.cardColor}
                label="Cor do card (PublicWebsite)"
                onChange={(e: SelectChangeEvent) =>
                  setForm((prev) => ({ ...prev, cardColor: e.target.value }))
                }
                renderValue={(selected) => {
                  const opt = CARD_COLOR_OPTIONS.find((o) => o.value === selected);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selected && (
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: selected, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                      )}
                      <span>{opt?.label ?? 'Padrão (por tipo)'}</span>
                    </Box>
                  );
                }}
              >
                {CARD_COLOR_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: opt.value || '#e0e0e0', border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info">
              Os eventos alimentam diretamente o PublicWebsite, então alterações publicadas aparecem para os visitantes após a atualização da consulta.
            </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            {editingItem && (
              <Button variant="outlined" color="error" onClick={handleDeleteEvent}>
                Excluir
              </Button>
            )}
            <Button variant="contained" onClick={handleSubmit}>
              {editingItem ? 'Salvar alterações' : 'Criar evento'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir evento</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente e não pode ser desfeita. O evento{' '}
            <strong>{editingItem?.title}</strong> será removido definitivamente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: dialogOpen ? 'top' : 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventsPage;
