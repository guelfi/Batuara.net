import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import bingoApi from '../../services/bingoApi';
import PagedCards from '../../_shared/comandaFoto/PagedCards';
import { BingoTableSetting } from '../../types/bingo';

const ROW_H = 56;
const validSeats = (n: number) => Number.isInteger(n) && n >= 1 && n <= 50;

interface Props {
  open: boolean;
  onClose: () => void;
  notify: (message: string, severity?: 'success' | 'error') => void;
  fullScreen?: boolean;
}

const errorText = (e: any, fallback: string) => e?.response?.data?.message ?? e?.message ?? fallback;

/**
 * Configurar mesas: lugares e exclusividade de cada mesa, em cartões paginados (sem rolar a tela quando há muitas mesas).
 * Pode ser ajustado com o evento em andamento.
 */
const TableSettingsDialog: React.FC<Props> = ({ open, onClose, notify, fullScreen }) => {
  const [settings, setSettings] = useState<BingoTableSetting[]>([]);
  const [saved, setSaved] = useState<BingoTableSetting[]>([]);
  const [allSeats, setAllSeats] = useState('4');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    bingoApi
      .getTableSettings()
      .then((list) => {
        setSettings(list);
        setSaved(list);
      })
      .catch((e) => notify(errorText(e, 'Não foi possível carregar os lugares das mesas.'), 'error'));
  }, [open, notify]);

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
  const invalid = settings.some((s) => !validSeats(s.lugares));

  const patch = (numero: number, change: Partial<BingoTableSetting>) =>
    setSettings((l) => l.map((s) => (s.numero === numero ? { ...s, ...change } : s)));

  const applyToAll = () => {
    const n = Number(allSeats);
    if (!validSeats(n)) {
      notify('Informe de 1 a 50 lugares.', 'error');
      return;
    }
    setSettings((l) => l.map((s) => ({ ...s, lugares: n })));
  };

  const save = async () => {
    setSaving(true);
    try {
      const list = await bingoApi.updateTableSettings(settings);
      setSettings(list);
      setSaved(list);
      notify('Lugares das mesas salvos.', 'success');
      onClose();
    } catch (e: any) {
      notify(errorText(e, 'Não foi possível salvar os lugares das mesas.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      sx={fullScreen ? undefined : { '& .MuiDialog-paper': { height: 'min(86dvh, 680px)' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>Configurar mesas</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden', pt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, flexShrink: 0 }}>
          <b>Exclusiva</b>: um grupo só. Sem marcar, a mesa é <b>compartilhada</b>: vale quem chegar primeiro, até lotar os lugares. Pode ser ajustado com o evento em andamento.
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <TextField
            label="Lugares em todas"
            type="number"
            size="small"
            value={allSeats}
            onChange={(e) => setAllSeats(e.target.value)}
            inputProps={{ min: 1, max: 50 }}
            sx={{ width: 140 }}
          />
          <Button variant="outlined" onClick={applyToAll}>
            Aplicar a todas
          </Button>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <PagedCards
            items={settings}
            getKey={(s) => s.numero}
            rowHeight={ROW_H}
            noun="Mesas"
            label="Mesas do evento"
            emptyText="Nenhuma mesa neste evento."
            rowProps={(s) => ({ testId: `config-mesa-${s.numero}` })}
            renderRow={(s) => (
              <>
                <Typography sx={{ width: 64, fontWeight: 700, flexShrink: 0 }}>Mesa {s.numero}</Typography>
                <TextField
                  size="small"
                  type="number"
                  label="Lugares"
                  value={Number.isNaN(s.lugares) ? '' : s.lugares}
                  onChange={(e) => patch(s.numero, { lugares: e.target.value === '' ? NaN : Number(e.target.value) })}
                  inputProps={{ min: 1, max: 50, 'aria-label': `Lugares da mesa ${s.numero}` }}
                  error={!validSeats(s.lugares)}
                  sx={{ width: 96, flexShrink: 0 }}
                />
                <FormControlLabel
                  sx={{ ml: 0.5, mr: 0 }}
                  control={<Checkbox checked={s.exclusiva} onChange={(e) => patch(s.numero, { exclusiva: e.target.checked })} inputProps={{ 'aria-label': `Mesa ${s.numero} exclusiva` }} />}
                  label="Exclusiva"
                />
              </>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" onClick={save} disabled={!dirty || invalid || saving}>
          {saving ? 'Salvando...' : 'Salvar lugares'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableSettingsDialog;
