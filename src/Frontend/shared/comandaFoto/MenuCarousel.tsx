import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';
import { brl } from './comandaUtils';

export const CARD_GAP = 8;
/** Altura mínima de um card; quem tem altura fixa de tela usa para saber quantas linhas cabem. */
export const CARD_MIN_H = 112;
/** Altura da faixa com as setas e o indicador de posição. */
export const CAROUSEL_HEADER_H = 40;
/** Largura do card: dois cards inteiros e um pedaço do próximo, mostrando que dá para arrastar. */
const CARD_BASIS = '42%';

export interface CarouselItem {
  id: string | number;
  name: string;
  unitPrice: number;
  /** false = esgotado: o card mostra "Esgotado" no lugar dos controles. */
  isAvailable?: boolean;
}

type QtyMap = { [id: string]: number } | { [id: number]: number };
const qtyOf = (qty: QtyMap, id: string | number): number => (qty as Record<string, number>)[String(id)] ?? 0;

interface QtyControlsProps {
  name: string;
  quantity: number;
  onChange: (delta: number) => void;
  max?: number;
  minusLabel?: string;
  plusLabel?: string;
}

/** − qtd + usado nos cards e na faixa "Na comanda". */
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

interface MenuCarouselProps<T extends CarouselItem> {
  items: T[];
  qty: QtyMap;
  onChange: (id: T['id'], delta: number) => void;
  label?: string;
  /** Linhas de cards por coluna (rolagem lateral). Padrão 1. */
  rows?: number;
  /** Quantidade máxima por item (o "+" desabilita ao atingir). */
  maxQty?: number;
  minusLabel?: (name: string) => string;
  plusLabel?: (name: string) => string;
  /** Texto extra ao lado do nome (ex.: quantidade já pedida). */
  renderBadge?: (item: T) => React.ReactNode;
  testIdPrefix?: string;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Cardápio em cards com rolagem lateral (arrastar, setas ou teclado).
 * Mantém a ordem recebida: tocar em "+" nunca muda um card de lugar.
 * Com `rows` > 1 os cards se organizam em colunas de várias linhas, aproveitando a altura disponível.
 */
function MenuCarousel<T extends CarouselItem>({
  items,
  qty,
  onChange,
  label = 'Cardápio',
  rows = 1,
  maxQty,
  minusLabel,
  plusLabel,
  renderBadge,
  testIdPrefix,
}: MenuCarouselProps<T>): React.ReactElement {
  const trackRef = useRef<HTMLDivElement>(null);
  const perColumn = Math.max(1, Math.floor(rows));
  const [range, setRange] = useState({ first: 1, last: Math.min(items.length, 2 * perColumn) });

  const updateRange = useCallback(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) {
      setRange({ first: 0, last: 0 });
      return;
    }
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? el.clientWidth / 2) + CARD_GAP;
    const column = Math.max(0, Math.round(el.scrollLeft / step));
    const visibleColumns = Math.max(1, Math.floor((el.clientWidth + CARD_GAP) / step));
    setRange({
      first: Math.min(items.length, column * perColumn + 1),
      last: Math.min(items.length, (column + visibleColumns) * perColumn),
    });
  }, [items.length, perColumn]);

  // nova busca ou novo número de linhas: volta ao primeiro card
  useEffect(() => {
    trackRef.current?.scrollTo?.({ left: 0 });
    updateRange();
  }, [items, perColumn, updateRange]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy?.({ left: dir * el.clientWidth * 0.84, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }} align="center">
        Nenhum item encontrado.
      </Typography>
    );
  }

  return (
    <Box role="group" aria-roledescription="carrossel" aria-label={label}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ height: CAROUSEL_HEADER_H }}>
        <IconButton aria-label="Itens anteriores" disabled={range.first <= 1} onClick={() => scrollByCards(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="body2" fontWeight={600} aria-live="polite">
          Itens {range.first}–{range.last} de {items.length}
        </Typography>
        <IconButton aria-label="Próximos itens" disabled={range.last >= items.length} onClick={() => scrollByCards(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Box
        ref={trackRef}
        onScroll={updateRange}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${perColumn}, minmax(${CARD_MIN_H}px, auto))`,
          gridAutoColumns: CARD_BASIS,
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          pb: 1,
        }}
      >
        {items.map((m) => {
          const q = qtyOf(qty, m.id);
          const available = m.isAvailable !== false;
          return (
            <Box
              key={m.id}
              role="group"
              aria-label={m.name}
              data-testid={testIdPrefix ? `${testIdPrefix}${m.id}` : undefined}
              sx={{
                scrollSnapAlign: 'start',
                border: 1,
                borderColor: q > 0 ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                opacity: available ? 1 : 0.5,
                color: available ? 'text.primary' : 'text.disabled',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                title={m.name}
              >
                {m.name}
                {renderBadge?.(m)}
              </Typography>
              <Box>
                <Typography variant="body2" color="inherit" sx={{ mb: 0.5 }}>
                  {brl(m.unitPrice)}
                </Typography>
                {available ? (
                  <QtyControls
                    name={m.name}
                    quantity={q}
                    max={maxQty}
                    minusLabel={minusLabel?.(m.name)}
                    plusLabel={plusLabel?.(m.name)}
                    onChange={(d) => onChange(m.id, d)}
                  />
                ) : (
                  <Typography variant="caption" fontWeight={700}>
                    Esgotado
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default MenuCarousel;
