import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveIcon from '@mui/icons-material/Remove';

/** Altura da faixa com as setas e o indicador de posição. */
export const CAROUSEL_HEADER_H = 40;

// Tamanhos fixos: o tema de quem hospeda o componente (o Admin dá padding 12 a todo IconButton) não pode inflar os botões.
const QTY_BTN = { width: 32, height: 32, minWidth: 0, minHeight: 0, p: 0 } as const;
const ARROW_BTN = { width: 36, height: 36, minWidth: 0, minHeight: 0, p: 0 } as const;

export interface CarouselItem {
  id: string | number;
  name: string;
  unitPrice: number;
  /** false = esgotado: a linha mostra "Esgotado" no lugar dos controles. */
  isAvailable?: boolean;
}

interface QtyControlsProps {
  name: string;
  quantity: number;
  onChange: (delta: number) => void;
  max?: number;
  minusLabel?: string;
  plusLabel?: string;
}

/** − qtd + usado nas linhas do cardápio e nos itens fora do cardápio. */
export const QtyControls: React.FC<QtyControlsProps> = ({ name, quantity, onChange, max, minusLabel, plusLabel }) => (
  <Stack direction="row" alignItems="center" spacing={0.5}>
    <IconButton size="small" aria-label={minusLabel ?? `Menos ${name}`} disabled={quantity === 0} onClick={() => onChange(-1)} sx={{ ...QTY_BTN, border: 1, borderColor: 'divider' }}>
      <RemoveIcon fontSize="small" />
    </IconButton>
    <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }} aria-label={`Quantidade de ${name}`}>
      {quantity}
    </Typography>
    <IconButton
      size="small"
      aria-label={plusLabel ?? `Mais ${name}`}
      disabled={max !== undefined && quantity >= max}
      onClick={() => onChange(1)}
      sx={{ ...QTY_BTN, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
    >
      <AddIcon fontSize="small" />
    </IconButton>
  </Stack>
);

interface CarouselControlsProps {
  first: number;
  last: number;
  total: number;
  /** Indicador curto ("1–6/18") e botões pequenos, para linhas apertadas. */
  compact?: boolean;
  /** O que está sendo paginado (padrão "Itens"; ex.: "Mesas"). */
  noun?: string;
  onPrev: () => void;
  onNext: () => void;
}

/** Setas e indicador de posição dos carrosséis. */
export const CarouselControls: React.FC<CarouselControlsProps> = ({ first, last, total, compact, noun = 'Itens', onPrev, onNext }) => (
  <Stack direction="row" justifyContent="center" alignItems="center" spacing={compact ? 0.5 : 1} sx={{ height: CAROUSEL_HEADER_H, flexShrink: 0 }}>
    <IconButton aria-label={noun === 'Itens' ? 'Itens anteriores' : `${noun} anteriores`} size="small" disabled={first <= 1} onClick={onPrev} sx={ARROW_BTN}>
      <ChevronLeftIcon />
    </IconButton>
    <Typography variant="body2" fontWeight={600} aria-live="polite" aria-label={`${noun} ${first} a ${last} de ${total}`} noWrap>
      {compact ? `${first}–${last}/${total}` : `${noun} ${first}–${last} de ${total}`}
    </Typography>
    <IconButton aria-label={noun === 'Itens' ? 'Próximos itens' : `Próximas ${noun.toLowerCase()}`} size="small" disabled={last >= total} onClick={onNext} sx={ARROW_BTN}>
      <ChevronRightIcon />
    </IconButton>
  </Stack>
);

// − e + só como ícone (sem círculo de botão): ocupam pouco e deixam mais largura para o texto da linha
const ICON_BTN = { width: 30, height: 30, minWidth: 0, minHeight: 0, p: 0 } as const;

/** − qtd + compacto: ícones pequenos e a quantidade no meio. */
export const QtyIcons: React.FC<QtyControlsProps> = ({ name, quantity, onChange, max, minusLabel, plusLabel }) => (
  <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
    <IconButton size="small" aria-label={minusLabel ?? `Menos ${name}`} disabled={quantity === 0} onClick={() => onChange(-1)} sx={{ ...ICON_BTN, color: 'text.secondary' }}>
      <RemoveCircleOutlineIcon sx={{ fontSize: 24 }} />
    </IconButton>
    <Typography fontWeight={700} sx={{ minWidth: 20, textAlign: 'center', fontSize: '0.9rem' }} aria-label={`Quantidade de ${name}`}>
      {quantity}
    </Typography>
    <IconButton
      size="small"
      aria-label={plusLabel ?? `Mais ${name}`}
      disabled={max !== undefined && quantity >= max}
      onClick={() => onChange(1)}
      sx={{ ...ICON_BTN, color: 'primary.main' }}
    >
      <AddCircleIcon sx={{ fontSize: 28 }} />
    </IconButton>
  </Stack>
);
