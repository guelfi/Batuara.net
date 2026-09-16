import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Pagination,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { HouseMember, UserRole } from '../types';
import { getRoleLabel, isMember } from '../utils/roles';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserActivity {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
}

interface ActivityResponseData {
  data: UserActivity[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

const emptyMemberForm = {
  fullName: '',
  email: '',
  mobilePhone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
  gap: 2,
};

const UnifiedProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const memberSession = isMember(user?.role);
  const showAccountSection = !memberSession;
  const showHouseMemberSection = memberSession || !!user?.houseMemberId;

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [member, setMember] = useState<HouseMember | null>(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberFeedback, setMemberFeedback] = useState('');
  const [useSelfServiceApi, setUseSelfServiceApi] = useState(false);
  const [contribution, setContribution] = useState({
    referenceMonth: currentMonth(),
    dueDate: '',
    amount: '50',
    notes: '',
    isRecurring: false,
    allowWhatsAppReminder: false,
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user && showAccountSection) {
      resetProfile({ name: user.name || '', email: user.email || '' });
    }
  }, [user, showAccountSection, resetProfile]);

  const applyMemberData = (data: HouseMember) => {
    setMember(data);
    setMemberForm({
      fullName: data.fullName || '',
      email: data.email || '',
      mobilePhone: data.mobilePhone || '',
      zipCode: data.zipCode || '',
      street: data.street || '',
      number: data.number || '',
      complement: data.complement || '',
      district: data.district || '',
      city: data.city || '',
      state: data.state || '',
    });
  };

  const loadHouseMemberProfile = useCallback(async () => {
    if (!showHouseMemberSection) return;

    setMemberLoading(true);
    setMemberError(null);
    try {
      if (memberSession) {
        const response = await apiService.getMyMemberProfile();
        applyMemberData(response.data);
        setUseSelfServiceApi(true);
        return;
      }

      // Admin/Editor: try self-service first, fall back to house-members/{id}
      try {
        const response = await apiService.getMyMemberProfile();
        applyMemberData(response.data);
        setUseSelfServiceApi(true);
      } catch {
        if (!user?.houseMemberId) {
          setMemberError('Nenhum cadastro de Filho da Casa vinculado a esta conta.');
          return;
        }
        const response = await apiService.getHouseMember(String(user.houseMemberId));
        applyMemberData(response.data);
        setUseSelfServiceApi(false);
      }
    } catch (err: any) {
      setMemberError(err.response?.data?.message || 'Não foi possível carregar o cadastro de Filho da Casa.');
    } finally {
      setMemberLoading(false);
    }
  }, [showHouseMemberSection, memberSession, user?.houseMemberId]);

  useEffect(() => {
    loadHouseMemberProfile();
  }, [loadHouseMemberProfile]);

