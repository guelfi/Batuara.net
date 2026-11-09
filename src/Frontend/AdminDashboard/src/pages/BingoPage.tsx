import ClosingReport from '../components/bingo/ClosingReport';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Cast as ProjectIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import apiService from '../services/api';
import CurrencyField from '../components/common/CurrencyField';
import useIsMobile from '../hooks/useIsMobile';
import bingoApi from '../services/bingoApi';
import {
  BingoEvent,
  BingoMenuItem,
  BingoPanel,
  BingoOrderItem,
  BingoPayMethod,
  BingoPendingTab,
  BingoReminderPreview,
  BingoReminderResult,
  BingoSummary,
  BingoTab,
  BingoWaiter,
} from '../types/bingo';
import { HouseMember } from '../types';

const BINGO_URL = 'https://www.batuara.org.br/bingo';
const POLL_MS = 4000;

type TabFilter = 'open' | 'closing' | 'paid' | 'verified' | 'unverified';

const money = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const apiError = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.errors?.join(' ') || e?.message || fallback;

const PAY_LABEL: Record<string, string> = { Card: 'Cartão', Pix: 'Pix', Cash: 'Dinheiro' };
const payLabel = (m?: string | null) => (m ? PAY_LABEL[m] ?? m : '-');

const EVENT_STATUS: Record<BingoEvent['status'], { label: string; color: 'default' | 'success' | 'warning' }> = {
  Draft: { label: 'Rascunho', color: 'warning' },
  Open: { label: 'Aberto', color: 'success' },
  Closed: { label: 'Encerrado', color: 'default' },
  Suspended: { label: 'Suspenso', color: 'warning' },
};

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const timeHm = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const ITEM_CHIP: Record<BingoOrderItem['status'], { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  Pending: { label: 'Pendente', color: 'warning' },
  Retrieved: { label: 'A caminho', color: 'info' },
  Delivered: { label: 'Entregue', color: 'success' },
  Contested: { label: 'Em contestação', color: 'error' },
  Cancelled: { label: 'Cancelado', color: 'default' },
};

type Notify = (message: string, severity?: 'success' | 'error') => void;

interface ConfirmState {
  title: string;
  text: string;
  confirmLabel: string;
  requireWord?: string;
  onConfirm: () => Promise<void>;
}

