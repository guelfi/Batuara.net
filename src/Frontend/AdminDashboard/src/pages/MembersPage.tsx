import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Divider,
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
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
import GridPager from '../components/common/GridPager';
import { ContributionPaymentStatus, HouseMember, HouseMemberContribution } from '../types';

type ContributionFormState = {
  id?: number;
  referenceMonth: string;
  dueDate: string;
  amount: string;
  status: ContributionPaymentStatus;
  paidAt: string;
  notes: string;
};

type MemberFormState = {
  fullName: string;
  birthDate: string;
  entryDate: string;
  headOrixaFront: string;
  headOrixaBack: string;
  headOrixaRonda: string;
  email: string;
  mobilePhone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  isActive: boolean;
  contributions: ContributionFormState[];
};

const buildEmptyContribution = (): ContributionFormState => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dueDate = `${month}-10`;
  return {
    referenceMonth: `${month}-01`,
    dueDate,
    amount: '50.00',
    status: ContributionPaymentStatus.Pending,
    paidAt: '',
    notes: '',
  };
};

const initialFormState: MemberFormState = {
  fullName: '',
  birthDate: '',
  entryDate: '',
  headOrixaFront: '',
  headOrixaBack: '',
  headOrixaRonda: '',
  email: '',
  mobilePhone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  isActive: true,
  contributions: [buildEmptyContribution()],
};

const resolveContributionStatus = (raw: unknown): ContributionPaymentStatus => {
  if (typeof raw === 'string') {
    if (raw === 'Paid') return ContributionPaymentStatus.Paid;
    return ContributionPaymentStatus.Pending;
  }
  const n = Number(raw);
  return isNaN(n) ? ContributionPaymentStatus.Pending : n as ContributionPaymentStatus;
};

const getContributionStatusLabel = (status?: ContributionPaymentStatus) => {
  if (status === ContributionPaymentStatus.Paid) {
    return 'Pago';
  }

  if (status === ContributionPaymentStatus.Pending) {
    return 'Pendente';
  }

  return 'Sem lançamento';
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatPhoneBr = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatUf = (value: string) => value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);

const MembersPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState<HouseMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseMember | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormState>(initialFormState);
  const [dialogTab, setDialogTab] = useState(0);
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    mobilePhone?: string;
    state?: string;
  }>({});
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsItems, setDetailsItems] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setGridError(null);
    try {
      const response = await apiService.getHouseMembers({
        q: query || undefined,
        city: cityFilter || undefined,
        state: stateFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: 'fullName:asc',
      });

      setRows(response.data);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível carregar os filhos da casa.';
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
  }, [paginationModel.page, paginationModel.pageSize, query, cityFilter, stateFilter, statusFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

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
          width: 52,
          getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon fontSize="small" />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
          ],
        },
        {
          field: 'fullName',
          headerName: 'Nome',
          flex: 0.85,
          minWidth: 80,
          renderCell: (params) => (
            <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.25, py: 1 }}>
              {params.row.fullName}
            </Typography>
          ),
        },
        {
          field: 'mobilePhone',
          headerName: 'Celular',
          width: 145,
          renderCell: (params) => (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', py: 1 }}>
              {params.row.mobilePhone || '—'}
            </Typography>
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
        { field: 'fullName', headerName: 'Nome', flex: 1.2, minWidth: 240 },
        { field: 'mobilePhone', headerName: 'Celular', width: 160 },
      ];

  const mapContribution = (contribution: HouseMemberContribution): ContributionFormState => ({
    id: contribution.id,
    referenceMonth: contribution.referenceMonth.slice(0, 10),
    dueDate: contribution.dueDate.slice(0, 10),
    amount: String(contribution.amount),
    status: resolveContributionStatus(contribution.status),
    paidAt: contribution.paidAt ? contribution.paidAt.slice(0, 10) : '',
    notes: contribution.notes || '',
  });

  const handleOpenDialog = (item?: HouseMember) => {
    if (item) {
      setEditingItem(item);
      setForm({
        fullName: item.fullName,
        birthDate: item.birthDate.slice(0, 10),
        entryDate: item.entryDate.slice(0, 10),
        headOrixaFront: item.headOrixaFront,
        headOrixaBack: item.headOrixaBack,
        headOrixaRonda: item.headOrixaRonda,
        email: item.email,
        mobilePhone: item.mobilePhone,
        zipCode: item.zipCode,
        street: item.street,
        number: item.number,
        complement: item.complement || '',
        district: item.district,
        city: item.city,
        state: item.state,
        isActive: item.isActive,
        contributions: item.contributions.map(mapContribution),
      });
    } else {
      setEditingItem(null);
      setForm(initialFormState);
    }

    setDialogTab(0);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(initialFormState);
    setFormErrors({});
    setDialogError(null);
  };

  const handleDeleteMember = () => {
    if (!editingItem) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setDeleting(true);
    try {
      await apiService.deleteHouseMember(String(editingItem.id));
      setConfirmDeleteOpen(false);
      setFeedback({ open: true, message: 'Cadastro excluído com sucesso.', severity: 'success' });
      handleCloseDialog();
      await loadMembers();
    } catch (error: any) {
      setConfirmDeleteOpen(false);
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível excluir o cadastro.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const contributionSummary = useMemo(() => {
    return form.contributions.reduce(
      (acc, item) => {
        acc.total += Number(item.amount || 0);
        if (item.status === ContributionPaymentStatus.Paid) {
          acc.paid += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [form.contributions]);

  const updateContribution = (index: number, field: keyof ContributionFormState, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      contributions: prev.contributions.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addContribution = () => {
    setForm((prev) => ({ ...prev, contributions: [...prev.contributions, buildEmptyContribution()] }));
  };

  const removeContribution = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contributions: prev.contributions.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSubmit = async () => {
    const nextErrors: typeof formErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Nome completo é obrigatório.';

    const emailValue = form.email.trim();
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Informe um e-mail válido.';
    }

    const phoneDigits = onlyDigits(form.mobilePhone);
    if (form.mobilePhone.trim() && !(phoneDigits.length === 10 || phoneDigits.length === 11)) {
      nextErrors.mobilePhone = 'Informe um celular válido (DDD + número).';
    }

    const uf = form.state.trim();
    if (uf && formatUf(uf).length !== 2) {
      nextErrors.state = 'UF deve conter 2 letras.';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.state) setDialogTab(1);
      else setDialogTab(0);
      setFeedback({ open: true, message: 'Revise os campos obrigatórios antes de salvar.', severity: 'error' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      fullName: form.fullName.trim(),
      birthDate: form.birthDate,
      entryDate: form.entryDate || today,
      headOrixaFront: form.headOrixaFront,
      headOrixaBack: form.headOrixaBack,
      headOrixaRonda: form.headOrixaRonda,
      email: form.email.trim(),
      mobilePhone: form.mobilePhone,
      zipCode: form.zipCode,
      street: form.street,
      number: form.number,
      complement: form.complement || undefined,
      district: form.district,
      city: form.city,
      state: formatUf(form.state),
      isActive: form.isActive,
      contributions: form.contributions.map((item) => ({
        id: item.id,
        referenceMonth: item.referenceMonth,
        dueDate: item.dueDate,
        amount: Number(item.amount),
        status: item.status,
        paidAt: item.status === ContributionPaymentStatus.Paid && item.paidAt ? item.paidAt : undefined,
        notes: item.notes || undefined,
      })),
    };

    try {
      if (editingItem) {
        await apiService.updateHouseMember(String(editingItem.id), payload);
        setFeedback({ open: true, message: 'Filho da casa atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createHouseMember(payload);
        setFeedback({ open: true, message: 'Filho da casa criado com sucesso.', severity: 'success' });
      }

      handleCloseDialog();
      await loadMembers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Não foi possível salvar o cadastro.';
      setDialogError(msg);
      setFeedback({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Filhos da Casa
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
            <TextField
              label="Cidade"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              InputProps={{
                endAdornment: cityFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar cidade"
                      size="small"
                      onClick={() => {
                        setCityFilter('');
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
              label="UF"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
              InputProps={{
                endAdornment: stateFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar UF"
                      size="small"
                      onClick={() => {
                        setStateFilter('');
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      }}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{ maxWidth: 120 }}
            />
            <FormControl sx={{ minWidth: 160 }}>
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
                  city: !isXs,
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
            '& .MuiDataGrid-actionsCell': isXs
              ? {
                  justifyContent: 'flex-end',
                  gap: 0.25,
                }
              : undefined,
            '& .MuiDataGrid-actionsCell .MuiIconButton-root': isXs
              ? {
                  width: 40,
                  height: 40,
                }
              : {
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="lg">
        <DialogTitle>{editingItem ? 'Editar filho da casa' : 'Novo filho da casa'}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={dialogTab} onChange={(_, value) => setDialogTab(value)} variant="fullWidth">
            <Tab label="Dados pessoais" />
            <Tab label="Endereço" />
            <Tab label="Orixás" />
          </Tabs>

          <Box sx={{ p: 2, pb: 2 }}>
            {dialogTab === 0 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Nome completo"
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                    sx={formErrors.fullName ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                    fullWidth
                  />
                  <TextField
                    label="E-mail"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    sx={formErrors.email ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                    fullWidth
                  />
                  <TextField
                    label="Celular"
                    value={form.mobilePhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, mobilePhone: formatPhoneBr(e.target.value) }))}
                    error={!!formErrors.mobilePhone}
                    helperText={formErrors.mobilePhone}
                    sx={formErrors.mobilePhone ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Data de nascimento"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Data de entrada na casa"
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, entryDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>

                <Divider />
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h6">Mensalidades</Typography>
                    <Typography color="text.secondary">
                      Controle histórico de contribuições mensais sugeridas em R$ 50,00.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addContribution}
                    fullWidth={isXs}
                  >
                    Adicionar mensalidade
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {form.contributions.map((item, index) => (
                    <Paper key={`${item.referenceMonth}-${index}`} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                          label="Mês de referência"
                          type="date"
                          value={item.referenceMonth}
                          onChange={(e) => updateContribution(index, 'referenceMonth', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          label="Vencimento"
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => updateContribution(index, 'dueDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          label="Valor"
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateContribution(index, 'amount', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          fullWidth
                        />
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select value={item.status} label="Status" onChange={(e) => updateContribution(index, 'status', Number(e.target.value))} sx={{ minHeight: 48 }}>
                            <MenuItem value={ContributionPaymentStatus.Pending}>Pendente</MenuItem>
                            <MenuItem value={ContributionPaymentStatus.Paid}>Pago</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Pago em"
                          type="date"
                          value={item.paidAt}
                          onChange={(e) => updateContribution(index, 'paidAt', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          disabled={item.status !== ContributionPaymentStatus.Paid}
                        />
                        <Button color="error" onClick={() => removeContribution(index)} fullWidth={isXs}>
                          Remover
                        </Button>
                      </Stack>
                      <TextField
                        label="Observações"
                        value={item.notes}
                        onChange={(e) => updateContribution(index, 'notes', e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{ mt: 2 }}
                      />
                    </Paper>
                  ))}
                </Stack>

                <Alert severity="info">
                  {`Mensalidades registradas: ${form.contributions.length} | Pagas: ${contributionSummary.paid} | Pendentes: ${contributionSummary.pending} | Total previsto: R$ ${contributionSummary.total.toFixed(2)}`}
                </Alert>

                {editingItem && (
                  <FormControlLabel
                    control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
                    label="Cadastro ativo"
                  />
                )}
              </Stack>
            )}

            {dialogTab === 1 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="CEP"
                    value={form.zipCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                    sx={{ minWidth: 160 }}
                  />
                  <TextField
                    label="Logradouro"
                    value={form.street}
                    onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Número"
                    value={form.number}
                    onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                    sx={{ minWidth: 120 }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Complemento"
                    value={form.complement}
                    onChange={(e) => setForm((prev) => ({ ...prev, complement: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Bairro"
                    value={form.district}
                    onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Cidade"
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="UF"
                    value={form.state}
                    onChange={(e) => setForm((prev) => ({ ...prev, state: formatUf(e.target.value) }))}
                    error={!!formErrors.state}
                    helperText={formErrors.state}
                    sx={{ minWidth: 100, ...(formErrors.state ? { '& .MuiInputBase-root': { backgroundColor: 'rgba(211,47,47,0.06)' } } : {}) }}
                  />
                </Stack>
              </Stack>
            )}

            {dialogTab === 2 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Orixá de frente"
                    value={form.headOrixaFront}
                    onChange={(e) => setForm((prev) => ({ ...prev, headOrixaFront: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Orixá de costas"
                    value={form.headOrixaBack}
                    onChange={(e) => setForm((prev) => ({ ...prev, headOrixaBack: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Orixá de ronda"
                    value={form.headOrixaRonda}
                    onChange={(e) => setForm((prev) => ({ ...prev, headOrixaRonda: e.target.value }))}
                    fullWidth
                  />
                </Stack>
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
            <Button variant="outlined" color="error" onClick={handleDeleteMember}>
              Excluir
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar cadastro'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir cadastro</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }}>
            Esta ação é permanente. O cadastro de <strong>{editingItem?.fullName}</strong> e todas as suas mensalidades serão removidos definitivamente.
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

export default MembersPage;
