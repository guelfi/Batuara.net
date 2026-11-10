import PaymentPicker, { PayLine, payBody } from './PaymentPicker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AxiosInstance } from 'axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';

interface MenuItem {
  id: number;
  name: string;
  unitPrice: number;
}

interface ExtraItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  http: AxiosInstance;
  payMethods: { id: number; name: string }[];
  /** Foto original (quando a leitura falhou) para anexar à comanda digitada. */
  photo: string | null;
  errMsg: (e: unknown) => string;
  onBack: () => void;
  onSaved: () => void;
}

const PAGE_SIZE = 10;
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Digitação manual da comanda: mesmo formato da comanda digital (itens do cardápio com − qtd +). */
const ComandaManual: React.FC<Props> = ({ http, payMethods, photo, errMsg, onBack, onSaved }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [comanda, setComanda] = useState('');
  const [nome, setNome] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');

  const loadMenu = useCallback(async () => {
    try {
      const r = await http.get('/comanda-foto/cardapio');
      setMenu(r.data.data ?? []);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [http, errMsg]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    return q ? menu.filter((m) => norm(m.name).includes(q)) : menu;
  }, [menu, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const setItemQty = (id: number, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(500, (q[id] ?? 0) + delta)) }));

  const menuTotal = menu.reduce((s, m) => s + (qty[m.id] ?? 0) * m.unitPrice, 0);
  const extrasTotal = extras.reduce((s, e) => s + e.quantity * e.unitPrice, 0);
  const total = menuTotal + extrasTotal;
  // sem consumo: nada a pagar, entao nao ha forma de pagamento
  const noConsumption = total <= 0;
  const count = menu.reduce((s, m) => s + (qty[m.id] ?? 0), 0) + extras.reduce((s, e) => s + e.quantity, 0);

  const addExtra = () => {
    const price = Number(extraPrice.replace(',', '.'));
    if (!extraName.trim() || !(price >= 0)) return;
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
      const m = await http.get('/comanda-foto/cardapio');
      const list: MenuItem[] = m.data.data ?? [];
      setMenu(list);
      const found = list.find((x) => norm(x.name) === norm(canonical));
      if (found) setQty((q) => ({ ...q, [found.id]: (q[found.id] ?? 0) + it.quantity }));
      setExtras((l) => l.filter((_, i) => i !== idx));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const save = async (lines: PayLine[] | null) => {
    setPayOpen(false);
    setBusy('Fechando comanda...');
    setError(null);
    const items = [
      ...menu.filter((m) => (qty[m.id] ?? 0) > 0).map((m) => ({ name: m.name, quantity: qty[m.id], unitPrice: m.unitPrice, matched: true })),
      ...extras.filter((e) => e.quantity > 0).map((e) => ({ ...e, matched: false })),
    ];
    try {
      await http.post('/comanda-foto', {
        comandaNumber: comanda.trim(),
        ...payBody(lines),
        items,
        label: [comanda.trim() && `Comanda ${comanda.trim()}`, nome.trim()].filter(Boolean).join(' - ').slice(0, 60),
        imageBase64: photo ?? '',
      });
      onSaved();
    } catch (e) {
      setError(errMsg(e));
      setBusy(null);
    }
  };

  const canClose = !busy && comanda.trim().length > 0;

  return (
    <Paper sx={{ p: 2, mb: 2, pb: 0 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Digitar comanda
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField size="small" label="Comanda" value={comanda} onChange={(e) => setComanda(e.target.value)} inputProps={{ inputMode: 'numeric', maxLength: 10 }} sx={{ width: 110 }} required />
        <TextField size="small" fullWidth label="Nome (opcional)" value={nome} onChange={(e) => setNome(e.target.value)} inputProps={{ maxLength: 40 }} />
      </Stack>
      <TextField
        size="small"
        fullWidth
        placeholder="Buscar item..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
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

      {loading ? (
        <Stack alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : (
        <>
          {visible.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }} align="center">
              Nenhum item encontrado.
            </Typography>
          )}
          {visible.map((m) => {
            const q = qty[m.id] ?? 0;
            return (
              <Box key={m.id} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                  {m.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, whiteSpace: 'nowrap' }}>
                    {brl(m.unitPrice)}
                  </Typography>
                  <IconButton size="small" aria-label={`Menos ${m.name}`} disabled={q === 0} onClick={() => setItemQty(m.id, -1)} sx={{ border: 1, borderColor: 'divider' }}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>
                    {q}
                  </Typography>
                  <IconButton size="small" aria-label={`Mais ${m.name}`} onClick={() => setItemQty(m.id, 1)} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" fontWeight={700} align="right" sx={{ minWidth: 76, whiteSpace: 'nowrap' }}>
                    = {brl(q * m.unitPrice)}
                  </Typography>
                </Stack>
              </Box>
            );
          })}

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ my: 1 }}>
            <IconButton aria-label="Página anterior" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2" fontWeight={600}>
              Página {current + 1} de {pages}
            </Typography>
            <IconButton aria-label="Próxima página" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {extras.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="error">
                Fora do cardápio
              </Typography>
              {extras.map((e, idx) => (
                <Box key={idx} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body1" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                    {e.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1, whiteSpace: 'nowrap' }}>
                      {brl(e.unitPrice)}
                    </Typography>
                    <IconButton size="small" aria-label="Menos" onClick={() => setExtras((l) => l.map((x, i) => (i === idx ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x)))} sx={{ border: 1, borderColor: 'divider' }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>
                      {e.quantity}
                    </Typography>
                    <IconButton size="small" aria-label="Mais" onClick={() => setExtras((l) => l.map((x, i) => (i === idx ? { ...x, quantity: Math.min(500, x.quantity + 1) } : x)))} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} align="right" sx={{ minWidth: 76, whiteSpace: 'nowrap' }}>
                      = {brl(e.quantity * e.unitPrice)}
                    </Typography>
                    <IconButton size="small" aria-label="Remover item" color="error" onClick={() => setExtras((l) => l.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Button size="small" variant="outlined" disabled={!!busy} onClick={() => registerExtra(idx)} sx={{ mt: 0.5, minWidth: 0, px: 1, py: 0, fontSize: 12 }}>
                    + Cardápio
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          <Button size="small" onClick={() => setExtraOpen(true)} disabled={!!busy}>
            + Item fora do cardápio
          </Button>
        </>
      )}

      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mx: -2, px: 2, pt: 1, pb: 'calc(8px + env(safe-area-inset-bottom))' }}>
        {busy && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">{busy}</Typography>
          </Stack>
        )}
        <Typography variant="h6" fontWeight={800} align="center" sx={{ mb: 1 }}>
          Total da comanda {brl(total)}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" onClick={onBack} disabled={!!busy}>
            Voltar
          </Button>
          <Button fullWidth variant="contained" size="large" onClick={() => setPayOpen(true)} disabled={!canClose}>
            {noConsumption ? 'Encerrar sem consumo' : 'Fechar comanda'}
          </Button>
        </Stack>
        {count > 0 && comanda.trim().length === 0 && (
          <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mt: 0.5 }}>
            Informe o número da comanda.
          </Typography>
        )}
      </Box>

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
        <DialogTitle>{noConsumption ? 'Encerrar sem consumo?' : 'Forma de pagamento'}</DialogTitle>
        <DialogContent>
          {noConsumption ? (
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Typography color="text.secondary">Comanda sem consumo: não há forma de pagamento. O número fica registrado para não ser lançado de novo.</Typography>
              <Button variant="contained" size="large" onClick={() => save(null)}>Encerrar sem consumo</Button>
              <Button onClick={() => setPayOpen(false)}>Voltar</Button>
            </Stack>
          ) : (
          <PaymentPicker total={total} payMethods={payMethods} onPick={save} onBack={() => setPayOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default ComandaManual;
