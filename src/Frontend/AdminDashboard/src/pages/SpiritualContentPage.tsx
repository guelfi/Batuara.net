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
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Star as StarIcon } from '@mui/icons-material';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<SpiritualContent | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [form, setForm] = useState<SpiritualContentForm>(initialForm);
  const [dialogTab, setDialogTab] = useState(0);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SpiritualContentType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SpiritualCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
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
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
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
  }, [categoryFilter, featuredFilter, paginationModel.page, paginationModel.pageSize, query, statusFilter, typeFilter]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const columns: GridColDef<SpiritualContent>[] = isXs
    ? [
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
        {
          field: 'isActive',
          headerName: 'Status',
          width: 80,
          renderCell: (params) => (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', py: 1 }}>
              {params.row.isActive ? 'Ativo' : 'Inativo'}
            </Typography>
          ),
          sortable: false,
          filterable: false,
        },
        {
          field: 'actions',
          type: 'actions',
          width: 104,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
            <GridActionsCellItem icon={<DeleteIcon />} label="Inativar" onClick={() => handleRequestDeactivate(params.row)} />,
          ],
        },
      ]
    : [
        { field: 'displayOrder', headerName: 'Ordem', width: 90 },
        { field: 'title', headerName: 'Título', flex: 1.4, minWidth: 220 },
        {
          field: 'type',
          headerName: 'Tipo',
          flex: 0.8,
          minWidth: 140,
          renderCell: (params) => <Chip size="small" label={typeLabels[params.row.type as SpiritualContentType]} color="primary" />,
        },
        {
          field: 'category',
          headerName: 'Categoria',
          flex: 0.8,
          minWidth: 140,
          renderCell: (params) => <Chip size="small" label={categoryLabels[params.row.category as SpiritualCategory]} variant="outlined" />,
        },
        {
          field: 'isFeatured',
          headerName: 'Destaque',
          width: 120,
          renderCell: (params) => params.row.isFeatured ? <Chip size="small" icon={<StarIcon />} label="Destaque" color="warning" /> : '—',
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
            <GridActionsCellItem icon={<DeleteIcon />} label="Inativar" onClick={() => handleRequestDeactivate(params.row)} />,
          ],
        },
      ];

  const handleOpenDialog = (item?: SpiritualContent) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        content: item.content,
        type: item.type,
        category: item.category,
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
  };

  const handleRequestDeactivate = (item: SpiritualContent) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (deactivating) {
      return;
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const handleSubmit = async () => {
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
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o conteúdo espiritual.',
        severity: 'error',
      });
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmTarget) {
      return;
    }

    setDeactivating(true);
    try {
      await apiService.updateSpiritualContent(String(confirmTarget.id), {
        title: confirmTarget.title,
        content: confirmTarget.content,
        type: confirmTarget.type,
        category: confirmTarget.category,
        source: confirmTarget.source,
        displayOrder: confirmTarget.displayOrder,
        isFeatured: confirmTarget.isFeatured,
        isActive: false,
      });

      setFeedback({ open: true, message: 'Conteúdo espiritual inativado com sucesso.', severity: 'success' });
      handleCloseConfirm();
      await loadContents();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível inativar o conteúdo espiritual.',
        severity: 'error',
      });
    } finally {
      setDeactivating(false);
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}>
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
            <Tab label="Preview" />
          </Tabs>

          <Box sx={{ p: 2, pb: 2 }}>
            {dialogTab === 0 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Título"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Conteúdo"
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
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
                {editingItem && (
                  <FormControlLabel
                    control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
                    label="Conteúdo ativo"
                  />
                )}
                <Alert severity="info">
                  O backend sanitiza HTML potencialmente inseguro antes de persistir o conteúdo.
                </Alert>
              </Stack>
            )}

            {dialogTab === 2 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {form.title?.trim() || 'Sem título'}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography
                    component="div"
                    sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: escapeHtml(form.content || '').replace(/\n/g, '<br />') }}
                  />
                </Paper>
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar conteúdo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm} fullWidth maxWidth="sm">
        <DialogTitle>Inativar conteúdo?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {confirmTarget ? `O conteúdo “${confirmTarget.title}” será marcado como inativo e deixará de aparecer no portal.` : 'Este conteúdo será marcado como inativo e deixará de aparecer no portal.'}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={deactivating}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={handleConfirmDeactivate} disabled={deactivating}>
            Inativar
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
