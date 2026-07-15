import React from 'react';
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
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '../services/api';
import GridPager from '../components/common/GridPager';
import { AttendanceType, CalendarAttendance } from '../types';

type CalendarFormState = {
  date: string;
  startTime: string;
  endTime: string;
  type: AttendanceType;
  description: string;
  observations: string;
  requiresRegistration: boolean;
  maxCapacity: string;
  isActive: boolean;
};

const initialFormState: CalendarFormState = {
  date: '',
  startTime: '19:00',
  endTime: '21:00',
  type: AttendanceType.Kardecismo,
  description: '',
  observations: '',
  requiresRegistration: false,
  maxCapacity: '',
  isActive: true,
};

const attendanceLabels: Record<AttendanceType, string> = {
  [AttendanceType.Kardecismo]: 'Kardecismo',
  [AttendanceType.Umbanda]: 'Umbanda',
  [AttendanceType.Palestra]: 'Palestra',
  [AttendanceType.Curso]: 'Curso',
  [AttendanceType.Festa]: 'Festa',
};

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

const attendanceTypeColors: Record<AttendanceType, string> = {
  [AttendanceType.Kardecismo]: '#1976d2',
  [AttendanceType.Umbanda]: '#7b1fa2',
  [AttendanceType.Palestra]: '#0288d1',
  [AttendanceType.Curso]: '#388e3c',
  [AttendanceType.Festa]: '#f57c00',
};

const normalizeAttendanceType = (value: unknown): AttendanceType => {
  if (typeof value === 'number') return value as AttendanceType;
  const nameMap: Record<string, AttendanceType> = {
    Kardecismo: AttendanceType.Kardecismo,
    Umbanda: AttendanceType.Umbanda,
    Palestra: AttendanceType.Palestra,
    Curso: AttendanceType.Curso,
    Festa: AttendanceType.Festa,
  };
  if (typeof value === 'string' && nameMap[value] !== undefined) return nameMap[value];
  return AttendanceType.Kardecismo;
};

const getAttendanceTypeColor = (type: unknown): string => {
  const normalized = normalizeAttendanceType(type);
  return attendanceTypeColors[normalized] ?? '#1976d2';
};

