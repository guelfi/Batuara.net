import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';

/** Altura da faixa com as setas e o indicador de posição. */
export const CAROUSEL_HEADER_H = 40;

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
    <IconButton size="small" aria-label={minusLabel ?? `Menos ${name}`} disabled={quantity === 0} onClick={() => onChange(-1)} sx={{ border: 1, borderColor: 'divider' }}>
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
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
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
  onPrev: () => void;
  onNext: () => void;
}

/** Setas e indicador de posição dos carrosséis. */
export const CarouselControls: React.FC<CarouselControlsProps> = ({ first, last, total, compact, onPrev, onNext }) => (
  <Stack direction="row" justifyContent="center" alignItems="center" spacing={compact ? 0.5 : 1} sx={{ height: CAROUSEL_HEADER_H, flexShrink: 0 }}>
    <IconButton aria-label="Itens anteriores" size={compact ? 'small' : 'medium'} disabled={first <= 1} onClick={onPrev}>
      <ChevronLeftIcon />
    </IconButton>
    <Typography variant="body2" fontWeight={600} aria-live="polite" aria-label={`Itens ${first} a ${last} de ${total}`} noWrap>
      {compact ? `${first}–${last}/${total}` : `Itens ${first}–${last} de ${total}`}
    </Typography>
    <IconButton aria-label="Próximos itens" size={compact ? 'small' : 'medium'} disabled={last >= total} onClick={onNext}>
      <ChevronRightIcon />
    </IconButton>
  </Stack>
);
