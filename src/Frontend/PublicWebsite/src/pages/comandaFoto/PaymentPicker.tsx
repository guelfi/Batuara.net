import React, { useState } from 'react';
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export interface PayMethod {
  id: number;
  name: string;
}
/** Forma escrita na comanda, como o OCR leu (valor opcional). */
export interface PayHint {
  paymentMethodId: number | null;
  amount: number | null;
}
/** Uma parte do pagamento. paymentMethodId nulo = "Não identificado". */
export interface PayLine {
  paymentMethodId: number | null;
  amount: number;
}

const NONE = 'none';
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const cents = (v: number) => Math.round(v * 100);
const fmt = (v: number) => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
const parseMoney = (s: string): number => {
  const t = s.trim();
  if (!t) return 0;
  const n = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(n) ? n : 0;
};

/** Corpo da requisição de fechamento da comanda de papel para o que foi escolhido (null = não identificado). */
export const payBody = (lines: PayLine[] | null) => {
  if (lines === null) return { paymentMethodId: 0, paymentNotIdentified: true };
  if (lines.length === 1 && lines[0].paymentMethodId !== null) {
    return { paymentMethodId: lines[0].paymentMethodId, paymentNotIdentified: false };
  }
  return {
    paymentMethodId: 0,
    paymentNotIdentified: false,
    payments: lines.map((l) => ({ paymentMethodId: l.paymentMethodId, amount: l.amount })),
  };
};

interface Row {
  method: string; // id da forma, NONE ou ''
  amount: string;
  auto: boolean; // valor calculado como "o que falta"
}

interface Props {
  total: number;
  payMethods: PayMethod[];
  /** Forma sugerida pelo OCR quando ele leu uma só. */
  suggestedPay?: number | null;
  /** Formas escritas na comanda (uma ou mais). Com 2 ou mais, abre direto dividido. */
  hints?: PayHint[];
  allowNotIdentified?: boolean;
  /** Abre direto na tela de divisão (cobrança digital). */
  startSplit?: boolean;
  onPick: (lines: PayLine[] | null) => void;
  onBack: () => void;
}

const buildRows = (total: number, hints: PayHint[], suggestedPay: number | null | undefined): Row[] => {
  const withMethod = hints.filter((h) => h.paymentMethodId !== null);
  if (withMethod.length >= 2) {
    const known = withMethod.reduce((s, h) => s + (h.amount ?? 0), 0);
    const missing = withMethod.filter((h) => h.amount === null).length;
    return withMethod.map((h, i) => {
      let amount = h.amount;
      if (amount === null && missing === 1 && total - known > 0) amount = Math.round((total - known) * 100) / 100;
      return { method: String(h.paymentMethodId), amount: amount === null ? '' : fmt(amount), auto: i === withMethod.length - 1 && h.amount === null };
    });
  }
  return [
    { method: suggestedPay ? String(suggestedPay) : '', amount: fmt(total), auto: false },
    { method: '', amount: '', auto: true },
  ];
};

