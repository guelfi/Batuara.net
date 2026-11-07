import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
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
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Cast as ProjectIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import apiService from '../services/api';
import CurrencyField from '../components/common/CurrencyField';
import bingoApi from '../services/bingoApi';
import {
  BingoEvent,
  BingoMenuItem,
  BingoPanel,
  BingoPaymentMethod,
  BingoSummary,
  BingoTab,
  BingoWaiter,
} from '../types/bingo';
import { HouseMember } from '../types';

const BINGO_URL = 'https://www.batuara.org.br/bingo';
const POLL_MS = 4000;

const money = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const apiError = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.errors?.join(' ') || e?.message || fallback;

const PAY_LABEL: Record<string, string> = { Card: 'Cartão', Pix: 'Pix', Cash: 'Dinheiro' };
const payLabel = (m?: string | null) => (m ? PAY_LABEL[m] ?? m : '-');

const EVENT_STATUS: Record<BingoEvent['status'], { label: string; color: 'default' | 'success' | 'warning' }> = {
  Draft: { label: 'Rascunho', color: 'warning' },
  Open: { label: 'Aberto', color: 'success' },
  Closed: { label: 'Encerrado', color: 'default' },
};

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
const LivePanel: React.FC<{
  event: BingoEvent | null;
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  onEventChanged: () => void;
}> = ({ event, notify, confirm, onEventChanged }) => {
  const [panel, setPanel] = useState<BingoPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<BingoTab | null>(null);
  const [method, setMethod] = useState<BingoPaymentMethod>('Pix');
  const [busy, setBusy] = useState(false);

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
  const open = tabs.filter((t) => t.status === 'Open');
  const closing = tabs.filter((t) => t.status === 'CloseRequested');
  const paid = tabs.filter((t) => t.status === 'Paid');
  const pendingByTab = tabs
    .map((t) => ({ tab: t, items: t.items.filter((i) => i.status === 'Pending') }))
    .filter((x) => x.items.length > 0)
    .sort((a, b) => String(a.tab.mesa).localeCompare(String(b.tab.mesa), 'pt-BR', { numeric: true }));
  const pendingCount = pendingByTab.reduce((s, x) => s + x.items.reduce((q, i) => q + i.quantity, 0), 0);
  const totalSold = panel?.totalSold ?? paid.reduce((s, t) => s + t.total, 0);
  const closeAll = panel?.closeAllRequested ?? event?.closeAllRequested ?? false;

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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Em aberto: ${open.length}`} />
            <Chip color="warning" label={`Pediram a conta: ${closing.length}`} />
            <Chip color="success" label={`Pagas: ${paid.length}`} />
            <Chip color="info" label={`Itens pendentes: ${pendingCount}`} />
            <Chip color="primary" label={`Total vendido: ${money(totalSold)}`} />
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
                onClick={() =>
                  confirm({
                    title: 'Encerrar evento',
                    text: 'Novos pedidos serão bloqueados e o evento ficará encerrado. Deseja continuar?',
                    confirmLabel: 'Encerrar evento',
                    onConfirm: async () => run(() => bingoApi.closeEvent(event.id), 'Evento encerrado.'),
                  })
                }
              >
                Encerrar pedidos do evento
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={busy || event.status === 'Closed'}
                onClick={() => run(() => bingoApi.openEvent(event.id), 'Evento aberto.')}
              >
                Abrir pedidos do evento
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h6">Pedidos pendentes por mesa</Typography>
      {pendingByTab.length === 0 ? (
        <Typography color="text.secondary">Nenhum pedido pendente.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mesa</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Itens</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingByTab.map(({ tab, items }) => (
                <TableRow key={tab.tabId}>
                  <TableCell>{tab.mesa}</TableCell>
                  <TableCell>{tab.customerName}</TableCell>
                  <TableCell>{items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6">Contas</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mesa</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {[...closing, ...open, ...paid].map((t) => (
              <TableRow key={t.tabId} sx={t.status === 'CloseRequested' ? { bgcolor: 'warning.light' } : undefined}>
                <TableCell>{t.mesa}</TableCell>
                <TableCell>{t.customerName}</TableCell>
                <TableCell>
                  {t.status === 'Paid' ? `Paga (${payLabel(t.paymentMethod)})`
                    : t.status === 'CloseRequested' ? 'Pediu para encerrar' : 'Aberta'}
                </TableCell>
                <TableCell align="right">{money(t.total)}</TableCell>
                <TableCell align="right">
                  {t.status !== 'Paid' && (
                    <Button size="small" variant="contained" onClick={() => { setMethod('Pix'); setPayTarget(t); }}>
                      Marcar paga
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {tabs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Nenhuma comanda ainda.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!payTarget} onClose={() => setPayTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Marcar comanda como paga</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Mesa {payTarget?.mesa} - {payTarget?.customerName} - {money(payTarget?.total ?? 0)}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="pay-method">Forma de pagamento</InputLabel>
            <Select labelId="pay-method" label="Forma de pagamento" value={method}
              onChange={(e) => setMethod(e.target.value as BingoPaymentMethod)}>
              <MenuItem value="Card">Cartão</MenuItem>
              <MenuItem value="Pix">Pix</MenuItem>
              <MenuItem value="Cash">Dinheiro</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayTarget(null)}>Cancelar</Button>
          <Button variant="contained" disabled={busy} onClick={async () => {
            const t = payTarget;
            setPayTarget(null);
            if (t) await run(() => bingoApi.payTab(t.tabId, method), 'Comanda marcada como paga.');
          }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

/* ---------- Cardápio ---------- */
const MenuTab: React.FC<{ notify: Notify; confirm: (s: ConfirmState) => void }> = ({ notify, confirm }) => {
  const [items, setItems] = useState<BingoMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', price: 0 });

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

  const patchLocal = (id: string, patch: Partial<BingoMenuItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = async (item: BingoMenuItem) => {
    try {
      await bingoApi.updateMenuItem(item.id, {
        name: item.name, unitPrice: item.unitPrice, isAvailable: item.isAvailable, sortOrder: item.sortOrder,
      });
      notify('Item salvo.', 'success');
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível salvar o item.'), 'error');
      load();
    }
  };

  const toggle = async (item: BingoMenuItem, value: boolean) => {
    patchLocal(item.id, { isAvailable: value });
    try {
      await bingoApi.setAvailability(item.id, value);
    } catch (e: any) {
      patchLocal(item.id, { isAvailable: !value });
      notify(apiError(e, 'Não foi possível alterar a disponibilidade.'), 'error');
    }
  };

  const add = async () => {
    const price = newItem.price;
    if (!newItem.name.trim() || !Number.isFinite(price) || price <= 0) {
      notify('Informe nome e preço válidos.', 'error');
      return;
    }
    try {
      const nextOrder = items.reduce((m, i) => Math.max(m, i.sortOrder), 0) + 1;
      await bingoApi.createMenuItem({ name: newItem.name.trim(), unitPrice: price, isAvailable: true, sortOrder: nextOrder });
      setNewItem({ name: '', price: 0 });
      notify('Item adicionado.', 'success');
      load();
    } catch (e: any) {
      notify(apiError(e, 'Não foi possível adicionar o item.'), 'error');
    }
  };

  if (loading) return <CircularProgress />;
  return (
    <Stack spacing={2}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80}>Ordem</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell width={150}>Preço</TableCell>
              <TableCell>Disponibilidade</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <TextField size="small" type="number" value={i.sortOrder}
                    onChange={(e) => patchLocal(i.id, { sortOrder: Number(e.target.value) })}
                    onBlur={() => save(i)} />
                </TableCell>
                <TableCell>
                  <TextField size="small" fullWidth value={i.name}
                    onChange={(e) => patchLocal(i.id, { name: e.target.value })} onBlur={() => save(i)} />
                </TableCell>
                <TableCell>
                  <CurrencyField size="small" value={i.unitPrice}
                    onValueChange={(v) => patchLocal(i.id, { unitPrice: v })} onBlur={() => save(i)} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center">
                    <Switch checked={i.isAvailable} onChange={(e) => toggle(i, e.target.checked)} />
                    <Typography variant="body2" color={i.isAvailable ? 'success.main' : 'error.main'}>
                      {i.isAvailable ? 'Disponível' : 'Esgotado'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Remover item">
                    <IconButton color="error" onClick={() => confirm({
                      title: 'Remover item',
                      text: `Remover "${i.name}" do cardápio?`,
                      confirmLabel: 'Remover',
                      onConfirm: async () => {
                        try {
                          await bingoApi.deleteMenuItem(i.id);
                          notify('Item removido.', 'success');
                          await load();
                        } catch (e: any) {
                          notify(apiError(e, 'Não foi possível remover o item.'), 'error');
                        }
                      },
                    })}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Novo item" value={newItem.name} fullWidth
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <CurrencyField label="Preço" value={newItem.price} sx={{ minWidth: 140 }}
            onValueChange={(v) => setNewItem({ ...newItem, price: v })} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={add}>Adicionar</Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

/* ---------- Mesas ---------- */
const QrBlock: React.FC<{ size: number; dataUrl: string }> = ({ size, dataUrl }) => (
  <Box component="img" src={dataUrl} alt="QR Code do bingo" sx={{ width: size, maxWidth: '100%', height: 'auto' }} />
);

const TablesTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');
  const [projecting, setProjecting] = useState(false);

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
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField label="Quantidade de mesas" type="number" value={count}
            onChange={(e) => setCount(e.target.value)} inputProps={{ min: 1, max: 500 }} />
          <Button variant="contained" onClick={save}>Salvar</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} className="bingo-no-print">
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!qr}>
            Imprimir
          </Button>
          <Button variant="outlined" startIcon={<ProjectIcon />} onClick={() => setProjecting(true)} disabled={!qr}>
            Projetar QR
          </Button>
        </Stack>
        <Box
          className="bingo-print-sheet"
          sx={{ textAlign: 'center', p: 2, border: '1px dashed', borderColor: 'divider' }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Aponte a câmera para pedir</Typography>
          {qr && <QrBlock size={480} dataUrl={qr} />}
          <Typography variant="h4" sx={{ mt: 2, wordBreak: 'break-all' }}>{BINGO_URL}</Typography>
        </Box>
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
            position: fixed; left: 0; top: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border: none !important; background: #fff; color: #000;
          }
          .bingo-print-sheet img { width: 16cm !important; }
          @page { size: A4 portrait; margin: 1.5cm; }
        }
      `}</style>
    </Stack>
  );
};

