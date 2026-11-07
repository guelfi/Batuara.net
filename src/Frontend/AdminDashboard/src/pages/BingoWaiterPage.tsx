import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import QRCode from 'qrcode';
import bingoApi from '../services/bingoApi';
import { BingoPaymentMethod, WaiterAccount, WaiterOrderGroup, WaiterStatus } from '../types/bingo';

const BIG = { minHeight: 56, fontSize: '1.1rem', fontWeight: 700 } as const;
const POLL_MS = 4000;
const QR_BASE_URL = 'https://www.batuara.org.br/bingo';
const bingoQrUrl = (mesa: number) => `${QR_BASE_URL}?mesa=${mesa}`;

const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const errorMessage = (e: any, fallback: string): string => {
  const data = e?.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (e?.response?.status === 403) return 'Você não está escalado como garçom ou o evento não está aberto.';
  return fallback;
};

/** Executa `fn` agora e a cada 4 s, pausando com a aba oculta e retomando ao voltar. */
function usePolling(fn: () => void | Promise<void>) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const run = () => {
      void ref.current();
    };
    const start = () => {
      if (!timer) timer = setInterval(run, POLL_MS);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        run();
        start();
      }
    };
    run();
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}

// ------------------------------------------------------------------ pedidos

const OrdersTab: React.FC = () => {
  const [groups, setGroups] = useState<WaiterOrderGroup[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setGroups(await bingoApi.getWaiterOrders());
      setError('');
    } catch (e) {
      setError('Sem conexão. Tentando novamente...');
    }
  }, []);

  usePolling(load);

  const deliver = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await bingoApi.deliverItem(itemId);
      await load();
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível dar baixa no item.'));
    } finally {
      setBusyId(null);
    }
  };

  const sorted = useMemo(() => {
    const oldest = (g: WaiterOrderGroup) =>
      Math.min(...g.items.map((i) => new Date(i.createdAt).getTime()), Number.MAX_SAFE_INTEGER);
    return [...(groups ?? [])].sort((a, b) => oldest(a) - oldest(b));
  }, [groups]);

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {groups && sorted.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhum pedido pendente.</Typography>}
      <Stack spacing={2}>
        {sorted.map((g) => (
          <Paper key={g.tabId} variant="outlined" sx={{ p: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Mesa {g.mesa} - {g.customerName}
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {g.items.map((i) => (
                <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ flex: 1 }}>
                    {i.quantity}x {i.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ minHeight: 52, minWidth: 110, fontWeight: 700 }}
                    disabled={busyId === i.id}
                    onClick={() => deliver(i.id)}
                  >
                    Entregue
                  </Button>
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// ------------------------------------------------------------------- contas

const METHODS: { value: BingoPaymentMethod; label: string }[] = [
  { value: 'Card', label: 'Cartão' },
  { value: 'Pix', label: 'Pix' },
  { value: 'Cash', label: 'Dinheiro' },
];

const AccountsTab: React.FC<{ mesas: number[] }> = ({ mesas }) => {
  const [accounts, setAccounts] = useState<WaiterAccount[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [method, setMethod] = useState<BingoPaymentMethod | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [editing, setEditing] = useState<WaiterAccount | null>(null);
  const [newMesa, setNewMesa] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await bingoApi.getWaiterAccounts();
      setAccounts(list);
      setSelected((sel) => sel.filter((id) => list.some((a) => a.tabId === id)));
      setError('');
    } catch (e) {
      setError('Sem conexão. Tentando novamente...');
    }
  }, []);

  usePolling(load);

  const selectedMesa = useMemo(
    () => accounts?.find((a) => a.tabId === selected[0])?.mesa ?? null,
    [accounts, selected]
  );
  const selectedTotal = (accounts ?? [])
    .filter((a) => selected.includes(a.tabId))
    .reduce((s, a) => s + a.total, 0);

  const toggle = (a: WaiterAccount) =>
    setSelected((sel) => (sel.includes(a.tabId) ? sel.filter((id) => id !== a.tabId) : [...sel, a.tabId]));

  const pay = async () => {
    if (!method || selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await bingoApi.payTabs(selected, method);
      setOk(`Pagamento registrado (${formatBRL(selectedTotal)}).`);
      setSelected([]);
      setMethod(null);
      setConfirm(false);
      await load();
    } catch (e) {
      setConfirm(false);
      setError(errorMessage(e, 'Não foi possível registrar o pagamento.'));
    } finally {
      setBusy(false);
    }
  };

  const saveMesa = async () => {
    if (!editing || !newMesa) return;
    setBusy(true);
    try {
      await bingoApi.changeTabTable(editing.tabId, Number(newMesa));
      setEditing(null);
      await load();
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível corrigir a mesa.'));
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ pb: selected.length ? 24 : 2 }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setOk('')}>{ok}</Alert>}
      {accounts && accounts.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhuma conta para cobrar.</Typography>}
      <Stack spacing={1.5}>
        {(accounts ?? []).map((a) => {
          const disabled = selectedMesa !== null && a.mesa !== selectedMesa;
          return (
            <Paper
              key={a.tabId}
              variant="outlined"
              sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, opacity: disabled ? 0.5 : 1 }}
            >
              <Checkbox
                checked={selected.includes(a.tabId)}
                disabled={disabled}
                onChange={() => toggle(a)}
                inputProps={{ 'aria-label': `Selecionar ${a.customerName}` }}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 32 }, p: 1.5 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>
                  Mesa {a.mesa} - {a.customerName}
                </Typography>
                <Typography variant="body2">
                  {formatBRL(a.total)} · {a.status === 'CloseRequested' ? 'Pediu a conta' : 'Em aberto'}
                </Typography>
              </Box>
              <Button
                sx={{ minHeight: 48 }}
                onClick={() => {
                  setEditing(a);
                  setNewMesa(String(a.mesa));
                }}
              >
                Mesa
              </Button>
            </Paper>
          );
        })}
      </Stack>

      {selected.length > 0 && (
        <Paper
          elevation={8}
          sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, p: 2, zIndex: 1300, borderRadius: '16px 16px 0 0' }}
        >
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Mesa {selectedMesa} · {selected.length} comanda(s) · {formatBRL(selectedTotal)}
            </Typography>
            <ToggleButtonGroup exclusive fullWidth value={method} onChange={(_, v) => setMethod(v)} sx={{ mb: 1.5 }}>
              {METHODS.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ minHeight: 56, fontWeight: 700 }}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={BIG}
              disabled={!method || busy}
              onClick={() => setConfirm(true)}
            >
              Confirmar pagamento
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>Confirmar pagamento?</DialogTitle>
        <DialogContent>
          <Typography>
            Mesa {selectedMesa}: {formatBRL(selectedTotal)} em {METHODS.find((m) => m.value === method)?.label}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setConfirm(false)}>Voltar</Button>
          <Button variant="contained" color="success" sx={{ minHeight: 48 }} disabled={busy} onClick={pay}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Corrigir mesa de {editing?.customerName}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Mesa" value={newMesa} onChange={(e) => setNewMesa(e.target.value)} sx={{ mt: 1 }}>
            {mesas.map((n) => (
              <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
                Mesa {n}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" sx={{ minHeight: 48 }} disabled={busy || !newMesa} onClick={saveMesa}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ----------------------------------------------------------------------- QR

const QrTab: React.FC<{ mesas: number[] }> = ({ mesas }) => {
  const [mesa, setMesa] = useState('');
  const [full, setFull] = useState(false);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!full || !mesa) return;
    let cancelled = false;
    QRCode.toDataURL(bingoQrUrl(Number(mesa)), { width: 900, margin: 2, errorCorrectionLevel: 'M' })
      .then((u) => {
        if (!cancelled) setDataUrl(u);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [full, mesa]);

  return (
    <Stack spacing={2}>
      <TextField select fullWidth label="Mesa do cliente" value={mesa} onChange={(e) => setMesa(e.target.value)}>
        {mesas.map((n) => (
          <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
            Mesa {n}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" sx={BIG} disabled={!mesa} onClick={() => setFull(true)}>
        Mostrar QR para o cliente
      </Button>

      {full && (
        <Box
          role="button"
          aria-label="Fechar QR"
          onClick={() => setFull(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            bgcolor: '#fff',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', mb: 1 }}>Mesa {mesa} - Aponte a câmera</Typography>
          {dataUrl && (
            <Box
              component="img"
              src={dataUrl}
              alt={`QR code da mesa ${mesa}`}
              sx={{ width: 'min(90vw, 70vh)', height: 'min(90vw, 70vh)' }}
            />
          )}
          <Typography sx={{ mt: 1, fontSize: '1.1rem', wordBreak: 'break-all' }}>{bingoQrUrl(Number(mesa))}</Typography>
          <Typography variant="caption" sx={{ mt: 2, opacity: 0.6 }}>
            Toque para fechar
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

// ------------------------------------------------------------------- página

const BingoWaiterPage: React.FC = () => {
  const [status, setStatus] = useState<WaiterStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [tab, setTab] = useState(0);
  const [mesas, setMesas] = useState<number[]>([]);

  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await bingoApi.getWaiterStatus());
      setStatusError(false);
    } catch {
      setStatusError(true);
    }
  }, []);

  usePolling(refreshStatus);

  const active = !!status?.isWaiter && !!status?.eventOpen;

  useEffect(() => {
    if (!active) return;
    bingoApi.getWaiterTables().then(setMesas).catch(() => undefined);
  }, [active]);

  if (!status) {
    return statusError ? (
      <Alert severity="warning">Não foi possível carregar o Bingo. Tentando novamente...</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!status.isWaiter) {
    return <Alert severity="info">Você não está escalado como garçom do Bingo.</Alert>;
  }
  if (!status.eventOpen) {
    return <Alert severity="info">O evento do Bingo não está aberto no momento.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
        Bingo (garçom)
      </Typography>
      {status.eventName && (
        <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
          {status.eventName}
        </Typography>
      )}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
        <Tab label="Pedidos" sx={{ minHeight: 56, fontWeight: 700 }} />
        <Tab label="Contas" sx={{ minHeight: 56, fontWeight: 700 }} />
        <Tab label="QR" sx={{ minHeight: 56, fontWeight: 700 }} />
      </Tabs>
      {tab === 0 && <OrdersTab />}
      {tab === 1 && <AccountsTab mesas={mesas} />}
      {tab === 2 && <QrTab mesas={mesas} />}
    </Box>
  );
};

export default BingoWaiterPage;
