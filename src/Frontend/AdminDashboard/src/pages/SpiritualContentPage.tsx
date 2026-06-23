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
  Tab,
  Tabs,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon, Star as StarIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
import GridPager from '../components/common/GridPager';
import { SpiritualCategory, SpiritualContent, SpiritualContentType } from '../types';


type SpiritualContentForm = {
  title: string;
  content: string;
  type: SpiritualContentType;
  category: SpiritualCategory;
  source: string;
  displayOrder: string;
  isFeatured: boolean;
  isActive: boolean;
};

const initialForm: SpiritualContentForm = {
  title: '',
  content: '',
  type: SpiritualContentType.Prayer,
  category: SpiritualCategory.General,
  source: '',
  displayOrder: '0',
  isFeatured: false,
  isActive: true,
};

const typeLabels: Record<SpiritualContentType, string> = {
  [SpiritualContentType.Prayer]: 'Oração',
  [SpiritualContentType.Teaching]: 'Ensinamento',
  [SpiritualContentType.Doctrine]: 'Doutrina',
  [SpiritualContentType.Hymn]: 'Ponto Cantado',
  [SpiritualContentType.Ritual]: 'Ritual',
};

const categoryLabels: Record<SpiritualCategory, string> = {
  [SpiritualCategory.Umbanda]: 'Umbanda',
  [SpiritualCategory.Kardecismo]: 'Kardecismo',
  [SpiritualCategory.General]: 'Geral',
  [SpiritualCategory.Orixas]: 'Orixás',
};

type SpiritualContentFormErrors = {
  title?: string;
  content?: string;
};

const validateSpiritualContentForm = (form: SpiritualContentForm): SpiritualContentFormErrors => {
  const errors: SpiritualContentFormErrors = {};
  if (!form.title.trim()) errors.title = 'Título é obrigatório.';
  if (!form.content.trim()) errors.content = 'Conteúdo é obrigatório.';
  return errors;
};

const typeNameToValue: Record<string, SpiritualContentType> = {
  Prayer: SpiritualContentType.Prayer,
  Teaching: SpiritualContentType.Teaching,
  Doctrine: SpiritualContentType.Doctrine,
  Hymn: SpiritualContentType.Hymn,
  Ritual: SpiritualContentType.Ritual,
};

const categoryNameToValue: Record<string, SpiritualCategory> = {
  Umbanda: SpiritualCategory.Umbanda,
  Kardecismo: SpiritualCategory.Kardecismo,
  General: SpiritualCategory.General,
  Orixas: SpiritualCategory.Orixas,
};

const resolveType = (raw: unknown): SpiritualContentType => {
  if (typeof raw === 'string' && raw in typeNameToValue) return typeNameToValue[raw];
  const n = Number(raw);
  return isNaN(n) ? SpiritualContentType.Prayer : n as SpiritualContentType;
};

