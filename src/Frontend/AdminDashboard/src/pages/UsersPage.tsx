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
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import apiService from '../services/api';
import { User, UserRole } from '../types';
import { getRoleLabel, normalizeUserRole } from '../utils/roles';

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

const initialForm: UserFormState = {
  name: '',
  email: '',
  role: UserRole.Editor,
  isActive: true,
  password: '',
  confirmPassword: '',
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers();
      setUsers((response.data || []).map((u) => ({ ...u, role: normalizeUserRole(u.role) })));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setForm(initialForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: '',
      confirmPassword: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFormError(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Nome é obrigatório.';
    if (!form.email.trim()) return 'E-mail é obrigatório.';
    if (!editingUser && form.password.length < 6) return 'Senha inicial deve ter pelo menos 6 caracteres.';
    if (!editingUser && form.password !== form.confirmPassword) return 'Confirmação de senha não confere.';
    return null;
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }

    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
        });
        setFeedback({ open: true, message: 'Usuário atualizado com sucesso.', severity: 'success' });
      } else {
        await apiService.createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        setFeedback({ open: true, message: 'Usuário criado com sucesso.', severity: 'success' });
      }
      closeDialog();
      await loadUsers();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Não foi possível salvar o usuário.');
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(`Excluir o usuário ${user.name}?`);
    if (!confirmed) return;

    try {
      await apiService.deleteUser(user.id);
      setFeedback({ open: true, message: 'Usuário excluído com sucesso.', severity: 'success' });
      await loadUsers();
    } catch (err: any) {
      setFeedback({ open: true, message: err?.response?.data?.message || 'Não foi possível excluir o usuário.', severity: 'error' });
    }
  };

  const columns: GridColDef<User>[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Papel',
      width: 150,
      renderCell: (params) => <Chip label={getRoleLabel(params.row.role)} size="small" color={params.row.role === UserRole.Admin ? 'primary' : 'default'} />,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <Chip label={params.row.isActive ? 'Ativo' : 'Inativo'} size="small" color={params.row.isActive ? 'success' : 'default'} />,
    },
    {
      field: 'lastLoginAt',
      headerName: 'Último login',
      width: 170,
      valueFormatter: (value) => value ? new Date(value as string).toLocaleString('pt-BR') : '-',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => openEditDialog(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Excluir" onClick={() => handleDelete(params.row)} showInMenu />,
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie administradores e editores do AdminDashboard.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Novo usuário
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Nome"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="user-role-label">Papel</InputLabel>
            <Select
              labelId="user-role-label"
              label="Papel"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: Number(event.target.value) as UserRole }))}
            >
              <MenuItem value={UserRole.Admin}>Administrador</MenuItem>
              <MenuItem value={UserRole.Editor}>Editor</MenuItem>
              <MenuItem value={UserRole.Viewer}>Viewer</MenuItem>
            </Select>
          </FormControl>
          {editingUser ? (
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />}
              label="Usuário ativo"
            />
          ) : (
            <>
              <TextField
                label="Senha inicial"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Confirmar senha inicial"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={feedback.open} autoHideDuration={5000} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
        <Alert severity={feedback.severity} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
