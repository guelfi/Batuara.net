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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
import { UmbandaLine } from '../types';

type UmbandaLineForm = {
  name: string;
  description: string;
  characteristics: string;
  batuaraInterpretation: string;
  displayOrder: string;
  entities: string;
  workingDays: string;
  isActive: boolean;
};

const initialForm: UmbandaLineForm = {
  name: '',
  description: '',
  characteristics: '',
  batuaraInterpretation: '',
  displayOrder: '0',
  entities: '',
  workingDays: '',
  isActive: true,
};

const UmbandaLinesPage: React.FC = () => {
  const [rows, setRows] = useState<UmbandaLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UmbandaLine | null>(null);
  const [form, setForm] = useState<UmbandaLineForm>(initialForm);
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadLines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getUmbandaLines({
        q: query || undefined,
        entity: entityFilter || undefined,
        workingDay: dayFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'displayOrder:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar as linhas de Umbanda.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [dayFilter, entityFilter, paginationModel.page, paginationModel.pageSize, query, statusFilter]);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

  const columns: GridColDef[] = [
      { field: 'displayOrder', headerName: 'Ordem', width: 90 },
      { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180 },
      {
        field: 'entities',
        headerName: 'Entidades',
        flex: 1.2,
        minWidth: 200,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {params.row.entities.slice(0, 2).map((entity: string) => (
              <Chip key={entity} label={entity} size="small" />
            ))}
            {params.row.entities.length > 2 && <Chip label={`+${params.row.entities.length - 2}`} size="small" variant="outlined" />}
          </Stack>
        ),
      },
      {
        field: 'workingDays',
        headerName: 'Dias',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => params.row.workingDays.join(', ') || 'Não informado',
      },
      {
        field: 'isActive',
        headerName: 'Status',
        width: 110,
        renderCell: (params) => <Chip size="small" label={params.row.isActive ? 'Ativa' : 'Inativa'} color={params.row.isActive ? 'success' : 'default'} />,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 110,
        getActions: (params) => [
          <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          <GridActionsCellItem icon={<DeleteIcon />} label="Excluir" onClick={() => handleDelete(params.row.id)} />,
        ],
      },
  ];

  const handleOpenDialog = (item?: UmbandaLine) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description,
        characteristics: item.characteristics,
        batuaraInterpretation: item.batuaraInterpretation,
        displayOrder: String(item.displayOrder),
        entities: item.entities.join(', '),
        workingDays: item.workingDays.join(', '),
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setForm(initialForm);
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      characteristics: form.characteristics,
      batuaraInterpretation: form.batuaraInterpretation,
      displayOrder: Number(form.displayOrder || 0),
      entities: form.entities.split(',').map((item) => item.trim()).filter(Boolean),
      workingDays: form.workingDays.split(',').map((item) => item.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (editingItem) {
        await apiService.updateUmbandaLine(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Linha de Umbanda atualizada com sucesso.', severity: 'success' });
      } else {
        await apiService.createUmbandaLine(payload);
        setFeedback({ open: true, message: 'Linha de Umbanda criada com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadLines();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar a linha de Umbanda.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteUmbandaLine(String(id));
      setFeedback({ open: true, message: 'Linha de Umbanda removida com sucesso.', severity: 'success' });
      await loadLines();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível remover a linha de Umbanda.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Linhas de Umbanda
          </Typography>
          <Typography color="text.secondary">
            Organize as linhas, entidades vinculadas, dias de trabalho e interpretação doutrinária da casa.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLines}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Nova linha
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          <TextField label="Entidade" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} fullWidth />
          <TextField label="Dia de trabalho" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} fullWidth />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Ativas</MenuItem>
              <MenuItem value="false">Inativas</MenuItem>
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
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar linha de Umbanda' : 'Nova linha de Umbanda'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Nome" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
              <TextField
                label="Ordem de exibição"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                sx={{ minWidth: 160 }}
              />
            </Stack>
            <TextField label="Descrição" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={3} />
            <TextField label="Características" value={form.characteristics} onChange={(e) => setForm((prev) => ({ ...prev, characteristics: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField
              label="Interpretação Batuara"
              value={form.batuaraInterpretation}
              onChange={(e) => setForm((prev) => ({ ...prev, batuaraInterpretation: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Entidades (separadas por vírgula)"
              value={form.entities}
              onChange={(e) => setForm((prev) => ({ ...prev, entities: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Dias de trabalho (separados por vírgula)"
              value={form.workingDays}
              onChange={(e) => setForm((prev) => ({ ...prev, workingDays: e.target.value }))}
              fullWidth
            />
            {editingItem && (
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
                label="Linha ativa"
              />
            )}
            <Alert severity="info">
              Use o mesmo vocabulário doutrinário adotado no portal público para manter consistência editorial e semântica.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar linha'}
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

export default UmbandaLinesPage;
