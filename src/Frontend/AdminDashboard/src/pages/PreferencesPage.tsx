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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { apiService } from '../services/api';
import { ApiResponse } from '../types';

interface UserPreferences {
  id: number;
  language: string;
  theme: string;
  timeZone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  itemsPerPage: number;
  showHelpTooltips: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PreferencesFormData {
  language: string;
  theme: string;
  timeZone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  itemsPerPage: number;
  showHelpTooltips: boolean;
}

const PreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    defaultValues: {
      language: 'pt-BR',
      theme: 'light',
      timeZone: 'America/Sao_Paulo',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      itemsPerPage: 10,
      showHelpTooltips: true,
    }
  });

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const response: any = await apiService.getUserPreferences();
      
      if (response.success && response.data?.success) {
        const preferencesData = response.data.data;
        setPreferences(preferencesData);
        // Set form values
        setValue('language', preferencesData.language);
        setValue('theme', preferencesData.theme);
        setValue('timeZone', preferencesData.timeZone);
        setValue('emailNotifications', preferencesData.emailNotifications);
        setValue('pushNotifications', preferencesData.pushNotifications);
        setValue('smsNotifications', preferencesData.smsNotifications);
        setValue('itemsPerPage', preferencesData.itemsPerPage);
        setValue('showHelpTooltips', preferencesData.showHelpTooltips);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar preferências');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update user preferences via API
      const response: any = await apiService.updateUserPreferences(data);
      
      if (response.success && response.data?.success) {
        const preferencesData = response.data.data;
        setPreferences(preferencesData);
        setSuccess('Preferências atualizadas com sucesso!');
        setSnackbarOpen(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar preferências');
    } finally {
      setLoading(false);
    }
  };

  if (preferencesLoading) {
    return (
      <Container maxWidth="md" role="main">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Carregando preferências do usuário" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" role="main">
      <Typography 
        variant="h4" 
        sx={{ mb: 4, fontWeight: 600 }}
        id="preferences-page-title"
        tabIndex={-1}
      >
        Preferências do Usuário
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

      <Paper 
        sx={{ p: 3 }}
        role="region"
        aria-labelledby="preferences-form-heading"
      >
        <Typography 
          variant="h6" 
          sx={{ mb: 3, fontWeight: 600 }}
          id="preferences-form-heading"
        >
          Configurações Gerais
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          aria-labelledby="preferences-form-heading"
        >
          <FormControl fullWidth margin="normal">
            <InputLabel 
              id="language-label"
              aria-describedby="language-help"
            >
              Idioma
            </InputLabel>
            <Select
              {...register('language')}
              labelId="language-label"
              label="Idioma"
              aria-describedby="language-help"
            >
              <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
              <MenuItem value="en-US">English (United States)</MenuItem>
            </Select>
            <Typography 
              id="language-help" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Selecione o idioma preferido para a interface
            </Typography>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel 
              id="theme-label"
              aria-describedby="theme-help"
            >
              Tema
            </InputLabel>
            <Select
              {...register('theme')}
              labelId="theme-label"
              label="Tema"
              aria-describedby="theme-help"
            >
              <MenuItem value="light">Claro</MenuItem>
              <MenuItem value="dark">Escuro</MenuItem>
            </Select>
            <Typography 
              id="theme-help" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Escolha o tema de cores da interface
            </Typography>
          </FormControl>
          
          <TextField
            fullWidth
            label="Fuso Horário"
            margin="normal"
            {...register('timeZone')}
            aria-describedby="timezone-help"
          />
          <Typography 
            id="timezone-help" 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Seu fuso horário para exibição de datas e horários
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="h6" 
            sx={{ mb: 2, fontWeight: 600 }}
            id="notifications-heading"
          >
            Notificações
          </Typography>
          
          <FormGroup aria-labelledby="notifications-heading">
            <FormControlLabel
              control={
                <Checkbox 
                  {...register('emailNotifications')} 
                  aria-describedby="email-notifications-help"
                />
              }
              label="Notificações por e-mail"
            />
            <Typography 
              id="email-notifications-help" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: -1, mb: 1, ml: 4 }}
            >
              Receber notificações importantes por e-mail
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox 
                  {...register('pushNotifications')} 
                  aria-describedby="push-notifications-help"
                />
              }
              label="Notificações push"
            />
            <Typography 
              id="push-notifications-help" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: -1, mb: 1, ml: 4 }}
            >
              Receber notificações no navegador
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox 
                  {...register('smsNotifications')} 
                  aria-describedby="sms-notifications-help"
                />
              }
              label="Notificações por SMS"
            />
            <Typography 
              id="sms-notifications-help" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: -1, mb: 1, ml: 4 }}
            >
              Receber notificações por mensagem de texto
            </Typography>
          </FormGroup>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="h6" 
            sx={{ mb: 2, fontWeight: 600 }}
            id="interface-heading"
          >
            Interface
          </Typography>
          
          <TextField
            fullWidth
            label="Itens por página"
            type="number"
            margin="normal"
            {...register('itemsPerPage', {
              valueAsNumber: true,
              min: { value: 5, message: 'Mínimo 5 itens por página' },
              max: { value: 100, message: 'Máximo 100 itens por página' }
            })}
            error={!!errors.itemsPerPage}
            helperText={errors.itemsPerPage?.message}
            aria-describedby="items-per-page-help"
          />
          <Typography 
            id="items-per-page-help" 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Número de itens exibidos em listas por página
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox 
                {...register('showHelpTooltips')} 
                aria-describedby="help-tooltips-help"
              />
            }
            label="Mostrar dicas de ajuda"
          />
          <Typography 
            id="help-tooltips-help" 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: -1, mb: 2, ml: 4 }}
          >
            Exibir dicas de ajuda ao passar o mouse sobre elementos da interface
          </Typography>
          
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
                <span className="sr-only">Salvando preferências...</span>
              </>
            ) : (
              'Salvar Preferências'
            )}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={success}
        role="alert"
        aria-live="polite"
      />
    </Container>
  );
};

export default PreferencesPage;