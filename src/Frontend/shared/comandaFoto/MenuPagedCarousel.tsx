import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CarouselControls, CarouselItem, QtyControls, QtyIcons } from './CarouselParts';
import { brl } from './comandaUtils';

const GAP = 8;
const CAROUSEL_BAR_H = 40;
/** Largura de cada cartão: quase a tela toda, deixando um pedaço do próximo à mostra (indica que dá para arrastar). */
const CARD_BASIS = '92%';

type QtyMap = { [id: string]: number } | { [id: number]: number };
const qtyOf = (qty: QtyMap, id: string | number): number => (qty as Record<string, number>)[String(id)] ?? 0;
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface MenuPagedCarouselProps<T extends CarouselItem> {
  items: T[];
  qty: QtyMap;
  onChange: (id: T['id'], delta: number) => void;
  label?: string;
  maxQty?: number;
  /** Altura de cada linha de item, em px. */
  rowHeight?: number;
  minusLabel?: (name: string) => string;
  plusLabel?: (name: string) => string;
  /** Texto extra ao lado do nome (ex.: quantidade já pedida). */
  renderBadge?: (item: T) => React.ReactNode;
  testIdPrefix?: string;
  /** Setas e indicador acima dos cartões (padrão) ou numa linha abaixo, que pode levar uma ação à esquerda. */
  controlsPosition?: 'top' | 'bottom';
  /** Ação à esquerda da linha de controles quando `controlsPosition` é 'bottom'. */
  footerStart?: React.ReactNode;
  /** Destaca as linhas que têm quantidade. */
  highlightSelected?: boolean;
  /** Só leitura: no lugar de − e + mostra "× quantidade" (usado na soma das comandas). */
  readOnly?: boolean;
  /** Texto quando não há itens. */
  emptyText?: string;
  /** Linha compacta: "descrição - valor × quantidade = total" e − / + só como ícones. */
  compactRows?: boolean;
  /** Conteúdo extra depois dos controles de cada linha (ex.: remover um item fora do cardápio). */
  renderAfter?: (item: T) => React.ReactNode;
}

/**
 * Cardápio em cartões com vários itens cada um (uma lista por cartão), com rolagem lateral entre cartões.
 * Preenche a altura do contêiner: quantos itens cabem em cada cartão é calculado pela altura medida.
 * Mantém a ordem recebida: os itens vão em sequência, cartão a cartão.
 */
