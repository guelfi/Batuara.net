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
          helperText={phone.length > 0 && !phoneOk ? 'Informe um celular com DDD' : ' '}
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
      setMessage({ severity: 'success', text: 'Pedido enviado! Um garçom vai levar até a sua mesa.' });
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

  const resend = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.resendLink(tabId);
      setMessage({ severity: 'success', text: 'Link reenviado para o seu WhatsApp.' });
    } catch (e) {
      if (httpStatus(e) === 429) {
        setMessage({
          severity: 'info',
          text: 'O link já foi enviado há pouco. Aguarde alguns minutos para pedir de novo.',
        });
      } else {
        setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível reenviar o link agora.') });
      }
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

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="overline" sx={{ opacity: 0.7 }}>
          {tab.eventName ? `Bingo - ${tab.eventName}` : 'Comanda do bingo'}
        </Typography>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          {tab.customerName}
        </Typography>
        <Typography variant="h6" color="primary">
          Mesa {tab.mesa}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Nº {tab.id.slice(0, 8).toUpperCase()}
        </Typography>
      </Paper>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {tab.closeAllRequested && !isPaid && (
        <Alert severity="warning" sx={{ mb: 2, fontWeight: 700 }}>
          Por favor, encerre sua conta.
        </Alert>
      )}
      {!tab.isOpen && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Os pedidos do bingo não estão abertos. Novos pedidos não são aceitos no momento.
        </Alert>
      )}
      {isPaid && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Conta paga. Obrigado por participar!
        </Alert>
      )}
      {closeRequested && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Conta solicitada. Aguarde o garçom para o pagamento.
        </Alert>
      )}
      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {canOrder && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Cardápio
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {tab.menu.map((m) => {
              const qty = cart[m.id] ?? 0;
              return (
                <Paper
                  key={m.id}
                  variant="outlined"
                  data-testid={`menu-${m.id}`}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: m.isAvailable ? 1 : 0.5,
                    bgcolor: m.isAvailable ? 'background.paper' : 'action.disabledBackground',
                    color: m.isAvailable ? 'text.primary' : 'text.disabled',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>{m.name}</Typography>
                    <Typography variant="body2">
                      {m.isAvailable ? formatBRL(m.unitPrice) : `${formatBRL(m.unitPrice)} - Esgotado`}
                    </Typography>
                  </Box>
                  {m.isAvailable && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton
                        aria-label={`Remover ${m.name}`}
                        onClick={() => change(m.id, -1)}
                        disabled={qty === 0}
                        sx={{ width: 48, height: 48, border: 1, borderColor: 'divider' }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700 }}>{qty}</Typography>
                      <IconButton
                        aria-label={`Adicionar ${m.name}`}
                        onClick={() => change(m.id, 1)}
                        disabled={qty >= 20}
                        sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Carrinho
            </Typography>
            {cartLines.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Nenhum item selecionado.
              </Typography>
            ) : (
              <Stack spacing={0.5} sx={{ mb: 1 }}>
                {cartLines.map((l) => (
                  <Box key={l.item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {l.quantity}x {l.item.name}
                    </span>
                    <span>{formatBRL(l.item.unitPrice * l.quantity)}</span>
                  </Box>
                ))}
              </Stack>
            )}
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Total do pedido: {formatBRL(cartTotal)}</Typography>
            <Button
              fullWidth
              variant="contained"
              sx={BIG_BUTTON}
              disabled={cartLines.length === 0 || busy}
              onClick={placeOrder}
            >
              Fazer pedido
            </Button>
          </Paper>
        </>
      )}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Meus pedidos
      </Typography>
      {tab.items.length === 0 ? (
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
          Você ainda não fez pedidos.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {tab.items.map((i) => (
            <Paper key={i.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {i.quantity}x {i.name}
                </Typography>
                <Typography variant="body2">{formatBRL(i.unitPrice * i.quantity)}</Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: i.status === 'Delivered' ? 'success.light' : 'warning.light',
                  color: 'common.black',
                }}
              >
                {i.status === 'Delivered' ? 'Entregue' : 'Pendente'}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Total consumido: {formatBRL(tab.total)}
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {!isPaid && !closeRequested && (
          <Button variant="outlined" color="warning" sx={BIG_BUTTON} disabled={busy} onClick={() => setConfirmClose(true)}>
            Encerrar a conta
          </Button>
        )}
        {!isPaid && (
          <Button variant="outlined" sx={BIG_BUTTON} disabled={busy} onClick={resend}>
            Reenviar link no WhatsApp
          </Button>
        )}
        {isPaid && (
          <Button variant="contained" sx={BIG_BUTTON} onClick={newTab}>
            Abrir nova comanda
          </Button>
        )}
      </Stack>

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
    <Container maxWidth="sm" sx={{ py: 3, px: 2 }}>
      {tabId ? <TabScreen tabId={tabId} /> : <CustomerForm />}
    </Container>
  );
};

export default BingoCustomerPage;
