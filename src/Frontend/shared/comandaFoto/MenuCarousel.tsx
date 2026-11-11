import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';
import { MenuItem, brl } from './comandaUtils';

const GAP = 8;
/** Largura do card: dois cards inteiros e um pedaço do próximo, mostrando que dá para arrastar. */
const CARD_BASIS = '42%';

interface QtyControlsProps {
  name: string;
  quantity: number;
  onChange: (delta: number) => void;
}

/** − qtd + usado nos cards e na faixa "Na comanda". */
export const QtyControls: React.FC<QtyControlsProps> = ({ name, quantity, onChange }) => (
  <Stack direction="row" alignItems="center" spacing={0.5}>
    <IconButton size="small" aria-label={`Menos ${name}`} disabled={quantity === 0} onClick={() => onChange(-1)} sx={{ border: 1, borderColor: 'divider' }}>
      <RemoveIcon fontSize="small" />
    </IconButton>
    <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }} aria-label={`Quantidade de ${name}`}>
      {quantity}
    </Typography>
    <IconButton size="small" aria-label={`Mais ${name}`} onClick={() => onChange(1)} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
      <AddIcon fontSize="small" />
    </IconButton>
  </Stack>
);

interface MenuCarouselProps {
  items: MenuItem[];
  qty: Record<number, number>;
  onChange: (id: number, delta: number) => void;
  label?: string;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Cardápio em cards com rolagem lateral (arrastar, setas ou teclado).
 * Mantém a ordem recebida: tocar em "+" nunca muda um card de lugar.
 */
const MenuCarousel: React.FC<MenuCarouselProps> = ({ items, qty, onChange, label = 'Cardápio' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ first: 1, last: Math.min(items.length, 2) });

  const updateRange = useCallback(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) {
      setRange({ first: 0, last: 0 });
      return;
    }
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? el.clientWidth / 2) + GAP;
    const first = Math.min(items.length, Math.max(1, Math.round(el.scrollLeft / step) + 1));
    const visible = Math.max(1, Math.floor((el.clientWidth + GAP) / step));
    setRange({ first, last: Math.min(items.length, first + visible - 1) });
  }, [items.length]);

  // nova busca: volta ao primeiro card
  useEffect(() => {
    trackRef.current?.scrollTo?.({ left: 0 });
    updateRange();
  }, [items, updateRange]);

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
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
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
          display: 'flex',
          gap: `${GAP}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          pb: 1,
        }}
      >
        {items.map((m) => {
          const q = qty[m.id] ?? 0;
          return (
            <Box
              key={m.id}
              role="group"
              aria-label={m.name}
              sx={{
                flex: `0 0 ${CARD_BASIS}`,
                scrollSnapAlign: 'start',
                border: 1,
                borderColor: q > 0 ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 104,
                bgcolor: 'background.paper',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                title={m.name}
              >
                {m.name}
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {brl(m.unitPrice)}
                </Typography>
                <QtyControls name={m.name} quantity={q} onChange={(d) => onChange(m.id, d)} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MenuCarousel;