const resolveCategory = (raw: unknown): SpiritualCategory => {
  if (typeof raw === 'string' && raw in categoryNameToValue) return categoryNameToValue[raw];
  const n = Number(raw);
  return isNaN(n) ? SpiritualCategory.General : n as SpiritualCategory;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const SpiritualContentPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<SpiritualContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SpiritualContent | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<SpiritualContentFormErrors>({});
  const [form, setForm] = useState<SpiritualContentForm>(initialForm);
  const [dialogTab, setDialogTab] = useState(0);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SpiritualContentType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SpiritualCategory>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadContents = useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const response = await apiService.getSpiritualContents({
        q: query || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'true',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'displayOrder:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os conteúdos espirituais.';
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
  }, [categoryFilter, featuredFilter, paginationModel.page, paginationModel.pageSize, query, typeFilter]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const columns: GridColDef<SpiritualContent>[] = isXs
    ? [
        {
          field: 'actions',
          type: 'actions',
          width: 60,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
        {
          field: 'summary',
          headerName: 'Conteúdo',
          flex: 1,
          minWidth: 180,
          renderCell: (params) => (
            <Stack spacing={0.5} sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.25 }}>
                {params.row.title}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" label={typeLabels[params.row.type as SpiritualContentType]} color="primary" />
                {params.row.isFeatured && <Chip size="small" icon={<StarIcon />} label="Destaque" color="warning" />}
              </Stack>
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
        { field: 'title', headerName: 'Título', flex: 1.4, minWidth: 220 },
        {
          field: 'type',
          headerName: 'Tipo',
          type: 'string',
          flex: 0.8,
          minWidth: 140,
          valueGetter: (_value: any, row: SpiritualContent) => typeLabels[resolveType(row.type)] ?? String(row.type),
        },
        {
          field: 'category',
          headerName: 'Categoria',
          type: 'string',
          flex: 0.8,
          minWidth: 140,
          valueGetter: (_value: any, row: SpiritualContent) => categoryLabels[resolveCategory(row.category)] ?? String(row.category),
        },
        {
          field: 'isFeatured',
          headerName: 'Destaque',
          width: 120,
          renderCell: (params) => params.row.isFeatured ? <Chip size="small" icon={<StarIcon />} label="Destaque" color="warning" /> : '—',
        },
      ];

  const handleOpenDialog = (item?: SpiritualContent) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        content: item.content,
        type: resolveType(item.type),
        category: resolveCategory(item.category),
        source: item.source,
        displayOrder: String(item.displayOrder),
        isFeatured: item.isFeatured,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setForm(initialForm);
    }

    setDialogTab(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(initialForm);
    setFormErrors({});
    setDialogError(null);
  };

  const handleDeleteContent = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteSpiritualContent(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Conteúdo excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadContents();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o conteúdo.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateSpiritualContentForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setDialogTab(0);
      return;
    }
    setFormErrors({});
    const payload = {
      title: form.title,
      content: form.content,
      type: form.type,
      category: form.category,
      source: form.source,
      displayOrder: Number(form.displayOrder || 0),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    setDialogError(null);
    try {
      if (editingItem) {
        await apiService.updateSpiritualContent(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Conteúdo espiritual atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createSpiritualContent(payload);
        setFeedback({ open: true, message: 'Conteúdo espiritual criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadContents();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Não foi possível salvar o conteúdo espiritual.';
      setDialogError(msg);
      setFeedback({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Conteúdos Espirituais
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} fullWidth={isXs}>
            Novo conteúdo
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
              onChange={(e) => setQuery(e.target.value)}
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
              onChange={(e) => setQuery(e.target.value)}
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
              <Select value={typeFilter} label="Tipo" onChange={(e) => setTypeFilter(e.target.value as 'all' | SpiritualContentType)}>
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Categoria</InputLabel>
              <Select value={categoryFilter} label="Categoria" onChange={(e) => setCategoryFilter(e.target.value as 'all' | SpiritualCategory)}>
                <MenuItem value="all">Todas</MenuItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Destaque</InputLabel>
              <Select value={featuredFilter} label="Destaque" onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'true' | 'false')}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="true">Em destaque</MenuItem>
                <MenuItem value="false">Sem destaque</MenuItem>
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
                  displayOrder: !isXs,
                  type: !isXs,
                  category: !isXs,
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
            '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
              width: 48,
              height: 48,
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar conteúdo espiritual' : 'Novo conteúdo espiritual'}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={dialogTab} onChange={(_, value) => setDialogTab(value)} variant="fullWidth">
            <Tab label="Conteúdo" />
            <Tab label="Metadados" />
          </Tabs>

          <Box sx={{ p: 2, pb: 2 }}>
            {dialogTab === 0 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Título"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  sx={formErrors.title ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                  fullWidth
                />
                <TextField
                  label="Conteúdo"
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  error={!!formErrors.content}
                  helperText={formErrors.content}
                  sx={formErrors.content ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                  fullWidth
                  multiline
                  minRows={10}
                />
              </Stack>
            )}

            {dialogTab === 1 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={form.type}
                      label="Tipo"
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: Number(e.target.value) as SpiritualContentType }))
                      }
                      sx={{ minHeight: 48 }}
                    >
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={form.category}
                      label="Categoria"
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, category: Number(e.target.value) as SpiritualCategory }))
                      }
                      sx={{ minHeight: 48 }}
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Ordem de exibição"
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                    sx={{ minWidth: 160 }}
                  />
                </Stack>

                <TextField label="Fonte" value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))} fullWidth />

                <FormControlLabel
                  control={<Switch checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />}
                  label="Exibir como destaque no portal"
                />
                <Alert severity="info">
                  O backend sanitiza HTML potencialmente inseguro antes de persistir o conteúdo.
                </Alert>
              </Stack>
            )}

          </Box>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{dialogError}</Alert>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {editingItem && (
            <Button variant="outlined" color="error" onClick={handleDeleteContent}>
              Excluir
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar conteúdo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir conteúdo</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente. O conteúdo <strong>{editingItem?.title}</strong> será removido definitivamente.
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

export default SpiritualContentPage;
