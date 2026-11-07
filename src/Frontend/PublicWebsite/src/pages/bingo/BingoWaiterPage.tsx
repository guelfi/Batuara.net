import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import QRCode from 'qrcode';
import { bingoApi, apiErrorMessage, httpStatus, waiterSession } from '../../services/bingoApi';
import { BingoPaymentMethod, WaiterAccount, WaiterOrderGroup } from '../../types/bingo';
import { formatBRL, useNoIndex, usePolling } from './bingoHooks';

const BIG = { minHeight: 56, fontSize: '1.1rem', fontWeight: 700 } as const;
const QR_BASE_URL = 'https://www.batuara.org.br/bingo';

export const bingoQrUrl = (mesa: number) => `${QR_BASE_URL}?mesa=${mesa}`;

// -------------------------------------------------------------------- login

const WaiterLogin: React.FC<{ onLogged: () => void; notice?: string }> = ({ onLogged, notice }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await bingoApi.waiterRequestCode(phone.replace(/\D/g, ''));
      setStep('code');
    } catch (err) {
      setError(
        httpStatus(err) === 429
          ? 'Muitas tentativas. Aguarde um pouco e tente de novo.'
          : apiErrorMessage(err, 'Não foi possível enviar o código.')
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await bingoApi.waiterVerifyCode(phone.replace(/\D/g, ''), code.trim());
      waiterSession.save(res);
      onLogged();
    } catch (err) {
      const status = httpStatus(err);
      if (status === 403) setError('Você não está escalado como garçom neste evento.');
      else if (status === 401) setError('Código inválido ou expirado.');
      else setError(apiErrorMessage(err, 'Não foi possível entrar.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
        Bingo - Garçom
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
        Entre com o celular cadastrado na Casa. Você receberá um código no WhatsApp.
      </Typography>
      {notice && <Alert severity="warning" sx={{ mb: 2 }}>{notice}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {step === 'phone' ? (
        <Stack component="form" spacing={2} onSubmit={requestCode}>
          <TextField
            label="Celular (com DDD)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { inputMode: 'tel', style: { minHeight: 28 } } }}
          />
          <Button type="submit" variant="contained" sx={BIG} disabled={busy || phone.replace(/\D/g, '').length < 10}>
            Enviar código
          </Button>
        </Stack>
      ) : (
        <Stack component="form" spacing={2} onSubmit={verify}>
          <TextField
            label="Código recebido"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            autoFocus
            slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'one-time-code', style: { minHeight: 28 } } }}
          />
          <Button type="submit" variant="contained" sx={BIG} disabled={busy || code.trim().length < 4}>
            Entrar
          </Button>
          <Button sx={{ minHeight: 48 }} onClick={() => { setStep('phone'); setCode(''); setError(''); }}>
            Trocar o celular
          </Button>
        </Stack>
      )}
    </Container>
  );
};

// ------------------------------------------------------------------ pedidos

