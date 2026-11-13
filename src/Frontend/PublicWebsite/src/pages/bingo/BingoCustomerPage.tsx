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
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import QRCode from 'qrcode';
import { bingoApi, apiErrorMessage, httpStatus, savedProfile, savedTabId, undeliveredFromError } from '../../services/bingoApi';
import { BingoPublicInfo, BingoTabItem, BingoTabView, BingoUndeliveredItem } from '../../types/bingo';
import { formatBRL, useNoIndex, usePolling } from './bingoHooks';
import MenuPagedCarousel from '../../_shared/comandaFoto/MenuPagedCarousel';

const BIG_BUTTON = { minHeight: 52, fontSize: '1.05rem', fontWeight: 700 } as const;
// Cardapio em carrossel de cards; quantas linhas de cards cabem depende da altura livre da tela.
const SEARCH_H = 44;
const MAX_PER_ITEM = 20;
const normText = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const TAB_PATH = /^\/bingo\/comanda\/([^/?#]+)/;

export const getTabIdFromPath = (pathname: string): string | null => {
  const m = TAB_PATH.exec(pathname);
  return m ? decodeURIComponent(m[1]) : null;
};

const ITEM_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  Pending: { label: 'Pendente', bg: 'warning.light', color: 'common.black' },
  Retrieved: { label: 'A caminho', bg: 'info.light', color: 'common.black' },
  Delivered: { label: 'Entregue', bg: 'success.light', color: 'common.black' },
  Contested: { label: 'Em contestação', bg: 'error.light', color: 'common.black' },
  Cancelled: { label: 'Cancelado', bg: 'grey.300', color: 'text.secondary' },
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const goTo = (path: string) => {
  window.location.replace(path);
};

// ---------------------------------------------------------------- formulário

const CustomerForm: React.FC = () => {
  const [info, setInfo] = useState<BingoPublicInfo | null>(null);
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState(savedProfile.get());
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [mesa, setMesa] = useState('');
  // quantas pessoas a comanda representa: ocupam lugares da mesa (o garçom vê se ainda há vaga)
  const [party, setParty] = useState('1');
  // mesa vinda do QR (garçom ou mesa): o cliente não pode trocar
  const [mesaLocked, setMesaLocked] = useState(false);
  const [mesaSignature, setMesaSignature] = useState<string | undefined>();
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
      .then(async (tab) => {
        if (tab.status === 'Paid') {
          savedTabId.clear();
          setCheckingSaved(false);
          return;
        }
        // Comanda de um evento que já fechou, com outro evento aberto agora (ex.: QR da mesa): a antiga não aceita
        // pedidos, então esquece-a e deixa o formulário abrir uma comanda nova no evento atual. Sem evento aberto,
        // segue para a comanda salva (consultar consumo e encerrar).
        if (!tab.isOpen) {
          const current = await bingoApi.getInfo().catch(() => null);
          if (current?.isOpen) {
            savedTabId.clear();
            setCheckingSaved(false);
            return;
          }
        }
        goTo(`/bingo/comanda/${saved}`);
      })
      .catch((e) => {
        if (httpStatus(e) === 404 || httpStatus(e) === 400) savedTabId.clear();
        setCheckingSaved(false);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('mesa');
    const signature = params.get('s') ?? undefined;
    bingoApi
      .getInfo(wanted ? Number(wanted) : undefined, signature)
      .then((data) => {
        setInfo(data);
        if (wanted && data.mesas.includes(Number(wanted))) {
          setMesa(String(Number(wanted)));
          // só trava quando o servidor confirma a assinatura do QR
          if (data.lockedMesa === Number(wanted)) {
            setMesaLocked(true);
            setMesaSignature(signature);
          }
        }
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
      const res = await bingoApi.createTab({ customerName: name.trim(), phone: digits, mesa: Number(mesa), partySize: Number(party) || 1, mesaSignature: mesaLocked ? mesaSignature : undefined });
      savedTabId.set(res.tabId);
      savedProfile.set(name.trim(), digits);
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
        {profile && (
          <Alert severity="success" icon={false} sx={{ fontWeight: 600 }}
            action={<Button color="inherit" size="small" onClick={() => { savedProfile.clear(); setProfile(null); setName(''); setPhone(''); }}>Não sou eu</Button>}>
            Olá, {profile.name.split(' ')[0]}! Escolha sua mesa para abrir a comanda.
          </Alert>
        )}
        {!profile && (<TextField
          label="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100, style: { minHeight: 28 } } }}
        />)}
        {!profile && (<TextField
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
        />)}
        {mesaLocked ? (
          <TextField label="Sua mesa" value={`Mesa ${mesa}`} fullWidth helperText="Definida pelo QR da mesa." slotProps={{ input: { readOnly: true }, htmlInput: { style: { minHeight: 28, fontWeight: 700 } } }} />
        ) : (
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
        )}
        <TextField
          select
          label="Quantas pessoas?"
          value={party}
          onChange={(e) => setParty(e.target.value)}
          required
          fullWidth
          helperText="Contando com você. Ajuda a casa a saber quantos lugares sobram na mesa."
          slotProps={{ select: { MenuProps: { PaperProps: { style: { maxHeight: 320 } } } } }}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
              {n} {n === 1 ? 'pessoa' : 'pessoas'}
            </MenuItem>
          ))}
        </TextField>

        <Alert severity="info" icon={false} sx={{ fontSize: '0.85rem' }}>
          Usamos seu nome e celular apenas para a comanda do bingo. Eles são apagados em até 30 dias depois do evento se a conta estiver paga. Se a conta ficar em aberto, o celular pode ser usado para um lembrete de pagamento por WhatsApp e é guardado por até 90 dias.
        </Alert>

        <Button type="submit" variant="contained" size="large" disabled={!canSubmit} sx={BIG_BUTTON}>
          {submitting ? 'Abrindo...' : 'Abrir minha comanda'}
        </Button>
      </Stack>
    </Box>
  );
};

// ------------------------------------------------------------------- comanda

/** QR de saida: quem confere abre o link logado como garcom e o servidor confirma o pagamento. */
const ExitQr: React.FC<{ tabId: string }> = ({ tabId }) => {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(`${window.location.origin}/admin/bingo-saida/${tabId}`, { width: 360, margin: 2, errorCorrectionLevel: 'M' })
      .then((u) => { if (!cancelled) setDataUrl(u); })
      .catch(() => { if (!cancelled) setDataUrl(''); });
    return () => { cancelled = true; };
  }, [tabId]);
  if (!dataUrl) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', mb: 2 }}>
      <Typography sx={{ fontWeight: 700 }}>Pagamento confirmado</Typography>
      <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>Mostre este QR na saída.</Typography>
      <Box component="img" src={dataUrl} alt="QR de saída" sx={{ width: 'min(70vw, 260px)', height: 'min(70vw, 260px)' }} />
      <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.6rem', letterSpacing: 4 }}>{tabId.replace(/-/g, '').slice(0, 6).toUpperCase()}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>Se a câmera não ler, informe este código.</Typography>
    </Paper>
  );
};

