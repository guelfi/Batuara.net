import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, ApiResponse } from '../types';
import { apiService } from '../services/api';
import InfoIcon from '@mui/icons-material/Info';

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

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
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

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
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
    fetchUserActivities();
  }, [page]);

  const fetchUserActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await apiService.get<ActivityResponseData>('/auth/activities', {
        params: {
          pageNumber: page,
          pageSize: pageSize
        }
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
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update user profile via API
      await apiService.put('/auth/me', data);
      
      // Refresh user data in context
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
      
      // Change password via API
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

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

  return (
    <Container maxWidth="lg" role="main">
      <Typography 
        variant="h4" 
        sx={{ mb: 4, fontWeight: 600 }}
        id="profile-page-title"
        tabIndex={-1}
      >
        Meu Perfil
      </Typography>

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          role="alert"
          aria-live="polite"
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Informações do Perfil */}
        <Paper 
          sx={{ p: 3, flex: 1 }}
          role="region"
          aria-labelledby="profile-info-heading"
        >
          <Typography 
            variant="h6" 
            sx={{ mb: 3, fontWeight: 600 }}
            id="profile-info-heading"
          >
            Informações Pessoais
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                mr: 2,
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
              aria-label={`Avatar do usuário ${user?.name}`}
            >
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 0 ? 'Administrador' : user?.role === 1 ? 'Moderador' : 'Editor'}
              </Typography>
            </Box>
          </Box>
          
          <Box 
            component="form" 
            onSubmit={handleSubmitProfile(handleProfileSubmit)}
            aria-labelledby="profile-info-heading"
          >
            <TextField
              fullWidth
              label="Nome"
              margin="normal"
              {...registerProfile('name', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres',
                },
              })}
              error={!!profileErrors.name}
              helperText={profileErrors.name?.message}
              aria-describedby="name-error"
              inputProps={{
                'aria-required': 'true',
                'aria-invalid': !!profileErrors.name,
              }}
            />
            {profileErrors.name && (
              <Typography 
                id="name-error" 
                color="error" 
                variant="caption"
                role="alert"
                aria-live="polite"
              >
                {profileErrors.name.message}
              </Typography>
            )}
            
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
              aria-describedby="email-error"
              inputProps={{
                'aria-required': 'true',
                'aria-invalid': !!profileErrors.email,
              }}
            />
            {profileErrors.email && (
              <Typography 
                id="email-error" 
                color="error" 
                variant="caption"
                role="alert"
                aria-live="polite"
              >
                {profileErrors.email.message}
              </Typography>
            )}
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3 }}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" aria-hidden="true" />
                  <span className="sr-only">Atualizando perfil...</span>
                </>
              ) : (
                'Atualizar Perfil'
              )}
            </Button>
          </Box>
        </Paper>

        {/* Alteração de Senha */}
        <Paper 
          sx={{ p: 3, flex: 1 }}
          role="region"
          aria-labelledby="change-password-heading"
        >
          <Typography 
            variant="h6" 
            sx={{ mb: 3, fontWeight: 600 }}
            id="change-password-heading"
          >
            Alterar Senha
          </Typography>
          
          {passwordSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              role="alert"
              aria-live="polite"
            >
              {passwordSuccess}
            </Alert>
          )}

          {passwordError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              role="alert"
              aria-live="polite"
            >
              {passwordError}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmitPassword(handlePasswordSubmit)}
            aria-labelledby="change-password-heading"
          >
            <TextField
              fullWidth
              label="Senha Atual"
              type="password"
              margin="normal"
              {...registerPassword('currentPassword', {
                required: 'Senha atual é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              aria-describedby="current-password-error"
              inputProps={{
                'aria-required': 'true',
                'aria-invalid': !!passwordErrors.currentPassword,
                autoComplete: 'current-password'
              }}
            />
            {passwordErrors.currentPassword && (
              <Typography 
                id="current-password-error" 
                color="error" 
                variant="caption"
                role="alert"
                aria-live="polite"
              >
                {passwordErrors.currentPassword.message}
              </Typography>
            )}
            
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              margin="normal"
              {...registerPassword('newPassword', {
                required: 'Nova senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              aria-describedby="new-password-error"
              inputProps={{
                'aria-required': 'true',
                'aria-invalid': !!passwordErrors.newPassword,
                autoComplete: 'new-password'
              }}
            />
            {passwordErrors.newPassword && (
              <Typography 
                id="new-password-error" 
                color="error" 
                variant="caption"
                role="alert"
                aria-live="polite"
              >
                {passwordErrors.newPassword.message}
              </Typography>
            )}
            
            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type="password"
              margin="normal"
              {...registerPassword('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: value => 
                  value === newPassword || 'As senhas não coincidem'
              })}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              aria-describedby="confirm-password-error"
              inputProps={{
                'aria-required': 'true',
                'aria-invalid': !!passwordErrors.confirmPassword,
                autoComplete: 'new-password'
              }}
            />
            {passwordErrors.confirmPassword && (
              <Typography 
                id="confirm-password-error" 
                color="error" 
                variant="caption"
                role="alert"
                aria-live="polite"
              >
                {passwordErrors.confirmPassword.message}
              </Typography>
            )}
            
            <Button
              type="submit"
              variant="contained"
              disabled={passwordLoading}
              sx={{ mt: 3 }}
              aria-busy={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <CircularProgress size={24} color="inherit" aria-hidden="true" />
                  <span className="sr-only">Alterando senha...</span>
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Histórico de Atividades */}
      <Paper 
        sx={{ p: 3, mt: 4 }}
        role="region"
        aria-labelledby="activity-history-heading"
      >
        <Typography 
          variant="h6" 
          sx={{ mb: 3, fontWeight: 600 }}
          id="activity-history-heading"
        >
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
                          color={getActionColor(activity.action) as any}
                          size="small"
                          aria-label={`Ação: ${activity.action}`}
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
                  onChange={handlePageChange}
                  color="primary"
                  aria-label="Paginação do histórico de atividades"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={success || passwordSuccess}
        role="alert"
        aria-live="polite"
      />
    </Container>
  );
};

export default ProfilePage;