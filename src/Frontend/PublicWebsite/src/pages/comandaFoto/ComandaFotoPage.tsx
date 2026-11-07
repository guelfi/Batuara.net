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
interface Comanda {
  id: number;
  label: string;
  total: number;
  createdAt: string;
  items: Item[];
}
interface Report {
  eventName: string;
  count: number;
  grandTotal: number;
  itemTotals: Item[];
  comandas: Comanda[];
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
    axios.create({ baseURL: resolveBaseUrl(), timeout: 70000, headers: { 'X-Comanda-Token': token } }),
  ).current;
  const fileRef = useRef<HTMLInputElement>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const errMsg = (e: any) =>
    e?.response?.status === 401 ? 'Link sem permissão. Peça o link correto ao administrador.' : e?.response?.data?.message || 'Falha de conexão.';

  const load = useCallback(async () => {
    try {
      const r = await http.get('/comanda-foto/relatorio');
      setReport(r.data.data);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [http]);

  useEffect(() => {
    load();
  }, [load]);

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
    setBusy('Salvando...');
    setError(null);
    try {
      await http.post('/comanda-foto', { label, items, imageBase64: photo });
      setPhoto(null);
      setItems([]);
      setLabel('');
      setNotes(null);
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const discard = async (id: number) => {
    if (!window.confirm('Descartar esta comanda?')) return;
    try {
      await http.delete(`/comanda-foto/${id}`);
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const photoUrl = (id: number) => `${resolveBaseUrl()}/comanda-foto/${id}/foto?t=${encodeURIComponent(token)}`;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700}>
        Fechamento por foto
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {report?.eventName ?? 'Evento'} — fotografe a comanda de papel ao fechar a conta.
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
              Confirmar e guardar
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Button fullWidth variant="contained" size="large" sx={{ py: 2, mb: 2 }} disabled={!!busy} onClick={() => fileRef.current?.click()}>
          📷 Fotografar comanda
        </Button>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography fontWeight={700}>Comandas fechadas: {report?.count ?? 0}</Typography>
          <Typography variant="h6" fontWeight={800}>
            {brl(report?.grandTotal ?? 0)}
          </Typography>
        </Stack>
        {report?.comandas.slice().reverse().map((c) => (
          <Stack key={c.id} direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Box component="a" href={photoUrl(c.id)} target="_blank" rel="noreferrer" sx={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
              #{c.id} {c.label && `· ${c.label}`} · {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Box>
            <Typography fontWeight={700}>{brl(c.total)}</Typography>
            <Button size="small" color="error" onClick={() => discard(c.id)}>
              Descartar
            </Button>
          </Stack>
        ))}
      </Paper>

      <Button fullWidth variant="outlined" onClick={() => { setShowReport((v) => !v); load(); }}>
        {showReport ? 'Ocultar relatório consolidado' : 'Ver relatório consolidado'}
      </Button>

      {showReport && report && (
        <Paper sx={{ p: 2, mt: 2 }} className="comanda-relatorio">
          <Typography variant="h6" fontWeight={700}>
            Relatório Consolidado — {report.eventName}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
            {brl(report.grandTotal)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {report.count} comandas fotografadas
          </Typography>
          {report.itemTotals.map((i) => (
            <Stack key={i.name} direction="row" justifyContent="space-between">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span>{brl(i.unitPrice)}</span>
            </Stack>
          ))}
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Comandas
          </Typography>
          {report.comandas.map((c) => (
            <Box key={c.id} sx={{ mt: 1, breakInside: 'avoid' }}>
              <Typography variant="body2" fontWeight={700}>
                #{c.id} {c.label && `· ${c.label}`} — {brl(c.total)}
              </Typography>
              <Box component="img" src={photoUrl(c.id)} alt={`Comanda ${c.id}`} loading="lazy" sx={{ width: '100%', maxWidth: 360 }} />
            </Box>
          ))}
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => window.print()}>
            Imprimir / salvar PDF
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ComandaFotoPage;