const TabScreen: React.FC<{ tabId: string }> = ({ tabId }) => {
  const [tab, setTab] = useState<BingoTabView | null>(null);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [undelivered, setUndelivered] = useState<BingoUndeliveredItem[] | null>(null);
  const [contestTarget, setContestTarget] = useState<BingoTabItem | null>(null);
  const [contestNote, setContestNote] = useState('');
  const [view, setView] = useState<'menu' | 'orders'>('menu');
  const [menuSearch, setMenuSearch] = useState('');

  const [code, setCode] = useState('');
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeMsg, setCodeMsg] = useState<{ severity: 'error' | 'success'; text: string } | null>(null);

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
      const next = Math.max(0, Math.min(MAX_PER_ITEM, (c[id] ?? 0) + delta));
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

  const closeTab = async (cancelUndelivered = false) => {
    setConfirmClose(false);
    setUndelivered(null);
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.closeTab(tabId, cancelUndelivered);
      setMessage({ severity: 'success', text: 'Conta solicitada. Um garçom vai até você para o pagamento.' });
      await load();
    } catch (e) {
      const pending = undeliveredFromError(e);
      if (pending) {
        setUndelivered(pending);
      } else {
        setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível encerrar a conta.') });
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelClose = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.cancelClose(tabId);
      setMessage({ severity: 'success', text: 'Pedido de conta cancelado. Pode continuar pedindo.' });
      await load();
    } catch (e) {
      setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível cancelar o pedido de conta.') });
    } finally {
      setBusy(false);
    }
  };

  const [cancelTarget, setCancelTarget] = useState<BingoTabItem | null>(null);
  const sendCancel = async () => {
    if (!cancelTarget) return;
    const item = cancelTarget;
    setCancelTarget(null);
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.cancelItem(tabId, item.id);
      setMessage({ severity: 'success', text: 'Item cancelado.' });
    } catch (e) {
      setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível cancelar o item.') });
    } finally {
      await load();
      setBusy(false);
    }
  };

  const sendContest = async () => {
    if (!contestTarget) return;
    const item = contestTarget;
    setContestTarget(null);
    setBusy(true);
    setMessage(null);
    try {
      await bingoApi.contestItem(tabId, item.id, contestNote.trim() || undefined);
      setContestNote('');
      setMessage({ severity: 'success', text: 'Contestação enviada. Um garçom vai conferir.' });
      await load();
    } catch (e) {
      setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível enviar a contestação.') });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const confirmPhone = async () => {
    if (code.length !== 6) return;
    setCodeBusy(true);
    setCodeMsg(null);
    try {
      await bingoApi.confirmPhone(tabId, code);
      setCode('');
      setTab((t) => (t ? { ...t, phoneVerified: true } : t));
    } catch (e) {
      setCodeMsg({ severity: 'error', text: apiErrorMessage(e, 'Código inválido ou expirado.') });
    } finally {
      setCodeBusy(false);
    }
  };

  const resendCode = async () => {
    setCodeBusy(true);
    setCodeMsg(null);
    try {
      await bingoApi.resendCode(tabId);
      setCodeMsg({ severity: 'success', text: 'Código reenviado no WhatsApp.' });
    } catch (e) {
      setCodeMsg({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível reenviar o código.') });
    } finally {
      setCodeBusy(false);
    }
  };

  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenMesas, setReopenMesas] = useState<number[]>([]);
  const [reopenMesa, setReopenMesa] = useState('');

  const newTab = () => {
    setReopenOpen(true);
    setReopenMesa(tab ? String(tab.mesa) : '');
    bingoApi.getInfo().then((i) => setReopenMesas(i.mesas)).catch(() => setReopenMesas([]));
  };

  const confirmReopen = async () => {
    if (!reopenMesa) return;
    setBusy(true);
    try {
      const res = await bingoApi.reopenTab(tabId, Number(reopenMesa));
      savedTabId.set(res.tabId);
      goTo(`/bingo/comanda/${res.tabId}`);
    } catch (e) {
      setReopenOpen(false);
      setBusy(false);
      if (httpStatus(e) === 409) {
        savedTabId.clear();
        goTo('/bingo');
      } else {
        setMessage({ severity: 'error', text: apiErrorMessage(e, 'Não foi possível abrir a nova comanda.') });
      }
    }
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

  const amountDue = tab.amountDue ?? tab.total;
  const isPaid = tab.status === 'Paid';
  const closeRequested = tab.status === 'CloseRequested';
  const canOrder = tab.isOpen && !isPaid && !closeRequested;

  const activeView = canOrder ? view : 'orders';
  const orderCount = tab.items.reduce((s, i) => s + i.quantity, 0);
  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const notice = (severity: 'success' | 'error' | 'info' | 'warning', text: string, bold = false) => (
    <Alert severity={severity} sx={{ flexShrink: 0, py: 0, px: 1, mb: 0.75, fontSize: '0.8rem', fontWeight: bold ? 700 : 400, '& .MuiAlert-icon': { py: 0.5, mr: 1 }, '& .MuiAlert-message': { py: 0.5 } }}>
      {text}
    </Alert>
  );

  const showCartBar = activeView === 'menu' && canOrder;

  const shownMenu = menuSearch.trim() ? tab.menu.filter((m) => normText(m.name).includes(normText(menuSearch.trim()))) : tab.menu;

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
        <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }}>
          {tab.customerName} · Nº {tab.id.slice(0, 8).toUpperCase()}
          {tab.phoneVerified && (
            <CheckCircleIcon aria-label="Celular confirmado" titleAccess="Celular confirmado" sx={{ fontSize: 20, color: 'success.main' }} />
          )}
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
        {!tab.phoneVerified && (
          <Box data-testid="phone-confirm" sx={{ py: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
              Confirme seu celular: digite o código que chegou no WhatsApp
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                size="small"
                slotProps={{
                  htmlInput: { inputMode: 'numeric', maxLength: 6, 'aria-label': 'Código de confirmação', style: { padding: '6px 8px', width: 84, letterSpacing: 2 } },
                }}
              />
              <Button size="small" variant="contained" disabled={codeBusy || code.length !== 6} onClick={confirmPhone}>
                Confirmar
              </Button>
              <Button size="small" variant="text" disabled={codeBusy} onClick={resendCode} sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0 }}>
                Reenviar código
              </Button>
            </Stack>
            {codeMsg && (
              <Typography role={codeMsg.severity === 'error' ? 'alert' : 'status'} variant="caption" sx={{ display: 'block', color: codeMsg.severity === 'error' ? 'error.main' : 'success.main' }}>
                {codeMsg.text}
              </Typography>
            )}
          </Box>
        )}
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

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', px: 2, pt: 1, pb: 2 }}>
        {error && notice('warning', error)}
        {tab.closeAllRequested && !isPaid && notice('warning', 'Por favor, encerre sua conta.', true)}
        {!tab.isOpen && notice('info', 'Pedidos do bingo fechados no momento.')}
        {isPaid && notice('success', 'Conta paga. Obrigado por participar!')}
        {closeRequested && (
          <Alert
            severity="info"
            action={<Button color="inherit" size="small" disabled={busy} onClick={cancelClose} sx={{ fontWeight: 700 }}>Continuar pedindo</Button>}
            sx={{ flexShrink: 0, py: 0, px: 1, mb: 0.75, fontSize: '0.8rem', '& .MuiAlert-icon': { py: 0.5, mr: 1 }, '& .MuiAlert-message': { py: 0.5 }, '& .MuiAlert-action': { py: 0.25 } }}
          >
            Conta solicitada. Aguarde o garçom.
          </Alert>
        )}

        {activeView === 'menu' && canOrder && (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar item..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              sx={{ flexShrink: 0, mb: 0.5, height: SEARCH_H - 4 }}
              slotProps={{ htmlInput: { 'aria-label': 'Buscar item', style: { fontSize: 16 } } }}
            />
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} data-testid="menu-carousel">
              <MenuPagedCarousel
                resetKey={menuSearch}
                items={shownMenu}
                qty={cart}
                onChange={change}
                maxQty={MAX_PER_ITEM}
                minusLabel={(name) => `Remover ${name}`}
                plusLabel={(name) => `Adicionar ${name}`}
                testIdPrefix="menu-"
                renderBadge={(m) => {
                  const already = orderedByItem[String(m.id)] ?? 0;
                  return already > 0 ? (
                    <Box component="span" data-testid={`ordered-${m.id}`} sx={{ fontWeight: 400, ml: 0.5 }}>
                      ({already})
                    </Box>
                  ) : null;
                }}
              />
            </Box>
          </Box>
        )}

        {activeView === 'orders' && (
          <>
            {tab.items.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7, py: 1 }}>
                Você ainda não fez pedidos.
              </Typography>
            ) : (
              <Box>
                {tab.items.map((i) => {
                  const cancelled = i.status === 'Cancelled';
                  const st = ITEM_STATUS[i.status] ?? ITEM_STATUS.Pending;
                  return (
                    <Box key={i.id} data-testid={`order-${i.id}`} sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            textDecoration: cancelled ? 'line-through' : 'none',
                            color: cancelled ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {i.quantity}x {i.name}
                        </Typography>
                        {i.status === 'Delivered' && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.75 }}>
                            {i.deliveredAt ? `Entregue às ${formatTime(i.deliveredAt)}` : 'Entregue'}
                            {i.deliveredByName ? ` por ${i.deliveredByName}` : ''}
                          </Typography>
                        )}
                        {cancelled && i.cancelReason && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                            Motivo: {i.cancelReason}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textDecoration: cancelled ? 'line-through' : 'none', color: cancelled ? 'text.disabled' : 'text.primary' }}
                      >
                        {formatBRL(i.unitPrice * i.quantity)}
                      </Typography>
                      <Box sx={{ width: 104, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: 1, bgcolor: st.bg, color: st.color }}
                        >
                          {st.label}
                        </Typography>
                        {i.status === 'Pending' && !isPaid && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={busy}
                            onClick={() => setCancelTarget(i)}
                            sx={{ height: 26, minHeight: 26, py: 0, px: 0.5, fontSize: '0.75rem', textTransform: 'none' }}
                          >
                            Cancelar item
                          </Button>
                        )}
                        {i.status === 'Delivered' && !i.contestedAt && (
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            disabled={busy}
                            onClick={() => {
                              setContestNote('');
                              setContestTarget(i);
                            }}
                            sx={{ height: 26, minHeight: 26, py: 0, px: 0.5, fontSize: '0.75rem', textTransform: 'none' }}
                          >
                            Não recebi
                          </Button>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
            <Box sx={{ my: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>Total consumido: {formatBRL(tab.total)}</Typography>
              {amountDue !== tab.total && (
                <Typography data-testid="amount-due" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.05rem' }}>
                  A pagar (itens entregues): {formatBRL(amountDue)}
                </Typography>
              )}
              {(tab.contestedCount ?? 0) > 0 && (
                <Typography variant="caption" sx={{ display: 'block', color: 'warning.dark', fontWeight: 600 }}>
                  Itens em contestação não entram no valor a pagar até serem conferidos.
                </Typography>
              )}
            </Box>

            <Stack spacing={1} sx={{ mb: 2 }}>
              {!isPaid && !closeRequested && (
                <Button variant="outlined" color="warning" sx={{ minHeight: 46, fontWeight: 700 }} disabled={busy} onClick={() => setConfirmClose(true)}>
                  Encerrar a conta
                </Button>
              )}
              {isPaid && <ExitQr tabId={tabId} />}
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
            {cartCount > 0
              ? `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} · ${formatBRL(cartTotal)}`
              : 'Nenhum item selecionado'}
          </Typography>
          <Button variant="contained" sx={{ minHeight: 42, fontWeight: 700 }} disabled={busy || cartCount === 0} onClick={placeOrder}>
            Fazer pedido
          </Button>
        </Box>
      )}

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Encerrar a conta?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A pagar (itens entregues): {formatBRL(amountDue)}. Depois de encerrar, não será possível fazer novos pedidos e um garçom virá
            cobrar na sua mesa.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setConfirmClose(false)}>
            Voltar
          </Button>
          <Button variant="contained" sx={{ minHeight: 48 }} onClick={() => closeTab(false)}>
            Encerrar conta
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reopenOpen} onClose={() => setReopenOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Nova comanda</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Em qual mesa você está?</DialogContentText>
          <TextField select fullWidth label="Sua mesa" value={reopenMesa} onChange={(e) => setReopenMesa(e.target.value)}>
            {reopenMesas.map((n) => (
              <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>Mesa {n}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReopenOpen(false)} sx={{ minHeight: 48 }}>Voltar</Button>
          <Button variant="contained" disabled={!reopenMesa || busy} onClick={confirmReopen} sx={{ minHeight: 48 }}>Abrir comanda</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={undelivered !== null} onClose={() => setUndelivered(null)}>
        <DialogTitle>Itens ainda não entregues</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>Estes itens ainda não chegaram à sua mesa:</DialogContentText>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {(undelivered ?? []).map((u) => (
              <li key={u.id}>
                {u.quantity}x {u.name}
              </li>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
          <Button variant="contained" sx={BIG_BUTTON} onClick={() => setUndelivered(null)}>
            Aguardar a entrega
          </Button>
          <Button variant="outlined" color="warning" sx={BIG_BUTTON} onClick={() => closeTab(true)}>
            Cancelar esses itens e encerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelTarget !== null} onClose={() => setCancelTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancelar este item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {cancelTarget ? `${cancelTarget.quantity}x ${cancelTarget.name}` : ''}
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>Só é possível enquanto o garçom ainda não retirou o item.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelTarget(null)} sx={{ minHeight: 48 }}>Voltar</Button>
          <Button variant="contained" color="error" onClick={sendCancel} sx={{ minHeight: 48 }}>Cancelar item</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={contestTarget !== null} onClose={() => setContestTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Não recebi este item</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            {contestTarget ? `${contestTarget.quantity}x ${contestTarget.name}` : ''}
          </DialogContentText>
          <TextField
            label="Observação (opcional)"
            value={contestNote}
            onChange={(e) => setContestNote(e.target.value.slice(0, 200))}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button sx={{ minHeight: 44 }} onClick={() => setContestTarget(null)}>
            Voltar
          </Button>
          <Button variant="contained" sx={{ minHeight: 44 }} onClick={sendContest}>
            Confirmar
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
