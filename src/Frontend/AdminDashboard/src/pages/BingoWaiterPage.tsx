import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
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
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, NotificationsActive as NotificationsActiveIcon } from '@mui/icons-material';
import QRCode from 'qrcode';
import { useLocation, useNavigate } from 'react-router-dom';
import QrScanner from '../components/bingo/QrScanner';
import bingoApi from '../services/bingoApi';
import bingoWaiterApi from '../services/bingoWaiterApi';
import { WaiterOrderGroup, WaiterStatus } from '../types/bingo';
import { ContestAction, WaiterAccountItem, WaiterBill, WaiterPaymentMethod } from '../types/bingoWaiter';

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

const pendingCount = (groups: WaiterOrderGroup[] | null): number =>
  (groups ?? []).reduce((s, g) => s + g.items.filter((i) => i.status === 'Pending').length, 0);

interface OrdersTabProps {
  groups: WaiterOrderGroup[] | null;
  loadError: string;
  reload: () => Promise<void>;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ groups, loadError, reload }) => {
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = async (itemId: string, fn: (id: string) => Promise<any>, fallback: string) => {
    setBusyId(itemId);
    setActionError('');
    try {
      await fn(itemId);
      await reload();
    } catch (e: any) {
      setActionError(errorMessage(e, fallback));
      if (e?.response?.status === 409) await reload();
    } finally {
      setBusyId(null);
    }
  };

  const sorted = useMemo(() => {
    const oldest = (g: WaiterOrderGroup) =>
      Math.min(...g.items.map((i) => new Date(i.createdAt).getTime()), Number.MAX_SAFE_INTEGER);
    return [...(groups ?? [])].sort((a, b) => oldest(a) - oldest(b));
  }, [groups]);

  const small = { minHeight: 44, minWidth: 84, fontWeight: 700, px: 1.5 } as const;

  return (
    <Box>
      {(actionError || loadError) && (
        <Alert severity="warning" sx={{ mb: 2 }}>{actionError || loadError}</Alert>
      )}
      {groups && sorted.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhum pedido pendente.</Typography>}
      <Stack spacing={2}>
        {sorted.map((g) => (
          <Paper key={g.tabId} variant="outlined" sx={{ p: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Mesa {g.mesa} - {g.customerName}
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {g.items.map((i) => {
                const retrieved = i.status === 'Retrieved';
                const others = retrieved && !i.retrievedByMe;
                const statusLabel = !retrieved
                  ? 'Pendente'
                  : i.retrievedByMe
                    ? 'Retirado por você'
                    : `Com ${i.retrievedByName ?? 'outro garçom'}`;
                return (
                  <Box key={i.id} sx={{ opacity: others ? 0.6 : 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {i.quantity}x {i.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: !retrieved ? 'warning.main' : i.retrievedByMe ? 'info.main' : 'text.secondary', fontWeight: 600 }}
                    >
                      {statusLabel}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {!retrieved && (
                        <Button
                          variant="outlined"
                          color="info"
                          sx={small}
                          disabled={busyId === i.id}
                          onClick={() => act(i.id, bingoApi.retrieveItem, 'Não foi possível retirar o item.')}
                        >
                          Retirei na cozinha
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="success"
                        sx={small}
                        disabled={busyId === i.id}
                        onClick={() => act(i.id, bingoApi.deliverItem, 'Não foi possível dar baixa no item.')}
                      >
                        {retrieved ? 'Entregue na mesa' : 'Entregue'}
                      </Button>
                      {retrieved && (
                        <Button
                          variant="outlined"
                          sx={small}
                          disabled={busyId === i.id}
                          onClick={() => act(i.id, bingoApi.returnItem, 'Não foi possível devolver o item.')}
                        >
                          Devolver
                        </Button>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// ------------------------------------------------------------------- contas

const ITEM_CHIP: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  Pending: { label: 'Pendente', color: 'warning' },
  Retrieved: { label: 'A caminho', color: 'info' },
  Delivered: { label: 'Entregue', color: 'success' },
  Contested: { label: 'Em contestação', color: 'error' },
  Cancelled: { label: 'Cancelado', color: 'default' },
};

const formatTime = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

type BillFilter = 'requested' | 'all';

const AccountsTab: React.FC<{ mesas: number[] }> = ({ mesas }) => {
  const [accounts, setAccounts] = useState<WaiterBill[] | null>(null);
  const [filter, setFilter] = useState<BillFilter>('requested');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [methods, setMethods] = useState<WaiterPaymentMethod[]>([]);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [editing, setEditing] = useState<WaiterBill | null>(null);
  const [newMesa, setNewMesa] = useState('');
  const [cancelTarget, setCancelTarget] = useState<WaiterAccountItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [resolveTarget, setResolveTarget] = useState<WaiterAccountItem | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await bingoWaiterApi.getBills(filter === 'all');
      setAccounts(list);
      setSelected((sel) => sel.filter((id) => list.some((a) => a.tabId === id)));
      setError('');
    } catch (e) {
      setError('Sem conexão. Tentando novamente...');
    }
  }, [filter]);

  usePolling(load);

  useEffect(() => {
    setAccounts(null);
    void load();
  }, [load]);

  useEffect(() => {
    bingoWaiterApi
      .getPaymentMethods()
      .then(setMethods)
      .catch(() => setError('Não foi possível carregar as formas de pagamento.'));
  }, []);

  const requestedCount = (accounts ?? []).filter((a) => a.status === 'CloseRequested').length;
  const selectedAccounts = (accounts ?? []).filter((a) => selected.includes(a.tabId));
  const selectedMesa = selectedAccounts[0]?.mesa ?? null;
  const selectedDue = selectedAccounts.reduce((s, a) => s + a.amountDue, 0);
  const blockedUndelivered = selectedAccounts.reduce((s, a) => s + a.undeliveredCount, 0);
  const blockedContested = selectedAccounts.reduce((s, a) => s + a.contestedCount, 0);
  const blockReason =
    methodId === null
      ? 'Escolha a forma de pagamento.'
      : blockedUndelivered > 0 || blockedContested > 0
        ? [
            blockedUndelivered > 0 ? `${blockedUndelivered} item(ns) não entregue(s)` : '',
            blockedContested > 0 ? `${blockedContested} em contestação` : '',
          ]
            .filter(Boolean)
            .join(' e ') + '. Resolva antes de cobrar.'
        : '';
  const methodName = methods.find((m) => m.id === methodId)?.name ?? '';

  const toggle = (a: WaiterBill) =>
    setSelected((sel) => (sel.includes(a.tabId) ? sel.filter((id) => id !== a.tabId) : [...sel, a.tabId]));
  const toggleExpanded = (id: string) =>
    setExpanded((ex) => (ex.includes(id) ? ex.filter((x) => x !== id) : [...ex, id]));

  const pay = async () => {
    if (methodId === null || selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await bingoWaiterApi.payTabs(selected, methodId);
      setOk(`Pagamento registrado (${formatBRL(selectedDue)}).`);
      setSelected([]);
      setMethodId(null);
      setConfirm(false);
      await load();
    } catch (e) {
      setConfirm(false);
      setError(errorMessage(e, 'Não foi possível registrar o pagamento.'));
      if ((e as any)?.response?.status === 409) await load();
    } finally {
      setBusy(false);
    }
  };

  const itemAction = async (fn: () => Promise<any>, fallback: string) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(errorMessage(e, fallback));
      if ((e as any)?.response?.status === 409) await load();
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget || cancelReason.trim().length < 3) return;
    const item = cancelTarget;
    const reason = cancelReason.trim();
    setCancelTarget(null);
    setCancelReason('');
    await itemAction(() => bingoWaiterApi.cancelItem(item.id, reason), 'Não foi possível cancelar o item.');
  };

  const resolve = async (action: ContestAction) => {
    if (!resolveTarget) return;
    const item = resolveTarget;
    setResolveTarget(null);
    await itemAction(
      () => bingoWaiterApi.resolveContest(item.id, action),
      'Não foi possível resolver a contestação.'
    );
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

  const small = { minHeight: 40, fontWeight: 700, px: 1.5 } as const;

  return (
    <Box sx={{ pb: selected.length ? 34 : 2 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} role="radiogroup" aria-label="Filtro de contas">
        <Chip
          role="radio"
          aria-checked={filter === 'requested'}
          label={`Pediram a conta (${requestedCount})`}
          color={filter === 'requested' ? 'primary' : 'default'}
          variant={filter === 'requested' ? 'filled' : 'outlined'}
          onClick={() => setFilter('requested')}
          sx={{ flex: 1, height: 48, fontSize: '1rem', fontWeight: 700 }}
        />
        <Chip
          role="radio"
          aria-checked={filter === 'all'}
          label="Todas abertas"
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setFilter('all')}
          sx={{ flex: 1, height: 48, fontSize: '1rem', fontWeight: 700 }}
        />
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setOk('')}>{ok}</Alert>}
      {accounts && accounts.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhuma conta para cobrar.</Typography>}
      <Stack spacing={1.5}>
        {(accounts ?? []).map((a) => {
          const disabled = selectedMesa !== null && a.mesa !== selectedMesa;
          const isOpenList = expanded.includes(a.tabId);
          const requested = a.status === 'CloseRequested';
          return (
            <Paper
              key={a.tabId}
              variant="outlined"
              data-testid={`bill-${a.tabId}`}
              sx={{
                p: 1,
                opacity: disabled ? 0.5 : 1,
                borderColor: requested ? 'warning.main' : 'divider',
                borderWidth: requested ? 2 : 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  checked={selected.includes(a.tabId)}
                  disabled={disabled}
                  onChange={() => toggle(a)}
                  inputProps={{ 'aria-label': `Selecionar ${a.customerName}` }}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 32 }, p: 1.5 }}
                />
                <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => toggleExpanded(a.tabId)}>
                  <Typography sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Mesa {a.mesa} - {a.customerName}
                    {a.phoneVerified && (
                      <CheckCircleIcon aria-label="Celular confirmado" titleAccess="Celular confirmado" sx={{ fontSize: 20, color: 'success.main' }} />
                    )}
                    {requested && (
                      <NotificationsActiveIcon aria-label="Pediu a conta" titleAccess="Pediu a conta" sx={{ fontSize: 20, color: 'warning.main' }} />
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    A cobrar (entregues): {formatBRL(a.amountDue)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    {requested ? 'Pediu a conta' : 'Em aberto'}
                  </Typography>
                  {(a.undeliveredCount > 0 || a.contestedCount > 0) && (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
                      {a.undeliveredCount > 0 && (
                        <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
                          {a.undeliveredCount} não entregue(s)
                        </Typography>
                      )}
                      {a.contestedCount > 0 && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                          {a.contestedCount} em contestação
                        </Typography>
                      )}
                    </Stack>
                  )}
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
              </Box>
              <Button size="small" sx={{ ml: 1, mt: 0.5, fontWeight: 700 }} onClick={() => toggleExpanded(a.tabId)}>
                {isOpenList ? 'Ocultar itens' : 'Conferir itens com o cliente'}
              </Button>
              {isOpenList && (
                <Box sx={{ mt: 1, px: 1 }}>
                  {a.items.length === 0 && <Typography variant="body2" sx={{ opacity: 0.7 }}>Sem itens.</Typography>}
                  {a.items.map((i) => {
                    const chip = ITEM_CHIP[i.status] ?? ITEM_CHIP.Pending;
                    const cancelled = i.status === 'Cancelled';
                    return (
                      <Box key={i.id} data-testid={`bill-item-${i.id}`} sx={{ py: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ flex: 1, fontWeight: 600, textDecoration: cancelled ? 'line-through' : 'none', color: cancelled ? 'text.disabled' : 'text.primary' }}>
                            {i.quantity}x {i.name}
                          </Typography>
                          <Typography variant="body2" sx={{ textDecoration: cancelled ? 'line-through' : 'none' }}>
                            {formatBRL(i.unitPrice * i.quantity)}
                          </Typography>
                          <Chip size="small" label={chip.label} color={chip.color} />
                        </Box>
                        {i.status === 'Delivered' && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                            entregue por {i.deliveredByName ?? '-'}
                            {i.deliveredAt ? ` às ${formatTime(i.deliveredAt)}` : ''}
                          </Typography>
                        )}
                        {i.status === 'Contested' && i.contestNote && (
                          <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                            Cliente: {i.contestNote}
                          </Typography>
                        )}
                        {cancelled && i.cancelReason && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                            Cancelado{i.cancelledByName ? ` por ${i.cancelledByName}` : ''}: {i.cancelReason}
                          </Typography>
                        )}
                        {!cancelled && (
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                            {(i.status === 'Pending' || i.status === 'Retrieved') && (
                              <Button
                                variant="contained"
                                color="success"
                                sx={small}
                                disabled={busy}
                                onClick={() => itemAction(() => bingoApi.deliverItem(i.id), 'Não foi possível dar baixa no item.')}
                              >
                                Entregue na mesa
                              </Button>
                            )}
                            {i.status === 'Contested' && (
                              <Button variant="contained" color="warning" sx={small} disabled={busy} onClick={() => setResolveTarget(i)}>
                                Resolver
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              sx={small}
                              disabled={busy}
                              onClick={() => {
                                setCancelReason('');
                                setCancelTarget(i);
                              }}
                            >
                              Cancelar
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
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
              Mesa {selectedMesa} · {selected.length} comanda(s) · {formatBRL(selectedDue)}
            </Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} role="radiogroup" aria-label="Forma de pagamento" sx={{ mb: 1 }}>
              {methods.map((m) => (
                <Chip
                  key={m.id}
                  role="radio"
                  aria-checked={methodId === m.id}
                  label={m.name}
                  color={methodId === m.id ? 'primary' : 'default'}
                  variant={methodId === m.id ? 'filled' : 'outlined'}
                  onClick={() => setMethodId(m.id)}
                  sx={{ height: 48, fontSize: '1rem', fontWeight: 700, px: 1 }}
                />
              ))}
              {methods.length === 0 && <Typography variant="body2">Nenhuma forma de pagamento ativa.</Typography>}
            </Stack>
            {blockReason && (
              <Typography role="status" variant="body2" sx={{ color: 'warning.main', fontWeight: 600, mb: 1 }}>
                {blockReason}
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={BIG}
              disabled={!!blockReason || busy}
              onClick={() => setConfirm(true)}
            >
              Cobrar
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>Confirmar pagamento?</DialogTitle>
        <DialogContent>
          <Typography>
            Mesa {selectedMesa}: {formatBRL(selectedDue)} em {methodName}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setConfirm(false)}>Voltar</Button>
          <Button variant="contained" color="success" sx={{ minHeight: 48 }} disabled={busy} onClick={pay}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancelar item</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>{cancelTarget ? `${cancelTarget.quantity}x ${cancelTarget.name}` : ''}</Typography>
          <TextField
            fullWidth
            required
            label="Motivo do cancelamento"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value.slice(0, 200))}
            helperText="Mínimo de 3 caracteres."
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setCancelTarget(null)}>Voltar</Button>
          <Button
            variant="contained"
            color="error"
            sx={{ minHeight: 48 }}
            disabled={busy || cancelReason.trim().length < 3}
            onClick={confirmCancel}
          >
            Cancelar item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Resolver contestação</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>{resolveTarget ? `${resolveTarget.quantity}x ${resolveTarget.name}` : ''}</Typography>
          {resolveTarget?.contestNote && (
            <Typography variant="body2" sx={{ color: 'error.main' }}>Cliente: {resolveTarget.contestNote}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
          <Button variant="contained" color="success" sx={BIG} onClick={() => resolve('ConfirmDelivered')}>
            Confirmar entrega
          </Button>
          <Button variant="outlined" color="error" sx={BIG} onClick={() => resolve('Cancel')}>
            Cancelar item
          </Button>
          <Button sx={{ minHeight: 44 }} onClick={() => setResolveTarget(null)}>Voltar</Button>
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
    if (!mesa) {
      setDataUrl('');
      return;
    }
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
  }, [mesa]);

  return (
    <Stack spacing={2}>
      <TextField select fullWidth label="Selecionar mesa" value={mesa} onChange={(e) => setMesa(e.target.value)}>
        {mesas.map((n) => (
          <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
            Mesa {n}
          </MenuItem>
        ))}
      </TextField>
      {mesa && dataUrl && (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={dataUrl}
            alt={`QR code da mesa ${mesa}`}
            onClick={() => setFull(true)}
            sx={{ width: 'min(88vw, 55vh)', height: 'min(88vw, 55vh)', cursor: 'zoom-in', border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}
          />
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.7 }}>Toque no QR para ampliar</Typography>
        </Box>
      )}

      {full && (
        <Box
          role="dialog"
          aria-label="QR code da mesa"
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
          <Button
            variant="contained"
            color="inherit"
            size="large"
            onClick={() => setFull(false)}
            sx={{ mt: 2, minWidth: 220, minHeight: 52, fontWeight: 700, fontSize: '1.05rem', bgcolor: '#212121', color: '#fff', '&:hover': { bgcolor: '#000' } }}
          >
            Fechar
          </Button>
        </Box>
      )}
    </Stack>
  );
};

// ------------------------------------------------------------------- saída

const EXIT_PATH = /bingo-saida\/([0-9a-fA-F-]{36})/;

const ExitTab: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onScan = useCallback(
    (text: string) => {
      const m = EXIT_PATH.exec(text);
      if (m) {
        navigate(`/bingo-saida/${m[1]}`);
      } else {
        setScanning(false);
        setError('Este QR não é de uma comanda do Bingo.');
      }
    },
    [navigate]
  );

  const byCode = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await bingoWaiterApi.getExitByCode(code);
      navigate(`/bingo-saida/${r.tabId}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Comanda não encontrada.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      {!scanning ? (
        <Button variant="contained" sx={BIG} onClick={() => { setError(''); setScanning(true); }}>
          Ler QR do cliente
        </Button>
      ) : (
        <>
          <QrScanner onResult={onScan} />
          <Button variant="outlined" sx={BIG} onClick={() => setScanning(false)}>Cancelar leitura</Button>
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="body2" sx={{ opacity: 0.8 }}>Ou digite o código de 6 caracteres que aparece abaixo do QR do cliente:</Typography>
      <TextField
        label="Código da comanda"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        slotProps={{ htmlInput: { maxLength: 7, autoCapitalize: 'characters', style: { fontSize: '1.4rem', letterSpacing: 4, textAlign: 'center' } } }}
        fullWidth
      />
      <Button variant="contained" color="secondary" sx={BIG} disabled={busy || code.replace(/[^0-9a-fA-F]/g, '').length !== 6} onClick={byCode}>
        Conferir código
      </Button>
    </Stack>
  );
};

// ------------------------------------------------------------------- página

const BingoWaiterPage: React.FC = () => {
  const [status, setStatus] = useState<WaiterStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const location = useLocation();
  const [tab, setTab] = useState<number>((location.state as any)?.tab ?? 0);
  const [mesas, setMesas] = useState<number[]>([]);
  const [groups, setGroups] = useState<WaiterOrderGroup[] | null>(null);
  const [ordersError, setOrdersError] = useState('');
  const [flash, setFlash] = useState(false);
  const [billFlash, setBillFlash] = useState(false);
  const [billCount, setBillCount] = useState(0);
  const lastPending = useRef<number | null>(null);
  const lastBills = useRef<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const billFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const list = await bingoApi.getWaiterOrders();
      setGroups(list);
      setOrdersError('');
      const n = pendingCount(list);
      const prev = lastPending.current;
      lastPending.current = n;
      if (prev !== null && n > prev) {
        try {
          navigator.vibrate?.(200);
        } catch {
          // vibração indisponível
        }
        setFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(false), 2500);
      }
    } catch {
      setOrdersError('Sem conexão. Tentando novamente...');
    }
  }, []);

  const loadBillRequests = useCallback(async () => {
    try {
      const list = await bingoWaiterApi.getBills(false);
      const n = list.filter((b) => b.status === 'CloseRequested').length;
      setBillCount(n);
      const prev = lastBills.current;
      lastBills.current = n;
      if (prev !== null && n > prev) {
        try {
          navigator.vibrate?.(200);
        } catch {
          // vibração indisponível
        }
        setBillFlash(true);
        if (billFlashTimer.current) clearTimeout(billFlashTimer.current);
        billFlashTimer.current = setTimeout(() => setBillFlash(false), 2500);
      }
    } catch {
      // a aba Contas mostra o erro de conexão
    }
  }, []);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (billFlashTimer.current) clearTimeout(billFlashTimer.current);
    },
    []
  );

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
  const activeRef = useRef(active);
  activeRef.current = active;
  usePolling(async () => {
    if (activeRef.current) await Promise.all([loadOrders(), loadBillRequests()]);
  });

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
        {status.waiterName || 'Garçom'}
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
        Garçom{status.eventName ? ` · ${status.eventName}` : ''}
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
        <Tab
          label={
            <Badge badgeContent={pendingCount(groups)} color="error" max={99} sx={{ '& .MuiBadge-badge': { right: -14 } }}>
              <span>Pedidos</span>
            </Badge>
          }
          sx={{
            minHeight: 56,
            fontWeight: 700,
            bgcolor: flash ? 'warning.light' : undefined,
            transition: 'background-color 0.4s',
          }}
        />
        <Tab
          label={
            <Badge badgeContent={billCount} color="error" max={99} sx={{ '& .MuiBadge-badge': { right: -14 } }}>
              <span>Contas</span>
            </Badge>
          }
          sx={{
            minHeight: 56,
            fontWeight: 700,
            bgcolor: billFlash ? 'warning.light' : undefined,
            transition: 'background-color 0.4s',
          }}
        />
        <Tab label="QR" sx={{ minHeight: 56, fontWeight: 700 }} />
        <Tab label="Saída" sx={{ minHeight: 56, fontWeight: 700 }} />
      </Tabs>
      {tab === 0 && <OrdersTab groups={groups} loadError={ordersError} reload={loadOrders} />}
      {tab === 1 && <AccountsTab mesas={mesas} />}
      {tab === 2 && <QrTab mesas={mesas} />}
      {tab === 3 && <ExitTab />}
    </Box>
  );
};

export default BingoWaiterPage;
