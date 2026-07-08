import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import apiService from '../services/api';
import { HouseMember } from '../types';

const emptyForm = {
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

const MemberProfilePage: React.FC = () => {
  const [member, setMember] = useState<HouseMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [contribution, setContribution] = useState({ referenceMonth: currentMonth(), dueDate: '', amount: '50', notes: '', isRecurring: false, allowWhatsAppReminder: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMyMemberProfile();
      const data = response.data;
      setMember(data);
      setForm({
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setError('Nome completo é obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await apiService.updateMyMemberProfile(form);
      setMember(response.data);
      setFeedback('Cadastro atualizado com sucesso.');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Não foi possível salvar seu cadastro.');
    } finally {
      setSaving(false);
    }
  };

  const handleContribution = async () => {
    setSaving(true);
    setError(null);
    try {
      const [year, month] = contribution.referenceMonth.split('-').map(Number);
      const response = await apiService.addMyMemberContribution({
        referenceMonth: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
        dueDate: contribution.dueDate ? new Date(`${contribution.dueDate}T00:00:00Z`).toISOString() : new Date().toISOString(),
        amount: Number(contribution.amount),
        notes: contribution.notes,
        isRecurring: contribution.isRecurring,
        allowWhatsAppReminder: contribution.allowWhatsAppReminder,
      });
      setMember(response.data);
      setFeedback('Contribuição pretendida registrada como pendente.');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Não foi possível registrar a contribuição.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Carregando cadastro...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        Meu Cadastro
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Atualize seus dados pessoais e endereço. Informações religiosas e status do cadastro são mantidos pela direção da Casa.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Dados pessoais</Typography>
          <Box sx={formGridSx}>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
              <TextField label="Nome completo" value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} fullWidth required />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
              <TextField label="E-mail" value={form.email} onChange={(e) => updateForm('email', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
              <TextField label="Celular" value={form.mobilePhone} onChange={(e) => updateForm('mobilePhone', e.target.value)} fullWidth />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>Endereço</Typography>
          <Box sx={formGridSx}>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="CEP" value={form.zipCode} onChange={(e) => updateForm('zipCode', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 8' } }}>
              <TextField label="Rua" value={form.street} onChange={(e) => updateForm('street', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 3' } }}>
              <TextField label="Número" value={form.number} onChange={(e) => updateForm('number', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 5' } }}>
              <TextField label="Complemento" value={form.complement} onChange={(e) => updateForm('complement', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="Bairro" value={form.district} onChange={(e) => updateForm('district', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 8' } }}>
              <TextField label="Cidade" value={form.city} onChange={(e) => updateForm('city', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="Estado" value={form.state} onChange={(e) => updateForm('state', e.target.value)} fullWidth />
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>Salvar cadastro</Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Minha contribuição</Typography>
          <Box sx={formGridSx}>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="Mês de referência" type="month" value={contribution.referenceMonth} onChange={(e) => setContribution((prev) => ({ ...prev, referenceMonth: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="Data pretendida" type="date" value={contribution.dueDate} onChange={(e) => setContribution((prev) => ({ ...prev, dueDate: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
              <TextField label="Valor pretendido" type="number" value={contribution.amount} onChange={(e) => setContribution((prev) => ({ ...prev, amount: e.target.value }))} fullWidth />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField label="Observações" value={contribution.notes} onChange={(e) => setContribution((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={2} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
              <FormControlLabel
                control={<Switch checked={contribution.isRecurring} onChange={(e) => setContribution((prev) => ({ ...prev, isRecurring: e.target.checked }))} />}
                label="Contribuição recorrente"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
              <FormControlLabel
                control={<Switch checked={contribution.allowWhatsAppReminder} onChange={(e) => setContribution((prev) => ({ ...prev, allowWhatsAppReminder: e.target.checked }))} />}
                label="Autorizar lembrete por WhatsApp"
              />
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleContribution} disabled={saving || !member}>Registrar Contribuição</Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={!!feedback} autoHideDuration={4000} onClose={() => setFeedback('')} message={feedback} />
    </Box>
  );
};

export default MemberProfilePage;