function MenuPagedCarousel<T extends CarouselItem>({
  items,
  qty,
  onChange,
  label = 'Cardápio',
  maxQty,
  rowHeight = 48,
  minusLabel,
  plusLabel,
  renderBadge,
  testIdPrefix,
  controlsPosition = 'top',
  footerStart,
  highlightSelected = false,
  readOnly = false,
  emptyText = 'Nenhum item encontrado.',
  compactRows = false,
  renderAfter,
}: MenuPagedCarouselProps<T>): React.ReactElement {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null);
  const [trackH, setTrackH] = useState(0);
  const [slide, setSlide] = useState(0);

  const setTrack = useCallback((el: HTMLDivElement | null) => {
    trackRef.current = el;
    setTrackEl(el);
  }, []);

  useEffect(() => {
    if (!trackEl) return undefined;
    const measure = () => setTrackH(trackEl.clientHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [trackEl]);

  // cartão = borda e respiro (≈ 12 px) + linhas; sem medida (testes), tudo cabe num cartão só
  const perCard = trackH > 0 ? Math.max(2, Math.floor((trackH - 12 - 8) / rowHeight)) : Math.max(1, items.length);
  const slides = Math.max(1, Math.ceil(items.length / perCard));

  const updateSlide = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? el.clientWidth) + GAP;
    setSlide(Math.max(0, Math.min(slides - 1, Math.round(el.scrollLeft / step))));
  }, [slides]);

  // nova busca ou novo tamanho: volta ao primeiro cartão
  useEffect(() => {
    trackRef.current?.scrollTo?.({ left: 0 });
    setSlide(0);
  }, [items, perCard]);

  const goTo = (target: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? el.clientWidth) + GAP;
    el.scrollTo?.({ left: Math.max(0, Math.min(slides - 1, target)) * step, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }} align="center">
        {emptyText}
      </Typography>
    );
  }

  const current = Math.min(slide, slides - 1);
  const first = current * perCard + 1;
  const last = Math.min(items.length, (current + 1) * perCard);
  const atBottom = controlsPosition === 'bottom';
  const controls = (
    <CarouselControls first={first} last={last} total={items.length} compact={atBottom} onPrev={() => goTo(current - 1)} onNext={() => goTo(current + 1)} />
  );
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += perCard) chunks.push(items.slice(i, i + perCard));

  return (
    <Box role="group" aria-roledescription="carrossel" aria-label={label} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {!atBottom && controls}
      <Box
        ref={setTrack}
        onScroll={updateSlide}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: `${GAP}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          pb: 1,
        }}
      >
        {chunks.map((chunk, idx) => (
          <Box
            key={idx}
            role="group"
            aria-label={`Itens ${idx * perCard + 1} a ${idx * perCard + chunk.length}`}
            sx={{
              flex: `0 0 ${slides > 1 ? CARD_BASIS : '100%'}`,
              scrollSnapAlign: 'start',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              bgcolor: 'background.paper',
              alignSelf: 'flex-start',
              maxHeight: '100%',
              overflow: 'hidden',
            }}
          >
            {chunk.map((m, rowIdx) => {
              const q = qtyOf(qty, m.id);
              const available = m.isAvailable !== false;
              return (
                <Box
                  key={m.id}
                  data-testid={testIdPrefix ? `${testIdPrefix}${m.id}` : undefined}
                  data-selected={highlightSelected && q > 0 ? 'true' : undefined}
                  sx={{
                    height: rowHeight,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: rowIdx < chunk.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                    opacity: available ? 1 : 0.5,
                    color: available ? 'text.primary' : 'text.disabled',
                    ...(highlightSelected && q > 0 ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.1), mx: -0.5, px: 0.5, borderRadius: 1 } : {}),
                  }}
                >
                  {compactRows ? (
                    <Typography
                      variant="body2"
                      title={m.name}
                      sx={{ flex: 1, minWidth: 0, lineHeight: 1.2, fontSize: '0.8rem', overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {m.name}
                      </Box>
                      {renderBadge?.(m)}
                      {` - ${brl(m.unitPrice)}`}
                      {q > 0 && ` × ${q} = ${brl(m.unitPrice * q)}`}
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        title={m.name}
                        sx={{ flex: 1, minWidth: 0, lineHeight: 1.2, overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {m.name}
                        {renderBadge?.(m)}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {brl(m.unitPrice)}
                      </Typography>
                    </>
                  )}
                  {readOnly ? (
                    compactRows ? null : <Typography fontWeight={700} sx={{ minWidth: 56, textAlign: 'right' }} aria-label={`Quantidade de ${m.name}`}>
                      × {q}
                    </Typography>
                  ) : available ? (
                    compactRows ? (
                      <QtyIcons name={m.name} quantity={q} max={maxQty} minusLabel={minusLabel?.(m.name)} plusLabel={plusLabel?.(m.name)} onChange={(d) => onChange(m.id, d)} />
                    ) : (
                      <QtyControls name={m.name} quantity={q} max={maxQty} minusLabel={minusLabel?.(m.name)} plusLabel={plusLabel?.(m.name)} onChange={(d) => onChange(m.id, d)} />
                    )
                  ) : (
                    <Typography variant="caption" fontWeight={700} sx={{ width: 78, textAlign: 'right' }}>
                      Esgotado
                    </Typography>
                  )}
                  {renderAfter?.(m)}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      {atBottom && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: CAROUSEL_BAR_H, flexShrink: 0 }}>
          <Box sx={{ flexShrink: 0 }}>{footerStart}</Box>
          {controls}
        </Stack>
      )}
    </Box>
  );
}

export default MenuPagedCarousel;
