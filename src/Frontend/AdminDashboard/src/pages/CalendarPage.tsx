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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
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

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMonthDate, setSelectedMonthDate] = React.useState(new Date());
  const [rows, setRows] = React.useState<CalendarAttendance[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CalendarAttendance | null>(null);
  const [form, setForm] = React.useState<CalendarFormState>(initialFormState);
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
    try {
      const response = await apiService.getAttendances({
        q: query || undefined,
        type: typeFilter === 'all' ? undefined : (Number(typeFilter) as AttendanceType),
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        requiresRegistration: registrationFilter === 'all' ? undefined : registrationFilter === 'true',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'date:asc',
        month: selectedMonthDate.getMonth() + 1,
        year: selectedMonthDate.getFullYear(),
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar os atendimentos.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, query, registrationFilter, statusFilter, typeFilter, selectedMonthDate]);

  React.useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const columns: GridColDef<CalendarAttendance>[] = [
      {
        field: 'date',
        headerName: 'Data',
        flex: 1,
        minWidth: 120,
        renderCell: (params) => new Date(params.row.date).toLocaleDateString('pt-BR'),
      },
      {
        field: 'type',
        headerName: 'Tipo',
        flex: 1,
        minWidth: 140,
        renderCell: (params) => <Chip size="small" color="primary" label={attendanceLabels[params.row.type as AttendanceType]} />,
      },
      {
        field: 'schedule',
        headerName: 'Horário',
        flex: 1,
        minWidth: 130,
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
        flex: 0.9,
        minWidth: 120,
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
        flex: 0.8,
        minWidth: 110,
        renderCell: (params) => (
          <Chip size="small" label={params.row.isActive ? 'Ativo' : 'Inativo'} color={params.row.isActive ? 'success' : 'default'} />
        ),
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
        type: item.type,
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
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        type: form.type,
        description: form.description || undefined,
        observations: form.observations || undefined,
        requiresRegistration: form.requiresRegistration,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
        isActive: form.isActive,
      };

      if (editingItem) {
        await apiService.updateAttendance(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Atendimento atualizado com sucesso.', severity: 'success' });
      } else {
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

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteAttendance(String(id));
      setFeedback({ open: true, message: 'Atendimento removido com sucesso.', severity: 'success' });
      await loadAttendances();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível remover o atendimento.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Calendário de Atendimentos
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            Gerencie horários e conflitos operacionais. Eventos especiais (Festas/Bazares) devem ser geridos em [Eventos e Festas].
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Paper variant="outlined" sx={{ px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevMonth} size="small">
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ minWidth: 140, textAlign: 'center', fontWeight: 600 }}>
              {monthLabel}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Paper>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadAttendances}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Novo atendimento
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Buscar"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQuery(e.target.value)}
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
              {Object.entries(attendanceLabels).map(([value, label]) => (
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
            description: !isXs,
            requiresRegistration: !isXs,
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Editar atendimento' : 'Novo atendimento'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev: CalendarFormState) => ({ ...prev, description: e.target.value }))
              }
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Data"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev: CalendarFormState) => ({ ...prev, date: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.startTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev: CalendarFormState) => ({ ...prev, startTime: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.endTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev: CalendarFormState) => ({ ...prev, endTime: e.target.value }))
                }
                fullWidth
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
                  {Object.entries(attendanceLabels).map(([value, label]) => (
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
                fullWidth
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
                    checked={form.isActive}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((prev: CalendarFormState) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                }
                label="Atendimento ativo"
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={editingItem !== null && (form.type === AttendanceType.Festa || form.type === AttendanceType.Curso)}
          >
            {editingItem ? 'Salvar alterações' : 'Criar atendimento'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((prev: typeof feedback) => ({ ...prev, open: false }))}
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
