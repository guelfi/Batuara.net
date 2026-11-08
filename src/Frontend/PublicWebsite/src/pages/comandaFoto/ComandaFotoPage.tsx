import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { resolveBaseUrl } from '../../services/api';

interface Item {
  name: string;
  quantity: number;
  unitPrice: number;
  matched: boolean;
}

const TOKEN_KEY = 'comanda_foto_token';
// # | descrição | valor | × | qtd | = | total
const ITEM_COLS = '18px minmax(0,1fr) 50px 10px 40px 10px 60px';
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
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const errMsg = (e: any) => {
    const status = e?.response?.status;
    if (status === 401) return 'Link sem permissão. Peça o link correto ao administrador.';
    if (e?.response?.data?.message) return e.response.data.message;
    if (e?.code === 'ECONNABORTED') return 'A leitura demorou demais (limite do aparelho).';
    if (status) return `O servidor demorou ou falhou ao responder (HTTP ${status}).`;
    return 'Sem conexão com o servidor. Verifique o sinal do celular.';
  };

  const loadEventName = useCallback(async () => {
    try {
      const r = await http.get('/comanda-foto/relatorio');
      const d = r.data.data;
      setEventName(d?.eventName ?? 'Evento');
      setEventDate(d?.eventDate ? new Date(d.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '');
      setBuild(d?.build ?? '');
    } catch (e) {
      setError(errMsg(e));
    }
  }, [http]);

  useEffect(() => {
    loadEventName();
  }, [loadEventName]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setBusy('Lendo a comanda...');
    try {
      const b64 = await resizePhoto(file);
      setPhoto(b64);
      try {
        const r = await http.post('/comanda-foto/ler', { imageBase64: b64, mediaType: 'image/jpeg' });
        setItems(r.data.data.items);
        const { comandaNumber, customerName } = r.data.data;
        setComanda(String(comandaNumber ?? ''));
        setNome(String(customerName ?? ''));
        setDup(r.data.data.duplicate ?? null);
        setDupFor(String(comandaNumber ?? ''));
      } catch (e) {
        setItems([]);
        setError(`${errMsg(e)} Digite os itens abaixo.`);
      }
    } catch {
      setError('Não consegui abrir a foto.');
    } finally {
      setBusy(null);
    }
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

  const save = async () => {
    setBusy('Fechando comanda...');
    setError(null);
    try {
      await http.post('/comanda-foto', { comandaNumber: comanda.trim(), items: items.filter((i) => i.quantity > 0), label: [comanda.trim() && `Comanda ${comanda.trim()}`, nome.trim()].filter(Boolean).join(' - ').slice(0, 60), imageBase64: photo });
      // Limpa tudo e volta ao estado inicial
      setPhoto(null);
      setItems([]);
      setComanda('');
      setNome('');
      setDup(null);
      setError(null);
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

      {photo ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          {dup && comanda.trim() === dupFor.trim() && (
            <Alert severity="error" sx={{ mb: 1 }}>
              A comanda {comanda.trim()} já foi fechada às {new Date(dup.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({brl(dup.total)}). Confira o número; se foi engano, descarte a anterior na lista e tente de novo.
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField size="small" label="Comanda" value={comanda} onChange={(e) => setComanda(e.target.value)} inputProps={{ inputMode: 'numeric', maxLength: 10 }} sx={{ width: 110 }} />
            <TextField size="small" fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} inputProps={{ maxLength: 40 }} />
          </Stack>
          {items.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: ITEM_COLS, columnGap: 0.5, alignItems: 'center', mb: 0.5, color: 'text.secondary', fontSize: 11, fontWeight: 700 }}>
              <span>#</span>
              <span>Descrição</span>
              <span style={{ textAlign: 'right' }}>Valor</span>
              <span />
              <span style={{ textAlign: 'right' }}>Qtd</span>
              <span />
              <span style={{ textAlign: 'right' }}>Total</span>
            </Box>
          )}
          {items.map((it, idx) => (
            <Box key={idx} sx={{ mb: 0.75, opacity: it.quantity === 0 ? 0.5 : 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: ITEM_COLS, columnGap: 0.5, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {idx + 1}
                </Typography>
                <TextField size="small" value={it.name} error={!it.matched} sx={cellSx} onChange={(e) => patch(idx, { name: e.target.value, matched: false })} />
                <TextField size="small" type="number" value={it.unitPrice} sx={{ ...cellSx, '& input': { ...cellSx['& input'], textAlign: 'right' } }} onChange={(e) => patch(idx, { unitPrice: Math.max(0, Number(e.target.value)) })} />
                <Typography variant="body2" color="text.secondary" align="center">×</Typography>
                <TextField size="small" type="number" value={it.quantity} sx={{ ...cellSx, '& input': { ...cellSx['& input'], textAlign: 'right' } }} onChange={(e) => patch(idx, { quantity: Math.max(0, Number(e.target.value)) })} />
                <Typography variant="body2" color="text.secondary" align="center">=</Typography>
                <Typography variant="body2" fontWeight={700} align="right" sx={it.quantity === 0 ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}>
                  {(it.quantity * it.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
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
            <Button fullWidth variant="contained" size="large" onClick={save} disabled={!!busy || items.every((i) => i.quantity <= 0) || (!!dup && comanda.trim() === dupFor.trim())}>
              Fechar comanda
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Button fullWidth variant="contained" size="large" sx={{ py: 2 }} disabled={!!busy} onClick={() => fileRef.current?.click()}>
          📷 Fotografar comanda
        </Button>
      )}
    </Container>
  );
};

export default ComandaFotoPage;
