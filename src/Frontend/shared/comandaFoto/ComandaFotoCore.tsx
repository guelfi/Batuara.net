import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Snackbar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PaymentPicker, { PayHint, PayLine, payBody } from './PaymentPicker';
import MenuCarousel, { QtyControls } from './MenuCarousel';
import { ExtraItem, Item, MAX_QTY, MenuItem, applyOcrItems, brl, deriveItems, norm } from './comandaUtils';

const NOT_IDENTIFIED = 'Não identificado';

/** Reduz a foto no celular (lado maior 1400 px, JPEG) para subir rapido e caber no banco. */
const resizePhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]);
    };
    img.onerror = () => reject(new Error('Foto inválida'));
    img.src = url;
  });

const errMsg = (e: any): string => {
  const status = e?.response?.status;
  if (status === 401) return 'Link inválido ou expirado. Peça um link novo ao administrador.';
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === 'ECONNABORTED') return 'A leitura demorou demais (limite do aparelho).';
  if (status) return `O servidor demorou ou falhou ao responder (HTTP ${status}).`;
  return 'Sem conexão com o servidor. Verifique o sinal do celular.';
};

const MAX_ATTEMPTS = 3;
const RETRY_PAUSE_MS = 2000;
/** Reduz mais a foto das comandas que vão juntas no mesmo envio (o proxy aceita ~1 MB por requisição). */
const shrinkPhoto = (b64: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
    };
    img.onerror = () => resolve(b64);
    img.src = `data:image/jpeg;base64,${b64}`;
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Só vale repetir quando a falha é temporária (rede, tempo esgotado, servidor ocupado). */
const isRetryable = (e: any) => {
  const status = e?.response?.status;
  return !status || status >= 500 || status === 429;
};

interface QueuedComanda {
  comanda: string;
  nome: string;
  items: Item[];
  photo: string;
  total: number;
}

interface ComandaFotoCoreProps {
  /** Token de acesso. Quem usa o componente decide de onde ele vem; aqui ele nunca é lido nem guardado. */
  token: string;
  baseUrl: string;
  /** 'page' = página própria (título e Container); 'panel' = embutido em outra tela. */
  variant?: 'page' | 'panel';
}

/**
 * Fechar comanda: fotografar (a leitura preenche o cardápio) e/ou digitar direto no cardápio.
 * Fonte única usada pela página pública e pela tela do garçom (src/Frontend/shared).
 */
