import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import apiService from '../services/api';
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

const getContributionStatusLabel = (status?: ContributionPaymentStatus) => {
  if (status === ContributionPaymentStatus.Paid) {
    return 'Pago';
  }

  if (status === ContributionPaymentStatus.Pending) {
    return 'Pendente';
  }

  return 'Sem lançamento';
};

const MembersPage: React.FC = () => {
  const [rows, setRows] = useState<HouseMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseMember | null>(null);
  const [form, setForm] = useState<MemberFormState>(initialFormState);
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadMembers = useCallback(async () => {
    setLoading(true);
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
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar os filhos da casa.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, query, cityFilter, stateFilter, statusFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nome', flex: 1, minWidth: 220 },
    {
      field: 'headOrixaFront',
      headerName: 'Orixás',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => `${params.row.headOrixaFront} / ${params.row.headOrixaBack} / ${params.row.headOrixaRonda}`,
    },
    { field: 'city', headerName: 'Cidade', width: 160 },
    { field: 'mobilePhone', headerName: 'Celular', width: 150 },
    {
      field: 'currentMonthContributionStatus',
      headerName: 'Mensalidade',
      width: 150,
      renderCell: (params) => {
        const status = params.row.currentMonthContributionStatus as ContributionPaymentStatus | undefined;
        const color = status === ContributionPaymentStatus.Paid ? 'success' : status === ContributionPaymentStatus.Pending ? 'warning' : 'default';
        return <Chip size="small" label={getContributionStatusLabel(status)} color={color} />;
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
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

  const mapContribution = (contribution: HouseMemberContribution): ContributionFormState => ({
    id: contribution.id,
    referenceMonth: contribution.referenceMonth.slice(0, 10),
    dueDate: contribution.dueDate.slice(0, 10),
    amount: String(contribution.amount),
    status: contribution.status,
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

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(initialFormState);
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
    const payload = {
      fullName: form.fullName,
      birthDate: form.birthDate,
      entryDate: form.entryDate,
      headOrixaFront: form.headOrixaFront,
      headOrixaBack: form.headOrixaBack,
      headOrixaRonda: form.headOrixaRonda,
      email: form.email,
      mobilePhone: form.mobilePhone,
      zipCode: form.zipCode,
      street: form.street,
      number: form.number,
      complement: form.complement || undefined,
      district: form.district,
      city: form.city,
      state: form.state,
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
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar o cadastro.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteHouseMember(String(id));
      setFeedback({ open: true, message: 'Cadastro inativado com sucesso.', severity: 'success' });
      await loadMembers();
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível remover o cadastro.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Filhos da Casa
          </Typography>
          <Typography color="text.secondary">
            Gerencie dados pessoais, endereço, Orixás de cabeça e o histórico financeiro das contribuições mensais.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadMembers}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Novo cadastro
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          <TextField label="Cidade" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} fullWidth />
          <TextField label="UF" value={stateFilter} onChange={(e) => setStateFilter(e.target.value.toUpperCase())} sx={{ maxWidth: 120 }} />
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
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="lg">
        <DialogTitle>{editingItem ? 'Editar filho da casa' : 'Novo filho da casa'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="h6">Dados pessoais</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Nome completo" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} fullWidth />
              <TextField label="E-mail" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
              <TextField label="Celular" value={form.mobilePhone} onChange={(e) => setForm((prev) => ({ ...prev, mobilePhone: e.target.value }))} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Data de nascimento" type="date" value={form.birthDate} onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Data de entrada na casa" type="date" value={form.entryDate} onChange={(e) => setForm((prev) => ({ ...prev, entryDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Orixá de frente" value={form.headOrixaFront} onChange={(e) => setForm((prev) => ({ ...prev, headOrixaFront: e.target.value }))} fullWidth />
              <TextField label="Orixá de costas" value={form.headOrixaBack} onChange={(e) => setForm((prev) => ({ ...prev, headOrixaBack: e.target.value }))} fullWidth />
              <TextField label="Orixá de ronda" value={form.headOrixaRonda} onChange={(e) => setForm((prev) => ({ ...prev, headOrixaRonda: e.target.value }))} fullWidth />
            </Stack>

            <Divider />
            <Typography variant="h6">Endereço</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="CEP" value={form.zipCode} onChange={(e) => setForm((prev) => ({ ...prev, zipCode: e.target.value }))} sx={{ minWidth: 160 }} />
              <TextField label="Logradouro" value={form.street} onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))} fullWidth />
              <TextField label="Número" value={form.number} onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))} sx={{ minWidth: 120 }} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Complemento" value={form.complement} onChange={(e) => setForm((prev) => ({ ...prev, complement: e.target.value }))} fullWidth />
              <TextField label="Bairro" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} fullWidth />
              <TextField label="Cidade" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} fullWidth />
              <TextField label="UF" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))} sx={{ minWidth: 100 }} />
            </Stack>

            <Divider />
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h6">Mensalidades</Typography>
                <Typography color="text.secondary">
                  Controle histórico de contribuições mensais sugeridas em R$ 50,00.
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addContribution}>
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
                      <Select value={item.status} label="Status" onChange={(e) => updateContribution(index, 'status', Number(e.target.value))}>
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
                    <Button color="error" onClick={() => removeContribution(index)}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Salvar alterações' : 'Criar cadastro'}
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
