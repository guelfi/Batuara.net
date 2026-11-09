import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import bingoWaiterApi, { ExitCheck } from '../services/bingoWaiterApi';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hhmm = (iso: string | null) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
};

const BingoExitPage: React.FC = () => {
  const { tabId = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ExitCheck | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await bingoWaiterApi.getExit(tabId));
      setError('');
    } catch (e: any) {
      const status = e?.response?.status;
      setData(null);
      setError(
        status === 404 ? 'Comanda inválida.'
          : status === 401 || status === 403 ? 'Você não está escalado como garçom ou o evento não está aberto.'
            : 'Não foi possível conferir. Tente novamente.'
      );
    }
  }, [tabId]);

  useEffect(() => {
    void load();
  }, [load]);

  const release = async () => {
    setBusy(true);
    try {
      setData(await bingoWaiterApi.releaseExit(tabId));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Não foi possível liberar a saída.');
    } finally {
      setBusy(false);
    }
  };

  if (!data && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }
  if (!data) return <Alert severity="error">{error}</Alert>;

  const ok = data.paid;
  const already = ok && !!data.exitCheckedAt;
  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
      <Box sx={{ bgcolor: !ok ? 'error.main' : already ? 'warning.main' : 'success.main', color: '#fff', borderRadius: 2, p: 3, mb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>{!ok ? 'NÃO PAGA' : already ? 'JÁ CONFERIDA' : 'PAGO'}</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>Mesa {data.mesa} · {data.customerName}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{money(ok ? data.amountDue : data.total)}</Typography>
        {ok && data.paidAt && (
          <Typography>pago às {hhmm(data.paidAt)}{data.paymentMethod ? ` (${data.paymentMethod})` : ''}</Typography>
        )}
        {already && <Typography sx={{ mt: 1 }}>saída conferida às {hhmm(data.exitCheckedAt)} por {data.exitCheckedByName}</Typography>}
        {!ok && <Typography sx={{ mt: 1 }}>Falta receber {money(data.amountDue)}. Encaminhe ao caixa.</Typography>}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button variant="outlined" size="large" fullWidth onClick={() => navigate('/bingo-garcom', { state: { tab: 4 } })} sx={{ minHeight: 52, fontWeight: 700, mb: 1 }}>
        Conferir outra comanda
      </Button>
      {ok && !already && (
        <Button variant="contained" color="success" size="large" fullWidth disabled={busy} onClick={release} sx={{ minHeight: 56, fontWeight: 700 }}>
          Liberar saída
        </Button>
      )}
    </Box>
  );
};

export default BingoExitPage;
