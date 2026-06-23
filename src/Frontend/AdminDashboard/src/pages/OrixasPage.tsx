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
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
import GridPager from '../components/common/GridPager';
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
  saudacao: string;
  fruta: string;
  comida: string;
  diaDaSemana: string;
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
  saudacao: '',
  fruta: '',
  comida: '',
  diaDaSemana: '',
};

const splitCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

const getColorSwatch = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (lower.startsWith('#') || lower.startsWith('rgb') || lower.startsWith('hsl')) return raw;

  const normalized = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const map: Record<string, string> = {
    branco: '#ffffff',
    preto: '#000000',
    cinza: '#9e9e9e',
    'cinza escuro': '#616161',
    'cinza claro': '#e0e0e0',
    azul: '#1976d2',
    'azul escuro': '#0d47a1',
    verde: '#2e7d32',
    vermelho: '#d32f2f',
    amarelo: '#fbc02d',
    laranja: '#f57c00',
    roxo: '#6a1b9a',
    lilas: '#8e24aa',
    rosa: '#d81b60',
    marrom: '#6d4c41',
    dourado: '#c9a227',
    prata: '#b0bec5',
  };

  return map[normalized] ?? null;
};

const OrixasPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<Orixa[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Orixa | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [form, setForm] = useState<OrixaFormState>(initialFormState);
  const [query, setQuery] = useState('');
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
    setGridError(null);
    try {
      const response = await apiService.getOrixas({
        q: query || undefined,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'displayOrder:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os Orixás.';
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
  }, [paginationModel.page, paginationModel.pageSize, query]);

  useEffect(() => {
    loadOrixas();
  }, [loadOrixas]);

  const columns: GridColDef[] = isXs
    ? [
        {
          field: 'actions',
          type: 'actions',
          width: 60,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon fontSize="small" />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
        {
          field: 'summary',
          headerName: 'Orixá',
          flex: 1,
          minWidth: 120,
          renderCell: (params) => (
            <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.25, py: 1 }}>
              {params.row.name}
            </Typography>
          ),
          sortable: false,
          filterable: false,
        },
        {
          field: 'primaryColor',
          headerName: 'Cor',
          width: 90,
          valueGetter: (_, row) => row.colors?.[0] ?? '',
          renderCell: (params) => (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 1 }}>
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getColorSwatch(params.value) || 'text.disabled',
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {params.value || '—'}
              </Typography>
            </Stack>
          ),
          sortable: false,
          filterable: false,
        },
      ]
    : [
        {
          field: 'actions',
          type: 'actions',
          width: 60,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
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
                <Chip
                  key={color}
                  label={color}
                  size="small"
                  icon={
                    <Box
                      aria-hidden
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: getColorSwatch(color) || 'text.disabled',
                      }}
                    />
                  }
                  sx={{ '& .MuiChip-icon': { ml: 0.75, mr: 0.5 } }}
                />
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
        saudacao: item.saudacao || '',
        fruta: item.fruta || '',
        comida: item.comida || '',
        diaDaSemana: item.diaDaSemana || '',
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
    setDialogError(null);
  };

  const handleDeleteOrixa = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteOrixa(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Orixá excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadOrixas();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o Orixá.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateOrixaForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setDialogError(null);
    const payload = {
      name: form.name,
      description: form.description,
      origin: form.origin,
      batuaraTeaching: form.batuaraTeaching,
      displayOrder: Math.max(1, Number(form.displayOrder || 1)),
      characteristics: splitCsv(form.characteristics),
      colors: splitCsv(form.colors),
      elements: splitCsv(form.elements),
      saudacao: form.saudacao || null,
      fruta: form.fruta || null,
      comida: form.comida || null,
      diaDaSemana: form.diaDaSemana || null,
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
      const msg = error?.response?.data?.message || 'Não foi possível salvar o Orixá.';
      setDialogError(msg);
      setFeedback({ open: true, message: msg, severity: 'error' });
    }
  };


  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Orixás
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} fullWidth={isXs}>
            Novo Orixá
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
            '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
              width: 48,
              height: 48,
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar Orixá' : 'Novo Orixá'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Nome" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} error={!!formErrors.name} helperText={formErrors.name} sx={formErrors.name ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}} fullWidth />
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
              sx={formErrors.description ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth multiline minRows={3}
            />
            <TextField
              label="Origem"
              value={form.origin}
              onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
              error={!!formErrors.origin} helperText={formErrors.origin}
              sx={formErrors.origin ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth multiline minRows={3}
            />
            <TextField
              label="Ensinamento Batuara"
              value={form.batuaraTeaching}
              onChange={(e) => setForm((prev) => ({ ...prev, batuaraTeaching: e.target.value }))}
              error={!!formErrors.batuaraTeaching} helperText={formErrors.batuaraTeaching}
              sx={formErrors.batuaraTeaching ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
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
                sx={formErrors.colors ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                fullWidth
              />
              <TextField
                label="Elementos (separados por vírgula)"
                value={form.elements}
                onChange={(e) => setForm((prev) => ({ ...prev, elements: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Saudação"
                value={form.saudacao}
                onChange={(e) => setForm((prev) => ({ ...prev, saudacao: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Dia da Semana"
                value={form.diaDaSemana}
                onChange={(e) => setForm((prev) => ({ ...prev, diaDaSemana: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Fruta"
                value={form.fruta}
                onChange={(e) => setForm((prev) => ({ ...prev, fruta: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Comida"
                value={form.comida}
                onChange={(e) => setForm((prev) => ({ ...prev, comida: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Alert severity="info">
              Os textos cadastrados aqui abastecem a seção pública de Orixás, então a consistência editorial impacta diretamente o PublicWebsite.
            </Alert>
          </Stack>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{dialogError}</Alert>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {editingItem && (
            <Button variant="outlined" color="error" onClick={handleDeleteOrixa}>
              Excluir
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar Orixá'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir Orixá</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente e não pode ser desfeita. O Orixá{' '}
            <strong>{editingItem?.name}</strong> será removido definitivamente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir definitivamente'}
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