  const fetchUserActivities = useCallback(async () => {
    if (!showAccountSection) return;
    try {
      setActivitiesLoading(true);
      const response = await apiService.get<ActivityResponseData>('/auth/activities', {
        params: { pageNumber: page, pageSize },
      });
      if (response.success) {
        setActivities(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error fetching user activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  }, [page, pageSize, showAccountSection]);

  useEffect(() => {
    fetchUserActivities();
  }, [fetchUserActivities]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await apiService.put('/auth/me', data);
      await refreshUser();
      setSuccess('Perfil atualizado com sucesso!');
      setSnackbarOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return;
      }

      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      await apiService.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordSuccess('Senha alterada com sucesso!');
      setSnackbarOpen(true);
      resetPassword();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.message || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateMemberForm = (field: keyof typeof emptyMemberForm, value: string) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveMember = async () => {
    if (!memberForm.fullName.trim()) {
      setMemberError('Nome completo é obrigatório.');
      return;
    }

    setMemberSaving(true);
    setMemberError(null);
    try {
      if (useSelfServiceApi || memberSession) {
        const response = await apiService.updateMyMemberProfile(memberForm);
        applyMemberData(response.data);
      } else if (member) {
        const response = await apiService.updateHouseMember(String(member.id), {
          fullName: memberForm.fullName,
          birthDate: member.birthDate,
          entryDate: member.entryDate,
          headOrixaFront: member.headOrixaFront,
          headOrixaBack: member.headOrixaBack,
          headOrixaRonda: member.headOrixaRonda,
          email: memberForm.email || null,
          mobilePhone: memberForm.mobilePhone || null,
          zipCode: memberForm.zipCode || null,
          street: memberForm.street || null,
          number: memberForm.number || null,
          complement: memberForm.complement || null,
          district: memberForm.district || null,
          city: memberForm.city || null,
          state: memberForm.state || null,
          amaciDate: member.amaciDate,
          yaoDate: member.yaoDate,
          smallParent: member.smallParent,
          religiousLeader: member.religiousLeader,
          notes: member.notes,
          isActive: member.isActive,
          contributions: (member.contributions || []).map((c) => ({
            id: c.id,
            referenceMonth: c.referenceMonth,
            dueDate: c.dueDate,
            amount: c.amount,
            status: c.status,
            paidAt: c.paidAt,
            notes: c.notes,
            isRecurring: c.isRecurring,
            allowWhatsAppReminder: c.allowWhatsAppReminder,
          })),
        });
        applyMemberData(response.data);
      } else {
        throw new Error('Cadastro não carregado.');
      }
      setMemberFeedback('Cadastro atualizado com sucesso.');
    } catch (err: any) {
      setMemberError(
        err.response?.data?.errors?.[0] || err.response?.data?.message || 'Não foi possível salvar seu cadastro.'
      );
    } finally {
      setMemberSaving(false);
    }
  };

  const handleContribution = async () => {
    setMemberSaving(true);
    setMemberError(null);
    try {
      const [year, month] = contribution.referenceMonth.split('-').map(Number);
      const response = await apiService.addMyMemberContribution({
        referenceMonth: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
        dueDate: contribution.dueDate
          ? new Date(`${contribution.dueDate}T00:00:00Z`).toISOString()
          : new Date().toISOString(),
        amount: Number(contribution.amount),
        notes: contribution.notes,
        isRecurring: contribution.isRecurring,
        allowWhatsAppReminder: contribution.allowWhatsAppReminder,
      });
      applyMemberData(response.data);
      setMemberFeedback('Contribuição pretendida registrada como pendente.');
    } catch (err: any) {
      setMemberError(
        err.response?.data?.errors?.[0] || err.response?.data?.message || 'Não foi possível registrar a contribuição.'
      );
    } finally {
      setMemberSaving(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'success';
      case 'token refresh':
        return 'info';
      case 'token revoke':
        return 'warning';
      default:
        return 'default';
    }
  };

  const pageTitle = memberSession ? 'Meu Cadastro' : 'Meu Perfil';

  return (
    <Container maxWidth="lg" role="main">
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }} id="profile-page-title" tabIndex={-1}>
        {pageTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {memberSession
          ? 'Atualize seus dados pessoais e endereço. Informações religiosas e status do cadastro são mantidos pela direção da Casa.'
          : showHouseMemberSection
            ? 'Gerencie sua conta do sistema e o cadastro vinculado de Filho da Casa.'
            : 'Gerencie as informações da sua conta do sistema.'}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} role="alert" aria-live="polite">
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} role="alert" aria-live="polite">
          {error}
        </Alert>
      )}

