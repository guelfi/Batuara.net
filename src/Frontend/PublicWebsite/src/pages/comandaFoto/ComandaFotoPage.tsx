import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Snackbar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { resolveBaseUrl } from '../../services/api';
import ComandaManual from './ComandaManual';

interface Item {
  name: string;
  quantity: number;
  unitPrice: number;
  matched: boolean;
}

const TOKEN_KEY = 'comanda_foto_token';
// linha 1: # | descrição; linha 2: valor × qtd = total | lixeira
const ITEM_COLS = '18px minmax(0,1fr) 10px 52px 10px 62px 26px';
const cellSx = { '& input': { py: 0.75, px: 0.75, fontSize: 13 } } as const;
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getToken = (): string => {
  const fromUrl = new URLSearchParams(window.location.search).get('t');
  try {
    if (fromUrl) window.localStorage.setItem(TOKEN_KEY, fromUrl);
    return fromUrl || window.localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return fromUrl || '';
  }
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
  if (status === 401) return 'Link sem permissão. Peça o link correto ao administrador.';
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === 'ECONNABORTED') return 'A leitura demorou demais (limite do aparelho).';
  if (status) return `O servidor demorou ou falhou ao responder (HTTP ${status}).`;
  return 'Sem conexão com o servidor. Verifique o sinal do celular.';
};

const MAX_ATTEMPTS = 3;
const RETRY_PAUSE_MS = 2000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Só vale repetir quando a falha é temporária (rede, tempo esgotado, servidor ocupado). */
const isRetryable = (e: any) => {
  const status = e?.response?.status;
  return !status || status >= 500 || status === 429;
};

