import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Button, Chip, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import bingoApi from '../../services/bingoApi';
import { WaiterTableState, WaiterTableStatus } from '../../types/bingoWaiter';

const REFRESH_MS = 10000;
const FLASH_MS = 8000;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.55); }
  50% { box-shadow: 0 0 0 6px rgba(46, 125, 50, 0); }
`;

/** Texto curto do estado de uma mesa. */
export const tableStateLabel = (t: WaiterTableStatus): string => {
  switch (t.estado) {
    case 'Free':
      return t.exclusiva ? 'Livre · exclusiva' : 'Livre';
    case 'HasSeats':
      return `${t.livres} ${t.livres === 1 ? 'lugar livre' : 'lugares livres'}`;
    case 'Full':
      return 'Lotada';
    default:
      return 'Exclusiva ocupada';
  }
};

const STATE_COLOR: Record<WaiterTableState, 'success' | 'warning' | 'error'> = {
  Free: 'success',
  HasSeats: 'warning',
  Full: 'error',
  ExclusiveTaken: 'error',
};

const seatsText = (t: WaiterTableStatus) => `${t.ocupados} de ${t.lugares} ${t.lugares === 1 ? 'lugar' : 'lugares'}`;
const occupantsText = (t: WaiterTableStatus) => t.ocupantes.map((o) => `${o.nome} (${o.pessoas})`).join(', ');

interface FlashInfo {
  kind: 'free' | 'seats';
  text: string;
}

/** Compara a lista nova com a anterior e devolve o que abriu: mesa que ficou livre ou que ganhou lugares. */
export const detectOpenings = (prev: Map<number, WaiterTableStatus>, next: WaiterTableStatus[]): Record<number, FlashInfo> => {
  const out: Record<number, FlashInfo> = {};
  next.forEach((t) => {
    const before = prev.get(t.numero);
    if (!before) return;
    if (before.estado !== 'Free' && t.estado === 'Free') {
      out[t.numero] = { kind: 'free', text: `Mesa ${t.numero} ficou livre` };
    } else if (t.estado !== 'ExclusiveTaken' && t.livres > before.livres && t.estado !== 'Free') {
      const abriu = t.livres - before.livres;
      out[t.numero] = { kind: 'seats', text: `Mesa ${t.numero} abriu ${abriu} ${abriu === 1 ? 'vaga' : 'vagas'}` };
    }
  });
  return out;
};

interface Props {
  /** Mesa aberta (a que mostra o QR); '' = nenhuma. */
  selected: string;
  onSelect: (mesa: string) => void;
}

/**
 * Situação das mesas ao vivo: livre, com vaga (quantos lugares), lotada ou exclusiva ocupada.
 * Atualiza sozinha e destaca por alguns segundos a mesa que ficou livre ou abriu vaga. Só informa: não bloqueia ninguém.
 */
const WaiterTablesStatus: React.FC<Props> = ({ selected, onSelect }) => {
  const [tables, setTables] = useState<WaiterTableStatus[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState<Record<number, FlashInfo>>({});
  const previous = useRef<Map<number, WaiterTableStatus>>(new Map());
  const timers = useRef<number[]>([]);

  const load = useCallback(async () => {
    try {
      const list = await bingoApi.getWaiterTablesStatus();
      const openings = detectOpenings(previous.current, list);
      previous.current = new Map(list.map((t) => [t.numero, t]));
      setTables(list);
      setError(false);
      setLoaded(true);
      const numbers = Object.keys(openings).map(Number);
      if (numbers.length > 0) {
        setFlash((f) => ({ ...f, ...openings }));
        const id = window.setTimeout(() => {
          setFlash((f) => {
            const copy = { ...f };
            numbers.forEach((n) => delete copy[n]);
            return copy;
          });
        }, FLASH_MS);
        timers.current.push(id);
      }
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') load();
    }, REFRESH_MS);
    const timersList = timers.current;
    return () => {
      window.clearInterval(id);
      timersList.forEach((t) => window.clearTimeout(t));
    };
  }, [load]);

  const banners = Object.values(flash);
  const current = selected ? tables.find((t) => String(t.numero) === selected) : undefined;

  if (!loaded) {
    return error ? (
      <Typography color="text.secondary" variant="body2">
        Não foi possível carregar a situação das mesas. Tentando novamente...
      </Typography>
    ) : null;
  }

  return (
    <Box>
      {banners.length > 0 && (
        <Stack spacing={0.5} sx={{ mb: 1 }} role="status" aria-live="polite">
          {banners.map((b) => (
            <Chip key={b.text} color="success" label={b.text} sx={{ fontWeight: 700, justifyContent: 'flex-start' }} />
          ))}
        </Stack>
      )}

      {current ? (
        <Box
          sx={{ border: 2, borderColor: (t) => alpha(t.palette[STATE_COLOR[current.estado]].main, 0.6), borderRadius: 2, p: 1.25, bgcolor: (t) => alpha(t.palette[STATE_COLOR[current.estado]].main, 0.08) }}
          data-testid={`mesa-detalhe-${current.numero}`}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={800}>
              Mesa {current.numero}
              {current.exclusiva && <LockIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'text-bottom' }} titleAccess="Exclusiva" />}
            </Typography>
            <Typography fontWeight={700}>{tableStateLabel(current)}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {seatsText(current)} ocupados · {current.exclusiva ? 'exclusiva (um grupo só)' : 'compartilhada (vale quem chegar primeiro)'}
          </Typography>
          {current.ocupantes.length > 0 && <Typography variant="body2" sx={{ mt: 0.5 }}>{occupantsText(current)}</Typography>}
          <Button size="small" sx={{ mt: 0.5, px: 0 }} onClick={() => onSelect('')}>
            Ver todas as mesas
          </Button>
        </Box>
      ) : (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mb: 1, flexWrap: 'wrap' }} aria-label="Legenda das mesas">
            {([['success', 'Livre'], ['warning', 'Com vaga'], ['error', 'Lotada / exclusiva ocupada']] as const).map(([c, label]) => (
              <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${c}.main` }} />
                <Typography variant="caption">{label}</Typography>
              </Stack>
            ))}
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 1 }} role="list" aria-label="Situação das mesas">
            {tables.map((t) => {
              const color = STATE_COLOR[t.estado];
              const f = flash[t.numero];
              return (
                <ButtonBase
                  key={t.numero}
                  role="listitem"
                  onClick={() => onSelect(String(t.numero))}
                  aria-label={`Mesa ${t.numero}: ${tableStateLabel(t)}, ${seatsText(t)} ocupados${f ? `. ${f.text}` : ''}`}
                  data-testid={`mesa-${t.numero}`}
                  data-estado={t.estado}
                  data-flash={f ? f.kind : undefined}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    border: 2,
                    borderColor: (th) => alpha(th.palette[color].main, 0.6),
                    bgcolor: (th) => alpha(th.palette[color].main, 0.1),
                    borderRadius: 2,
                    p: 1,
                    minHeight: 70,
                    ...(f ? { animation: `${pulse} 1.2s ease-in-out infinite` } : {}),
                  }}
                >
                  <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    Mesa {t.numero}
                    {t.exclusiva && <LockIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'text-bottom' }} titleAccess="Exclusiva" />}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {tableStateLabel(t)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {t.estado === 'Free' ? `${t.lugares} ${t.lugares === 1 ? 'lugar' : 'lugares'}` : seatsText(t)}
                  </Typography>
                  {f && <Typography variant="caption" fontWeight={800} color="success.dark">{f.kind === 'free' ? 'Vagou!' : 'Abriu vaga!'}</Typography>}
                </ButtonBase>
              );
            })}
          </Box>
          {tables.length === 0 && <Typography color="text.secondary">Nenhuma mesa neste evento.</Typography>}
        </>
      )}
    </Box>
  );
};

export default WaiterTablesStatus;