      {showAccountSection && (
        <Box sx={{ display: 'flex', gap: { xs: 2, lg: 4 }, flexDirection: { xs: 'column', lg: 'row' }, mb: 3 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, flex: 1 }} role="region" aria-labelledby="profile-info-heading">
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }} id="profile-info-heading">
              Conta do sistema
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                aria-label={`Avatar do usuário ${user?.name}`}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getRoleLabel(user?.role)}
                  {user?.houseMemberId ? ` · Filho da Casa #${user.houseMemberId}` : ''}
                </Typography>
              </Box>
            </Box>

            <Box component="form" onSubmit={handleSubmitProfile(handleProfileSubmit)} aria-labelledby="profile-info-heading">
              <TextField
                fullWidth
                label="Nome"
                margin="normal"
                {...registerProfile('name', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                })}
                error={!!profileErrors.name}
                helperText={profileErrors.name?.message}
              />
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                margin="normal"
                {...registerProfile('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido',
                  },
                })}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message}
              />
              <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ mt: 3 }} aria-busy={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Atualizar Perfil'}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 }, flex: 1 }} role="region" aria-labelledby="change-password-heading">
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }} id="change-password-heading">
              Alterar Senha
            </Typography>

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 3 }} role="alert">
                {passwordSuccess}
              </Alert>
            )}
            {passwordError && (
              <Alert severity="error" sx={{ mb: 3 }} role="alert">
                {passwordError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmitPassword(handlePasswordSubmit)}>
              <TextField
                fullWidth
                label="Senha Atual"
                type="password"
                margin="normal"
                {...registerPassword('currentPassword', {
                  required: 'Senha atual é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                })}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message || 'Informe sua senha atual.'}
                inputProps={{ autoComplete: 'current-password' }}
              />
              <TextField
                fullWidth
                label="Nova Senha"
                type="password"
                margin="normal"
                {...registerPassword('newPassword', {
                  required: 'Nova senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                })}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message || 'Mínimo de 6 caracteres.'}
                inputProps={{ autoComplete: 'new-password' }}
              />
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type="password"
                margin="normal"
                {...registerPassword('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) => value === newPassword || 'As senhas não coincidem',
                })}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message || 'Digite novamente para confirmar.'}
                inputProps={{ autoComplete: 'new-password' }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
                fullWidth
                sx={{ mt: 3 }}
                aria-busy={passwordLoading}
              >
                {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'Alterar Senha'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {showHouseMemberSection && (
        <Box sx={{ mb: 3 }}>
          {memberError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {memberError}
            </Alert>
          )}

          {memberLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress aria-label="Carregando cadastro" />
            </Box>
          ) : (
            <>
              <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {memberSession ? 'Dados pessoais' : 'Cadastro de Filho da Casa'}
                </Typography>
                <Box sx={formGridSx}>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                    <TextField
                      label="Nome completo"
                      value={memberForm.fullName}
                      onChange={(e) => updateMemberForm('fullName', e.target.value)}
                      fullWidth
                      required
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                    <TextField
                      label="E-mail"
                      value={memberForm.email}
                      onChange={(e) => updateMemberForm('email', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                    <TextField
                      label="Celular"
                      value={memberForm.mobilePhone}
                      onChange={(e) => updateMemberForm('mobilePhone', e.target.value)}
                      fullWidth
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Endereço
                </Typography>
                <Box sx={formGridSx}>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                    <TextField
                      label="CEP"
                      value={memberForm.zipCode}
                      onChange={(e) => updateMemberForm('zipCode', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 8' } }}>
                    <TextField
                      label="Rua"
                      value={memberForm.street}
                      onChange={(e) => updateMemberForm('street', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 3' } }}>
                    <TextField
                      label="Número"
                      value={memberForm.number}
                      onChange={(e) => updateMemberForm('number', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 5' } }}>
                    <TextField
                      label="Complemento"
                      value={memberForm.complement}
                      onChange={(e) => updateMemberForm('complement', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                    <TextField
                      label="Bairro"
                      value={memberForm.district}
                      onChange={(e) => updateMemberForm('district', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 8' } }}>
                    <TextField
                      label="Cidade"
                      value={memberForm.city}
                      onChange={(e) => updateMemberForm('city', e.target.value)}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                    <TextField
                      label="Estado"
                      value={memberForm.state}
                      onChange={(e) => updateMemberForm('state', e.target.value)}
                      fullWidth
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={handleSaveMember} disabled={memberSaving || !member}>
                    Salvar cadastro
                  </Button>
                </Box>
              </Paper>

              {memberSession && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Minha contribuição
                  </Typography>
                  <Box sx={formGridSx}>
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                      <TextField
                        label="Mês de referência"
                        type="month"
                        value={contribution.referenceMonth}
                        onChange={(e) => setContribution((prev) => ({ ...prev, referenceMonth: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                      <TextField
                        label="Data pretendida"
                        type="date"
                        value={contribution.dueDate}
                        onChange={(e) => setContribution((prev) => ({ ...prev, dueDate: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                      <TextField
                        label="Valor pretendido"
                        type="number"
                        value={contribution.amount}
                        onChange={(e) => setContribution((prev) => ({ ...prev, amount: e.target.value }))}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <TextField
                        label="Observações"
                        value={contribution.notes}
                        onChange={(e) => setContribution((prev) => ({ ...prev, notes: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={contribution.isRecurring}
                            onChange={(e) => setContribution((prev) => ({ ...prev, isRecurring: e.target.checked }))}
                          />
                        }
                        label="Contribuição recorrente"
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={contribution.allowWhatsAppReminder}
                            onChange={(e) =>
                              setContribution((prev) => ({ ...prev, allowWhatsAppReminder: e.target.checked }))
                            }
                          />
                        }
                        label="Autorizar lembrete por WhatsApp"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleContribution} disabled={memberSaving || !member}>
                      Registrar Contribuição
                    </Button>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Box>
      )}

      {showAccountSection && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 1 } }} role="region" aria-labelledby="activity-history-heading">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }} id="activity-history-heading">
            Histórico de Atividades
          </Typography>

          {activitiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress aria-label="Carregando histórico de atividades" />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table aria-label="Tabela de histórico de atividades">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ação</TableCell>
                      <TableCell>Entidade</TableCell>
                      <TableCell>
                        IP
                        <Tooltip title="Endereço IP do dispositivo usado na ação">
                          <IconButton size="small" aria-label="Informações sobre o IP">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Chip
                            label={activity.action}
                            color={getActionColor(activity.action) as 'success' | 'info' | 'warning' | 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {activity.entityType}
                          {activity.entityId && ` (${activity.entityId})`}
                        </TableCell>
                        <TableCell>{activity.ipAddress || 'N/A'}</TableCell>
                        <TableCell>{formatDate(activity.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                    {activities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Nenhuma atividade registrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, value) => setPage(value)}
                    color="primary"
                    aria-label="Paginação do histórico de atividades"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={success || passwordSuccess}
      />
      <Snackbar
        open={!!memberFeedback}
        autoHideDuration={4000}
        onClose={() => setMemberFeedback('')}
        message={memberFeedback}
      />
    </Container>
  );
};

export default UnifiedProfilePage;