/* ---------- Confirmação (com palavra obrigatória opcional) ---------- */
const ConfirmDialog: React.FC<{ state: ConfirmState | null; onClose: () => void }> = ({ state, onClose }) => {
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setWord(''), [state]);
  if (!state) return null;
  const canConfirm = !state.requireWord || word.trim().toUpperCase() === state.requireWord;
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: state.requireWord ? 2 : 0 }}>{state.text}</DialogContentText>
        {state.requireWord && (
          <TextField
            autoFocus
            fullWidth
            label={`Digite ${state.requireWord} para confirmar`}
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          disabled={!canConfirm || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await state.onConfirm();
            } finally {
              setBusy(false);
              onClose();
            }
          }}
        >
          {state.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ---------- Painel ao vivo ---------- */
const PhoneBadge: React.FC<{ tab: BingoTab }> = ({ tab }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
    {tab.phoneVerified !== undefined && (
      <Chip size="small" variant="outlined" color={tab.phoneVerified ? 'success' : 'default'}
        label={tab.phoneVerified ? '✓ confirmado' : 'não confirmado'} />
    )}
    {tab.codeDeliveryStatus === 'Failed' && (
      <Tooltip title={tab.codeDeliveryError || 'Falha ao entregar o código'}>
        <Chip size="small" color="error" label="falha de entrega" />
      </Tooltip>
    )}
  </Stack>
);

/* ---------- Fechamento no caixa ---------- */
const OPEN_STATUSES: BingoOrderItem['status'][] = ['Pending', 'Retrieved', 'Contested'];

const CashierDialog: React.FC<{
  tab: BingoTab;
  notify: Notify;
  onClose: () => void;
  onChanged: () => void;
}> = ({ tab, notify, onClose, onChanged }) => {
  const [tabs, setTabs] = useState<BingoTab[]>([tab]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([tab.tabId]);
  const [methods, setMethods] = useState<BingoPayMethod[]>([]);
  const [methodId, setMethodId] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cancelItem, setCancelItem] = useState<BingoOrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTabOpen, setCancelTabOpen] = useState(false);
  const [cancelTabReason, setCancelTabReason] = useState('');
  const [resolveItem, setResolveItem] = useState<BingoOrderItem | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const isMobile = useIsMobile();

  const loadTabs = useCallback(async () => {
    try {
      const list = await bingoApi.getTableTabs(tab.mesa);
      setTabs(list);
      setSelected((prev) => prev.filter((id) => list.some((t) => t.tabId === id)));
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar as comandas da mesa.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [tab.mesa, notify]);

  useEffect(() => { loadTabs(); }, [loadTabs]);
  useEffect(() => {
    bingoApi.getPaymentMethods()
      .then((list) => setMethods(list.filter((m) => m.isActive)))
      .catch((e) => notify(apiError(e, 'Não foi possível carregar as formas de pagamento.'), 'error'));
  }, [notify]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const chosen = tabs.filter((t) => selected.includes(t.tabId));
  const totalDue = chosen.reduce((s, t) => s + t.amountDue, 0);
  const undelivered = chosen.reduce((s, t) => s + t.items.filter((i) => i.status === 'Pending' || i.status === 'Retrieved').length, 0);
  const contested = chosen.reduce((s, t) => s + t.items.filter((i) => i.status === 'Contested').length, 0);
  let blockReason = '';
  if (chosen.length === 0) blockReason = 'Marque ao menos uma comanda.';
  else if (undelivered + contested > 0) {
    const parts: string[] = [];
    if (undelivered) parts.push(`${undelivered} ${undelivered === 1 ? 'item não entregue' : 'itens não entregues'}`);
    if (contested) parts.push(`${contested} ${contested === 1 ? 'item em contestação' : 'itens em contestação'}`);
    blockReason = `Resolva antes de cobrar: ${parts.join(' e ')}.`;
  } else if (methodId === '') blockReason = 'Escolha a forma de pagamento.';

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      notify(ok, 'success');
      setPayError(null);
      await loadTabs();
      onChanged();
    } catch (e: any) {
      notify(apiError(e, 'Operação não concluída.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    const item = cancelItem;
    if (!item) return;
    const reason = cancelReason.trim();
    if (reason.length < 3 || reason.length > 200) {
      notify('Informe o motivo (3 a 200 caracteres).', 'error');
      return;
    }
    setCancelItem(null);
    await act(() => bingoApi.cancelItem(item.id, reason), 'Item cancelado.');
  };

  const cancellableTabs = tabs.filter((t) => selected.includes(t.tabId) && t.status !== 'Paid');
  const confirmCancelTab = async () => {
    const reason = cancelTabReason.trim();
    if (reason.length < 10 || reason.length > 200) {
      notify('Informe a justificativa (10 a 200 caracteres).', 'error');
      return;
    }
    setCancelTabOpen(false);
    await act(async () => {
      for (const t of cancellableTabs) {
        await bingoApi.cancelTab(t.tabId, reason);
      }
    }, cancellableTabs.length > 1 ? 'Comandas canceladas.' : 'Comanda cancelada.');
  };

  const confirmResolve = async (action: 'ConfirmDelivered' | 'Cancel') => {
    const item = resolveItem;
    if (!item) return;
    const n = resolveNote.trim();
    setResolveItem(null);
    await act(() => bingoApi.resolveContest(item.id, action, n || undefined),
      action === 'Cancel' ? 'Item cancelado.' : 'Entrega confirmada.');
  };

  const pay = async () => {
    if (methodId === '') return;
    setBusy(true);
    setPayError(null);
    try {
      const r = await bingoApi.payTabsAdmin(selected, methodId, note.trim() || undefined);
      notify(`${r.paidCount} ${r.paidCount === 1 ? 'conta paga' : 'contas pagas'}: ${money(r.total)}.`, 'success');
      onChanged();
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 409) {
        const list: BingoPendingTab[] = Array.isArray(e.response.data?.data?.tabs) ? e.response.data.data.tabs : [];
        const detail = list
          .map((t) => `${t.customerName} (${t.undeliveredCount} não entregue(s), ${t.contestedCount} em contestação)`)
          .join('; ');
        setPayError(`${apiError(e, 'Há itens pendentes.')}${detail ? ` ${detail}` : ''}`);
        await loadTabs();
      } else {
        notify(apiError(e, 'Não foi possível registrar o pagamento.'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const itemBg = (st: BingoOrderItem['status']) =>
    st === 'Contested' ? 'rgba(211,47,47,0.14)' : st === 'Pending' || st === 'Retrieved' ? 'rgba(237,108,2,0.14)' : undefined;

  const itemNote = (i: BingoOrderItem) => {
    if (i.status === 'Delivered' && (i.deliveredByName || i.deliveredAt))
      return `entregue${i.deliveredByName ? ` por ${i.deliveredByName}` : ''}${i.deliveredAt ? ` às ${timeHm(i.deliveredAt)}` : ''}`;
    if (i.status === 'Cancelled')
      return `cancelado${i.cancelledByName ? ` por ${i.cancelledByName}` : ''}${i.cancelReason ? `: ${i.cancelReason}` : ''}`;
    if (i.status === 'Contested')
      return `contestado${i.contestedAt ? ` às ${timeHm(i.contestedAt)}` : ''}${i.contestNote ? `: ${i.contestNote}` : ''}`;
    return '';
  };

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="lg" fullScreen={isMobile}>
      <DialogTitle>Fechar conta: mesa {tab.mesa}</DialogTitle>
      <DialogContent dividers>
        {loading && <CircularProgress size={24} />}
        <Stack spacing={2}>
          {tabs.length === 0 && !loading && <Alert severity="info">Nenhuma comanda não paga nesta mesa.</Alert>}
          {tabs.map((t) => {
            const checked = selected.includes(t.tabId);
            return (
              <Paper key={t.tabId} variant="outlined" sx={{ p: 1.5, borderColor: checked ? 'primary.main' : 'divider' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                  <FormControlLabel
                    control={<Checkbox checked={checked} onChange={() => toggle(t.tabId)} />}
                    label={<Typography sx={{ fontWeight: 600 }}>{t.customerName || 'Sem nome'}</Typography>}
                  />
                  <PhoneBadge tab={t} />
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary">Consumo {money(t.total)}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>A cobrar {money(t.amountDue)}</Typography>
                </Stack>
                {isMobile ? (
                  <Stack spacing={1}>
                    {t.items.map((i) => (
                      <Box key={i.id} sx={{ p: 1, borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: itemBg(i.status) }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography sx={{ fontWeight: 600, textDecoration: i.status === 'Cancelled' ? 'line-through' : undefined }}>
                            {i.quantity}x {i.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{money(i.unitPrice * i.quantity)}</Typography>
                        </Stack>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip size="small" color={ITEM_CHIP[i.status].color} label={ITEM_CHIP[i.status].label} />
                        </Box>
                        {itemNote(i) && (
                          <Typography variant="body2" sx={{ mt: 0.5, color: i.status === 'Contested' ? 'error.main' : 'text.secondary' }}>
                            {itemNote(i)}
                          </Typography>
                        )}
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {(i.status === 'Pending' || i.status === 'Retrieved') && (
                            <Button fullWidth variant="outlined" disabled={busy} sx={{ minHeight: 40 }}
                              onClick={() => act(() => bingoApi.deliverItemAdmin(i.id), 'Item marcado como entregue.')}>
                              Marcar entregue
                            </Button>
                          )}
                          {i.status === 'Contested' && (
                            <Button fullWidth color="error" variant="outlined" disabled={busy} sx={{ minHeight: 40 }}
                              onClick={() => { setResolveNote(''); setResolveItem(i); }}>
                              Resolver contestação
                            </Button>
                          )}
                          {i.status !== 'Cancelled' && (
                            <Button fullWidth color="error" variant="outlined" disabled={busy} sx={{ minHeight: 40 }}
                              onClick={() => { setCancelReason(''); setCancelItem(i); }}>
                              Cancelar
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                    {t.items.length === 0 && <Typography variant="body2">Sem itens.</Typography>}
                  </Stack>
                ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Detalhe</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {t.items.map((i) => (
                        <TableRow key={i.id} sx={{ bgcolor: itemBg(i.status) }}>
                          <TableCell sx={i.status === 'Cancelled' ? { textDecoration: 'line-through' } : undefined}>
                            {i.quantity}x {i.name}
                          </TableCell>
                          <TableCell align="right">{money(i.unitPrice * i.quantity)}</TableCell>
                          <TableCell>
                            <Chip size="small" color={ITEM_CHIP[i.status].color} label={ITEM_CHIP[i.status].label} />
                          </TableCell>
                          <TableCell sx={{ color: i.status === 'Contested' ? 'error.main' : 'text.secondary' }}>
                            {itemNote(i)}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                              {(i.status === 'Pending' || i.status === 'Retrieved') && (
                                <Button size="small" disabled={busy}
                                  onClick={() => act(() => bingoApi.deliverItemAdmin(i.id), 'Item marcado como entregue.')}>
                                  Marcar entregue
                                </Button>
                              )}
                              {i.status === 'Contested' && (
                                <Button size="small" color="error" disabled={busy}
                                  onClick={() => { setResolveNote(''); setResolveItem(i); }}>
                                  Resolver contestação
                                </Button>
                              )}
                              {i.status !== 'Cancelled' && (
                                <Button size="small" color="error" variant="outlined" disabled={busy}
                                  onClick={() => { setCancelReason(''); setCancelItem(i); }}>
                                  Cancelar
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {t.items.length === 0 && <TableRow><TableCell colSpan={5}>Sem itens.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </TableContainer>
                )}
              </Paper>
            );
          })}
          {payError && <Alert severity="error">{payError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          flexWrap: 'wrap', gap: 1, p: 2, alignItems: 'center',
          ...(isMobile && { flexDirection: 'column', alignItems: 'stretch', '& > :not(style)': { ml: 0, width: '100%' } }),
        }}
      >
        <Typography variant="h6" sx={{ mr: 'auto' }}>Total a cobrar: {money(totalDue)}</Typography>
        <FormControl size="small" sx={{ minWidth: isMobile ? 0 : 200 }}>
          <InputLabel id="caixa-forma">Forma de pagamento</InputLabel>
          <Select labelId="caixa-forma" label="Forma de pagamento" value={methodId}
            onChange={(e) => setMethodId(e.target.value === ('' as any) ? '' : Number(e.target.value))}>
            {methods.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="Observação (opcional)" value={note} onChange={(e) => setNote(e.target.value)}
          inputProps={{ maxLength: 200 }} sx={{ minWidth: isMobile ? 0 : 220 }} />
        <Tooltip title={blockReason}>
          <span>
            <Button variant="contained" color="success" disabled={busy || !!blockReason} onClick={pay}
              fullWidth={isMobile} sx={isMobile ? { minHeight: 44 } : undefined}>
              Registrar pagamento
            </Button>
          </span>
        </Tooltip>
        <Button color="error" variant="outlined" disabled={busy || cancellableTabs.length === 0}
          onClick={() => { setCancelTabReason(''); setCancelTabOpen(true); }} sx={isMobile ? { minHeight: 44 } : undefined}>
          Cancelar comanda
        </Button>
        <Button onClick={onClose} disabled={busy} sx={isMobile ? { minHeight: 44 } : undefined}>Fechar</Button>
        {blockReason && (
          <Typography variant="body2" color="error" sx={{ width: '100%', textAlign: isMobile ? 'left' : 'right' }}>{blockReason}</Typography>
        )}
      </DialogActions>

      <Dialog open={cancelTabOpen} onClose={() => setCancelTabOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Cancelar comanda</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Todos os itens da comanda serão cancelados e ela sai dos totais. O registro continua no histórico com a justificativa.
          </DialogContentText>
          <TextField autoFocus fullWidth required label="Justificativa" value={cancelTabReason}
            onChange={(e) => setCancelTabReason(e.target.value)} inputProps={{ maxLength: 200 }}
            helperText="De 10 a 200 caracteres" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTabOpen(false)}>Voltar</Button>
          <Button color="error" variant="contained" disabled={cancelTabReason.trim().length < 10} onClick={confirmCancelTab}>
            Cancelar comanda
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!cancelItem} onClose={() => setCancelItem(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancelar item</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {cancelItem?.quantity}x {cancelItem?.name}. O item sai da conta.
          </DialogContentText>
          <TextField autoFocus fullWidth required label="Motivo do cancelamento" value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)} inputProps={{ maxLength: 200 }}
            helperText="De 3 a 200 caracteres" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelItem(null)}>Voltar</Button>
          <Button color="error" variant="contained" disabled={cancelReason.trim().length < 3} onClick={confirmCancel}>
            Cancelar item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!resolveItem} onClose={() => setResolveItem(null)} fullWidth maxWidth="xs">
        <DialogTitle>Resolver contestação</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {resolveItem?.quantity}x {resolveItem?.name}
            {resolveItem?.contestNote ? `. Cliente: "${resolveItem.contestNote}"` : ''}
          </DialogContentText>
          <TextField fullWidth label="Observação (opcional)" value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)} inputProps={{ maxLength: 200 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveItem(null)}>Voltar</Button>
          <Button color="error" onClick={() => confirmResolve('Cancel')}>Cancelar item</Button>
          <Button variant="contained" onClick={() => confirmResolve('ConfirmDelivered')}>Confirmar entrega</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

const LivePanel: React.FC<{
  event: BingoEvent | null;
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  onEventChanged: () => void;
}> = ({ event, notify, confirm, onEventChanged }) => {
  const [panel, setPanel] = useState<BingoPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closeTarget, setCloseTarget] = useState<BingoTab | null>(null);
  const [busy, setBusy] = useState(false);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    try {
      setPanel(await bingoApi.getPanel());
      setError(null);
    } catch (e: any) {
      setError(apiError(e, 'Não foi possível carregar o painel.'));
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const tabs = panel?.tabs ?? [];
  const [filter, setFilter] = useState<TabFilter | null>(null);
  const toggleFilter = (f: TabFilter) => setFilter((cur) => (cur === f ? null : f));
  const matchesFilter = (t: BingoTab) => {
    switch (filter) {
      case 'open': return t.status === 'Open';
      case 'closing': return t.status === 'CloseRequested';
      case 'paid': return t.status === 'Paid';
      case 'verified': return !!t.phoneVerified;
      case 'unverified': return !t.phoneVerified;
      default: return true;
    }
  };
  const open = tabs.filter((t) => t.status === 'Open');
  const closing = tabs.filter((t) => t.status === 'CloseRequested');
  const paid = tabs.filter((t) => t.status === 'Paid');
  const itemsText = (items: BingoTab['items']) =>
    items.map((i) => `${i.quantity}x ${i.name}${i.status === 'Retrieved' ? ` (a caminho${i.retrievedByName ? ` - ${i.retrievedByName}` : ''})` : ''}`).join(', ');
  const mesaRows = tabs
    .filter((t) => (filter === 'paid' ? true : t.status !== 'Paid'))
    .filter(matchesFilter)
    .map((t) => ({
      tab: t,
      toDeliver: t.items.filter((i) => i.status === 'Pending' || i.status === 'Retrieved'),
      delivered: t.items.filter((i) => i.status === 'Delivered'),
      contested: t.items.filter((i) => i.status === 'Contested'),
    }))
    .filter((x) => x.toDeliver.length + x.delivered.length + x.contested.length > 0)
    .sort((a, b) => String(a.tab.mesa).localeCompare(String(b.tab.mesa), 'pt-BR', { numeric: true }));
  const countItems = (status: 'Pending' | 'Retrieved' | 'Contested') =>
    tabs.reduce((sum, t) => sum + t.items.filter((i) => i.status === status).reduce((q, i) => q + i.quantity, 0), 0);
  const retrievedCount = panel?.retrievedItems ?? countItems('Retrieved');
  const pendingCount = countItems('Pending');
  const contestedCount = panel?.contestedItems ?? countItems('Contested');
  const totalSold = panel?.totalSold ?? paid.reduce((s, t) => s + t.total, 0);
  const closeAll = panel?.closeAllRequested ?? event?.closeAllRequested ?? false;

  const chipFilter = (f: TabFilter) => ({
    clickable: true,
    onClick: () => toggleFilter(f),
    variant: (filter === f ? 'filled' : 'outlined') as 'filled' | 'outlined',
    sx: filter === f ? { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: 1 } : undefined,
  });

  const run = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      notify(ok, 'success');
      await load();
      onEventChanged();
    } catch (e: any) {
      notify(apiError(e, 'Operação não concluída.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!event) return <Alert severity="info">Nenhum evento. Crie um na aba Eventos.</Alert>;
  const isOpen = event.status === 'Open';

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap
            sx={isMobile ? { '& .MuiChip-root': { height: 36, maxWidth: '100%' } } : undefined}>
            <Chip {...chipFilter('open')} label={`Em aberto: ${open.length}`} />
            <Chip {...chipFilter('closing')} color="warning" label={`Pediram a conta: ${closing.length}`} />
            <Chip {...chipFilter('paid')} color="success" label={`Pagas: ${paid.length}`} />
            <Chip color="info" variant="outlined" label={`Itens pendentes: ${pendingCount}`} />
            <Chip color="secondary" variant="outlined" label={`Itens retirados: ${retrievedCount}`} />
            {contestedCount > 0 && <Chip color="error" label={`Em contestação: ${contestedCount}`} />}
            <Chip color="primary" variant="outlined" label={`Total vendido: ${money(totalSold)}`} />
            {panel?.phoneVerifiedCount !== undefined && (
              <Chip {...chipFilter('verified')} color="success" label={`Celular confirmado: ${panel.phoneVerifiedCount}`} />
            )}
            {panel?.phoneNotVerifiedCount !== undefined && (
              <Chip {...chipFilter('unverified')} label={`Não confirmado: ${panel.phoneNotVerifiedCount}`} />
            )}
            {!!panel?.codeDeliveryFailedCount && (
              <Chip color="error" variant="outlined" label={`Falha de entrega: ${panel.codeDeliveryFailedCount}`} />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            <Stack direction="row" alignItems="center">
              <Switch
                checked={closeAll}
                disabled={busy || !isOpen}
                onChange={(e) =>
                  run(() => bingoApi.setCloseAll(e.target.checked),
                    e.target.checked ? 'Fechamento geral solicitado.' : 'Fechamento geral desligado.')
                }
              />
              <Typography variant="body2">Pedir fechamento geral</Typography>
            </Stack>
            {isOpen ? (
              <Button
                color="error"
                variant="outlined"
                disabled={busy}
                fullWidth={isMobile}
                sx={isMobile ? { minHeight: 44 } : undefined}
                onClick={() =>
                  event.isTest
                    ? confirm({
                      title: 'Suspender evento de teste',
                      text: 'O evento de teste é permanente: ele só é suspenso, nunca encerrado. Novos pedidos serão bloqueados. Deseja continuar?',
                      confirmLabel: 'Suspender',
                      onConfirm: async () => run(() => bingoApi.suspendEvent(event.id), 'Evento suspenso.'),
                    })
                    : confirm({
                      title: 'Encerrar evento',
                      text: 'Novos pedidos serão bloqueados e o evento ficará encerrado. Deseja continuar?',
                      confirmLabel: 'Encerrar evento',
                      onConfirm: async () => run(() => bingoApi.closeEvent(event.id), 'Evento encerrado.'),
                    })
                }
              >
                {event.isTest ? 'Suspender pedidos do evento' : 'Encerrar pedidos do evento'}
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth={isMobile}
                sx={isMobile ? { minHeight: 44 } : undefined}
                disabled={busy || event.status === 'Closed'}
                onClick={() => run(() => bingoApi.openEvent(event.id), 'Evento aberto.')}
              >
                Abrir pedidos do evento
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h6">Mesas</Typography>
      {mesaRows.length === 0 ? (
        <Typography color="text.secondary">Nenhum pedido nas mesas.</Typography>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {mesaRows.map(({ tab, toDeliver, delivered, contested }) => (
            <Paper key={tab.tabId} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Mesa {tab.mesa}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{tab.customerName}</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600 }}>A entregar</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{toDeliver.length ? itemsText(toDeliver) : '—'}</Typography>
              <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 600 }}>Entregues</Typography>
              <Typography variant="body2">{delivered.length ? itemsText(delivered) : '—'}</Typography>
              {contested.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600, mt: 1 }}>Em contestação</Typography>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>{itemsText(contested)}</Typography>
                </>
              )}
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mesa</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell>Itens</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mesaRows.map(({ tab, toDeliver, delivered, contested }) => (
                <React.Fragment key={tab.tabId}>
                  <TableRow sx={{ '& td': { borderBottom: 0 } }}>
                    <TableCell rowSpan={contested.length ? 3 : 2} sx={{ fontWeight: 700, verticalAlign: 'top', borderBottom: 1, borderColor: 'divider' }}>{tab.mesa}</TableCell>
                    <TableCell rowSpan={contested.length ? 3 : 2} sx={{ verticalAlign: 'top', borderBottom: 1, borderColor: 'divider' }}>{tab.customerName}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'warning.dark', fontWeight: 600 }}>A entregar</TableCell>
                    <TableCell>{toDeliver.length ? itemsText(toDeliver) : '—'}</TableCell>
                  </TableRow>
                  <TableRow sx={contested.length ? { '& td': { borderBottom: 0 } } : undefined}>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'success.dark', fontWeight: 600 }}>Entregues</TableCell>
                    <TableCell>{delivered.length ? itemsText(delivered) : '—'}</TableCell>
                  </TableRow>
                  {contested.length > 0 && (
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap', color: 'error.main', fontWeight: 600 }}>Em contestação</TableCell>
                      <TableCell sx={{ color: 'error.main' }}>{itemsText(contested)}</TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6">Contas</Typography>
      {isMobile ? (
        <Stack spacing={1.5}>
          {[...closing, ...open, ...paid].filter(matchesFilter).map((t) => (
            <Paper key={t.tabId} variant="outlined"
              sx={{ p: 1.5, ...(t.status === 'CloseRequested' && { bgcolor: 'warning.light' }) }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>Mesa {t.mesa}</Typography>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{t.customerName}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 700 }}>{money(t.total)}</Typography>
                  {t.status !== 'Paid' && t.amountDue !== t.total && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      a cobrar {money(t.amountDue)}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {t.status === 'Paid' ? `Paga (${payLabel(t.paymentMethod)}${t.paidByName ? `, ${t.paidByName}` : ''})`
                  : t.status === 'CloseRequested' ? 'Pediu para encerrar' : 'Aberta'}
              </Typography>
              <Box sx={{ mt: 0.5 }}><PhoneBadge tab={t} /></Box>
              {t.status !== 'Paid' && (
                <Button fullWidth variant="contained" sx={{ mt: 1, minHeight: 44 }} onClick={() => setCloseTarget(t)}>
                  Fechar conta
                </Button>
              )}
            </Paper>
          ))}
          {tabs.length === 0 && <Typography color="text.secondary">Nenhuma comanda ainda.</Typography>}
        </Stack>
      ) : (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mesa</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Celular</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {[...closing, ...open, ...paid].filter(matchesFilter).map((t) => (
              <TableRow key={t.tabId} sx={t.status === 'CloseRequested' ? { bgcolor: 'warning.light' } : undefined}>
                <TableCell>{t.mesa}</TableCell>
                <TableCell>{t.customerName}</TableCell>
                <TableCell>
                  {t.status === 'Paid' ? `Paga (${payLabel(t.paymentMethod)}${t.paidByName ? `, ${t.paidByName}` : ''})`
                    : t.status === 'CloseRequested' ? 'Pediu para encerrar' : 'Aberta'}
                </TableCell>
                <TableCell><PhoneBadge tab={t} /></TableCell>
                <TableCell align="right">
                  {money(t.total)}
                  {t.status !== 'Paid' && t.amountDue !== t.total && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      a cobrar {money(t.amountDue)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {t.status !== 'Paid' && (
                    <Button size="small" variant="contained" onClick={() => setCloseTarget(t)}>
                      Fechar conta
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {tabs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>Nenhuma comanda ainda.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {closeTarget && (
        <CashierDialog
          tab={closeTarget}
          notify={notify}
          onClose={() => setCloseTarget(null)}
          onChanged={() => { load(); onEventChanged(); }}
        />
      )}
    </Stack>
  );
};

/* ---------- Edição de preço em célula do grid ---------- */
const CurrencyEditCell: React.FC<GridRenderEditCellParams> = ({ id, field, value }) => {
  const apiRef = useGridApiContext();
  return (
    <CurrencyField
      autoFocus
      fullWidth
      size="small"
      variant="standard"
      value={Number(value) || 0}
      onValueChange={(v) => apiRef.current.setEditCellValue({ id, field, value: v })}
      sx={{ px: 1 }}
    />
  );
};

/* ---------- Cardápio ---------- */
const MenuTab: React.FC<{
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  addOpen: boolean;
  onAddClose: () => void;
}> = ({ notify, confirm, addOpen, onAddClose }) => {
  const [items, setItems] = useState<BingoMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: 0, isAvailable: true });
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState<BingoMenuItem | null>(null);

  const load = useCallback(async () => {
    try {
      setItems((await bingoApi.getMenu()).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar o cardápio.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (addOpen) setForm({ name: '', price: 0, isAvailable: true }); }, [addOpen]);

  const processRowUpdate = async (row: BingoMenuItem, old: BingoMenuItem) => {
    const next: BingoMenuItem = { ...row, name: String(row.name ?? '').trim(), unitPrice: Number(row.unitPrice), sortOrder: Number(row.sortOrder) };
    if (next.name === old.name && next.unitPrice === old.unitPrice && next.sortOrder === old.sortOrder) return old;
    if (!next.name) throw new Error('Informe o nome do item.');
    if (!Number.isFinite(next.unitPrice) || next.unitPrice <= 0) throw new Error('Informe um preço válido.');
    if (!Number.isInteger(next.sortOrder)) throw new Error('A ordem deve ser um número inteiro.');
    await bingoApi.updateMenuItem(next.id, {
      name: next.name, unitPrice: next.unitPrice, isAvailable: next.isAvailable, sortOrder: next.sortOrder,
    });
    notify('Item salvo.', 'success');
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)));
    return next;
  };

  const toggle = async (item: BingoMenuItem, value: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: value } : i)));
    try {
      await bingoApi.setAvailability(item.id, value);
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !value } : i)));
      notify(apiError(e, 'Não foi possível alterar a disponibilidade.'), 'error');
    }
  };

  const add = async () => {
    if (!form.name.trim() || !Number.isFinite(form.price) || form.price <= 0) {
      notify('Informe nome e preço válidos.', 'error');
      return;
    }
    try {
      const nextOrder = items.reduce((m, i) => Math.max(m, i.sortOrder), 0) + 1;
      await bingoApi.createMenuItem({
        name: form.name.trim(), unitPrice: form.price, isAvailable: form.isAvailable, sortOrder: nextOrder,
      });
      notify('Item adicionado.', 'success');
      onAddClose();
      load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível adicionar o item.'), 'error');
    }
  };

  const saveEditing = async () => {
    if (!editing) return;
    const old = items.find((i) => i.id === editing.id);
    if (!old) { setEditing(null); return; }
    try {
      await processRowUpdate(editing, old);
      setEditing(null);
    } catch (e: any) {
      notify(e?.message || 'Não foi possível salvar o item.', 'error');
    }
  };

  const removeItem = (item: BingoMenuItem) => confirm({
    title: 'Excluir item',
    text: `Excluir "${item.name}" do cardápio?`,
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await bingoApi.deleteMenuItem(item.id);
        notify('Item removido.', 'success');
        await load();
      } catch (e: any) {
        notify(apiError(e, 'Não foi possível remover o item.'), 'error');
      }
    },
  });

  const columns: GridColDef<BingoMenuItem>[] = [
    { field: 'sortOrder', headerName: 'Ordem', type: 'number', width: 90, editable: true, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, editable: true },
    {
      field: 'unitPrice', headerName: 'Preço', type: 'number', width: 150, editable: true,
      valueFormatter: (v: number) => money(v),
      renderEditCell: (params) => <CurrencyEditCell {...params} />,
    },
    {
      field: 'isAvailable', headerName: 'Disponível', width: 130, sortable: false,
      renderCell: (params) => (
        <Switch checked={params.row.isAvailable} onChange={(e) => toggle(params.row, e.target.checked)}
          inputProps={{ 'aria-label': 'Disponível' }} />
      ),
    },
    {
      field: 'actions', headerName: 'Ações', width: 90, sortable: false, filterable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={params.row.isUsed ? 'Item já usado: marque como indisponível' : 'Excluir item'}>
          <span>
          <IconButton color="error" size="small" aria-label="Excluir item" disabled={!!params.row.isUsed} onClick={() => confirm({
            title: 'Excluir item',
            text: `Excluir "${params.row.name}" do cardápio?`,
            confirmLabel: 'Excluir',
            onConfirm: async () => {
              try {
                await bingoApi.deleteMenuItem(params.row.id);
                notify('Item removido.', 'success');
                await load();
              } catch (e: any) {
                notify(apiError(e, 'Não foi possível remover o item.'), 'error');
              }
            },
          })}>
            <DeleteIcon />
          </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  if (loading) return <CircularProgress />;
  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {items.length === 0 && <Typography color="text.secondary">Nenhum item no cardápio.</Typography>}
        {items.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{item.name}</Typography>
                  <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{money(item.unitPrice)}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Ordem: {item.sortOrder}{item.isUsed ? ' · já usado (não pode renomear/excluir)' : ''}
                </Typography>
                <FormControlLabel
                  control={<Switch checked={item.isAvailable} onChange={(e) => toggle(item, e.target.checked)} />}
                  label="Disponível"
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" fullWidth startIcon={<EditIcon />} sx={{ minHeight: 40 }}
                    onClick={() => setEditing({ ...item })}>Editar</Button>
                  <Button variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />} sx={{ minHeight: 40 }}
                    disabled={!!item.isUsed} onClick={() => removeItem(item)}>Excluir</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Dialog fullScreen open={!!editing} onClose={() => setEditing(null)}>
          <DialogTitle>Editar item</DialogTitle>
          <DialogContent>
            {editing && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField fullWidth label="Nome" value={editing.name} disabled={!!editing.isUsed}
                  helperText={editing.isUsed ? 'Item já usado: o nome não pode ser alterado.' : undefined}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <CurrencyField fullWidth label="Preço" value={editing.unitPrice} onValueChange={(v) => setEditing({ ...editing, unitPrice: v })} />
                <TextField fullWidth label="Ordem" type="number" value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value === '' ? ('' as any) : Number(e.target.value) })} />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditing(null)} sx={{ minHeight: 40 }}>Cancelar</Button>
            <Button variant="contained" onClick={saveEditing} sx={{ minHeight: 40 }}>Salvar</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={addOpen} onClose={onAddClose} fullScreen>
          <DialogTitle>Adicionar item</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField autoFocus fullWidth label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <CurrencyField fullWidth label="Preço" value={form.price} onValueChange={(v) => setForm({ ...form, price: v })} />
              <FormControlLabel
                control={<Switch checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />}
                label="Disponível"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onAddClose} sx={{ minHeight: 40 }}>Cancelar</Button>
            <Button variant="contained" onClick={add} sx={{ minHeight: 40 }}>Adicionar</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">Dê dois cliques em uma célula para editar; Enter salva. Itens já usados em pedidos ou comandas não podem ser renomeados nem excluídos (marque como indisponível). O preço novo vale só para lançamentos futuros.</Typography>
      <Paper>
        <DataGrid
          rows={items}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          hideFooter
          isCellEditable={(params) => !(params.field === 'name' && params.row.isUsed)}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(e) => notify(e?.message || 'Não foi possível salvar o item.', 'error')}
          localeText={{ noRowsLabel: 'Nenhum item no cardápio.' }}
        />
      </Paper>
      <Dialog open={addOpen} onClose={onAddClose} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField autoFocus label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <CurrencyField label="Preço" value={form.price} onValueChange={(v) => setForm({ ...form, price: v })} />
            <FormControlLabel
              control={<Switch checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />}
              label="Disponível"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onAddClose}>Cancelar</Button>
          <Button variant="contained" onClick={add}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

/* ---------- Formas de pagamento ---------- */
const PaymentMethodsTab: React.FC<{ notify: Notify; addOpen: boolean; onAddClose: () => void }> = ({ notify, addOpen, onAddClose }) => {
  const [methods, setMethods] = useState<BingoPayMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState<BingoPayMethod | null>(null);

  const load = useCallback(async () => {
    try {
      setMethods(await bingoApi.getPaymentMethods());
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar as formas de pagamento.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (addOpen) setName(''); }, [addOpen]);

  const input = (m: BingoPayMethod) => ({ name: m.name, isActive: m.isActive, sortOrder: m.sortOrder });

  const processRowUpdate = async (row: BingoPayMethod, old: BingoPayMethod) => {
    const next: BingoPayMethod = { ...row, name: String(row.name ?? '').trim(), sortOrder: Number(row.sortOrder) };
    if (next.name === old.name && next.sortOrder === old.sortOrder) return old;
    if (!next.name) throw new Error('Informe o nome da forma de pagamento.');
    if (!Number.isInteger(next.sortOrder)) throw new Error('A ordem deve ser um número inteiro.');
    await bingoApi.updatePaymentMethod(next.id, input(next));
    notify('Forma de pagamento salva.', 'success');
    setMethods((prev) => prev.map((m) => (m.id === next.id ? next : m)));
    return next;
  };

  const toggle = async (m: BingoPayMethod, value: boolean) => {
    setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, isActive: value } : x)));
    try {
      await bingoApi.updatePaymentMethod(m.id, { ...input(m), isActive: value });
    } catch (e: any) {
      setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, isActive: !value } : x)));
      notify(apiError(e, 'Não foi possível alterar a forma de pagamento.'), 'error');
    }
  };

  const add = async () => {
    if (!name.trim()) {
      notify('Informe o nome da forma de pagamento.', 'error');
      return;
    }
    try {
      const nextOrder = methods.reduce((m, i) => Math.max(m, i.sortOrder), 0) + 1;
      await bingoApi.createPaymentMethod({ name: name.trim(), isActive: true, sortOrder: nextOrder });
      notify('Forma de pagamento adicionada.', 'success');
      onAddClose();
      load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível adicionar a forma de pagamento.'), 'error');
    }
  };

  const saveEditing = async () => {
    if (!editing) return;
    const old = methods.find((m) => m.id === editing.id);
    if (!old) { setEditing(null); return; }
    try {
      await processRowUpdate(editing, old);
      setEditing(null);
    } catch (e: any) {
      notify(e?.message || 'Não foi possível salvar.', 'error');
    }
  };

  const columns: GridColDef<BingoPayMethod>[] = [
    { field: 'sortOrder', headerName: 'Ordem', type: 'number', width: 90, editable: true, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, editable: true },
    {
      field: 'isActive', headerName: 'Ativa', width: 120, sortable: false,
      renderCell: (params) => (
        <Switch checked={params.row.isActive} onChange={(e) => toggle(params.row, e.target.checked)}
          inputProps={{ 'aria-label': 'Ativa' }} />
      ),
    },
  ];

  if (loading) return <CircularProgress />;
  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        <Alert severity="info">As formas ativas aparecem para o garçom escolher ao cobrar.</Alert>
        {methods.length === 0 && <Typography color="text.secondary">Nenhuma forma de pagamento.</Typography>}
        {methods.map((m) => (
          <Card key={m.id} variant="outlined">
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{m.name}</Typography>
                <Typography variant="caption" color="text.secondary">Ordem: {m.sortOrder}</Typography>
                <FormControlLabel
                  control={<Switch checked={m.isActive} onChange={(e) => toggle(m, e.target.checked)} />}
                  label="Ativa"
                />
                <Button variant="outlined" fullWidth startIcon={<EditIcon />} sx={{ minHeight: 40 }}
                  onClick={() => setEditing({ ...m })}>Editar</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Dialog fullScreen open={!!editing} onClose={() => setEditing(null)}>
          <DialogTitle>Editar forma de pagamento</DialogTitle>
          <DialogContent>
            {editing && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField fullWidth label="Nome" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <TextField fullWidth label="Ordem" type="number" value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value === '' ? ('' as any) : Number(e.target.value) })} />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditing(null)} sx={{ minHeight: 40 }}>Cancelar</Button>
            <Button variant="contained" onClick={saveEditing} sx={{ minHeight: 40 }}>Salvar</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={addOpen} onClose={onAddClose} fullScreen>
          <DialogTitle>Adicionar forma de pagamento</DialogTitle>
          <DialogContent>
            <TextField autoFocus fullWidth label="Nome" value={name} sx={{ mt: 1 }} onChange={(e) => setName(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onAddClose} sx={{ minHeight: 40 }}>Cancelar</Button>
            <Button variant="contained" onClick={add} sx={{ minHeight: 40 }}>Adicionar</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }
  return (
    <Stack spacing={1}>
      <Alert severity="info">As formas ativas aparecem para o garçom escolher ao cobrar.</Alert>
      <Paper>
        <DataGrid
          rows={methods}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          hideFooter
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(e) => notify(e?.message || 'Não foi possível salvar.', 'error')}
          localeText={{ noRowsLabel: 'Nenhuma forma de pagamento.' }}
        />
      </Paper>
      <Dialog open={addOpen} onClose={onAddClose} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar forma de pagamento</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Nome" value={name} sx={{ mt: 1 }} onChange={(e) => setName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onAddClose}>Cancelar</Button>
          <Button variant="contained" onClick={add}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

/* ---------- Mesas ---------- */
const QrBlock: React.FC<{ size: number; dataUrl: string }> = ({ size, dataUrl }) => (
  <Box component="img" src={dataUrl} alt="QR Code do bingo" sx={{ width: size, maxWidth: '100%', height: 'auto' }} />
);

const TablesTab: React.FC<{ notify: Notify; event: BingoEvent | null }> = ({ notify, event }) => {
  const locked = !!event && event.status !== 'Draft';
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');
  const [projecting, setProjecting] = useState(false);
  const isMobile = useIsMobile();
  const btnSx = isMobile ? { minHeight: 40 } : undefined;

  useEffect(() => {
    bingoApi.getTableCount()
      .then((n) => setCount(String(n)))
      .catch((e) => notify(apiError(e, 'Não foi possível carregar as mesas.'), 'error'))
      .finally(() => setLoading(false));
    QRCode.toDataURL(BINGO_URL, { width: 900, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => notify('Não foi possível gerar o QR.', 'error'));
  }, [notify]);

  const save = async () => {
    const q = Number(count);
    if (!Number.isInteger(q) || q < 1 || q > 500) {
      notify('Informe uma quantidade de mesas entre 1 e 500.', 'error');
      return;
    }
    try {
      await bingoApi.setTableCount(q);
      notify('Mesas atualizadas.', 'success');
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível salvar as mesas.'), 'error');
    }
  };

  if (loading) return <CircularProgress />;
  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={isMobile ? 'row' : { xs: 'column', sm: 'row' }}
          spacing={isMobile ? 0 : 2}
          alignItems={isMobile ? 'center' : { xs: 'stretch', sm: 'center' }}
          justifyContent="center"
          flexWrap={isMobile ? 'wrap' : undefined}
          gap={isMobile ? 1.5 : undefined}
          className="bingo-no-print"
        >
          <TextField
            label="Quantidade de mesas"
            type="number"
            size="small"
            value={count}
            disabled={locked}
            onChange={(e) => setCount(e.target.value)}
            inputProps={{ min: 1, max: 500 }}
            sx={isMobile ? { flex: '1 1 160px', minWidth: 0 } : { width: 190 }}
          />
          <Button variant="contained" onClick={save} disabled={locked} sx={btnSx}>Salvar</Button>
          <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!qr} sx={btnSx}>
            Imprimir
          </Button>
          <Button variant="outlined" startIcon={<ProjectIcon />} onClick={() => setProjecting(true)} disabled={!qr} sx={btnSx}>
            Projetar QR
          </Button>
          <Box
            className="bingo-print-sheet"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <Typography className="sheet-title" variant="h5" sx={{ fontWeight: 700, display: 'none' }}>
              Aponte a câmera para pedir
            </Typography>
            {qr && <QrBlock size={150} dataUrl={qr} />}
            <Typography className="sheet-url" variant="h6" sx={{ display: 'none', wordBreak: 'break-all' }}>{BINGO_URL}</Typography>
          </Box>
        </Stack>
        {locked && (
          <Alert severity="info" sx={{ mt: 2 }} className="bingo-no-print">
            Evento em andamento ou encerrado: o número de mesas fica bloqueado para não afetar comandas abertas.
            Para mudar, crie um novo evento.
          </Alert>
        )}
      </Paper>

      <Dialog fullScreen open={projecting} onClose={() => setProjecting(false)}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: '#000', textAlign: 'center', p: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setProjecting(false)} sx={{ position: 'absolute', top: 8, right: 8 }} aria-label="Fechar">
            <CloseIcon fontSize="large" />
          </IconButton>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>Aponte a câmera para pedir</Typography>
          <Box component="img" src={qr} alt="QR Code" sx={{ height: '62vh', maxWidth: '90vw', objectFit: 'contain' }} />
          <Typography variant="h3" sx={{ mt: 2 }}>{BINGO_URL}</Typography>
        </Box>
      </Dialog>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .bingo-print-sheet, .bingo-print-sheet * { visibility: visible !important; }
          .bingo-print-sheet {
            margin: 0 !important;
            position: fixed; left: 0; top: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border: none !important; background: #fff; color: #000;
          }
          .bingo-print-sheet img { width: 16cm !important; }
          .bingo-print-sheet .sheet-title { display: block !important; font-size: 40pt !important; margin-bottom: 24pt !important; }
          .bingo-print-sheet .sheet-url { display: block !important; font-size: 22pt !important; margin-top: 24pt !important; }
          @page { size: A4 portrait; margin: 1.5cm; }
        }
      `}</style>
    </Stack>
  );
};

/* ---------- Garçons ---------- */
const WaitersTab: React.FC<{ notify: Notify; confirm: (s: ConfirmState) => void }> = ({ notify, confirm }) => {
  const isMobile = useIsMobile();
  const [waiters, setWaiters] = useState<BingoWaiter[]>([]);
  const [options, setOptions] = useState<HouseMember[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HouseMember | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setWaiters(await bingoApi.getWaiters());
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar os garçons.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
    const t = window.setInterval(() => { if (!document.hidden) load(); }, 15000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (search.trim().length < 2) { setOptions([]); return; }
    const t = window.setTimeout(async () => {
      try {
        const res = await apiService.getHouseMembers({
          q: search.trim(), isActive: true, pageNumber: 1, pageSize: 10, sort: 'fullName:asc',
        });
        setOptions(res.data);
      } catch {
        setOptions([]);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const add = async () => {
    if (!selected) return;
    try {
      await bingoApi.addWaiter(selected.id);
      notify('Garçom escalado.', 'success');
      setSelected(null);
      setSearch('');
      load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível escalar o garçom.'), 'error');
    }
  };

  const connected = (w: BingoWaiter) =>
    !!w.lastSeenAt && Date.now() - new Date(w.lastSeenAt).getTime() < 2 * 60 * 1000;

  const askRemove = (w: BingoWaiter) => confirm({
    title: 'Remover garçom',
    text: `Remover ${w.name} da escala? A sessão dele será encerrada.`,
    confirmLabel: 'Remover',
    onConfirm: async () => {
      try {
        await bingoApi.removeWaiter(w.houseMemberId);
        notify('Garçom removido.', 'success');
        await load();
      } catch (e: any) {
        notify(apiError(e, 'Não foi possível remover o garçom.'), 'error');
      }
    },
  });

  if (loading) return <CircularProgress />;
  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Autocomplete
            fullWidth
            options={options}
            value={selected}
            onChange={(_, v) => setSelected(v)}
            onInputChange={(_, v) => setSearch(v)}
            filterOptions={(x) => x}
            getOptionLabel={(o) => o.fullName}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText="Digite ao menos 2 letras do nome"
            renderInput={(params) => <TextField {...params} label="Buscar filho ativo" />}
          />
          <Button variant="contained" startIcon={<AddIcon />} disabled={!selected} onClick={add}
            sx={isMobile ? { minHeight: 44 } : undefined}>Escalar</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          O filho precisa ter celular cadastrado para entrar como garçom.
        </Typography>
      </Paper>

      {isMobile ? (
        <Stack spacing={1.5}>
          {waiters.map((w) => (
            <Card key={String(w.houseMemberId)}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography fontWeight={700} sx={{ minWidth: 0, wordBreak: 'break-word' }}>{w.name}</Typography>
                  <Chip size="small" color={connected(w) ? 'success' : 'default'}
                    label={connected(w) ? 'Conectado' : 'Não entrou'} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Entregas: {w.deliveries}
                </Typography>
                <Button fullWidth color="error" variant="outlined" startIcon={<DeleteIcon />}
                  sx={{ mt: 1.5, minHeight: 40 }} onClick={() => askRemove(w)}>
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
          {waiters.length === 0 && <Alert severity="info">Nenhum garçom escalado.</Alert>}
        </Stack>
      ) : (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Entregas</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {waiters.map((w) => (
              <TableRow key={String(w.houseMemberId)}>
                <TableCell>{w.name}</TableCell>
                <TableCell>
                  <Chip size="small" color={connected(w) ? 'success' : 'default'}
                    label={connected(w) ? 'Conectado' : 'Não entrou'} />
                </TableCell>
                <TableCell align="right">{w.deliveries}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" aria-label="Remover garçom" onClick={() => confirm({
                    title: 'Remover garçom',
                    text: `Remover ${w.name} da escala? A sessão dele será encerrada.`,
                    confirmLabel: 'Remover',
                    onConfirm: async () => {
                      try {
                        await bingoApi.removeWaiter(w.houseMemberId);
                        notify('Garçom removido.', 'success');
                        await load();
                      } catch (e: any) {
                        notify(apiError(e, 'Não foi possível remover o garçom.'), 'error');
                      }
                    },
                  })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {waiters.length === 0 && (
              <TableRow><TableCell colSpan={4}>Nenhum garçom escalado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      <Box>
        <Button fullWidth={isMobile} sx={isMobile ? { minHeight: 40 } : undefined} color="error" variant="outlined" disabled={waiters.length === 0} onClick={() => confirm({
          title: 'Encerrar sessão dos garçons',
          text: 'Todos os garçons serão desconectados e precisarão ser escalados novamente. Confirmar?',
          confirmLabel: 'Encerrar sessões',
          onConfirm: async () => {
            try {
              await bingoApi.endWaiterSessions();
              notify('Sessões encerradas.', 'success');
              await load();
            } catch (e: any) {
              notify(apiError(e, 'Não foi possível encerrar as sessões.'), 'error');
            }
          },
        })}>
          Encerrar sessão dos garçons
        </Button>
      </Box>
    </Stack>
  );
};

/* ---------- Resumo (conteúdo reutilizado no histórico) ---------- */
const SummaryView: React.FC<{ summary: BingoSummary }> = ({ summary }) => {
  const isMobile = useIsMobile();
  return (
  <Stack spacing={2}>
    {summary.contestedOpen > 0 && (
      <Alert severity="warning">
        Há {summary.contestedOpen} {summary.contestedOpen === 1 ? 'item em contestação' : 'itens em contestação'} sem resolução.
      </Alert>
    )}
    {summary.photoUnmatched > 0 && (
      <Alert severity="warning">
        {summary.photoUnmatched} {summary.photoUnmatched === 1 ? 'item das comandas por foto está' : 'itens das comandas por foto estão'} fora do cardápio. Confira em "Comandas fotografadas".
      </Alert>
    )}
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Card sx={{ flex: 1, borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid' }}><CardContent>
        <Typography color="text.secondary">Total geral (digital + foto)</Typography>
        <Typography variant="h4">{money(summary.grandTotal)}</Typography>
      </CardContent></Card>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Comandas por foto ({summary.photoCount})</Typography>
        <Typography variant="h4">{money(summary.photoTotal)}</Typography>
      </CardContent></Card>
    </Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Total vendido (pago)</Typography>
        <Typography variant="h4">{money(summary.totalSold)}</Typography>
      </CardContent></Card>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Em aberto</Typography>
        <Typography variant="h4">{money(summary.totalOpen)}</Typography>
      </CardContent></Card>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Cancelados</Typography>
        <Typography variant="h4">{money(summary.cancelledTotal)}</Typography>
      </CardContent></Card>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Em contestação</Typography>
        <Typography variant="h4" color={summary.contestedOpen > 0 ? 'error.main' : undefined}>{summary.contestedOpen}</Typography>
      </CardContent></Card>
    </Stack>
    <Typography variant="h6">Por forma de pagamento</Typography>
    {isMobile ? (
    <Paper>
      {summary.byPayment.map((l, i) => (
        <React.Fragment key={l.label}>
          {i > 0 && <Divider />}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600}>{payLabel(l.label)}</Typography>
              <Typography variant="caption" color="text.secondary">{l.count ?? '-'} contas</Typography>
            </Box>
            <Typography fontWeight={700}>{money(l.total)}</Typography>
          </Stack>
        </React.Fragment>
      ))}
      {summary.byPayment.length === 0 && <Typography sx={{ p: 1.5 }}>Sem pagamentos.</Typography>}
    </Paper>
    ) : (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow><TableCell>Forma</TableCell><TableCell align="right">Contas</TableCell><TableCell align="right">Total</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {summary.byPayment.map((l) => (
            <TableRow key={l.label}>
              <TableCell>{payLabel(l.label)}</TableCell>
              <TableCell align="right">{l.count ?? '-'}</TableCell>
              <TableCell align="right">{money(l.total)}</TableCell>
            </TableRow>
          ))}
          {summary.byPayment.length === 0 && <TableRow><TableCell colSpan={3}>Sem pagamentos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
    )}
    <Typography variant="h6">Por item</Typography>
    {isMobile ? (
    <Paper>
      {summary.byItem.map((l, i) => (
        <React.Fragment key={l.label}>
          {i > 0 && <Divider />}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{l.label}</Typography>
              <Typography variant="caption" color="text.secondary">Qtd.: {l.quantity ?? '-'}</Typography>
            </Box>
            <Typography fontWeight={700}>{money(l.total)}</Typography>
          </Stack>
        </React.Fragment>
      ))}
      {summary.byItem.length === 0 && <Typography sx={{ p: 1.5 }}>Sem itens.</Typography>}
    </Paper>
    ) : (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="right">Qtd.</TableCell><TableCell align="right">Valor</TableCell></TableRow></TableHead>
        <TableBody>
          {summary.byItem.map((l) => (
            <TableRow key={l.label}>
              <TableCell>{l.label}</TableCell>
              <TableCell align="right">{l.quantity ?? '-'}</TableCell>
              <TableCell align="right">{money(l.total)}</TableCell>
            </TableRow>
          ))}
          {summary.byItem.length === 0 && <TableRow><TableCell colSpan={3}>Sem itens.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
    )}
    <Typography variant="h6">Conferência de caixa por garçom</Typography>
    {isMobile ? (
    <Paper>
      {summary.byWaiter.map((w, i) => (
        <React.Fragment key={w.name}>
          {i > 0 && <Divider />}
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{w.name}</Typography>
                <Typography variant="caption" color="text.secondary">{w.count} contas</Typography>
              </Box>
              <Typography fontWeight={700}>{money(w.total)}</Typography>
            </Stack>
            {w.byMethod.map((m) => (
              <Stack key={m.method} direction="row" justifyContent="space-between" sx={{ mt: 0.5, pl: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{payLabel(m.method)}</Typography>
                <Typography variant="body2">{money(m.total)}</Typography>
              </Stack>
            ))}
          </Box>
        </React.Fragment>
      ))}
      {summary.byWaiter.length === 0 && <Typography sx={{ p: 1.5 }}>Sem recebimentos.</Typography>}
    </Paper>
    ) : (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Garçom</TableCell>
            <TableCell align="right">Contas</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Por forma de pagamento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary.byWaiter.map((w) => (
            <TableRow key={w.name}>
              <TableCell>{w.name}</TableCell>
              <TableCell align="right">{w.count}</TableCell>
              <TableCell align="right">{money(w.total)}</TableCell>
              <TableCell>{w.byMethod.map((m) => `${payLabel(m.method)}: ${money(m.total)}`).join(' · ') || '-'}</TableCell>
            </TableRow>
          ))}
          {summary.byWaiter.length === 0 && <TableRow><TableCell colSpan={4}>Sem recebimentos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
    )}
  </Stack>
  );
};

const SummaryTab: React.FC<{
  events: BingoEvent[];
  current: BingoEvent | null;
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  onEventChanged: () => void;
}> = ({ events, current, notify, confirm, onEventChanged }) => {
  const isMobile = useIsMobile();
  const [eventId, setEventId] = useState<string>(current?.id ?? '');
  const [summary, setSummary] = useState<BingoSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BingoTab[] | null>(null);
  const [preparing, setPreparing] = useState(false);

  const printClosing = async () => {
    setPreparing(true);
    try {
      setReport(await bingoApi.getEventTabs(eventId));
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível preparar o fechamento.'), 'error');
    } finally {
      setPreparing(false);
    }
  };
  const endReport = useCallback(() => setReport(null), []);

  useEffect(() => {
    if (!eventId && current) setEventId(current.id);
  }, [current, eventId]);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      setSummary(await bingoApi.getEventSummary(eventId));
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar o resumo.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [eventId, notify]);
  useEffect(() => { load(); }, [load]);

  const [photoLink, setPhotoLink] = useState('');
  const showPhotoLink = async () => {
    try {
      const r = await apiService.get<any>('/comanda-foto/token');
      const link = `https://www.batuara.org.br/comanda-foto?t=${r.data?.data?.token ?? r.data?.token}`;
      setPhotoLink(link);
      try { await navigator.clipboard.writeText(link); notify('Link copiado.', 'success'); } catch { /* mostra na tela */ }
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível gerar o link.'), 'error');
    }
  };

  const sendPhotoLinkWhatsApp = async () => {
    try {
      const r = await apiService.get<any>('/comanda-foto/token');
      const link = `https://www.batuara.org.br/comanda-foto?t=${r.data?.data?.token ?? r.data?.token}`;
      const message = `*Fechamento de Comanda por Foto*\n\nLink para fechar comandas fotografando:\n${link}\n\nBasta abrir no celular e fotografar cada comanda de papel.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível gerar o link.'), 'error');
    }
  };

  const selected = events.find((e) => e.id === eventId);
  const canReset = !!selected && selected.isTest;

  return (
    <Stack spacing={2}>
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems={isMobile ? 'stretch' : 'center'} flexWrap="wrap"
        sx={isMobile ? { '& .MuiButton-root': { minHeight: 40 } } : undefined}>
        <FormControl sx={{ minWidth: isMobile ? 0 : 300 }} fullWidth={isMobile}>
          <InputLabel id="sum-ev">Evento</InputLabel>
          <Select labelId="sum-ev" label="Evento" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name} - {formatDate(e.eventDate)} ({EVENT_STATUS[e.status].label})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={showPhotoLink}>Copiar link</Button>
        <Button variant="contained" color="success" onClick={sendPhotoLinkWhatsApp}>
          Enviar por WhatsApp
        </Button>
        {summary && (
          <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={printClosing} disabled={preparing || loading}>
            Imprimir fechamento
          </Button>
        )}
      </Stack>
      {photoLink && (
        <Alert severity="info">
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{photoLink}</Typography>
        </Alert>
      )}
      {loading && <CircularProgress size={24} />}
      {summary && selected && report && (
        <ClosingReport event={selected} summary={summary} tabs={report} onDone={endReport} />
      )}
      {summary && <SummaryView summary={summary} />}
      {canReset && (
        <Box>
          <Button fullWidth={isMobile} sx={isMobile ? { minHeight: 40 } : undefined} color="error" variant="contained" onClick={() => confirm({
            title: 'Zerar dados do evento de teste',
            text: 'Apaga todas as comandas e pedidos deste evento de teste (cardápio, mesas e garçons são mantidos). Não há como desfazer.',
            confirmLabel: 'Zerar dados',
            requireWord: 'ZERAR',
            onConfirm: async () => {
              try {
                await bingoApi.resetEvent();
                notify('Dados do evento zerados.', 'success');
                await load();
                onEventChanged();
              } catch (e: any) {
                notify(apiError(e, 'Não foi possível zerar os dados.'), 'error');
              }
            },
          })}>
            Zerar dados do evento
          </Button>
        </Box>
      )}
    </Stack>
  );
};

/* ---------- Eventos ---------- */
const EventsTab: React.FC<{
  events: BingoEvent[];
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  onChanged: () => void;
  /** No celular: caixa de selecao da navegacao, ao lado do botao "Novo evento". */
  navSlot?: React.ReactNode;
}> = ({ events, notify, confirm, onChanged, navSlot }) => {
  const isMobile = useIsMobile();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', eventDate: '', copyFrom: '' });
  const [history, setHistory] = useState<BingoEvent | null>(null);
  const [histSummary, setHistSummary] = useState<BingoSummary | null>(null);
  const [histTabs, setHistTabs] = useState<BingoTab[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [closing, setClosing] = useState<{ event: BingoEvent; summary: BingoSummary; tabs: BingoTab[] } | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const endClosing = useCallback(() => setClosing(null), []);
  const printClosing = async (ev: BingoEvent) => {
    setPrintingId(ev.id);
    try {
      const [summary, tabs] = await Promise.all([bingoApi.getEventSummary(ev.id), bingoApi.getEventTabs(ev.id)]);
      setClosing({ event: ev, summary, tabs });
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível preparar o fechamento.'), 'error');
    } finally {
      setPrintingId(null);
    }
  };
  const [remEvent, setRemEvent] = useState<BingoEvent | null>(null);
  const [remPreview, setRemPreview] = useState<BingoReminderPreview | null>(null);
  const [remLoading, setRemLoading] = useState(false);
  const [remConfirmed, setRemConfirmed] = useState(false);
  const [remSending, setRemSending] = useState(false);
  const [remResult, setRemResult] = useState<BingoReminderResult | null>(null);

  const closeReminders = () => {
    if (remSending) return;
    setRemEvent(null);
  };

  const openReminders = async (ev: BingoEvent) => {
    setRemEvent(ev);
    setRemPreview(null);
    setRemResult(null);
    setRemConfirmed(false);
    setRemLoading(true);
    try {
      setRemPreview(await bingoApi.getReminderPreview(ev.id));
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar a prévia dos lembretes.'), 'error');
      setRemEvent(null);
    } finally {
      setRemLoading(false);
    }
  };

  const sendReminders = async () => {
    if (!remEvent) return;
    setRemSending(true);
    try {
      setRemResult(await bingoApi.sendReminders(remEvent.id));
      setRemPreview(null);
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível enviar os lembretes.'), 'error');
    } finally {
      setRemSending(false);
    }
  };

  const [editEv, setEditEv] = useState<BingoEvent | null>(null);
  const [editForm, setEditForm] = useState({ name: '', eventDate: '' });
  const startEdit = (ev: BingoEvent) => {
    setEditForm({ name: ev.name, eventDate: String(ev.eventDate).slice(0, 10) });
    setEditEv(ev);
  };
  const saveEdit = async () => {
    if (!editEv) return;
    if (!editForm.name.trim() || !editForm.eventDate) {
      notify('Informe nome e data do evento.', 'error');
      return;
    }
    try {
      await bingoApi.updateEvent(editEv.id, { name: editForm.name.trim(), eventDate: editForm.eventDate });
      notify('Evento atualizado.', 'success');
      setEditEv(null);
      onChanged();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível atualizar o evento.'), 'error');
    }
  };

  const create = async () => {
    if (!form.name.trim() || !form.eventDate) {
      notify('Informe nome e data do evento.', 'error');
      return;
    }
    try {
      await bingoApi.createEvent({
        name: form.name.trim(),
        eventDate: form.eventDate,
        ...(form.copyFrom ? { copiarDeEventoId: form.copyFrom } : {}),
      });
      notify('Evento criado.', 'success');
      setCreating(false);
      setForm({ name: '', eventDate: '', copyFrom: '' });
      onChanged();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível criar o evento.'), 'error');
    }
  };

  const openEvent = async (ev: BingoEvent) => {
    try {
      await bingoApi.openEvent(ev.id);
      notify('Evento aberto.', 'success');
      onChanged();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível abrir o evento.'), 'error');
    }
  };

  const showHistory = async (ev: BingoEvent) => {
    setHistory(ev);
    setHistSummary(null);
    setHistTabs([]);
    setHistLoading(true);
    try {
      const [s, t] = await Promise.all([bingoApi.getEventSummary(ev.id), bingoApi.getEventTabs(ev.id)]);
      setHistSummary(s);
      setHistTabs(t);
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar o histórico.'), 'error');
    } finally {
      setHistLoading(false);
    }
  };

  const renderActions = (ev: BingoEvent) => (
    <>
      <Button size="small" variant="outlined" startIcon={<PrintIcon />} disabled={printingId === ev.id} onClick={() => printClosing(ev)}>
        Fechamento
      </Button>
      <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(ev)}>Editar</Button>
      {ev.status === 'Draft' && (
        <Button size="small" variant="contained" onClick={() => openEvent(ev)}>Abrir</Button>
      )}
      {ev.status === 'Open' && (
        <Button size="small" variant="outlined" onClick={() => confirm({
          title: 'Suspender evento',
          text: `Suspender "${ev.name}"? Os pedidos ficam bloqueados e nada é apagado. Você poderá retomar depois, e isso libera a vaga para abrir outro evento.`,
          confirmLabel: 'Suspender',
          onConfirm: async () => {
            try {
              await bingoApi.suspendEvent(ev.id);
              notify('Evento suspenso.', 'success');
              onChanged();
            } catch (e: any) {
              notify(apiError(e, 'Não foi possível suspender o evento.'), 'error');
            }
          },
        })}>Suspender</Button>
      )}
      {ev.status === 'Suspended' && (
        <Button size="small" variant="contained" onClick={async () => {
          try {
            await bingoApi.resumeEvent(ev.id);
            notify('Evento retomado.', 'success');
            onChanged();
          } catch (e: any) {
            notify(apiError(e, 'Não foi possível retomar o evento.'), 'error');
          }
        }}>Retomar</Button>
      )}
      {!ev.isTest && (ev.status === 'Open' || ev.status === 'Suspended') && (
        <Button size="small" color="error" variant="outlined" onClick={() => confirm({
          title: 'Encerrar evento',
          text: `Encerrar "${ev.name}"? Novos pedidos serão bloqueados.`,
          confirmLabel: 'Encerrar',
          onConfirm: async () => {
            try {
              await bingoApi.closeEvent(ev.id);
              notify('Evento encerrado.', 'success');
              onChanged();
            } catch (e: any) {
              notify(apiError(e, 'Não foi possível encerrar o evento.'), 'error');
            }
          },
        })}>Encerrar</Button>
      )}
      {ev.status === 'Closed' && (
        <>
          <Button size="small" variant="contained" onClick={() => confirm({
            title: 'Reabrir evento',
            text: `Reabrir "${ev.name}"? Os pedidos voltam a ser aceitos e a data de encerramento é limpa.`,
            confirmLabel: 'Reabrir',
            onConfirm: async () => {
              try {
                await bingoApi.reopenEvent(ev.id);
                notify('Evento reaberto.', 'success');
                onChanged();
              } catch (e: any) {
                notify(apiError(e, 'Não foi possível reabrir o evento.'), 'error');
              }
            },
          })}>Reabrir</Button>
          <Button size="small" variant="outlined" onClick={() => openReminders(ev)}>Lembretes de contas</Button>
          <Button size="small" variant="outlined" onClick={() => showHistory(ev)}>Ver histórico</Button>
        </>
      )}
    </>
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {navSlot}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)} sx={{ flexShrink: 0 }}>Novo evento</Button>
      </Box>
      {isMobile && (
        <Stack spacing={1.5}>
          {events.map((ev) => (
            <Card key={ev.id} variant="outlined">
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>{ev.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatDate(ev.eventDate)}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                    {ev.isTest && <Chip size="small" label="Teste" color="secondary" />}
                    <Chip size="small" color={EVENT_STATUS[ev.status].color} label={EVENT_STATUS[ev.status].label} />
                  </Stack>
                </Stack>
                <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>Total vendido: <strong>{money(ev.totalSold)}</strong></Typography>
                <Box sx={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
                  '& .MuiButton-root': { minHeight: 40, width: '100%', minWidth: 0 },
                }}>
                  {renderActions(ev)}
                </Box>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && <Typography color="text.secondary">Nenhum evento cadastrado.</Typography>}
        </Stack>
      )}
      {!isMobile && <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total vendido</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell>
                  {ev.name} {ev.isTest && <Chip size="small" label="Teste" color="secondary" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{formatDate(ev.eventDate)}</TableCell>
                <TableCell><Chip size="small" color={EVENT_STATUS[ev.status].color} label={EVENT_STATUS[ev.status].label} /></TableCell>
                <TableCell align="right">{money(ev.totalSold)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap sx={{ '& .MuiButton-root': { minWidth: 150 } }}>
                    {renderActions(ev)}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && <TableRow><TableCell colSpan={5}>Nenhum evento cadastrado.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>}

      <Dialog open={creating} onClose={() => setCreating(false)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Novo evento</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            <FormControl>
              <InputLabel id="copy-from">Copiar cardápio, mesas e garçons de:</InputLabel>
              <Select labelId="copy-from" label="Copiar cardápio, mesas e garçons de:" value={form.copyFrom}
                onChange={(e) => setForm({ ...form, copyFrom: e.target.value })}>
                <MenuItem value="">Não copiar</MenuItem>
                {events.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.name} - {formatDate(e.eventDate)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreating(false)}>Cancelar</Button>
          <Button variant="contained" onClick={create}>Criar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editEv} onClose={() => setEditEv(null)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Editar evento</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={editForm.name} inputProps={{ maxLength: 200 }}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} value={editForm.eventDate}
              onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEv(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!remEvent} onClose={closeReminders} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Lembretes de contas em aberto: {remEvent?.name}</DialogTitle>
        <DialogContent>
          {remLoading && <CircularProgress />}
          {remResult && (
            <Alert severity={remResult.failed > 0 ? 'warning' : 'success'}>
              Enviados: {remResult.sent} · Ignorados: {remResult.skipped} · Falhas: {remResult.failed}
            </Alert>
          )}
          {remPreview && (
            <Stack spacing={1.5}>
              <Typography>
                {remPreview.count} {remPreview.count === 1 ? 'comanda' : 'comandas'} em aberto · Total devido: {money(remPreview.totalOwed)}
              </Typography>
              <Alert severity="info">Cada comanda recebe no máximo um lembrete.</Alert>
              {remPreview.items.length > 0 && (
                <TableContainer component={Paper} sx={{ maxHeight: 280, overflowX: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell><TableCell>Mesa</TableCell>
                        <TableCell align="right">Valor</TableCell><TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {remPreview.items.map((i) => (
                        <TableRow key={i.tabId}>
                          <TableCell>{i.customerName}</TableCell>
                          <TableCell>{i.mesa}</TableCell>
                          <TableCell align="right">{money(i.total)}</TableCell>
                          <TableCell>{i.reminderSentAt ? 'já enviado' : ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {remPreview.count > 0 && (
                <FormControlLabel
                  control={<Checkbox checked={remConfirmed} onChange={(e) => setRemConfirmed(e.target.checked)} />}
                  label={`Confirmo o envio de ${remPreview.count} mensagens de WhatsApp`}
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReminders} disabled={remSending}>Fechar</Button>
          <Button variant="contained" onClick={sendReminders}
            disabled={remSending || !remPreview || remPreview.count <= 0 || !remConfirmed}>
            {remSending ? 'Enviando...' : 'Enviar lembretes'}
          </Button>
        </DialogActions>
      </Dialog>

      {closing && <ClosingReport event={closing.event} summary={closing.summary} tabs={closing.tabs} onDone={endClosing} />}
      <Dialog open={!!history} onClose={() => setHistory(null)} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle>Histórico: {history?.name} ({formatDate(history?.eventDate ?? '')})</DialogTitle>
        <DialogContent>
          {histLoading && <CircularProgress />}
          <Stack spacing={2}>
            {histSummary && <SummaryView summary={histSummary} />}
            {histTabs.length > 0 && (
              <>
                <Typography variant="h6">Comandas</Typography>
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: isMobile ? 560 : undefined }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mesa</TableCell><TableCell>Cliente</TableCell>
                        <TableCell>Itens</TableCell><TableCell>Situação</TableCell><TableCell>Celular / lembrete</TableCell><TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {histTabs.map((t) => (
                        <TableRow key={t.tabId}>
                          <TableCell>{t.mesa}</TableCell>
                          <TableCell>{t.customerName}</TableCell>
                          <TableCell>{t.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                          <TableCell>{t.status === 'Paid'
                            ? `Paga (${payLabel(t.paymentMethod)}${t.paidByName ? `, por ${t.paidByName}` : ''})`
                            : 'Não paga'}</TableCell>
                          <TableCell>
                            <PhoneBadge tab={t} />
                            {t.reminderDeliveryStatus && (
                              <Typography variant="caption" display="block">Lembrete: {t.reminderDeliveryStatus}</Typography>
                            )}
                            {t.reminderSentAt && !t.reminderDeliveryStatus && (
                              <Typography variant="caption" display="block">Lembrete enviado</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {money(t.status === 'Paid' ? t.total : t.amountDue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setHistory(null)}>Fechar</Button></DialogActions>
      </Dialog>
    </Stack>
  );
};

/* ---------- Página ---------- */
const BingoPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addPayOpen, setAddPayOpen] = useState(false);
  const [events, setEvents] = useState<BingoEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const notify: Notify = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const list = await bingoApi.getEvents();
      if (mounted.current) setEvents(list);
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar os eventos.'), 'error');
    } finally {
      if (mounted.current) setEventsLoading(false);
    }
  }, [notify]);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Evento atual: o aberto; senão o rascunho mais recente.
  const current = useMemo(() => {
    const open = events.find((e) => e.status === 'Open');
    if (open) return open;
    return [...events].filter((e) => e.status === 'Draft')
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0] ?? null;
  }, [events]);

  const needsEvent = tab !== 0;
  const isMobile = useIsMobile();
  const TAB_LABELS = ['Eventos', 'Painel ao vivo', 'Cardápio', 'Mesas', 'Garçons', 'Formas de pagamento', 'Resumo', 'Comandas Foto'];
  const navSelect = (
    <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
      <Select value={tab} onChange={(e) => setTab(Number(e.target.value))} inputProps={{ 'aria-label': 'Seção do Bingo' }}>
        {TAB_LABELS.map((l, i) => (
          <MenuItem key={l} value={i}>{l}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <Typography variant="h4">Bingo</Typography>
        {current ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" color="text.secondary">{current.name}</Typography>
            <Chip size="small" color={EVENT_STATUS[current.status].color} label={EVENT_STATUS[current.status].label} />
            {current.isTest && <Chip size="small" color="secondary" label="Teste" />}
          </Stack>
        ) : (
          !eventsLoading && <Chip size="small" label="Sem evento atual" />
        )}
      </Stack>

      {isMobile ? (
        tab !== 0 && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            {navSelect}
            {tab === 2 && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddMenuOpen(true)} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Adicionar</Button>
            )}
            {tab === 5 && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPayOpen(true)} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Adicionar</Button>
            )}
          </Stack>
        )
      ) : (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ minWidth: 0, flex: '0 1 auto' }}>
            {TAB_LABELS.map((l) => (
              <Tab key={l} label={l} />
            ))}
          </Tabs>
          <Box sx={{ flex: 1 }} />
          {tab === 2 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddMenuOpen(true)}>Adicionar item</Button>
          )}
          {tab === 5 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPayOpen(true)}>Adicionar forma</Button>
          )}
        </Stack>
      )}

      {eventsLoading ? (
        <CircularProgress />
      ) : needsEvent && !current ? (
        <Alert severity="info">Não há evento atual. Crie ou abra um evento na aba Eventos.</Alert>
      ) : (
        <>
          {tab === 0 && <EventsTab events={events} notify={notify} confirm={setConfirmState} onChanged={loadEvents} navSlot={isMobile ? navSelect : undefined} />}
          {tab === 1 && <LivePanel event={current} notify={notify} confirm={setConfirmState} onEventChanged={loadEvents} />}
          {tab === 2 && (
            <MenuTab notify={notify} confirm={setConfirmState} addOpen={addMenuOpen} onAddClose={() => setAddMenuOpen(false)} />
          )}
          {tab === 3 && <TablesTab notify={notify} event={current} />}
          {tab === 4 && <WaitersTab notify={notify} confirm={setConfirmState} />}
          {tab === 5 && (
            <PaymentMethodsTab notify={notify} addOpen={addPayOpen} onAddClose={() => setAddPayOpen(false)} />
          )}
          {tab === 6 && (
            <SummaryTab events={events} current={current} notify={notify} confirm={setConfirmState} onEventChanged={loadEvents} />
          )}
          {tab === 7 && (
            <PhotoTabsTab notify={notify} current={current} />
          )}
        </>
      )}

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface PhotoTabItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PhotoTabData {
  cancelled?: boolean;
  cancelReason?: string | null;
  cancelledByName?: string | null;
  id: number;
  label: string;
  total: number;
  createdAt: string;
  items: PhotoTabItem[];
}

interface PhotoTabReport {
  isTest?: boolean;
  eventName: string;
  count: number;
  grandTotal: number;
  itemTotals: PhotoTabItem[];
  comandas: PhotoTabData[];
}

const PhotoTabsTab: React.FC<{ notify: Notify; current: BingoEvent | null }> = ({ notify, current }) => {
  const isMobile = useIsMobile();
  const [report, setReport] = useState<PhotoTabReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [cancelPhotoId, setCancelPhotoId] = useState<number | null>(null);
  const [cancelPhotoReason, setCancelPhotoReason] = useState('');

  const load = useCallback(async () => {
    if (!current) return;
    setLoading(true);
    try {
      const r = await apiService.get<any>('/bingo/admin/comandas-foto');
      // apiService ja devolve {success,data}: o relatorio esta em r.data
      setReport(r.data?.comandas ? r.data : r.data?.data ?? null);
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível carregar as comandas fotografadas.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [current, notify]);

  useEffect(() => { load(); }, [load]);

  const confirmCancelPhoto = async () => {
    const id = cancelPhotoId;
    const reason = cancelPhotoReason.trim();
    if (id === null) return;
    if (reason.length < 10 || reason.length > 200) {
      notify('Informe a justificativa (10 a 200 caracteres).', 'error');
      return;
    }
    try {
      await bingoApi.cancelPhotoTab(id, reason);
      setCancelPhotoId(null);
      notify('Comanda cancelada.', 'success');
      await load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível cancelar a comanda.'), 'error');
    }
  };

  const handleDiscard = async (id: number) => {
    // evento regular: cancelar exige justificativa; so o teste descarta livremente
    if (!report?.isTest) {
      setCancelPhotoReason('');
      setCancelPhotoId(id);
      return;
    }
    if (!window.confirm('Descartar esta comanda fotografada?')) return;
    try {
      await apiService.delete(`/bingo/admin/comandas-foto/${id}`);
      notify('Comanda descartada com sucesso.', 'success');
      await load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível descartar a comanda.'), 'error');
    }
  };

  const sendPhotoLinkWhatsApp = async () => {
    try {
      const r = await apiService.get<any>('/comanda-foto/token');
      const link = `https://www.batuara.org.br/comanda-foto?t=${r.data?.data?.token ?? r.data?.token}`;
      const message = `*Fechamento de Comanda por Foto*\n\nLink para fechar comandas fotografando:\n${link}\n\nBasta abrir no celular e fotografar cada comanda de papel.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      notify('Abrindo WhatsApp...', 'success');
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível gerar o link.'), 'error');
    }
  };

  if (!current) {
    return <Alert severity="info">Não há evento atual. Abra um evento na aba Eventos.</Alert>;
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (!report || report.count === 0) {
    return (
      <Alert severity="info">
        Nenhuma comanda fotografada neste evento. As comandas de papel fotografadas aparecerão aqui.
      </Alert>
    );
  }

  const photoUrl = (id: number) => `/batuara-api/api/bingo/admin/comandas-foto/${id}/foto`;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} spacing={isMobile ? 1.5 : 0} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Comandas Fotografadas — {report.eventName}
          </Typography>
          <Button variant="contained" color="success" onClick={sendPhotoLinkWhatsApp} sx={isMobile ? { minHeight: 40 } : undefined}>
            Enviar link por WhatsApp
          </Button>
        </Stack>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 0.5 : 2} alignItems="baseline">
          <Typography variant="body1">
            <strong>{report.count}</strong> comandas
          </Typography>
          <Typography variant="h5" fontWeight={800} color="primary">
            Total: {money(report.grandTotal)}
          </Typography>
        </Stack>
      </Paper>

      {isMobile ? (
        <Stack spacing={1.5}>
          {report.comandas.map((comanda) => (
            <Card key={comanda.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                      #{comanda.id} · {comanda.label || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comanda.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                  <Typography fontWeight={800} color="primary">{money(comanda.total)}</Typography>
                </Stack>
                {comanda.items?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Divider sx={{ mb: 0.5 }} />
                    {comanda.items.map((it, idx) => (
                      <Stack key={idx} direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.25 }}>
                        <Typography variant="body2" sx={{ minWidth: 0, wordBreak: 'break-word' }}>{it.name}</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {it.quantity} × {money(it.unitPrice)} = {money(it.quantity * it.unitPrice)}
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button fullWidth variant="outlined" sx={{ minHeight: 40 }} onClick={() => setSelectedPhoto(comanda.id)}>
                    Ver Foto
                  </Button>
                  {comanda.cancelled ? (
                    <Typography variant="caption" color="error" sx={{ alignSelf: 'center', flex: 1 }}>
                      Cancelada{comanda.cancelledByName ? ` por ${comanda.cancelledByName}` : ''}: {comanda.cancelReason}
                    </Typography>
                  ) : (
                    <Button fullWidth color="error" variant="outlined" sx={{ minHeight: 40 }} onClick={() => handleDiscard(comanda.id)}>
                      {report.isTest ? 'Descartar' : 'Cancelar'}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Mesa / Nome</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.comandas.map((comanda) => (
              <TableRow key={comanda.id}>
                <TableCell>{comanda.id}</TableCell>
                <TableCell>{comanda.label || '—'}</TableCell>
                <TableCell>
                  {new Date(comanda.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell align="right">
                  <strong>{money(comanda.total)}</strong>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" onClick={() => setSelectedPhoto(comanda.id)}>
                      Ver Foto
                    </Button>
                    {comanda.cancelled ? (
                      <Typography variant="caption" color="error">
                        Cancelada{comanda.cancelledByName ? ` por ${comanda.cancelledByName}` : ''}: {comanda.cancelReason}
                      </Typography>
                    ) : (
                      <Button size="small" color="error" onClick={() => handleDiscard(comanda.id)}>
                        {report.isTest ? 'Descartar' : 'Cancelar'}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {report.itemTotals.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Consolidado por Item
          </Typography>
          {isMobile ? (
            <Stack divider={<Divider />}>
              {report.itemTotals.map((item, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" spacing={1} sx={{ py: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Qtd.: {item.quantity}</Typography>
                  </Box>
                  <Typography fontWeight={700}>{money(item.unitPrice)}</Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.itemTotals.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{money(item.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </Paper>
      )}

      <Dialog open={cancelPhotoId !== null} onClose={() => setCancelPhotoId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancelar comanda fotografada</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            A comanda continua no histórico, mas sai dos totais. Informe a justificativa.
          </DialogContentText>
          <TextField autoFocus fullWidth required label="Justificativa" value={cancelPhotoReason}
            onChange={(e) => setCancelPhotoReason(e.target.value)} inputProps={{ maxLength: 200 }}
            helperText="De 10 a 200 caracteres" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelPhotoId(null)}>Voltar</Button>
          <Button color="error" variant="contained" disabled={cancelPhotoReason.trim().length < 10} onClick={confirmCancelPhoto}>
            Cancelar comanda
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={selectedPhoto !== null} onClose={() => setSelectedPhoto(null)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Foto da Comanda #{selectedPhoto}
          <IconButton
            onClick={() => setSelectedPhoto(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <Box
              component="img"
              src={photoUrl(selectedPhoto)}
              alt={`Comanda ${selectedPhoto}`}
              sx={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default BingoPage;
