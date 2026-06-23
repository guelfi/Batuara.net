import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
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
import { Guide } from '../types';

type GuideFormState = {
  name: string;
  description: string;
  specialties: string;
  displayOrder: string;
  comida: string;
  fruta: string;
  diaDaSemana: string;
  cor: string;
  saudacao: string;
  isActive: boolean;
};

type GuideFormErrors = Partial<Record<keyof GuideFormState, string>>;

const validateGuideForm = (form: GuideFormState): GuideFormErrors => {
  const errors: GuideFormErrors = {};
  if (!form.name.trim()) errors.name = 'Nome é obrigatório.';
  if (!form.description.trim()) errors.description = 'Descrição é obrigatória.';
  if (!form.specialties.trim()) errors.specialties = 'Informe pelo menos uma especialidade.';
  return errors;
};

const initialFormState: GuideFormState = {
  name: '',
  description: '',
  specialties: '',
  displayOrder: '1',
  comida: '',
  fruta: '',
  diaDaSemana: '',
  cor: '',
  saudacao: '',
  isActive: true,
};

const splitCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

const GuidesPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Guide | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<GuideFormState>(initialFormState);
  const [query, setQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsItems, setDetailsItems] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [formErrors, setFormErrors] = useState<GuideFormErrors>({});
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const response = await apiService.getGuides({
        q: query || undefined,
        specialty: specialtyFilter || undefined,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'displayOrder:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os guias e entidades.';
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
  }, [paginationModel.page, paginationModel.pageSize, query, specialtyFilter]);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const openDetails = (title: string, items: string[]) => {
    setDetailsTitle(title);
    setDetailsItems(items);
    setDetailsOpen(true);
  };

  const columns: GridColDef[] = isXs
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
          headerName: 'Nome',
          flex: 1,
          minWidth: 140,
          renderCell: (params) => (
            <Stack spacing={0.25} sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.25 }}>
                {params.row.name}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                {params.row.specialties?.[0] ? (
                  <Chip label={params.row.specialties[0]} size="small" />
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    —
                  </Typography>
                )}
                {Array.isArray(params.row.specialties) && params.row.specialties.length > 1 && (
                  <Chip
                    label={`+${params.row.specialties.length - 1}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => openDetails(`Especialidades — ${params.row.name}`, params.row.specialties)}
                  />
                )}
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
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
        {
          field: 'specialties',
          headerName: 'Especialidades',
          flex: 1,
          minWidth: 220,
          renderCell: (params) => (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              {params.row.specialties.slice(0, 2).map((item: string) => (
                <Chip key={item} label={item} size="small" />
              ))}
              {params.row.specialties.length > 2 && (
                <Chip
                  label={`+${params.row.specialties.length - 2}`}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => openDetails(`Especialidades — ${params.row.name}`, params.row.specialties)}
                />
              )}
            </Stack>
          ),
        },
      ];

  const handleOpenDialog = (item?: Guide) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description,
        specialties: item.specialties.join(', '),
        displayOrder: String(item.displayOrder),
        comida: item.comida || '',
        fruta: item.fruta || '',
        diaDaSemana: item.diaDaSemana || '',
        cor: item.cor || '',
        saudacao: item.saudacao || '',
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

  const handleDeleteGuide = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteGuide(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Guia ou entidade excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadGuides();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o guia ou entidade.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateGuideForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const payload = {
      name: form.name,
      description: form.description,
      specialties: splitCsv(form.specialties),
      displayOrder: Math.max(1, Number(form.displayOrder || 1)),
      comida: form.comida || undefined,
      fruta: form.fruta || undefined,
      diaDaSemana: form.diaDaSemana || undefined,
      cor: form.cor || undefined,
      saudacao: form.saudacao || undefined,
      isActive: form.isActive,
    };

    try {
      if (editingItem) {
        await apiService.updateGuide(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Guia ou entidade atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createGuide(payload);
        setFeedback({ open: true, message: 'Guia ou entidade criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadGuides();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o guia ou entidade.',
        severity: 'error',
      });
    }
  };


  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Guias e Entidades
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} fullWidth={isXs}>
            Novo cadastro
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
            <TextField
              label="Especialidade"
              value={specialtyFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSpecialtyFilter(e.target.value)}
              InputProps={{
                endAdornment: specialtyFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar especialidade"
                      size="small"
                      onClick={() => {
                        setSpecialtyFilter('');
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
          columnVisibilityModel={
            isXs
              ? undefined
              : {
                  displayOrder: !isXs,
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

      <Drawer
        anchor="bottom"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{ sx: { p: 2, pb: 3, borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {detailsTitle || 'Detalhes'}
          </Typography>
          {detailsItems.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {detailsItems.map((item) => (
                <Chip key={item} label={item} size="small" sx={{ mb: 1 }} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum item para exibir.
            </Typography>
          )}
          <Button variant="contained" onClick={() => setDetailsOpen(false)} fullWidth>
            Fechar
          </Button>
        </Stack>
      </Drawer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? 'Editar guia ou entidade' : 'Novo guia ou entidade'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Nome"
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={formErrors.name ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                fullWidth
              />
              <TextField
                label="Ordem de exibição"
                type="number"
                value={form.displayOrder}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, displayOrder: e.target.value }))
                }
                inputProps={{ min: 1 }}
                sx={{ minWidth: 160 }}
              />
            </Stack>
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              error={!!formErrors.description} helperText={formErrors.description}
              sx={formErrors.description ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth multiline minRows={4}
            />
            <TextField
              label="Especialidades"
              helperText={formErrors.specialties || 'Separe por vírgula'}
              value={form.specialties}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, specialties: e.target.value }))
              }
              error={!!formErrors.specialties}
              sx={formErrors.specialties ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Saudação"
                value={form.saudacao}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, saudacao: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Dia da Semana"
                value={form.diaDaSemana}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, diaDaSemana: e.target.value }))
                }
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Fruta"
                value={form.fruta}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, fruta: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Comida"
                value={form.comida}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, comida: e.target.value }))
                }
                fullWidth
              />
            </Stack>
            <TextField
              label="Cor"
              value={form.cor}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, cor: e.target.value }))
              }
              helperText="Separe múltiplas cores por vírgula (ex: Vermelho, Preto)"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {editingItem && (
            <Button variant="outlined" color="error" onClick={handleDeleteGuide}>
              Excluir
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar cadastro'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir guia ou entidade</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente. O cadastro <strong>{editingItem?.name}</strong> será removido definitivamente.
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

export default GuidesPage;