interface CalendarPageProps {
  hideTitle?: boolean;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ hideTitle = false }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMonthDate, setSelectedMonthDate] = React.useState(new Date());
  const [rows, setRows] = React.useState<CalendarAttendance[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [gridError, setGridError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CalendarAttendance | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [form, setForm] = React.useState<CalendarFormState>(initialFormState);
  const [formErrors, setFormErrors] = React.useState<{
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    maxCapacity?: string;
  }>({});
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'true' | 'false'>('all');
  const [registrationFilter, setRegistrationFilter] = React.useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadAttendances = React.useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const normalizedQuery = query.trim();
      const isSearching = normalizedQuery.length > 0;
      const selectedYear = selectedMonthDate.getFullYear();
      const response = await apiService.getAttendances({
        q: normalizedQuery || undefined,
        type: typeFilter === 'all' ? undefined : (Number(typeFilter) as AttendanceType),
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        requiresRegistration: registrationFilter === 'all' ? undefined : registrationFilter === 'true',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'date:asc',
        month: isSearching ? undefined : selectedMonthDate.getMonth() + 1,
        year: isSearching ? undefined : selectedYear,
        fromDate: isSearching ? `${selectedYear}-01-01` : undefined,
        toDate: isSearching ? `${selectedYear}-12-31` : undefined,
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os atendimentos.';
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
  }, [paginationModel.page, paginationModel.pageSize, query, registrationFilter, statusFilter, typeFilter, selectedMonthDate]);

  React.useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const columns: GridColDef<CalendarAttendance>[] = isXs
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
          headerName: 'Atendimento',
          flex: 1,
          minWidth: 160,
          renderCell: (params) => (
            <Stack spacing={0.25} sx={{ py: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: 600,
                }}
              >
                {params.row.description || 'Sem descrição'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {formatDateOnlyPtBr(params.row.date)} • {(params.row.startTime || '').slice(0, 5)} - {(params.row.endTime || '').slice(0, 5)}
              </Typography>
            </Stack>
          ),
        },
        {
          field: 'isActive',
          headerName: 'Status',
          width: 90,
          renderCell: (params) => (
            <Chip size="small" label={params.row.isActive ? 'Ativo' : 'Cancelado'} color={params.row.isActive ? 'success' : 'error'} />
          ),
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
          flex: 0.8,
          minWidth: 110,
          renderCell: (params) => formatDateOnlyPtBr(params.row.date),
        },
        {
          field: 'type',
          headerName: 'Tipo',
          minWidth: 130,
          flex: 0.9,
          renderCell: (params) => {
            const normalized = normalizeAttendanceType(params.row.type);
            const color = getAttendanceTypeColor(params.row.type);
            return (
              <Chip
                size="small"
                variant="outlined"
                label={attendanceLabels[normalized]}
                sx={{
                  color,
                  borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                  fontWeight: 700,
                }}
              />
            );
          },
        },
        {
          field: 'schedule',
          headerName: 'Horário',
          flex: 0.8,
          minWidth: 120,
          valueGetter: (_, row) => `${(row.startTime || '').slice(0, 5)} - ${(row.endTime || '').slice(0, 5)}`,
        },
        {
          field: 'description',
          headerName: 'Descrição',
          flex: 1.5,
          minWidth: 200,
          renderCell: (params) => params.row.description || 'Sem descrição',
        },
        {
          field: 'requiresRegistration',
          headerName: 'Inscrição',
          flex: 0.7,
          minWidth: 110,
          renderCell: (params) => (
            <Chip
              size="small"
              label={params.row.requiresRegistration ? 'Obrigatória' : 'Livre'}
              color={params.row.requiresRegistration ? 'warning' : 'default'}
            />
          ),
        },
        {
          field: 'isActive',
          headerName: 'Status',
          flex: 0.7,
          minWidth: 110,
          renderCell: (params) => (
            <Chip size="small" label={params.row.isActive ? 'Ativo' : 'Cancelado'} color={params.row.isActive ? 'success' : 'error'} />
          ),
        },
      ];

  const handlePrevMonth = () => setSelectedMonthDate((prev: Date) => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonthDate((prev: Date) => addMonths(prev, 1));

  const monthLabel = React.useMemo(() => {
    const raw = format(selectedMonthDate, "MMMM 'de' yyyy", { locale: ptBR });
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [selectedMonthDate]);

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialFormState);
  };

  const handleOpenDialog = (item?: CalendarAttendance) => {
    if (item) {
      setEditingItem(item);
      setForm({
        date: item.date.slice(0, 10),
        startTime: (item.startTime || '').slice(0, 5),
        endTime: (item.endTime || '').slice(0, 5),
        type: normalizeAttendanceType(item.type),
        description: item.description || '',
        observations: item.observations || '',
        requiresRegistration: item.requiresRegistration,
        maxCapacity: item.maxCapacity ? String(item.maxCapacity) : '',
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
    setFormErrors({});
  };

  const handleDeleteAttendance = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteAttendance(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Atendimento excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadAttendances();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o atendimento.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = (): typeof formErrors => {
    const nextErrors: typeof formErrors = {};

    if (!form.description.trim()) nextErrors.description = 'Descrição é obrigatória.';
    if (!form.date) nextErrors.date = 'Data é obrigatória.';
    if (form.date && Number.isNaN(new Date(form.date).getTime())) nextErrors.date = 'Informe uma data válida.';

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      nextErrors.endTime = 'Horário de término deve ser maior que o horário de início.';
    }

    if (form.maxCapacity) {
      const value = Number(form.maxCapacity);
      if (Number.isNaN(value)) nextErrors.maxCapacity = 'Informe um número válido.';
      else if (value < 0) nextErrors.maxCapacity = 'Capacidade deve ser maior ou igual a 0.';
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
        const originalMaxCapacity = editingItem.maxCapacity ?? null;
        const originalObservations = editingItem.observations ?? '';

        const payload: any = {};

        if (form.date && form.date !== originalDate) payload.date = form.date;
        if (form.startTime && form.startTime !== originalStart) payload.startTime = form.startTime;
        if (form.endTime && form.endTime !== originalEnd) payload.endTime = form.endTime;
        if (form.type !== normalizeAttendanceType(editingItem.type)) payload.type = form.type;

        const nextDescription = form.description.trim();
        if (nextDescription !== (editingItem.description || '')) payload.description = nextDescription;

        if ((form.observations || '') !== originalObservations) {
          payload.observations = form.observations ? form.observations : null;
        }

        if (form.requiresRegistration !== !!editingItem.requiresRegistration) payload.requiresRegistration = form.requiresRegistration;

        const nextMaxCapacity = form.maxCapacity ? Number(form.maxCapacity) : null;
        if (nextMaxCapacity !== originalMaxCapacity) payload.maxCapacity = nextMaxCapacity;

        if (form.isActive !== !!editingItem.isActive) payload.isActive = form.isActive;

        await apiService.updateAttendance(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Atendimento atualizado com sucesso.', severity: 'success' });
      } else {
        const payload = {
          date: form.date,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          type: form.type,
          description: form.description.trim() || undefined,
          observations: form.observations || undefined,
          requiresRegistration: form.requiresRegistration,
          maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
          isActive: form.isActive,
        };
        await apiService.createAttendance(payload);
        setFeedback({ open: true, message: 'Atendimento criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadAttendances();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o atendimento.',
        severity: 'error',
      });
    }
  };


  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        {!hideTitle && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Calendário de Atendimentos
            </Typography>
          </Box>
        )}
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
            Novo atendimento
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
                value={typeFilter}
                label="Tipo"
                onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(attendanceLabels)
                  .map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
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
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Inscrição</InputLabel>
              <Select
                value={registrationFilter}
                label="Inscrição"
                onChange={(e: SelectChangeEvent) => setRegistrationFilter(e.target.value as 'all' | 'true' | 'false')}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="true">Obrigatória</MenuItem>
                <MenuItem value="false">Livre</MenuItem>
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
          columnVisibilityModel={isXs ? undefined : { description: true, requiresRegistration: true }}
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
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm" fullScreen={isXs}>
          <DialogTitle>{editingItem ? 'Editar atendimento' : 'Novo atendimento'}</DialogTitle>
          <DialogContent sx={{ pb: isXs ? 12 : 2 }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev: CalendarFormState) => ({ ...prev, description: e.target.value }))
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
              fullWidth
              sx={formErrors.description ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <DatePicker
                label="Data"
                value={form.date ? parseIsoDateOnlyToDate(form.date) : null}
                onChange={(value) =>
                  setForm((prev: CalendarFormState) => ({
                    ...prev,
                    date: value ? toIsoDateOnly(value) : '',
                  }))
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
              <TimePicker
                label="Início"
                value={form.startTime ? parseTimeToDate(form.startTime) : null}
                onChange={(value) =>
                  setForm((prev: CalendarFormState) => ({
                    ...prev,
                    startTime: value ? format(value, 'HH:mm') : '',
                  }))
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
              <TimePicker
                label="Fim"
                value={form.endTime ? parseTimeToDate(form.endTime) : null}
                onChange={(value) =>
                  setForm((prev: CalendarFormState) => ({
                    ...prev,
                    endTime: value ? format(value, 'HH:mm') : '',
                  }))
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
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={String(form.type)}
                  label="Tipo"
                  onChange={(e: SelectChangeEvent) =>
                    setForm((prev: CalendarFormState) => ({ ...prev, type: Number(e.target.value) as AttendanceType }))
                  }
                >
                  {Object.entries(attendanceLabels)
                    .map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                label="Capacidade máxima"
                type="number"
                value={form.maxCapacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev: CalendarFormState) => ({ ...prev, maxCapacity: e.target.value }))
                }
                error={!!formErrors.maxCapacity}
                helperText={formErrors.maxCapacity}
                fullWidth
                sx={formErrors.maxCapacity ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              />
            </Stack>
            <TextField
              label="Observações"
              value={form.observations}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev: CalendarFormState) => ({ ...prev, observations: e.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.requiresRegistration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((prev: CalendarFormState) => ({ ...prev, requiresRegistration: e.target.checked }))
                  }
                />
              }
              label="Exige inscrição prévia"
            />
            {editingItem && (
              <FormControlLabel
                control={
                  <Switch
                    color="error"
                    checked={!form.isActive}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((prev: CalendarFormState) => ({ ...prev, isActive: !e.target.checked }))
                    }
                  />
                }
                label="Cancelar atendimento"
              />
            )}
            {(form.type === AttendanceType.Festa || form.type === AttendanceType.Curso || form.type === AttendanceType.Palestra) && (
              <Alert severity="warning">
                Atenção: Para eventos especiais como Festas, Bazares ou Cursos, recomendamos utilizar a seção{' '}
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  Eventos e Festas
                </Typography>{' '}
                para garantir a correta exibição de imagens e descrições detalhadas.
              </Alert>
            )}
            <Alert severity="info">
              O backend valida conflitos de horário com outros atendimentos e eventos especiais da mesma data.
            </Alert>
            </Stack>
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
                <Button onClick={handleCloseDialog} fullWidth>
                  Cancelar
                </Button>
                {editingItem && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteAttendance}
                    disabled={deleting}
                    fullWidth
                  >
                    Excluir
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  fullWidth
                >
                  {editingItem ? 'Salvar' : 'Criar'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              {editingItem && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteAttendance}
                  disabled={deleting}
                >
                  Excluir
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
              >
                {editingItem ? 'Salvar alterações' : 'Criar atendimento'}
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </LocalizationProvider>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir atendimento</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente e não pode ser desfeita. O atendimento de{' '}
            <strong>{editingItem ? formatDateOnlyPtBr(editingItem.date) : ''}</strong> será removido definitivamente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((prev: typeof feedback) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: dialogOpen ? 'top' : 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((prev: typeof feedback) => ({ ...prev, open: false }))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalendarPage;
