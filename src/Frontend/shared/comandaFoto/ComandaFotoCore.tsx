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
import { Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PaymentPicker, { PayHint, PayLine, payBody } from './PaymentPicker';
import MenuPagedCarousel from './MenuPagedCarousel';
import { QtyControls } from './CarouselParts';
import ComandaList, { ComandaListEntry } from './ComandaList';
import { useFillViewport } from './useFillViewport';
import { ExtraItem, Item, MAX_QTY, MenuItem, aggregateDrafts, applyOcrItems, brl, deriveItems, norm } from './comandaUtils';

const NOT_IDENTIFIED = 'Não identificado';

// Paddings padrão do MUI por variante e tamanho. O tema do Admin troca todos por 8px 16px e minHeight 48, o que
// inflava botões e linhas deste componente; aqui ele volta a ter o mesmo tamanho em qualquer hospedeiro.
const BUTTON_PADDING: Record<string, Record<string, string>> = {
  text: { small: '4px 5px', medium: '6px 8px', large: '8px 11px' },
  outlined: { small: '3px 9px', medium: '5px 15px', large: '7px 21px' },
  contained: { small: '4px 10px', medium: '6px 16px', large: '8px 22px' },
};
type OwnerState = { variant?: string; size?: string };
type StyleFn = (props: { ownerState: OwnerState }) => object;
const hostStyles = (host: unknown, props: { ownerState: OwnerState }): object =>
  typeof host === 'function' ? (host as StyleFn)(props) : ((host as object | undefined) ?? {});
const isolateHostTheme = (outer: Theme): Theme => {
  const hostButton = outer.components?.MuiButton?.styleOverrides?.root;
  const hostIconButton = outer.components?.MuiIconButton?.styleOverrides?.root;
  return createTheme(outer, {
    components: {
      MuiButton: {
        styleOverrides: {
          // mantém o que o tema do hospedeiro define (maiúsculas, raio, fonte) e só repõe altura mínima e padding
          root: (props: { ownerState: OwnerState }) => ({
            ...hostStyles(hostButton, props),
            minHeight: 0,
            padding: (BUTTON_PADDING[String(props.ownerState.variant ?? 'text')] ?? BUTTON_PADDING.text)[String(props.ownerState.size ?? 'medium')],
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: (props: { ownerState: OwnerState }) => ({ ...hostStyles(hostIconButton, props), padding: props.ownerState.size === 'small' ? 5 : 8 }),
        },
      },
    },
  });
};

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

/** Comanda já preenchida, guardada para fechar junto; guarda quantidades e itens de fora para poder ser reaberta e editada. */
interface QueuedComanda {
  id: string;
  comanda: string;
  nome: string;
  qty: Record<number, number>;
  extras: ExtraItem[];
  items: Item[];
  photo: string;
  total: number;
}

/** Identificador da comanda que está sendo preenchida (ainda fora da fila). */
const ACTIVE_ID = '__atual__';

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
  // Uma só versão: o componente ocupa exatamente a altura visível da tela (sem rolagem de página) e o carrossel
  // escolhe quantas linhas de cards cabem. Na página própria vale também um título; no painel do garçom, não.
  const rootRef = useRef<HTMLDivElement>(null);
  const fitHeight = useFillViewport(rootRef);
  const roomy = (fitHeight ?? 0) >= 700; // telas altas: botões de ação empilhados e maiores
  const rootProps = {
    ref: rootRef,
    ...(isPage ? { maxWidth: 'sm' as const } : {}),
    sx: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...(isPage ? { py: 1 } : {}),
      ...(fitHeight ? { height: fitHeight } : {}),
    },
  };
  const http = useMemo(
    () => axios.create({ baseURL: baseUrl, timeout: 95000, headers: { 'X-Comanda-Token': token } }),
    [token, baseUrl],
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const idSeq = useRef(0);
  // true quando a foto atual já veio reduzida da fila (não reduzir de novo)
  const photoShrunk = useRef(false);

  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [build, setBuild] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const menuRef = useRef<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [qty, setQty] = useState<Record<number, number>>({});
  // ids lidos da foto: ficam no início do cardápio até a próxima leitura ou até descartar (nada muda de lugar enquanto se digita)
  const [pinned, setPinned] = useState<number[]>([]);
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
  // posição, na lista de comandas, em que a comanda aberta no cardápio volta a ficar (null = no fim)
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  // true = o cardápio mostra a soma dos itens de todas as comandas (só leitura)
  const [viewAll, setViewAll] = useState(false);
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
        setPinned(Object.keys(applied.qty).map(Number));
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
      photoShrunk.current = false;
      // foto nova = comanda nova: nada da leitura anterior pode seguir junto, nem se esta leitura falhar
      clearDraft();
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

  /** Limpa tudo o que é da comanda atual, menos a foto. */
  const clearDraft = () => {
    setQty({});
    setPinned([]);
    setExtras([]);
    setSearch('');
    setComanda('');
    setNome('');
    setDup(null);
    setDupFor('');
    setSuggestedPay(null);
    setPayHints([]);
  };
  const resetCurrent = () => {
    photoShrunk.current = false;
    setActiveSlot(null);
    setPhoto(null);
    setQty({});
    setPinned([]);
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
    setViewAll(false);
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

  // Todas as comandas da conta, na ordem em que serão fechadas: as guardadas e, no lugar dela, a que está aberta no cardápio
  const slotOf = (len: number) => (activeSlot === null ? len : Math.min(activeSlot, len));
  const entries = useMemo<ComandaListEntry[]>(() => {
    const list: ComandaListEntry[] = queue.map((q) => ({ id: q.id, comanda: q.comanda, nome: q.nome, count: q.items.reduce((n, i) => n + i.quantity, 0), total: q.total }));
    if (!pristine) list.splice(slotOf(list.length), 0, { id: ACTIVE_ID, comanda: comanda.trim(), nome: nome.trim(), count, total });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, activeSlot, pristine, comanda, nome, count, total]);
  const showAll = viewAll && entries.length > 1;
  const aggregated = useMemo(() => {
    if (!showAll) return [];
    return aggregateDrafts(menu, [...queue, ...(pristine ? [] : [{ qty, extras }])]);
  }, [showAll, menu, queue, pristine, qty, extras]);

  const orderedMenu = useMemo(
    () => (pinned.length > 0 ? [...menu.filter((m) => pinned.includes(m.id)), ...menu.filter((m) => !pinned.includes(m.id))] : menu),
    [menu, pinned],
  );
  const filteredMenu = useMemo(() => {
    const q = norm(search);
    return q ? orderedMenu.filter((m) => norm(m.name).includes(q)) : orderedMenu;
  }, [orderedMenu, search]);

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

  const nextId = () => {
    idSeq.current += 1;
    return `c${idSeq.current}`;
  };

  /** Foto da comanda aberta, reduzida para o envio (só reduz uma vez). */
  const photoForQueue = async (): Promise<string> => (photo ? (photoShrunk.current ? photo : await shrinkPhoto(photo)) : '');

  /** Guarda o que está aberto no cardápio como uma comanda da fila. */
  const snapshotActive = async (): Promise<QueuedComanda> => ({
    id: nextId(),
    comanda: comanda.trim(),
    nome: nome.trim(),
    qty,
    extras,
    items,
    photo: await photoForQueue(),
    total,
  });

  /** Fila com a comanda aberta já inserida na posição dela. */
  const withActive = (snap: QueuedComanda | null): QueuedComanda[] => {
    if (!snap) return queue;
    const slot = slotOf(queue.length);
    return [...queue.slice(0, slot), snap, ...queue.slice(slot)];
  };

  const addToQueue = async () => {
    const number = comanda.trim();
    if (queue.some((q) => q.comanda === number)) {
      setError(`A comanda ${number} já está nesta lista.`);
      return;
    }
    const snap = await snapshotActive();
    setQueue(withActive(snap));
    resetCurrent();
  };

  /** Abre, no cardápio, os itens de uma comanda da lista; a que estava aberta volta para a fila. */
  const selectComanda = async (id: string) => {
    setViewAll(false);
    if (id === ACTIVE_ID) return;
    if (!pristine) {
      if (!identified || isDuplicate) {
        setError('Informe o número e o nome da comanda atual antes de abrir outra.');
        return;
      }
      if (queue.some((q) => q.comanda === comanda.trim())) {
        setError(`A comanda ${comanda.trim()} já está nesta lista.`);
        return;
      }
    }
    const merged = withActive(pristine ? null : await snapshotActive());
    const idx = merged.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const target = merged[idx];
    setQueue(merged.filter((_, i) => i !== idx));
    photoShrunk.current = !!target.photo;
    setQty(target.qty);
    setExtras(target.extras);
    setComanda(target.comanda);
    setNome(target.nome);
    setPhoto(target.photo || null);
    setPinned([]);
    setSearch('');
    setDup(null);
    setDupFor('');
    setSuggestedPay(null);
    setPayHints([]);
    setError(null);
    setActiveSlot(idx);
  };

  const removeComanda = (id: string) => {
    if (id === ACTIVE_ID) {
      resetCurrent();
      return;
    }
    const idx = queue.findIndex((q) => q.id === id);
    if (idx < 0) return;
    setQueue((l) => l.filter((q) => q.id !== id));
    setActiveSlot((slot) => (slot !== null && idx < slot ? slot - 1 : slot));
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
        const all = withActive(hasCurrent ? await snapshotActive() : null);
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

  const addExtraButton = (
    <Button size="small" onClick={() => setExtraOpen(true)} disabled={!!busy} sx={{ whiteSpace: 'nowrap' }}>
      + Item fora do cardápio
    </Button>
  );
  const closeLabel = queue.length > 0 ? `Fechar ${entries.length} comandas` : noConsumption ? (roomy ? 'Fechar comanda sem lançamentos' : 'Fechar sem lançamentos') : 'Fechar comanda';
  const reading = attempt > 0;
  const photoLabel = photo ? 'Fotografar Novamente' : queue.length > 0 ? 'Fotografar Outra Comanda' : 'Fotografar Comanda';

  return (
    <ThemeProvider theme={isolateHostTheme}>
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
      {isPage && (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.75, fontSize: '0.78rem' }}>
          {[eventName, eventDate && !eventName.includes(eventDate) ? eventDate : '', 'Fotografar comanda para Fechar Conta']
            .filter(Boolean)
            .join(' - ')}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {busy && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexShrink: 0 }}>
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
        <ComandaList
          entries={entries}
          total={grandTotal}
          selectedId={ACTIVE_ID}
          viewAll={showAll}
          onSelect={selectComanda}
          onRemove={removeComanda}
          onToggleAll={() => setViewAll((v) => !v)}
          maxRows={roomy ? 4 : 3}
          disabled={!!busy}
        />
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
        <Paper sx={{ px: 2, pt: 1.25, pb: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Button fullWidth variant="contained" size={roomy ? 'large' : 'medium'} sx={{ py: roomy ? 0.75 : 0.5, mb: 1, flexShrink: 0 }} disabled={!!busy} onClick={() => fileRef.current?.click()}>
            📷 - {photoLabel}
          </Button>
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexShrink: 0 }}>
            <TextField size="small" label="Comanda" required value={comanda} onChange={(e) => setComanda(e.target.value)} inputProps={{ inputMode: 'numeric', maxLength: 10 }} sx={{ width: 132, flexShrink: 0 }} />
            <TextField
              size="small"
              fullWidth
              required
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              inputProps={{ maxLength: 40 }}
              InputProps={{
                // atalho só enquanto o nome está vazio: sai do caminho assim que se começa a digitar
                endAdornment: !nome.trim() ? (
                  <InputAdornment position="end">
                    <Button size="small" onClick={() => setNome(NOT_IDENTIFIED)} sx={{ py: 0, px: 0.5, minWidth: 0, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {NOT_IDENTIFIED}
                    </Button>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Stack>

          {extras.length > 0 && (
            <Box sx={{ mb: 1, flexShrink: 0, maxHeight: 84, overflowY: 'auto' }}>
              <Typography variant="subtitle2" fontWeight={700} color="error" sx={{ lineHeight: 1.5 }}>
                Fora do cardápio ({extras.length})
              </Typography>
              {extras.map((e, idx) => (
                <Stack key={`${e.name}-${idx}`} direction="row" alignItems="center" spacing={1} sx={{ py: 0.25, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap title={e.name}>
                      {e.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="error" noWrap>
                        {brl(e.unitPrice)} × {e.quantity}
                      </Typography>
                      <Button size="small" variant="outlined" disabled={!!busy || !e.name.trim() || e.unitPrice <= 0} onClick={() => registerExtra(idx)} sx={{ minWidth: 0, px: 0.75, py: 0, fontSize: 11, lineHeight: 1.6, whiteSpace: 'nowrap' }}>
                        + Cardápio
                      </Button>
                    </Stack>
                  </Box>
                  <QtyControls name={e.name} quantity={e.quantity} onChange={(d) => setExtraQty(idx, d)} />
                  <IconButton size="small" aria-label={`Remover ${e.name}`} color="error" onClick={() => setExtras((l) => l.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          )}

          {showAll ? (
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, flexShrink: 0, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              Itens de todas as comandas (soma)
            </Typography>
          ) : (
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar item do cardápio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1, flexShrink: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Limpar busca" onClick={() => setSearch('')} sx={{ p: 0.5 }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          )}
          <Box sx={{ flex: '1 1 0', minHeight: 150, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {menuLoading ? (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress size={24} />
              </Stack>
            ) : showAll ? (
              <MenuPagedCarousel
                key="todas"
                label="Itens de todas as comandas"
                items={aggregated.map((r) => ({ id: r.id, name: r.name, unitPrice: r.unitPrice }))}
                qty={Object.fromEntries(aggregated.map((r) => [String(r.id), r.quantity]))}
                onChange={() => undefined}
                rowHeight={40}
                readOnly
                emptyText="Nenhum item lançado ainda."
                controlsPosition="bottom"
                footerStart={addExtraButton}
                testIdPrefix="soma-"
              />
            ) : (
              <MenuPagedCarousel
                key="comanda"
                items={filteredMenu}
                qty={qty}
                onChange={setItemQty}
                rowHeight={40}
                maxQty={MAX_QTY}
                controlsPosition="bottom"
                footerStart={addExtraButton}
                highlightSelected
                testIdPrefix="item-"
              />
            )}
          </Box>

          <Box sx={{ position: 'sticky', bottom: 0, mt: 'auto', flexShrink: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mx: -2, px: 2, pt: 1, pb: 'calc(8px + env(safe-area-inset-bottom))' }}>
            {queue.length > 0 && pristine ? (
              <Button fullWidth variant="contained" color="success" size="large" disabled={!!busy} onClick={() => setPayOpen(true)}>
                Fechar {queue.length} {queue.length === 1 ? 'comanda' : 'comandas'} — {brl(queueTotal)}
              </Button>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={800} align="center" sx={{ mb: 0.5, lineHeight: 1.3 }}>
                  Total da comanda {brl(total)}
                  {count > 0 && <Box component="span" sx={{ fontWeight: 400, fontSize: '0.8rem', ml: 0.75 }}>· {count} {count === 1 ? 'item' : 'itens'}</Box>}
                </Typography>
                <Stack direction={roomy ? 'column' : 'row'} spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    size={roomy ? 'medium' : 'small'}
                    onClick={() => setPayOpen(true)}
                    disabled={!canClose}
                    sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, fontSize: '0.8125rem', order: roomy ? 1 : 2 }}
                  >
                    {closeLabel}
                  </Button>
                  {/* só depois de fotografar (a leitura foi tentada); com comandas na fila também, para desistir da próxima sem perder a fila */}
                  <Button
                    fullWidth={roomy}
                    variant="outlined"
                    size="small"
                    onClick={resetCurrent}
                    disabled={!!busy || (!photo && queue.length === 0)}
                    sx={{ flex: roomy ? undefined : '0 0 auto', px: 1.5, whiteSpace: 'nowrap', order: roomy ? 3 : 1 }}
                  >
                    Descartar
                  </Button>
                  {!identified && roomy && (
                    <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ order: 2, lineHeight: 1.3, mt: '4px !important' }}>
                      Informe o número da comanda e o nome do cliente.
                    </Typography>
                  )}
                </Stack>
                {!identified && !roomy && (
                  <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                    Informe o número da comanda e o nome do cliente.
                  </Typography>
                )}
                <Button fullWidth variant="text" size="small" sx={{ mt: 0.25, fontWeight: 700 }} onClick={addToQueue} disabled={!canClose}>
                  + Outra comanda para pagamento
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
        <DialogTitle>{grandNoConsumption ? 'Fechar sem lançamentos?' : queue.length > 0 ? `Pagamento de ${entries.length} comandas` : 'Forma de pagamento'}</DialogTitle>
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
              breakdown={entries.map((e) => ({ label: `Comanda ${e.comanda}${e.nome ? ` - ${e.nome}` : ''}`, amount: e.total }))}
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
    </ThemeProvider>
  );
};

export default ComandaFotoCore;
