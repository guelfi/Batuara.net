import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';

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

/** Forma marcada. Com uma só, o valor é o total; com várias, a última é calculada (auto) até ser editada. */
interface Entry {
  key: string; // id da forma ou NONE
  amount: string;
  auto: boolean;
}

interface Props {
  total: number;
  payMethods: PayMethod[];
  /** Forma sugerida pelo OCR quando ele leu uma só. */
  suggestedPay?: number | null;
  /** Formas escritas na comanda (uma ou mais); já vêm marcadas. */
  hints?: PayHint[];
  allowNotIdentified?: boolean;
  /** Valor de cada comanda quando várias são fechadas juntas (mostrado acima do total). */
  breakdown?: { label: string; amount: number }[];
  /** Mantido por compatibilidade: a seleção por caixas já permite marcar mais de uma forma. */
  startSplit?: boolean;
  onPick: (lines: PayLine[] | null) => void;
  onBack: () => void;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

const initialEntries = (total: number, hints: PayHint[], suggestedPay: number | null | undefined): Entry[] => {
  const withMethod = hints.filter((h) => h.paymentMethodId !== null);
  if (withMethod.length >= 2) {
    const known = withMethod.reduce((s, h) => s + (h.amount ?? 0), 0);
    const missing = withMethod.filter((h) => h.amount === null).length;
    return withMethod.map((h, i) => {
      let amount = h.amount;
      if (amount === null && missing === 1 && total - known > 0) amount = round2(total - known);
      return { key: String(h.paymentMethodId), amount: amount === null ? '' : fmt(amount), auto: i === withMethod.length - 1 && h.amount === null };
    });
  }
  const one = withMethod.length === 1 ? withMethod[0].paymentMethodId : suggestedPay;
  return one ? [{ key: String(one), amount: fmt(total), auto: false }] : [];
};

const PaymentPicker: React.FC<Props> = ({ total, payMethods, suggestedPay = null, hints = [], allowNotIdentified = true, breakdown = [], onPick, onBack }) => {
  const [entries, setEntries] = useState<Entry[]>(() => initialEntries(total, hints, suggestedPay));

  const many = entries.length >= 2;
  const sum = entries.reduce((s, e) => s + parseMoney(e.amount), 0);
  const missing = cents(total) - cents(sum);
  const canConfirm = entries.length > 0 && entries.every((e) => parseMoney(e.amount) > 0) && missing === 0;

  /** Uma forma fica com o total; com várias, a última auto recebe o que falta. */
  const settle = (list: Entry[]): Entry[] => {
    if (list.length === 1) return [{ ...list[0], amount: fmt(total), auto: false }];
    const last = list.length - 1;
    if (last < 1 || !list[last].auto) return list;
    const others = list.slice(0, last).reduce((s, e) => s + parseMoney(e.amount), 0);
    const rest = round2(total - others);
    return list.map((e, i) => (i === last ? { ...e, amount: rest > 0 ? fmt(rest) : '' } : e));
  };

  const toggle = (key: string) =>
    setEntries((list) => {
      if (list.some((e) => e.key === key)) return settle(list.filter((e) => e.key !== key).map((e, i, arr) => (i === arr.length - 1 && arr.length > 1 ? { ...e, auto: true } : e)));
      if (list.length === 0) return [{ key, amount: fmt(total), auto: false }];
      // ao marcar a segunda forma, a primeira espera o valor digitado e a nova fica com o restante
      const base = list.length === 1 ? [{ ...list[0], amount: '', auto: false }] : list.map((e) => ({ ...e, auto: false }));
      return settle([...base, { key, amount: '', auto: true }]);
    });

  const setAmount = (key: string, amount: string) => setEntries((list) => settle(list.map((e) => (e.key === key ? { ...e, amount, auto: false } : e))));

  const confirm = () => onPick(entries.map((e) => ({ paymentMethodId: e.key === NONE ? null : Number(e.key), amount: round2(parseMoney(e.amount)) })));

  const options = [...payMethods.map((m) => ({ key: String(m.id), name: m.name })), ...(allowNotIdentified ? [{ key: NONE, name: 'Não identificado' }] : [])];

  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      {payMethods.length === 0 && <Typography color="text.secondary">Nenhuma forma de pagamento ativa.</Typography>}
      {breakdown.length > 1 && (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 }}>
          {breakdown.map((b) => (
            <Stack key={b.label} direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
              <Typography variant="body2" noWrap sx={{ minWidth: 0, pr: 1 }}>{b.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{brl(b.amount)}</Typography>
            </Stack>
          ))}
        </Box>
      )}
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{breakdown.length > 1 ? 'Total das comandas' : 'Total a pagar'}</Typography>
        <Typography variant="h4" fontWeight={800} color="primary">{brl(total)}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {entries.length > 0 && (suggestedPay !== null || hints.length > 0) ? 'Marcado o que foi identificado na comanda. ' : ''}
        Marque a forma de pagamento. Se foi dividido, marque mais de uma: a soma precisa ser igual ao total.
      </Typography>
      {options.map((o) => {
        const entry = entries.find((e) => e.key === o.key);
        return (
          <Stack key={o.key} direction="row" spacing={1} alignItems="center" sx={{ minHeight: 44 }}>
            <FormControlLabel
              sx={{ flex: 1, minWidth: 0, m: 0 }}
              control={<Checkbox checked={!!entry} onChange={() => toggle(o.key)} />}
              label={o.name}
            />
            {entry && many && (
              <TextField
                size="small"
                label="Valor"
                value={entry.amount}
                onChange={(e) => setAmount(o.key, e.target.value)}
                inputProps={{ inputMode: 'decimal', 'aria-label': `Valor em ${o.name}` }}
                sx={{ width: 120 }}
              />
            )}
          </Stack>
        );
      })}
      {many && (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }} color={missing === 0 ? 'success.main' : 'warning.main'}>
            {missing === 0 ? 'Soma confere.' : missing > 0 ? `Faltam ${brl(missing / 100)}` : `Passou ${brl(-missing / 100)}`}
          </Typography>
        </Box>
      )}
      <Button variant="contained" size="large" disabled={!canConfirm} onClick={confirm}>
        Confirmar pagamento
      </Button>
      {allowNotIdentified && entries.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Sem identificar a forma? Marque "Não identificado".
        </Typography>
      )}
      <Button onClick={onBack}>Voltar</Button>
    </Stack>
  );
};

export default PaymentPicker;