const ComandaFotoCore: React.FC<ComandaFotoCoreProps> = ({ token, baseUrl, variant = 'page' }) => {
  const isPage = variant === 'page';
  const Root: React.ElementType = isPage ? Container : Box;
  const rootProps = isPage ? { maxWidth: 'sm' as const, sx: { py: 2 } } : {};
  const http = useMemo(
    () => axios.create({ baseURL: baseUrl, timeout: 95000, headers: { 'X-Comanda-Token': token } }),
    [token, baseUrl],
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [build, setBuild] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const menuRef = useRef<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [search, setSearch] = useState('');
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [comanda, setComanda] = useState('');
  const [nome, setNome] = useState('');
  const [dupFor, setDupFor] = useState('');
  const [dup, setDup] = useState<{ id: number; label: string; total: number; createdAt: string } | null>(null);
  const [payMethods, setPayMethods] = useState<{ id: number; name: string }[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [payHints, setPayHints] = useState<PayHint[]>([]);
  // comandas já preenchidas que serão fechadas juntas no mesmo pagamento (cada uma continua separada)
  const [queue, setQueue] = useState<QueuedComanda[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 0 = não está lendo; 1..3 = tentativa atual da leitura da foto
  const [attempt, setAttempt] = useState(0);
  const [readFailure, setReadFailure] = useState<string | null>(null);
  // forma de pagamento que a IA achou escrita na comanda (pré-seleciona no diálogo)
  const [suggestedPay, setSuggestedPay] = useState<number | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const fetchMenu = useCallback(async (): Promise<MenuItem[]> => {
    const r = await http.get('/comanda-foto/cardapio');
    const list: MenuItem[] = r.data.data ?? [];
    menuRef.current = list;
    setMenu(list);
    return list;
  }, [http]);

  const loadInitial = useCallback(async () => {
    try {
      const r = await http.get('/comanda-foto/relatorio');
      const d = r.data.data;
      setEventName(d?.eventName ?? 'Evento');
      setEventDate(d?.eventDate ? new Date(d.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '');
      setBuild(d?.build ?? '');
      const m = await http.get('/comanda-foto/formas-pagamento');
      setPayMethods(m.data.data ?? []);
      await fetchMenu();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setMenuLoading(false);
    }
  }, [http, fetchMenu]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const readPhoto = async (b64: string) => {
    setReadFailure(null);
    setSuggestedPay(null);
    let lastError: unknown = null;
    for (let n = 1; n <= MAX_ATTEMPTS; n += 1) {
      setAttempt(n);
      try {
        const r = await http.post('/comanda-foto/ler', { imageBase64: b64, mediaType: 'image/jpeg' });
        const menuList = menuRef.current.length > 0 ? menuRef.current : await fetchMenu().catch(() => [] as MenuItem[]);
        const applied = applyOcrItems(menuList, r.data.data.items);
        setQty(applied.qty);
        setExtras(applied.extras);
        const { comandaNumber, customerName } = r.data.data;
        setComanda(String(comandaNumber ?? ''));
        setNome(String(customerName ?? ''));
        setDup(r.data.data.duplicate ?? null);
        setDupFor(String(comandaNumber ?? ''));
        setSuggestedPay(r.data.data.paymentMethodId ?? null);
        setPayHints(((r.data.data.payments ?? []) as any[]).map((h) => ({ paymentMethodId: h.paymentMethodId ?? null, amount: h.amount ?? null })));
        setAttempt(0);
        return;
      } catch (e) {
        lastError = e;
        if (!isRetryable(e) || n === MAX_ATTEMPTS) break;
        await sleep(RETRY_PAUSE_MS);
      }
    }
    setAttempt(0);
    setReadFailure(`Não foi possível processar a imagem. ${errMsg(lastError)}`);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setReadFailure(null);
    try {
      const b64 = await resizePhoto(file);
      setPhoto(b64);
      await readPhoto(b64);
    } catch {
      setError('Não consegui abrir a foto.');
    }
  };

  const noticeAdded = (added?: { name: string; unitPrice: number }[]) => {
    if (added && added.length > 0) {
      setAddedNotice(`Entrou no cardápio (confirmar no Admin): ${added.map((a) => `${a.name} (${brl(a.unitPrice)})`).join(', ')}`);
    }
  };

  const resetCurrent = () => {
    setPhoto(null);
    setQty({});
    setExtras([]);
    setSearch('');
    setComanda('');
    setNome('');
    setDup(null);
    setError(null);
    setReadFailure(null);
    setAttempt(0);
    setSuggestedPay(null);
    setPayHints([]);
  };
  const resetAll = () => {
    resetCurrent();
    setQueue([]);
  };

  const items = useMemo(() => deriveItems(menu, qty, extras), [menu, qty, extras]);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  // sem consumo: nada a pagar, entao nao ha forma de pagamento
  const noConsumption = total <= 0;
  const queueTotal = queue.reduce((s, q) => s + q.total, 0);
  // a comanda atual ainda está em branco (nada digitado, lido nem fotografado)
  const pristine = !photo && count === 0 && !comanda.trim() && !nome.trim();
  const hasCurrent = !pristine;
  const grandTotal = queueTotal + (hasCurrent ? total : 0);
  const grandNoConsumption = grandTotal <= 0;
  const isDuplicate = !!dup && comanda.trim() === dupFor.trim();
  const identified = comanda.trim().length > 0 && nome.trim().length > 0;
  const canClose = !busy && identified && !isDuplicate;

  const filteredMenu = useMemo(() => {
    const q = norm(search);
    return q ? menu.filter((m) => norm(m.name).includes(q)) : menu;
  }, [menu, search]);
  const selectedMenu = menu.filter((m) => (qty[m.id] ?? 0) > 0);

  const setItemQty = (id: number, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(MAX_QTY, (q[id] ?? 0) + delta)) }));
  const setExtraQty = (idx: number, delta: number) =>
    setExtras((l) => l.map((x, i) => (i === idx ? { ...x, quantity: Math.max(1, Math.min(MAX_QTY, x.quantity + delta)) } : x)));

  const addExtra = () => {
    const price = Number(extraPrice.replace(',', '.'));
    if (!extraName.trim() || !(price >= 0) || extraPrice.trim() === '') return;
    setExtras((l) => [...l, { name: extraName.trim(), quantity: 1, unitPrice: price }]);
    setExtraName('');
    setExtraPrice('');
    setExtraOpen(false);
  };

  const registerExtra = async (idx: number) => {
    const it = extras[idx];
    setBusy('Cadastrando no cardápio...');
    try {
      const r = await http.post('/comanda-foto/cardapio', { name: it.name, unitPrice: it.unitPrice });
      const canonical: string = r.data.data.name;
      const list = await fetchMenu();
      const found = list.find((x) => norm(x.name) === norm(canonical));
      if (found) setQty((q) => ({ ...q, [found.id]: Math.min(MAX_QTY, (q[found.id] ?? 0) + it.quantity) }));
      setExtras((l) => l.filter((_, i) => i !== idx));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const addToQueue = async () => {
    const number = comanda.trim();
    if (queue.some((q) => q.comanda === number)) {
      setError(`A comanda ${number} já está nesta lista.`);
      return;
    }
    const small = photo ? await shrinkPhoto(photo) : '';
    setQueue((l) => [...l, { comanda: number, nome: nome.trim(), items, photo: small, total }]);
    resetCurrent();
  };

  const save = async (lines: PayLine[] | null) => {
    setPayOpen(false);
    setBusy('Fechando comanda...');
    setError(null);
    const labelOf = (c: string, n: string) => [c && `Comanda ${c}`, n].filter(Boolean).join(' - ').slice(0, 60);
    try {
      if (queue.length === 0) {
        const r = await http.post('/comanda-foto', { comandaNumber: comanda.trim(), ...payBody(lines), items, label: labelOf(comanda.trim(), nome.trim()), imageBase64: photo ?? '' });
        resetAll();
        noticeAdded(r.data?.data?.addedToMenu);
      } else {
        const all = [...queue, ...(hasCurrent ? [{ comanda: comanda.trim(), nome: nome.trim(), items, photo: photo ? await shrinkPhoto(photo) : '', total }] : [])];
        const r = await http.post('/comanda-foto/lote', {
          ...payBody(lines),
          comandas: all.map((c) => ({ comandaNumber: c.comanda, label: labelOf(c.comanda, c.nome), items: c.items, imageBase64: c.photo })),
        });
        resetAll();
        noticeAdded(r.data?.data?.addedToMenu);
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const closeLabel = queue.length > 0 ? `Fechar ${queue.length + 1} comandas` : noConsumption ? 'Fechar comanda sem lançamentos' : 'Fechar comanda';
  const reading = attempt > 0;
  const photoLabel = photo ? 'Fotografar Novamente' : queue.length > 0 ? 'Fotografar Outra Comanda' : 'Fotografar Comanda';

  return (
    <Root {...rootProps}>
      <Snackbar open={!!addedNotice} autoHideDuration={9000} onClose={() => setAddedNotice(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ top: { xs: 16 } }}>
        <Alert severity="info" variant="filled" onClose={() => setAddedNotice(null)} sx={{ width: '100%', boxShadow: 6 }}>
          {addedNotice}
        </Alert>
      </Snackbar>
      <Snackbar open={isDuplicate} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ top: { xs: 16 } }}>
        <Alert severity="error" variant="filled" sx={{ width: '100%', boxShadow: 6 }}>
          Comanda {comanda.trim()} já registrada{dup ? ` (${brl(dup.total)})` : ''}
        </Alert>
      </Snackbar>
      {isPage && (
        <Typography variant="h5" fontWeight={700}>
          Fechamento Comanda{build && ` - ${build}`}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2, fontSize: isPage ? '0.78rem' : 'clamp(0.6rem, 2.9vw, 0.78rem)' }}>
        {[eventName, eventDate && !eventName.includes(eventDate) ? eventDate : '', 'Fotografar comanda para Fechar Conta']
          .filter(Boolean)
          .join(' - ')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {busy && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>{busy}</Typography>
        </Stack>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        data-testid="comanda-file"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {queue.length > 0 && !reading && !readFailure && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Comandas para fechar juntas ({queue.length})
          </Typography>
          {queue.map((q, i) => (
            <Stack key={q.comanda} direction="row" alignItems="center" spacing={1} sx={{ py: 0.25 }}>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                Comanda {q.comanda}{q.nome ? ` - ${q.nome}` : ''}
              </Typography>
              <Typography variant="body2" fontWeight={700}>{brl(q.total)}</Typography>
              <Button size="small" color="error" sx={{ minWidth: 0, px: 1 }} disabled={!!busy} onClick={() => setQueue((l) => l.filter((_, k) => k !== i))}>
                Remover
              </Button>
            </Stack>
          ))}
        </Paper>
      )}

      {reading ? (
        <Paper
          sx={{ p: 2, mb: 2, '@media (prefers-reduced-motion: reduce)': { '& .MuiSkeleton-root, & .MuiSkeleton-root::after': { animation: 'none' } } }}
          aria-busy="true"
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography fontWeight={600}>
              Lendo a comanda... tentativa {attempt} de {MAX_ATTEMPTS}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Skeleton variant="rounded" width={110} height={40} animation="wave" />
            <Skeleton variant="rounded" height={40} animation="wave" sx={{ flex: 1 }} />
          </Stack>
          {[72, 58, 84].map((w, i) => (
            <Skeleton key={i} variant="rounded" height={32} width={`${w}%`} animation="wave" sx={{ mb: 1 }} />
          ))}
        </Paper>
      ) : readFailure ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {readFailure}
          </Alert>
          <Stack spacing={1}>
            <Button fullWidth variant="contained" size="large" onClick={() => photo && readPhoto(photo)}>
              🔄 Tentar ler novamente
            </Button>
            <Button fullWidth variant="outlined" size="large" onClick={() => setReadFailure(null)}>
              ✍ Digitar sem ler a foto
            </Button>
            <Button fullWidth onClick={resetCurrent}>
              ← Voltar
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, mb: 2, pb: 0 }}>
          <Button fullWidth variant="contained" size="large" sx={{ py: 1.5, mb: 1 }} disabled={!!busy} onClick={() => fileRef.current?.click()}>
            📷 - {photoLabel}
          </Button>
          {photo && (
            <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mb: 1 }}>
              Foto anexada a esta comanda. Confira os itens abaixo.
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
            <TextField size="small" label="Comanda" required value={comanda} onChange={(e) => setComanda(e.target.value)} inputProps={{ inputMode: 'numeric', maxLength: 10 }} sx={{ width: 110 }} />
            <TextField size="small" fullWidth required label="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} inputProps={{ maxLength: 40 }} />
          </Stack>
          <Button size="small" sx={{ mb: 1 }} disabled={nome === NOT_IDENTIFIED} onClick={() => setNome(NOT_IDENTIFIED)}>
            {NOT_IDENTIFIED}
          </Button>

          {(selectedMenu.length > 0 || extras.length > 0) && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Na comanda ({count})
              </Typography>
              {selectedMenu.map((m) => (
                <Stack key={m.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap title={m.name}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {brl(m.unitPrice)} × {qty[m.id]} = {brl(m.unitPrice * qty[m.id])}
                    </Typography>
                  </Box>
                  <QtyControls name={m.name} quantity={qty[m.id]} onChange={(d) => setItemQty(m.id, d)} />
                </Stack>
              ))}
              {extras.map((e, idx) => (
                <Box key={`${e.name}-${idx}`} sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap title={e.name}>
                        {e.name}
                      </Typography>
                      <Typography variant="caption" color="error">
                        Fora do cardápio · {brl(e.unitPrice)} × {e.quantity} = {brl(e.unitPrice * e.quantity)}
                      </Typography>
                    </Box>
                    <QtyControls name={e.name} quantity={e.quantity} onChange={(d) => setExtraQty(idx, d)} />
                    <IconButton size="small" aria-label={`Remover ${e.name}`} color="error" onClick={() => setExtras((l) => l.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Button size="small" variant="outlined" disabled={!!busy || !e.name.trim() || e.unitPrice <= 0} onClick={() => registerExtra(idx)} sx={{ mt: 0.5, minWidth: 0, px: 1, py: 0, fontSize: 12 }}>
                    + Cardápio
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          <TextField
            size="small"
            fullWidth
            placeholder="Buscar item do cardápio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Limpar busca" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
          />
          {menuLoading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <MenuCarousel items={filteredMenu} qty={qty} onChange={setItemQty} />
          )}
          <Button size="small" onClick={() => setExtraOpen(true)} disabled={!!busy}>
            + Item fora do cardápio
          </Button>

          <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mx: -2, px: 2, pt: 1, pb: 'calc(8px + env(safe-area-inset-bottom))' }}>
            {queue.length > 0 && pristine ? (
              <Button fullWidth variant="contained" color="success" size="large" disabled={!!busy} onClick={() => setPayOpen(true)}>
                Fechar {queue.length} {queue.length === 1 ? 'comanda' : 'comandas'} — {brl(queueTotal)}
              </Button>
            ) : (
              <>
                <Typography variant="h6" fontWeight={800} align="center" sx={{ mb: 1 }}>
                  Total da comanda {brl(total)}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" onClick={resetCurrent} disabled={!!busy || pristine}>
                    Descartar
                  </Button>
                  <Button fullWidth variant="contained" size="large" onClick={() => setPayOpen(true)} disabled={!canClose}>
                    {closeLabel}
                  </Button>
                </Stack>
                {!identified && (
                  <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mt: 0.5 }}>
                    Informe o número da comanda e o nome do cliente.
                  </Typography>
                )}
                <Button fullWidth variant="text" sx={{ mt: 0.5 }} onClick={addToQueue} disabled={!canClose}>
                  + Outra comanda no mesmo pagamento
                </Button>
              </>
            )}
          </Box>
        </Paper>
      )}

      <Dialog open={extraOpen} onClose={() => setExtraOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Item fora do cardápio</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField label="Nome do item" value={extraName} onChange={(e) => setExtraName(e.target.value)} inputProps={{ maxLength: 60 }} autoFocus fullWidth />
            <TextField label="Valor (R$)" value={extraPrice} onChange={(e) => setExtraPrice(e.target.value)} inputProps={{ inputMode: 'decimal' }} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtraOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={addExtra} disabled={!extraName.trim() || !(Number(extraPrice.replace(',', '.')) >= 0) || extraPrice.trim() === ''}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{grandNoConsumption ? 'Fechar sem lançamentos?' : queue.length > 0 ? `Pagamento de ${queue.length + (hasCurrent ? 1 : 0)} comandas` : 'Forma de pagamento'}</DialogTitle>
        <DialogContent>
          {grandNoConsumption ? (
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Typography color="text.secondary">Comanda sem consumo: não há forma de pagamento. O número fica registrado para não ser lançado de novo.</Typography>
              <Button variant="contained" size="large" onClick={() => save(null)}>Fechar sem lançamentos</Button>
              <Button onClick={() => setPayOpen(false)}>Voltar</Button>
            </Stack>
          ) : (
            <PaymentPicker
              total={grandTotal}
              breakdown={[...queue.map((q) => ({ label: `Comanda ${q.comanda}${q.nome ? ` - ${q.nome}` : ''}`, amount: q.total })), ...(hasCurrent ? [{ label: `Comanda ${comanda.trim()}${nome.trim() ? ` - ${nome.trim()}` : ''}`, amount: total }] : [])]}
              payMethods={payMethods}
              suggestedPay={queue.length > 0 ? null : suggestedPay}
              hints={queue.length > 0 ? [] : payHints}
              onPick={save}
              onBack={() => setPayOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Root>
  );
};

export default ComandaFotoCore;