const ComandaFotoPage: React.FC = () => {
  const token = useRef(getToken()).current;
  const http = useRef(
    axios.create({ baseURL: resolveBaseUrl(), timeout: 95000, headers: { 'X-Comanda-Token': token } }),
  ).current;
  const fileRef = useRef<HTMLInputElement>(null);

  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [build, setBuild] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [comanda, setComanda] = useState('');
  const [nome, setNome] = useState('');
  const [dupFor, setDupFor] = useState('');
  const [dup, setDup] = useState<{ id: number; label: string; total: number; createdAt: string } | null>(null);
  const [payMethods, setPayMethods] = useState<{ id: number; name: string }[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 0 = não está lendo; 1..3 = tentativa atual da leitura da foto
  const [attempt, setAttempt] = useState(0);
  const [readFailure, setReadFailure] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  // forma de pagamento que a IA achou escrita na comanda (pré-seleciona no diálogo)
  const [suggestedPay, setSuggestedPay] = useState<number | null>(null);

  const loadEventName = useCallback(async () => {
    try {
      const r = await http.get('/comanda-foto/relatorio');
      const d = r.data.data;
      setEventName(d?.eventName ?? 'Evento');
      setEventDate(d?.eventDate ? new Date(d.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '');
      setBuild(d?.build ?? '');
      const m = await http.get('/comanda-foto/formas-pagamento');
      setPayMethods(m.data.data ?? []);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [http]);

  useEffect(() => {
    loadEventName();
  }, [loadEventName]);

  const readPhoto = async (b64: string) => {
    setReadFailure(null);
    setSuggestedPay(null);
    let lastError: unknown = null;
    for (let n = 1; n <= MAX_ATTEMPTS; n += 1) {
      setAttempt(n);
      try {
        const r = await http.post('/comanda-foto/ler', { imageBase64: b64, mediaType: 'image/jpeg' });
        setItems(r.data.data.items);
        const { comandaNumber, customerName } = r.data.data;
        setComanda(String(comandaNumber ?? ''));
        setNome(String(customerName ?? ''));
        setDup(r.data.data.duplicate ?? null);
        setDupFor(String(comandaNumber ?? ''));
        setSuggestedPay(r.data.data.paymentMethodId ?? null);
        setAttempt(0);
        return;
      } catch (e) {
        lastError = e;
        if (!isRetryable(e) || n === MAX_ATTEMPTS) break;
        await sleep(RETRY_PAUSE_MS);
      }
    }
    setItems([]);
    setAttempt(0);
    setReadFailure(`Não foi possível processar a imagem. ${errMsg(lastError)}`);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setReadFailure(null);
    setManual(false);
    try {
      const b64 = await resizePhoto(file);
      setPhoto(b64);
      await readPhoto(b64);
    } catch {
      setError('Não consegui abrir a foto.');
    }
  };

  const resetAll = () => {
    setPhoto(null);
    setItems([]);
    setComanda('');
    setNome('');
    setDup(null);
    setError(null);
    setReadFailure(null);
    setManual(false);
    setAttempt(0);
    setSuggestedPay(null);
  };

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const patch = (idx: number, p: Partial<Item>) => setItems((l) => l.map((it, i) => (i === idx ? { ...it, ...p } : it)));

  const registerItem = async (idx: number) => {
    const it = items[idx];
    setBusy('Cadastrando no cardápio...');
    try {
      const r = await http.post('/comanda-foto/cardapio', { name: it.name, unitPrice: it.unitPrice });
      patch(idx, { name: r.data.data.name, matched: true });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const save = async (paymentMethodId: number | null) => {
    setPayOpen(false);
    setBusy('Fechando comanda...');
    setError(null);
    try {
      await http.post('/comanda-foto', { comandaNumber: comanda.trim(), paymentMethodId: paymentMethodId ?? 0, paymentNotIdentified: paymentMethodId === null, items: items.filter((i) => i.quantity > 0), label: [comanda.trim() && `Comanda ${comanda.trim()}`, nome.trim()].filter(Boolean).join(' - ').slice(0, 60), imageBase64: photo });
      resetAll();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700}>
        Fechamento Comanda{build && ` - ${build}`}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2, fontSize: '0.78rem' }}>
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
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {attempt > 0 ? (
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
          {[72, 58, 84, 64, 76].map((w, i) => (
            <Box key={i} sx={{ mb: 1.25 }}>
              <Skeleton variant="rounded" height={32} width={`${w}%`} animation="wave" sx={{ mb: 0.5 }} />
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <Skeleton variant="rounded" width={52} height={24} animation="wave" />
                <Skeleton variant="rounded" width={52} height={24} animation="wave" />
                <Skeleton variant="rounded" width={62} height={24} animation="wave" />
                <Skeleton variant="circular" width={22} height={22} animation="wave" />
              </Stack>
            </Box>
          ))}
          <Skeleton variant="rounded" height={32} width="60%" animation="wave" sx={{ mx: 'auto', my: 1.5 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" height={42} animation="wave" sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={42} animation="wave" sx={{ flex: 1 }} />
          </Stack>
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
            <Button fullWidth variant="outlined" size="large" onClick={() => { setReadFailure(null); setManual(true); }}>
              ✍ Digitar sem foto
            </Button>
            <Button fullWidth onClick={resetAll}>
              ← Voltar
            </Button>
          </Stack>
        </Paper>
      ) : manual ? (
        <ComandaManual http={http} payMethods={payMethods} photo={photo} errMsg={errMsg} onBack={resetAll} onSaved={resetAll} />
      ) : photo ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Snackbar open={!!dup && comanda.trim() === dupFor.trim()} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ top: { xs: 16 } }}>
            <Alert severity="error" variant="filled" sx={{ width: '100%', boxShadow: 6 }}>
              Comanda {comanda.trim()} já registrada{dup ? ` (${brl(dup.total)})` : ''}
            </Alert>
          </Snackbar>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField size="small" label="Comanda" value={comanda} onChange={(e) => setComanda(e.target.value)} inputProps={{ inputMode: 'numeric', maxLength: 10 }} sx={{ width: 110 }} />
            <TextField size="small" fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} inputProps={{ maxLength: 40 }} />
          </Stack>
          {items.map((it, idx) => (
            <Box key={idx} sx={{ mb: 1.25, opacity: it.quantity === 0 ? 0.5 : 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '18px minmax(0,1fr)', columnGap: 0.5, alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {idx + 1}
                </Typography>
                <TextField size="small" fullWidth value={it.name} error={!it.matched} sx={cellSx} onChange={(e) => patch(idx, { name: e.target.value, matched: false })} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '18px 1fr 52px 10px 52px 10px 62px 26px', columnGap: 0.5, alignItems: 'center' }}>
                <span />
                <Typography variant="caption" color="text.secondary" align="right">Valor</Typography>
                <TextField size="small" type="number" value={it.unitPrice} sx={{ ...cellSx, '& input': { ...cellSx['& input'], textAlign: 'right' } }} onChange={(e) => patch(idx, { unitPrice: Math.max(0, Number(e.target.value)) })} />
                <Typography variant="body2" color="text.secondary" align="center">×</Typography>
                <TextField size="small" type="number" value={it.quantity} sx={{ ...cellSx, '& input': { ...cellSx['& input'], textAlign: 'right' } }} onChange={(e) => patch(idx, { quantity: Math.max(0, Number(e.target.value)) })} />
                <Typography variant="body2" color="text.secondary" align="center">=</Typography>
                <Typography variant="body2" fontWeight={700} align="right" sx={it.quantity === 0 ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}>
                  {(it.quantity * it.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <IconButton size="small" aria-label="Remover item" color="error" onClick={() => setItems((l) => l.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
              {!it.matched && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 3, mt: 0.25 }}>
                  <Typography variant="caption" color="error">
                    Fora do cardápio
                  </Typography>
                  <Button size="small" variant="outlined" disabled={!!busy || !it.name.trim() || it.unitPrice <= 0} onClick={() => registerItem(idx)} sx={{ whiteSpace: 'nowrap', minWidth: 0, px: 1, py: 0, fontSize: 12 }}>
                    + Cardápio
                  </Button>
                </Stack>
              )}
            </Box>
          ))}
          <Button size="small" onClick={() => setItems((l) => [...l, { name: '', quantity: 1, unitPrice: 0, matched: true }])}>
            + Adicionar item
          </Button>
          <Typography variant="h5" fontWeight={800} align="center" sx={{ my: 1 }}>
            Total da comanda {brl(total)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" onClick={() => setPhoto(null)} disabled={!!busy}>
              Descartar
            </Button>
            <Button fullWidth variant="contained" size="large" onClick={() => setPayOpen(true)} disabled={!!busy || items.every((i) => i.quantity <= 0) || (!!dup && comanda.trim() === dupFor.trim())}>
              Fechar comanda
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Button fullWidth variant="contained" size="large" sx={{ py: 2 }} disabled={!!busy} onClick={() => fileRef.current?.click()}>
          📷 Fotografar comanda
        </Button>
      )}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Forma de pagamento</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            {payMethods.length === 0 && <Typography color="text.secondary">Nenhuma forma de pagamento ativa.</Typography>}
            {suggestedPay !== null && (
              <Typography variant="body2" color="text.secondary">
                Identificado na comanda: confirme ou escolha outra.
              </Typography>
            )}
            {payMethods.map((m) => (
              <Button key={m.id} variant={m.id === suggestedPay ? 'contained' : 'outlined'} size="large" onClick={() => save(m.id)}>
                {m.name}
              </Button>
            ))}
            <Button variant="outlined" size="large" color="inherit" onClick={() => save(null)}>
              Não identificado
            </Button>
            <Button onClick={() => setPayOpen(false)}>Voltar</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ComandaFotoPage;
