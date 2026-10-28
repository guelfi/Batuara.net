import React, { useState } from 'react';
import { Box, Button, FormControlLabel, Paper, Switch, TextField, Typography } from '@mui/material';
import { apiService } from '../../services/api';
import { HouseMember } from '../../types';

/**
 * Seção "Minha contribuição" da tela do Filho da Casa (declaração de valor, recorrência e
 * autorização de lembrete por WhatsApp).
 *
 * OCULTA NA FASE 1 DO SITE: a fase 1 é só o preenchimento de dados cadastrais. O componente
 * foi preservado como referência de implementação e NÃO é renderizado em lugar nenhum.
 * Para reativar, veja PM-048 em docs/PLANO-MELHORIAS.md.
 */
interface MemberContributionSectionProps {
  member: HouseMember | null;
  onMemberUpdated: (member: HouseMember) => void;
  onFeedback: (message: string) => void;
  onError: (message: string | null) => void;
}

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
  gap: 2,
};

const MemberContributionSection: React.FC<MemberContributionSectionProps> = ({
  member,
  onMemberUpdated,
  onFeedback,
  onError,
}) => {
  const [saving, setSaving] = useState(false);
  const [contribution, setContribution] = useState({
    referenceMonth: currentMonth(),
    dueDate: '',
    amount: '50',
    notes: '',
    isRecurring: false,
    allowWhatsAppReminder: false,
  });

  const handleContribution = async () => {
    setSaving(true);
    onError(null);
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
      onMemberUpdated(response.data);
      onFeedback('Contribuição pretendida registrada como pendente.');
    } catch (err: any) {
      onError(
        err.response?.data?.errors?.[0] || err.response?.data?.message || 'Não foi possível registrar a contribuição.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
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
                onChange={(e) => setContribution((prev) => ({ ...prev, allowWhatsAppReminder: e.target.checked }))}
              />
            }
            label="Autorizar lembrete por WhatsApp"
          />
        </Box>
      </Box>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleContribution} disabled={saving || !member}>
          Registrar Contribuição
        </Button>
      </Box>
    </Paper>
  );
};

export default MemberContributionSection;
