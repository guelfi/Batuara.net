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
import { Orixa } from '../types';

type OrixaFormState = {
  name: string;
  description: string;
  origin: string;
  batuaraTeaching: string;
  displayOrder: string;
  characteristics: string;
  colors: string;
  elements: string;
  imageUrl: string;
  isActive: boolean;
};

type OrixaFormErrors = Partial<Record<keyof OrixaFormState, string>>;

const validateOrixaForm = (form: OrixaFormState): OrixaFormErrors => {
  const errors: OrixaFormErrors = {};
  if (!form.name.trim()) errors.name = 'Nome é obrigatório.';
  if (!form.description.trim()) errors.description = 'Descrição é obrigatória.';
  if (!form.origin.trim()) errors.origin = 'Origem é obrigatória.';
  if (!form.batuaraTeaching.trim()) errors.batuaraTeaching = 'Ensinamento Batuara é obrigatório.';
  if (!form.colors.trim()) errors.colors = 'Informe pelo menos uma cor.';
  return errors;
};

const initialFormState: OrixaFormState = {
  name: '',
  description: '',
  origin: '',
  batuaraTeaching: '',
  displayOrder: '1',
  characteristics: '',
  colors: '',
  elements: '',
  imageUrl: '',
  isActive: true,
};

const splitCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

const OrixasPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<Orixa[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Orixa | null>(null);
  const [form, setForm] = useState<OrixaFormState>(initialFormState);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [formErrors, setFormErrors] = useState<OrixaFormErrors>({});
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadOrixas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getOrixas({
        q: query || undefined,
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
        message: error?.response?.data?.message || 'Não foi possível carregar os Orixás.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, query, statusFilter]);

  useEffect(() => {
    loadOrixas();
  }, [loadOrixas]);

  const columns: GridColDef[] = [
    { field: 'displayOrder', headerName: 'Ordem', width: 90 },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180 },
    {
      field: 'colors',
      headerName: 'Cores',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {params.row.colors.slice(0, 2).map((color: string) => (
            <Chip key={color} label={color} size="small" />
          ))}
          {params.row.colors.length > 2 && <Chip label={`+${params.row.colors.length - 2}`} size="small" variant="outlined" />}
        </Stack>
      ),
    },
    {
      field: 'elements',
      headerName: 'Elementos',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => params.row.elements.join(', '),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => <Chip size="small" label={params.row.isActive ? 'Ativo' : 'Inativo'} color={params.row.isActive ? 'success' : 'default'} />,
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

  const handleOpenDialog = (item?: Orixa) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description,
        origin: item.origin,
        batuaraTeaching: item.batuaraTeaching,
        displayOrder: String(item.displayOrder),
        characteristics: item.characteristics.join(', '),
        colors: item.colors.join(', '),
        elements: item.elements.join(', '),
        imageUrl: item.imageUrl || '',
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setForm(initialFormState);
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(initialFormState);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors = validateOrixaForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const payload = {
      name: form.name,
      description: form.description,
      origin: form.origin,
      batuaraTeaching: form.batuaraTeaching,
      displayOrder: Math.max(1, Number(form.displayOrder || 1)),
      characteristics: splitCsv(form.characteristics),
      colors: splitCsv(form.colors),
      elements: splitCsv(form.elements),
      imageUrl: form.imageUrl || undefined,
      isActive: form.isActive,
    };

    try {
      if (editingItem) {
        await apiService.updateOrixa(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Orixá atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createOrixa(payload);
        setFeedback({ open: true, message: 'Orixá criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadOrixas();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o Orixá.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteOrixa(String(id));
      setFeedback({ open: true, message: 'Orixá removido com sucesso.', severity: 'success' });
      await loadOrixas();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível remover o Orixá.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Orixás
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            Administre os textos doutrinários, características, cores, elementos e ordem de exibição dos Orixás.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadOrixas}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Novo Orixá
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Ativos</MenuItem>
              <MenuItem value="false">Inativos</MenuItem>
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
            displayOrder: !isXs,
            elements: !isXs,
          }}
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar Orixá' : 'Novo Orixá'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Nome" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} error={!!formErrors.name} helperText={formErrors.name} fullWidth />
              <TextField
                label="Ordem de exibição"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                inputProps={{ min: 1 }}
                sx={{ minWidth: 160 }}
              />
            </Stack>
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              error={!!formErrors.description} helperText={formErrors.description}
              fullWidth multiline minRows={3}
            />
            <TextField
              label="Origem"
              value={form.origin}
              onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
              error={!!formErrors.origin} helperText={formErrors.origin}
              fullWidth multiline minRows={3}
            />
            <TextField
              label="Ensinamento Batuara"
              value={form.batuaraTeaching}
              onChange={(e) => setForm((prev) => ({ ...prev, batuaraTeaching: e.target.value }))}
              error={!!formErrors.batuaraTeaching} helperText={formErrors.batuaraTeaching}
              fullWidth multiline minRows={4}
            />
            <TextField
              label="Características (separadas por vírgula)"
              value={form.characteristics}
              onChange={(e) => setForm((prev) => ({ ...prev, characteristics: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Cores (separadas por vírgula)"
                value={form.colors}
                onChange={(e) => setForm((prev) => ({ ...prev, colors: e.target.value }))}
                error={!!formErrors.colors} helperText={formErrors.colors}
                fullWidth
              />
              <TextField
                label="Elementos (separados por vírgula)"
                value={form.elements}
                onChange={(e) => setForm((prev) => ({ ...prev, elements: e.target.value }))}
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
                label="Orixá ativo"
              />
            )}
            <Alert severity="info">
              Os textos cadastrados aqui abastecem a seção pública de Orixás, então a consistência editorial impacta diretamente o PublicWebsite.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar Orixá'}
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

export default OrixasPage;