const OrdersTab: React.FC<{ onAuthError: (e: unknown) => boolean }> = ({ onAuthError }) => {
  const [groups, setGroups] = useState<WaiterOrderGroup[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setGroups(await bingoApi.waiterOrders());
      setError('');
    } catch (e) {
      if (!onAuthError(e)) setError('Sem conexão. Tentando novamente...');
    }
  }, [onAuthError]);

  usePolling(load, true);

  const deliver = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await bingoApi.waiterDeliver(itemId);
      await load();
    } catch (e) {
      if (!onAuthError(e)) setError(apiErrorMessage(e, 'Não foi possível dar baixa no item.'));
    } finally {
      setBusyId(null);
    }
  };

  // Mais antigos primeiro (o servidor já ordena; reforça pela data do item mais antigo do grupo).
  const sorted = useMemo(() => {
    const oldest = (g: WaiterOrderGroup) =>
      Math.min(...g.items.map((i) => new Date(i.createdAt).getTime()), Number.MAX_SAFE_INTEGER);
    return [...(groups ?? [])].sort((a, b) => oldest(a) - oldest(b));
  }, [groups]);

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {groups && sorted.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhum pedido pendente.</Typography>}
      <Stack spacing={2}>
        {sorted.map((g) => (
          <Paper key={g.tabId} variant="outlined" sx={{ p: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Mesa {g.mesa} - {g.customerName}
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {g.items.map((i) => (
                <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ flex: 1 }}>
                    {i.quantity}x {i.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ minHeight: 52, minWidth: 110, fontWeight: 700 }}
                    disabled={busyId === i.id}
                    onClick={() => deliver(i.id)}
                  >
                    Entregue
                  </Button>
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// ------------------------------------------------------------------- contas

const METHODS: { value: BingoPaymentMethod; label: string }[] = [
  { value: 'Card', label: 'Cartão' },
  { value: 'Pix', label: 'Pix' },
  { value: 'Cash', label: 'Dinheiro' },
];

const AccountsTab: React.FC<{ onAuthError: (e: unknown) => boolean; mesas: number[] }> = ({ onAuthError, mesas }) => {
  const [accounts, setAccounts] = useState<WaiterAccount[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [method, setMethod] = useState<BingoPaymentMethod | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [editing, setEditing] = useState<WaiterAccount | null>(null);
  const [newMesa, setNewMesa] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await bingoApi.waiterAccounts();
      setAccounts(list);
      setSelected((sel) => sel.filter((id) => list.some((a) => a.tabId === id)));
      setError('');
    } catch (e) {
      if (!onAuthError(e)) setError('Sem conexão. Tentando novamente...');
    }
  }, [onAuthError]);

  usePolling(load, true);

  const selectedMesa = useMemo(
    () => accounts?.find((a) => a.tabId === selected[0])?.mesa ?? null,
    [accounts, selected]
  );
  const selectedAccounts = (accounts ?? []).filter((a) => selected.includes(a.tabId));
  const selectedTotal = selectedAccounts.reduce((s, a) => s + a.total, 0);

  const toggle = (a: WaiterAccount) =>
    setSelected((sel) => (sel.includes(a.tabId) ? sel.filter((id) => id !== a.tabId) : [...sel, a.tabId]));

  const pay = async () => {
    if (!method || selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await bingoApi.waiterPay(selected, method);
      setOk(`Pagamento registrado (${formatBRL(selectedTotal)}).`);
      setSelected([]);
      setMethod(null);
      setConfirm(false);
      await load();
    } catch (e) {
      setConfirm(false);
      if (!onAuthError(e)) setError(apiErrorMessage(e, 'Não foi possível registrar o pagamento.'));
    } finally {
      setBusy(false);
    }
  };

  const saveMesa = async () => {
    if (!editing || !newMesa) return;
    setBusy(true);
    try {
      await bingoApi.waiterChangeTable(editing.tabId, Number(newMesa));
      setEditing(null);
      await load();
    } catch (e) {
      if (!onAuthError(e)) setError(apiErrorMessage(e, 'Não foi possível corrigir a mesa.'));
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ pb: selected.length ? 24 : 2 }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setOk('')}>{ok}</Alert>}
      {accounts && accounts.length === 0 && <Typography sx={{ opacity: 0.7 }}>Nenhuma conta para cobrar.</Typography>}
      <Stack spacing={1.5}>
        {(accounts ?? []).map((a) => {
          const disabled = selectedMesa !== null && a.mesa !== selectedMesa;
          return (
            <Paper key={a.tabId} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, opacity: disabled ? 0.5 : 1 }}>
              <Checkbox
                checked={selected.includes(a.tabId)}
                disabled={disabled}
                onChange={() => toggle(a)}
                slotProps={{ input: { 'aria-label': `Selecionar ${a.customerName}` } }}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 32 }, p: 1.5 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>
                  Mesa {a.mesa} - {a.customerName}
                </Typography>
                <Typography variant="body2">
                  {formatBRL(a.total)} · {a.status === 'CloseRequested' ? 'Pediu a conta' : 'Em aberto'}
                </Typography>
              </Box>
              <Button
                sx={{ minHeight: 48 }}
                onClick={() => {
                  setEditing(a);
                  setNewMesa(String(a.mesa));
                }}
              >
                Mesa
              </Button>
            </Paper>
          );
        })}
      </Stack>

      {selected.length > 0 && (
        <Paper
          elevation={8}
          sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, p: 2, zIndex: 1200, borderRadius: '16px 16px 0 0' }}
        >
          <Container maxWidth="sm" disableGutters>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Mesa {selectedMesa} · {selected.length} comanda(s) · {formatBRL(selectedTotal)}
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={method}
              onChange={(_, v) => setMethod(v)}
              sx={{ mb: 1.5 }}
            >
              {METHODS.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ minHeight: 56, fontWeight: 700 }}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button fullWidth variant="contained" color="success" sx={BIG} disabled={!method || busy} onClick={() => setConfirm(true)}>
              Confirmar pagamento
            </Button>
          </Container>
        </Paper>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>Confirmar pagamento?</DialogTitle>
        <DialogContent>
          <Typography>
            Mesa {selectedMesa}: {formatBRL(selectedTotal)} em {METHODS.find((m) => m.value === method)?.label}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setConfirm(false)}>Voltar</Button>
          <Button variant="contained" color="success" sx={{ minHeight: 48 }} disabled={busy} onClick={pay}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Corrigir mesa de {editing?.customerName}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Mesa" value={newMesa} onChange={(e) => setNewMesa(e.target.value)} sx={{ mt: 1 }}>
            {mesas.map((n) => (
              <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
                Mesa {n}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button sx={{ minHeight: 48 }} onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" sx={{ minHeight: 48 }} disabled={busy || !newMesa} onClick={saveMesa}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ----------------------------------------------------------------------- QR

const QrTab: React.FC<{ mesas: number[] }> = ({ mesas }) => {
  const [mesa, setMesa] = useState('');
  const [full, setFull] = useState(false);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!full || !mesa) return;
    let cancelled = false;
    QRCode.toDataURL(bingoQrUrl(Number(mesa)), { width: 900, margin: 2, errorCorrectionLevel: 'M' })
      .then((u) => {
        if (!cancelled) setDataUrl(u);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [full, mesa]);

  return (
    <Stack spacing={2}>
      <TextField select fullWidth label="Mesa do cliente" value={mesa} onChange={(e) => setMesa(e.target.value)}>
        {mesas.map((n) => (
          <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
            Mesa {n}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" sx={BIG} disabled={!mesa} onClick={() => setFull(true)}>
        Mostrar QR para o cliente
      </Button>

      {full && (
        <Box
          role="button"
          aria-label="Fechar QR"
          onClick={() => setFull(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            bgcolor: '#fff',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', mb: 1 }}>Mesa {mesa} - Aponte a câmera</Typography>
          {dataUrl && (
            <Box
              component="img"
              src={dataUrl}
              alt={`QR code da mesa ${mesa}`}
              sx={{ width: 'min(90vw, 70vh)', height: 'min(90vw, 70vh)' }}
            />
          )}
          <Typography sx={{ mt: 1, fontSize: '1.1rem', wordBreak: 'break-all' }}>{bingoQrUrl(Number(mesa))}</Typography>
          <Typography variant="caption" sx={{ mt: 2, opacity: 0.6 }}>
            Toque para fechar
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

// ------------------------------------------------------------------- página

const BingoWaiterPage: React.FC = () => {
  useNoIndex();
  const [logged, setLogged] = useState(() => !!waiterSession.getToken());
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState(0);
  const [mesas, setMesas] = useState<number[]>([]);
  const [eventOpen, setEventOpen] = useState(true);
  const [eventName, setEventName] = useState('');

  const logout = useCallback((msg = '') => {
    waiterSession.clear();
    setNotice(msg);
    setLogged(false);
  }, []);

  /** Retorna true se o erro era de autenticação/autorização (e já voltou ao login). */
  const onAuthError = useCallback(
    (e: unknown) => {
      const status = httpStatus(e);
      if (status === 401 || status === 403) {
        logout('Sua sessão terminou ou você não está mais escalado. Entre novamente.');
        return true;
      }
      return false;
    },
    [logout]
  );

  useEffect(() => {
    if (!logged) return;
    const refresh = () =>
      bingoApi
        .getInfo()
        .then((i) => {
          setMesas(i.mesas);
          setEventOpen(i.isOpen);
          setEventName(i.eventName ?? '');
        })
        .catch(() => undefined);
    refresh();
    const t = setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
    return () => clearInterval(t);
  }, [logged]);

  if (!logged) {
    return (
      <WaiterLogin
        notice={notice}
        onLogged={() => {
          setNotice('');
          setLogged(true);
        }}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1, minHeight: 56 }}>
          <Typography sx={{ flex: 1, fontWeight: 700 }}>Garçom: {waiterSession.getName() ?? ''}</Typography>
          <Button sx={{ minHeight: 48 }} onClick={() => logout()}>
            Sair
          </Button>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Pedidos" sx={{ minHeight: 56, fontWeight: 700 }} />
          <Tab label="Contas" sx={{ minHeight: 56, fontWeight: 700 }} />
          <Tab label="QR" sx={{ minHeight: 56, fontWeight: 700 }} />
        </Tabs>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 2, px: 2 }}>
        {eventName && <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>{eventName}</Typography>}
        {!eventOpen && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Os pedidos do bingo ainda não foram abertos.
          </Alert>
        )}
        {tab === 0 && <OrdersTab onAuthError={onAuthError} />}
        {tab === 1 && <AccountsTab onAuthError={onAuthError} mesas={mesas} />}
        {tab === 2 && <QrTab mesas={mesas} />}
      </Container>
    </Box>
  );
};

export default BingoWaiterPage;
