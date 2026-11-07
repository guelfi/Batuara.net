import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { bingoApi, apiErrorMessage, httpStatus, savedTabId } from '../../services/bingoApi';
import { BingoPublicInfo, BingoTabView } from '../../types/bingo';
import { formatBRL, useNoIndex, usePolling } from './bingoHooks';

const BIG_BUTTON = { minHeight: 52, fontSize: '1.05rem', fontWeight: 700 } as const;
const TAB_PATH = /^\/bingo\/comanda\/([^/?#]+)/;

export const getTabIdFromPath = (pathname: string): string | null => {
  const m = TAB_PATH.exec(pathname);
  return m ? decodeURIComponent(m[1]) : null;
};

const goTo = (path: string) => {
  window.location.replace(path);
};

// ---------------------------------------------------------------- formulário

const CustomerForm: React.FC = () => {
  const [info, setInfo] = useState<BingoPublicInfo | null>(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mesa, setMesa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingSaved, setCheckingSaved] = useState(true);

  // Se há comanda salva e válida, vai direto para ela.
  useEffect(() => {
    const saved = savedTabId.get();
    if (!saved) {
      setCheckingSaved(false);
      return;
    }
    bingoApi
      .getTab(saved)
      .then((tab) => {
        if (tab.status !== 'Paid') {
          goTo(`/bingo/comanda/${saved}`);
        } else {
          savedTabId.clear();
          setCheckingSaved(false);
        }
      })
      .catch((e) => {
        if (httpStatus(e) === 404 || httpStatus(e) === 400) savedTabId.clear();
        setCheckingSaved(false);
      });
  }, []);

  useEffect(() => {
    bingoApi
      .getInfo()
      .then((data) => {
        setInfo(data);
        const wanted = new URLSearchParams(window.location.search).get('mesa');
        if (wanted && data.mesas.includes(Number(wanted))) setMesa(String(Number(wanted)));
      })
      .catch(() => setLoadError('Não foi possível carregar as informações do bingo. Tente novamente.'));
  }, []);

  const digits = phone.replace(/\D/g, '');
  const phoneOk = digits.length >= 10 && digits.length <= 13;
  const canSubmit = name.trim().length >= 2 && phoneOk && mesa !== '' && !submitting && info?.isOpen !== false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await bingoApi.createTab({ customerName: name.trim(), phone: digits, mesa: Number(mesa) });
      savedTabId.set(res.tabId);
      goTo(`/bingo/comanda/${res.tabId}`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível abrir a comanda. Confira os dados e tente de novo.'));
      setSubmitting(false);
    }
  };

  if (checkingSaved) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
        Bingo - Abrir comanda
      </Typography>
      {info?.eventName && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {info.eventName}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
        Informe seus dados para pedir direto da sua mesa.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
      {info && !info.isOpen && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Os pedidos do bingo ainda não foram abertos.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <TextField
          label="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100, style: { minHeight: 28 } } }}
        />
        <TextField
          label="Celular (com DDD)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          required
          fullWidth
          error={phone.length > 0 && !phoneOk}
          helperText={
            phone.length > 0 && !phoneOk
              ? 'Informe um celular com DDD'
              : 'Já tem comanda? Informe o mesmo celular para voltar a ela.'
          }
          slotProps={{ htmlInput: { inputMode: 'tel', style: { minHeight: 28 } } }}
        />
        <TextField
          select
          label="Sua mesa"
          value={mesa}
          onChange={(e) => setMesa(e.target.value)}
          required
          fullWidth
          slotProps={{ select: { MenuProps: { PaperProps: { style: { maxHeight: 320 } } } } }}
        >
          {(info?.mesas ?? []).map((n) => (
            <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
              Mesa {n}
            </MenuItem>
          ))}
        </TextField>

        <Alert severity="info" icon={false} sx={{ fontSize: '0.85rem' }}>
          Usamos seu nome e celular apenas para a comanda do bingo. Eles são apagados em até 30 dias.
        </Alert>

        <Button type="submit" variant="contained" size="large" disabled={!canSubmit} sx={BIG_BUTTON}>
          {submitting ? 'Abrindo...' : 'Abrir minha comanda'}
        </Button>
      </Stack>
    </Box>
  );
};

// ------------------------------------------------------------------- comanda

const TabScreen: React.FC<{ tabId: string }> = ({ tabId }) => {
  const [tab, setTab] = useState<BingoTabView | null>(null);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [view, setView] = useState<'menu' | 'orders'>('menu');

  useEffect(() => {
    if (!message || message.severity === 'error') return undefined;
    const timer = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const load = useCallback(async () => {
    try {
      const data = await bingoApi.getTab(tabId);
      setTab(data);
      setError('');
    } catch (e) {
      const status = httpStatus(e);
      if (status === 404 || status === 400) {
        savedTabId.clear();
        setError('Comanda não encontrada. Abra uma nova comanda.');
        setTab(null);
      } else {
        setError('Sem conexão com o servidor. Tentando novamente...');
      }
    }
  }, [tabId]);

  usePolling(load, true);

  const cartLines = useMemo(
    () =>
      (tab?.menu ?? [])
        .filter((m) => (cart[m.id] ?? 0) > 0)
        .map((m) => ({ item: m, quantity: cart[m.id] })),
    [tab, cart]
  );
  // Quantidade ja pedida de cada item nesta comanda (pendentes + entregues), pelo id do item do cardapio.
  const orderedByItem = useMemo(() => {
    const totals: Record<string, number> = {};
    (tab?.items ?? []).forEach((i) => {
      const key = String(i.menuItemId);
      totals[key] = (totals[key] ?? 0) + i.quantity;
    });
    return totals;
  }, [tab]);
  const cartTotal = cartLines.reduce((s, l) => s + l.item.unitPrice * l.quantity, 0);

  const change = (id: string, delta: number) =>
    setCart((c) => {
      const next = Math.max(0, Math.min(20, (c[id] ?? 0) + delta));
      const copy = { ...c };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });

  const placeOrder = async () => {
    if (!tab || cartLines.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.addItems(
        tabId,
        cartLines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity }))
      );
      setCart({});
      setMessage({ severity: 'success', text: 'Pedido enviado! Um garçom levará à sua mesa.' });
      await load();
    } catch (e) {
      setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível enviar o pedido.') });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const closeTab = async () => {
    setConfirmClose(false);
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.closeTab(tabId);
      setMessage({ severity: 'success', text: 'Conta solicitada. Um garçom vai até você para o pagamento.' });
      await load();
    } catch (e) {
      setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível encerrar a conta.') });
    } finally {
      setBusy(false);
    }
  };

  const newTab = () => {
    savedTabId.clear();
    goTo('/bingo');
  };

  if (!tab) {
    return error ? (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={BIG_BUTTON} onClick={newTab}>
          Abrir nova comanda
        </Button>
      </Stack>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isPaid = tab.status === 'Paid';
  const closeRequested = tab.status === 'CloseRequested';
  const canOrder = tab.isOpen && !isPaid && !closeRequested;

  const activeView = canOrder ? view : 'orders';
  const MINI_BTN = { width: 30, height: 30 } as const;
  const orderCount = tab.items.reduce((s, i) => s + i.quantity, 0);
  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const notice = (severity: 'success' | 'error' | 'info' | 'warning', text: string, bold = false) => (
    <Alert severity={severity} sx={{ py: 0, px: 1, mb: 0.75, fontSize: '0.8rem', fontWeight: bold ? 700 : 400, '& .MuiAlert-icon': { py: 0.5, mr: 1 }, '& .MuiAlert-message': { py: 0.5 } }}>
      {text}
    </Alert>
  );

  const showCartBar = activeView === 'menu' && canOrder && cartCount > 0;

  return (
    <Box
      sx={{
        height: '100vh',
        '@supports (height: 100dvh)': { height: '100dvh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          pt: 1,
        }}
      >
        <Typography component="h1" sx={{ fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', lineHeight: 1.2 }}>
          COMANDA DO BINGO
          <Box component="span" sx={{ color: 'primary.main', ml: 1 }}>
            · Mesa {tab.mesa}
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', opacity: 0.75, lineHeight: 1.3 }}>
          {tab.customerName} · Nº {tab.id.slice(0, 8).toUpperCase()}
        </Typography>
        <Tabs
          value={activeView}
          onChange={(_, v) => setView(v)}
          variant="fullWidth"
          sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, py: 0.5, fontWeight: 700 } }}
        >
          <Tab value="menu" label="Cardápio" disabled={!canOrder} />
          <Tab value="orders" label={orderCount > 0 ? `Pedido (${orderCount})` : 'Pedido'} />
        </Tabs>
        {message && (
          <Alert
            severity={message.severity}
            onClose={() => setMessage(null)}
            sx={{ py: 0, px: 1, my: 0.5, fontSize: '0.78rem', '& .MuiAlert-icon': { py: 0.5, mr: 1 }, '& .MuiAlert-message': { py: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, '& .MuiAlert-action': { py: 0, pl: 0.5 } }}
          >
            {message.text}
          </Alert>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1, pb: 2 }}>
        {error && notice('warning', error)}
        {tab.closeAllRequested && !isPaid && notice('warning', 'Por favor, encerre sua conta.', true)}
        {!tab.isOpen && notice('info', 'Pedidos do bingo fechados no momento.')}
        {isPaid && notice('success', 'Conta paga. Obrigado por participar!')}
        {closeRequested && notice('info', 'Conta solicitada. Aguarde o garçom para o pagamento.')}

        {activeView === 'menu' && canOrder && (
          <>
            <Box>
              {tab.menu.map((m) => {
                const qty = cart[m.id] ?? 0;
                const already = orderedByItem[String(m.id)] ?? 0;
                return (
                  <Box
                    key={m.id}
                    data-testid={`menu-${m.id}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      opacity: m.isAvailable ? 1 : 0.5,
                      color: m.isAvailable ? 'text.primary' : 'text.disabled',
                    }}
                  >
                    <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                      {m.name}
                      {already > 0 && (
                        <Box component="span" data-testid={`ordered-${m.id}`} sx={{ fontWeight: 400, ml: 0.5 }}>
                          ({already})
                        </Box>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatBRL(m.unitPrice)}
                    </Typography>
                    {m.isAvailable ? (
                      <Stack direction="row" alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
                        <IconButton
                          aria-label={`Remover ${m.name}`}
                          onClick={() => change(m.id, -1)}
                          disabled={qty === 0}
                          sx={{ ...MINI_BTN, border: 1, borderColor: 'divider' }}
                        >
                          <RemoveIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography sx={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{qty}</Typography>
                        <IconButton
                          aria-label={`Adicionar ${m.name}`}
                          onClick={() => change(m.id, 1)}
                          disabled={qty >= 20}
                          sx={{ ...MINI_BTN, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                        >
                          <AddIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ fontWeight: 700, width: 82, textAlign: 'right' }}>
                        Esgotado
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>

          </>
        )}

        {activeView === 'orders' && (
          <>
            {tab.items.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7, py: 1 }}>
                Você ainda não fez pedidos.
              </Typography>
            ) : (
              <Box>
                {tab.items.map((i) => (
                  <Box
                    key={i.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                      {i.quantity}x {i.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatBRL(i.unitPrice * i.quantity)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        px: 0.9,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor:
                          i.status === 'Delivered' ? 'success.light' : i.status === 'Retrieved' ? 'info.light' : 'warning.light',
                        color: 'common.black',
                      }}
                    >
                      {i.status === 'Delivered' ? 'Entregue' : i.status === 'Retrieved' ? 'A caminho' : 'Pendente'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Typography sx={{ fontWeight: 700, my: 1.5 }}>Total consumido: {formatBRL(tab.total)}</Typography>

            <Stack spacing={1} sx={{ mb: 2 }}>
              {!isPaid && !closeRequested && (
                <Button variant="outlined" color="warning" sx={{ minHeight: 46, fontWeight: 700 }} disabled={busy} onClick={() => setConfirmClose(true)}>
                  Encerrar a conta
                </Button>
              )}
              {isPaid && (
                <Button variant="contained" sx={{ minHeight: 46, fontWeight: 700 }} onClick={newTab}>
                  Abrir nova comanda
                </Button>
              )}
            </Stack>
          </>
        )}
      </Box>

      {showCartBar && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.92rem' }}>
            {cartCount} {cartCount === 1 ? 'item' : 'itens'} · {formatBRL(cartTotal)}
          </Typography>
          <Button variant="contained" sx={{ minHeight: 42, fontWeight: 700 }} disabled={busy} onClick={placeOrder}>
            Fazer pedido
          </Button>
        </Box>
      )}

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Encerrar a conta?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Total: {formatBRL(tab.total)}. Depois de encerrar, não será possível fazer novos pedidos e um garçom virá
            cobrar na sua mesa.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setConfirmClose(false)}>
            Voltar
          </Button>
          <Button variant="contained" sx={{ minHeight: 48 }} onClick={closeTab}>
            Encerrar conta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// -------------------------------------------------------------------- página

const BingoCustomerPage: React.FC = () => {
  useNoIndex();
  const tabId = getTabIdFromPath(window.location.pathname);
  return (
    <Container maxWidth="sm" sx={tabId ? { p: 0 } : { py: 3, px: 2 }}>
      {tabId ? <TabScreen tabId={tabId} /> : <CustomerForm />}
    </Container>
  );
};

export default BingoCustomerPage;
