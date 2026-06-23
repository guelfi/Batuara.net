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

type UmbandaLineFormErrors = Partial<Record<keyof UmbandaLineForm, string>>;

const validateUmbandaLineForm = (form: UmbandaLineForm): UmbandaLineFormErrors => {
  const errors: UmbandaLineFormErrors = {};
  if (!form.name.trim()) errors.name = 'Nome é obrigatório.';
  if (!form.description.trim()) errors.description = 'Descrição é obrigatória.';
  if (!form.characteristics.trim()) errors.characteristics = 'Características são obrigatórias.';
  if (!form.entities.trim()) errors.entities = 'Informe pelo menos uma entidade.';
  return errors;
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
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<UmbandaLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UmbandaLine | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [form, setForm] = useState<UmbandaLineForm>(initialForm);
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsItems, setDetailsItems] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [formErrors, setFormErrors] = useState<UmbandaLineFormErrors>({});
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadLines = useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const response = await apiService.getUmbandaLines({
        q: query || undefined,
        entity: entityFilter || undefined,
        workingDay: dayFilter || undefined,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'displayOrder:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar as linhas de Umbanda.';
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
  }, [dayFilter, entityFilter, paginationModel.page, paginationModel.pageSize, query]);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

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
                {params.row.entities?.[0] ? (
                  <Chip label={params.row.entities[0]} size="small" />
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    —
                  </Typography>
                )}
                {Array.isArray(params.row.entities) && params.row.entities.length > 1 && (
                  <Chip
                    label={`+${params.row.entities.length - 1}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => openDetails(`Entidades — ${params.row.name}`, params.row.entities)}
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
              {params.row.entities.length > 2 && (
                <Chip
                  label={`+${params.row.entities.length - 2}`}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => openDetails(`Entidades — ${params.row.name}`, params.row.entities)}
                />
              )}
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
    setFormErrors({});
    setDialogError(null);
  };

  const handleDeleteLine = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteUmbandaLine(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Linha de Umbanda excluída com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadLines();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir a linha de Umbanda.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateUmbandaLineForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
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


  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Linhas de Umbanda
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} fullWidth={isXs}>
            Nova linha
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
              label="Entidade"
              value={entityFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEntityFilter(e.target.value)}
              InputProps={{
                endAdornment: entityFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar entidade"
                      size="small"
                      onClick={() => {
                        setEntityFilter('');
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
              label="Dia de trabalho"
              value={dayFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDayFilter(e.target.value)}
              InputProps={{
                endAdornment: dayFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar dia de trabalho"
                      size="small"
                      onClick={() => {
                        setDayFilter('');
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
                  workingDays: !isXs,
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
        <DialogTitle>{editingItem ? 'Editar linha de Umbanda' : 'Nova linha de Umbanda'}</DialogTitle>
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
                sx={{ minWidth: 160 }}
              />
            </Stack>
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
              sx={formErrors.description ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Características"
              value={form.characteristics}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, characteristics: e.target.value }))
              }
              error={!!formErrors.characteristics}
              helperText={formErrors.characteristics}
              sx={formErrors.characteristics ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Interpretação Batuara"
              value={form.batuaraInterpretation}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, batuaraInterpretation: e.target.value }))
              }
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Entidades (separadas por vírgula)"
              value={form.entities}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, entities: e.target.value }))
              }
              error={!!formErrors.entities} helperText={formErrors.entities}
              sx={formErrors.entities ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
              fullWidth
            />
            <TextField
              label="Dias de trabalho (separados por vírgula)"
              value={form.workingDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, workingDays: e.target.value }))
              }
              fullWidth
            />
            <Alert severity="info">
              Use o mesmo vocabulário doutrinário adotado no portal público para manter consistência editorial e semântica.
            </Alert>
          </Stack>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{dialogError}</Alert>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {editingItem && (
            <Button variant="outlined" color="error" onClick={handleDeleteLine}>
              Excluir
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar linha'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir linha de Umbanda</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente. A linha <strong>{editingItem?.name}</strong> será removida definitivamente.
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

export default UmbandaLinesPage;
