import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  PhoneIphone as PhoneIcon,
  Pin as PinIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import apiService from '../services/api';
import { formatPhoneBr, onlyDigits } from '../utils/phone';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginMemberWithCode, isLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'staff' | 'member'>('staff');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberInfo, setMemberInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRequestMemberCode = async () => {
    try {
      setError(null);
      setMemberInfo(null);
      setMemberLoading(true);
      await apiService.requestMemberCode(onlyDigits(memberPhone));
      setCodeRequested(true);
      setMemberInfo('Se o número estiver cadastrado, você receberá um código no WhatsApp.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível solicitar o código.');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleMemberLogin = async () => {
    try {
      setError(null);
      setMemberLoading(true);
      await loginMemberWithCode(onlyDigits(memberPhone), memberCode);
      navigate('/member-profile', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Código inválido.');
    } finally {
      setMemberLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            minHeight: { xs: 420, sm: 440 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mb: 1,
            }}
          >
            <Box
              component="a"
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL || '/admin'}/batuara_logo.png`}
                alt="Logo Batuara"
                sx={{
                  height: { xs: 40, sm: 48 },
                  width: { xs: 40, sm: 48 },
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              component="a"
              href="/"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: { xs: '1.5rem', sm: '2rem' },
                transition: 'color 0.2s ease-in-out',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
            >
              Casa de Caridade Batuara
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Acesso Batuara.net
          </Typography>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={mode}
            onChange={(_, value) => {
              if (value) {
                setMode(value);
                setError(null);
                setMemberInfo(null);
              }
            }}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="staff">Equipe</ToggleButton>
            <ToggleButton value="member">Filho da Casa</ToggleButton>
          </ToggleButtonGroup>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}



          {mode === 'staff' ? (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              margin="normal"
              inputProps={{ autoComplete: 'username' }}
              {...register('email', {
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              inputProps={{ autoComplete: 'current-password' }}
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Entrar'
              )}
            </Button>
          </Box>
          ) : (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Celular com DDD"
                value={memberPhone}
                disabled={codeRequested}
                onChange={(event) => setMemberPhone(formatPhoneBr(event.target.value))}
                placeholder="(11) 99999-9999"
                helperText={codeRequested ? 'Código enviado! Verifique seu WhatsApp.' : undefined}
                FormHelperTextProps={{ sx: { color: 'success.main', fontWeight: 500 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color={codeRequested ? 'disabled' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Campo código — sempre visível, habilitado apenas após envio */}
              <TextField
                fullWidth
                label="Código recebido"
                value={memberCode}
                disabled={!codeRequested}
                onChange={(event) => setMemberCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                placeholder={codeRequested ? '000000' : '------'}
                helperText={!codeRequested ? 'Informe seu celular acima para receber o código' : undefined}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinIcon color={codeRequested ? 'action' : 'disabled'} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  memberLoading ||
                  (!codeRequested && onlyDigits(memberPhone).length < 10) ||
                  (codeRequested && memberCode.length !== 6)
                }
                onClick={codeRequested ? handleMemberLogin : handleRequestMemberCode}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
              >
                {memberLoading
                  ? <CircularProgress size={24} color="inherit" />
                  : codeRequested
                  ? 'Entrar com código'
                  : 'Receber código no WhatsApp'}
              </Button>

              {codeRequested && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => { setCodeRequested(false); setMemberCode(''); setMemberInfo(null); }}
                >
                  Trocar celular
                </Button>
              )}
            </Stack>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            {mode === 'staff' ? 'Acesso restrito aos administradores e editores.' : 'Acesso dos Filhos da Casa por WhatsApp.'}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