const PaymentPicker: React.FC<Props> = ({ total, payMethods, suggestedPay = null, hints = [], allowNotIdentified = true, startSplit = false, onPick, onBack }) => {
  const startsSplit = startSplit || hints.filter((h) => h.paymentMethodId !== null).length >= 2;
  const [split, setSplit] = useState(startsSplit);
  const [rows, setRows] = useState<Row[]>(() => buildRows(total, hints, suggestedPay));

  const sum = rows.reduce((s, r) => s + parseMoney(r.amount), 0);
  const missing = cents(total) - cents(sum);
  const rowsValid = rows.every((r) => r.method !== '' && parseMoney(r.amount) > 0);
  const canConfirm = rowsValid && missing === 0;

  const recompute = (list: Row[]): Row[] => {
    const last = list.length - 1;
    if (last < 1 || !list[last].auto) return list;
    const others = list.slice(0, last).reduce((s, r) => s + parseMoney(r.amount), 0);
    const rest = Math.round((total - others) * 100) / 100;
    return list.map((r, i) => (i === last ? { ...r, amount: rest > 0 ? fmt(rest) : '' } : r));
  };

  const update = (idx: number, patch: Partial<Row>) =>
    setRows((list) => {
      const next = list.map((r, i) => (i === idx ? { ...r, ...patch } : r));
      if (patch.amount !== undefined && idx === next.length - 1) next[idx] = { ...next[idx], auto: false };
      return recompute(next);
    });

  const addRow = () =>
    setRows((list) => {
      const rest = Math.round((total - list.reduce((s, r) => s + parseMoney(r.amount), 0)) * 100) / 100;
      return [...list.map((r) => ({ ...r, auto: false })), { method: '', amount: rest > 0 ? fmt(rest) : '', auto: true }];
    });

  const removeRow = (idx: number) => setRows((list) => recompute(list.filter((_, i) => i !== idx).map((r, i, arr) => (i === arr.length - 1 ? { ...r, auto: true } : r))));

  const confirm = () =>
    onPick(rows.map((r) => ({ paymentMethodId: r.method === NONE ? null : Number(r.method), amount: Math.round(parseMoney(r.amount) * 100) / 100 })));

  if (!split) {
    return (
      <Stack spacing={1} sx={{ pt: 1 }}>
        {payMethods.length === 0 && <Typography color="text.secondary">Nenhuma forma de pagamento ativa.</Typography>}
        {suggestedPay !== null && (
          <Typography variant="body2" color="text.secondary">
            Identificado na comanda: confirme ou escolha outra.
          </Typography>
        )}
        {payMethods.map((m) => (
          <Button key={m.id} variant={m.id === suggestedPay ? 'contained' : 'outlined'} size="large" onClick={() => onPick([{ paymentMethodId: m.id, amount: total }])}>
            {m.name}
          </Button>
        ))}
        {allowNotIdentified && (
          <Button variant="outlined" size="large" color="inherit" onClick={() => onPick(null)}>
            Não identificado
          </Button>
        )}
        <Button variant="text" size="large" onClick={() => setSplit(true)} disabled={payMethods.length === 0}>
          Dividir pagamento
        </Button>
        <Button onClick={onBack}>Voltar</Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ pt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Total {brl(total)}. A soma das formas precisa ser igual ao total.
      </Typography>
      {rows.map((r, idx) => (
        <Stack key={idx} direction="row" spacing={1} alignItems="center">
          <TextField select size="small" label="Forma" value={r.method} onChange={(e) => update(idx, { method: e.target.value })} sx={{ flex: 1, minWidth: 0 }}>
            {payMethods.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>{m.name}</MenuItem>
            ))}
            {allowNotIdentified && <MenuItem value={NONE}>Não identificado</MenuItem>}
          </TextField>
          <TextField
            size="small"
            label="Valor"
            value={r.amount}
            onChange={(e) => update(idx, { amount: e.target.value, auto: false })}
            inputProps={{ inputMode: 'decimal' }}
            sx={{ width: 110 }}
          />
          <IconButton size="small" aria-label="Remover forma" disabled={rows.length <= 2} onClick={() => removeRow(idx)}>
            <DeleteOutlineIcon />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" onClick={addRow} sx={{ alignSelf: 'flex-start' }}>
        + Adicionar forma
      </Button>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }} color={missing === 0 ? 'success.main' : 'warning.main'}>
          {missing === 0 ? 'Soma confere.' : missing > 0 ? `Faltam ${brl(missing / 100)}` : `Passou ${brl(-missing / 100)}`}
        </Typography>
      </Box>
      <Button variant="contained" size="large" disabled={!canConfirm} onClick={confirm}>
        Confirmar pagamento
      </Button>
      <Button onClick={() => (startsSplit ? onBack() : setSplit(false))}>Voltar</Button>
    </Stack>
  );
};

export default PaymentPicker;
