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
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState<string | null>(null);
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
    setNotes(null);
    setBusy('Lendo a comanda...');
    try {
      const b64 = await resizePhoto(file);
      setPhoto(b64);
      try {
        const r = await http.post('/comanda-foto/ler', { imageBase64: b64, mediaType: 'image/jpeg' });
        setItems(r.data.data.items);
        setNotes(r.data.data.notes || null);
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

  const save = async () => {
    setBusy('Fechando comanda...');
    setError(null);
    try {
      await http.post('/comanda-foto', { label, items, imageBase64: photo });
      // Limpa tudo e volta ao estado inicial
      setPhoto(null);
      setItems([]);
      setLabel('');
      setNotes(null);
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {[eventName, eventDate && !eventName.includes(eventDate) ? eventDate : '', 'Fotografe a comanda para Fechar Conta']
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
          <Box component="img" src={`data:image/jpeg;base64,${photo}`} alt="Comanda" sx={{ width: '100%', maxHeight: 220, objectFit: 'contain', mb: 1 }} />
          {notes && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {notes}
            </Alert>
          )}
          <TextField size="small" fullWidth label="Mesa / nome (opcional)" value={label} onChange={(e) => setLabel(e.target.value)} sx={{ mb: 1 }} />
          {items.map((it, idx) => (
            <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <TextField size="small" type="number" label="Qtd" value={it.quantity} sx={{ width: 70 }} onChange={(e) => patch(idx, { quantity: Math.max(0, Number(e.target.value)) })} />
              <TextField
                size="small"
                label="Item"
                value={it.name}
                fullWidth
                error={!it.matched}
                helperText={!it.matched ? 'Conferir' : undefined}
                onChange={(e) => patch(idx, { name: e.target.value })}
              />
              <TextField size="small" type="number" label="R$" value={it.unitPrice} sx={{ width: 90 }} onChange={(e) => patch(idx, { unitPrice: Math.max(0, Number(e.target.value)), matched: true })} />
              <IconButton aria-label="Remover" onClick={() => setItems((l) => l.filter((_, i) => i !== idx))}>
                ✕
              </IconButton>
            </Stack>
          ))}
          <Button size="small" onClick={() => setItems((l) => [...l, { name: '', quantity: 1, unitPrice: 0, matched: true }])}>
            + Adicionar item
          </Button>
          <Typography variant="h4" fontWeight={800} align="center" sx={{ my: 1 }}>
            Total {brl(total)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" onClick={() => setPhoto(null)} disabled={!!busy}>
              Descartar
            </Button>
            <Button fullWidth variant="contained" size="large" onClick={save} disabled={!!busy || items.length === 0}>
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