/* ---------- Garçons ---------- */
const WaitersTab: React.FC<{ notify: Notify; confirm: (s: ConfirmState) => void }> = ({ notify, confirm }) => {
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
          <Button variant="contained" startIcon={<AddIcon />} disabled={!selected} onClick={add}>Escalar</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          O filho precisa ter celular cadastrado para entrar como garçom.
        </Typography>
      </Paper>

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

      <Box>
        <Button color="error" variant="outlined" disabled={waiters.length === 0} onClick={() => confirm({
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
const SummaryView: React.FC<{ summary: BingoSummary }> = ({ summary }) => (
  <Stack spacing={2}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Total vendido (pago)</Typography>
        <Typography variant="h4">{money(summary.totalSold)}</Typography>
      </CardContent></Card>
      <Card sx={{ flex: 1 }}><CardContent>
        <Typography color="text.secondary">Em aberto</Typography>
        <Typography variant="h4">{money(summary.totalOpen)}</Typography>
      </CardContent></Card>
    </Stack>
    <Typography variant="h6">Por forma de pagamento</Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Forma</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
        <TableBody>
          {summary.byPayment.map((l) => (
            <TableRow key={l.label}><TableCell>{payLabel(l.label)}</TableCell><TableCell align="right">{money(l.total)}</TableCell></TableRow>
          ))}
          {summary.byPayment.length === 0 && <TableRow><TableCell colSpan={2}>Sem pagamentos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
    <Typography variant="h6">Por item</Typography>
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
  </Stack>
);

const SummaryTab: React.FC<{
  events: BingoEvent[];
  current: BingoEvent | null;
  notify: Notify;
  confirm: (s: ConfirmState) => void;
  onEventChanged: () => void;
}> = ({ events, current, notify, confirm, onEventChanged }) => {
  const [eventId, setEventId] = useState<string>(current?.id ?? '');
  const [summary, setSummary] = useState<BingoSummary | null>(null);
  const [loading, setLoading] = useState(false);

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

  const selected = events.find((e) => e.id === eventId);
  const canReset = !!selected && selected.isTest && selected.id === current?.id;

  return (
    <Stack spacing={2}>
      <FormControl sx={{ maxWidth: 420 }}>
        <InputLabel id="sum-ev">Evento</InputLabel>
        <Select labelId="sum-ev" label="Evento" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.name} - {formatDate(e.eventDate)} ({EVENT_STATUS[e.status].label})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading && <CircularProgress size={24} />}
      {summary && <SummaryView summary={summary} />}
      {canReset && (
        <Box>
          <Button color="error" variant="contained" onClick={() => confirm({
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
}> = ({ events, notify, confirm, onChanged }) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', eventDate: '', copyFrom: '' });
  const [history, setHistory] = useState<BingoEvent | null>(null);
  const [histSummary, setHistSummary] = useState<BingoSummary | null>(null);
  const [histTabs, setHistTabs] = useState<BingoTab[]>([]);
  const [histLoading, setHistLoading] = useState(false);

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

  return (
    <Stack spacing={2}>
      <Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>Novo evento</Button>
      </Box>
      <TableContainer component={Paper}>
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
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                    {ev.status === 'Draft' && (
                      <Button size="small" variant="contained" onClick={() => openEvent(ev)}>Abrir</Button>
                    )}
                    {ev.status === 'Open' && (
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
                      <Button size="small" onClick={() => showHistory(ev)}>Ver histórico</Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && <TableRow><TableCell colSpan={5}>Nenhum evento cadastrado.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={creating} onClose={() => setCreating(false)} fullWidth maxWidth="sm">
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

      <Dialog open={!!history} onClose={() => setHistory(null)} fullWidth maxWidth="md">
        <DialogTitle>Histórico: {history?.name} ({formatDate(history?.eventDate ?? '')})</DialogTitle>
        <DialogContent>
          {histLoading && <CircularProgress />}
          <Stack spacing={2}>
            {histSummary && <SummaryView summary={histSummary} />}
            {histTabs.length > 0 && (
              <>
                <Typography variant="h6">Comandas</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mesa</TableCell><TableCell>Cliente</TableCell>
                        <TableCell>Itens</TableCell><TableCell>Situação</TableCell><TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {histTabs.map((t) => (
                        <TableRow key={t.tabId}>
                          <TableCell>{t.mesa}</TableCell>
                          <TableCell>{t.customerName}</TableCell>
                          <TableCell>{t.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                          <TableCell>{t.status === 'Paid' ? `Paga (${payLabel(t.paymentMethod)})` : 'Não paga'}</TableCell>
                          <TableCell align="right">{money(t.total)}</TableCell>
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label="Eventos" />
        <Tab label="Painel ao vivo" />
        <Tab label="Cardápio" />
        <Tab label="Mesas" />
        <Tab label="Garçons" />
        <Tab label="Resumo" />
      </Tabs>

      {eventsLoading ? (
        <CircularProgress />
      ) : needsEvent && !current ? (
        <Alert severity="info">Não há evento atual. Crie ou abra um evento na aba Eventos.</Alert>
      ) : (
        <>
          {tab === 0 && <EventsTab events={events} notify={notify} confirm={setConfirmState} onChanged={loadEvents} />}
          {tab === 1 && <LivePanel event={current} notify={notify} confirm={setConfirmState} onEventChanged={loadEvents} />}
          {tab === 2 && <MenuTab notify={notify} confirm={setConfirmState} />}
          {tab === 3 && <TablesTab notify={notify} />}
          {tab === 4 && <WaitersTab notify={notify} confirm={setConfirmState} />}
          {tab === 5 && (
            <SummaryTab events={events} current={current} notify={notify} confirm={setConfirmState} onEventChanged={loadEvents} />
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

export default BingoPage;
