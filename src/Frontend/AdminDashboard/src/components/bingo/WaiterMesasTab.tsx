import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, MenuItem, TextField } from '@mui/material';
import QRCode from 'qrcode';
import bingoApi from '../../services/bingoApi';
import { useFillViewport } from '../../_shared/comandaFoto/useFillViewport';
import WaiterTablesStatus from './WaiterTablesStatus';

/**
 * Aba Mesas do garçom. Sem mesa escolhida: caixa de seleção e a grade com a situação de cada mesa.
 * Com mesa escolhida: só o card da mesa, o QR (que usa o espaço que sobra, inteiro, sem rolar) e o botão de voltar.
 */
const WaiterMesasTab: React.FC<{ mesas: number[] }> = ({ mesas }) => {
  const [mesa, setMesa] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const fitHeight = useFillViewport(rootRef, 300);
  const [qrBox, setQrBox] = useState<HTMLDivElement | null>(null);
  const [qrSize, setQrSize] = useState(0);

  useEffect(() => {
    if (!qrBox) return undefined;
    const measure = () => setQrSize(Math.floor(Math.min(qrBox.clientWidth, qrBox.clientHeight)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(qrBox);
    return () => observer.disconnect();
  }, [qrBox]);

  useEffect(() => {
    setQrError('');
    if (!mesa) {
      setDataUrl('');
      return undefined;
    }
    let cancelled = false;
    // o servidor devolve o link assinado: o cliente não consegue trocar a mesa
    bingoApi
      .getMesaQrUrl(Number(mesa))
      .then((url) => QRCode.toDataURL(url, { width: 900, margin: 2, errorCorrectionLevel: 'M' }))
      .then((u) => {
        if (!cancelled) setDataUrl(u);
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setQrError('Não foi possível gerar o QR da mesa. Tente novamente.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mesa]);

  return (
    <Box ref={rootRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden', ...(fitHeight ? { height: fitHeight } : {}) }}>
      {/* com a mesa à vista (card + QR) a caixa de seleção sai do caminho */}
      {!mesa && (
        <TextField select fullWidth label="Selecionar mesa" value={mesa} onChange={(e) => setMesa(e.target.value)} sx={{ flexShrink: 0 }}>
          {mesas.map((n) => (
            <MenuItem key={n} value={String(n)} sx={{ minHeight: 48 }}>
              Mesa {n}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Box sx={mesa ? { flexShrink: 0 } : { flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <WaiterTablesStatus selected={mesa} onSelect={setMesa} />
      </Box>

      {qrError && <Alert severity="error" sx={{ flexShrink: 0 }}>{qrError}</Alert>}
      {mesa && dataUrl && (
        <Box ref={setQrBox} sx={{ flex: 1, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {qrSize > 0 && (
            <Box
              component="img"
              src={dataUrl}
              alt={`QR code da mesa ${mesa}`}
              sx={{ width: qrSize, height: qrSize, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}
            />
          )}
        </Box>
      )}

      {mesa && (
        <Button variant="outlined" fullWidth onClick={() => setMesa('')} sx={{ flexShrink: 0 }}>
          Voltar às mesas
        </Button>
      )}
    </Box>
  );
};

export default WaiterMesasTab;
