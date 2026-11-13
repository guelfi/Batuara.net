import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { CarouselControls } from './CarouselParts';

const GAP = 8;
const BAR_H = 40;
/** Largura de cada cartão: quase a tela toda, deixando um pedaço do próximo à mostra (indica que dá para arrastar). */
const CARD_BASIS = '92%';
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export interface PagedRowProps {
  /** data-testid da linha. */
  testId?: string;
  /** Linha destacada (ex.: tem quantidade). */
  selected?: boolean;
  /** Linha esmaecida (ex.: esgotado). */
  dimmed?: boolean;
  sx?: SxProps<Theme>;
}

export interface PagedCardsProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  /** Conteúdo da linha; cada linha tem altura fixa (`rowHeight`). */
  renderRow: (item: T, index: number) => React.ReactNode;
  rowProps?: (item: T, index: number) => PagedRowProps;
  /** Altura de cada linha, em px. */
  rowHeight?: number;
  label?: string;
  /** O que é paginado, para o indicador e os botões (padrão "Itens"). */
  noun?: string;
  emptyText?: string;
  /** Volta ao primeiro cartão só quando este valor muda (ex.: o texto da busca); mudar a lista mantém a página. */
  resetKey?: string | number;
  /** Setas e indicador acima dos cartões (padrão) ou numa linha abaixo, que pode levar uma ação à esquerda. */
  controlsPosition?: 'top' | 'bottom';
  footerStart?: React.ReactNode;
}

/**
 * Cartões paginados com rolagem lateral entre eles: cada cartão é uma lista de linhas e preenche a altura do contêiner.
 * Quantas linhas cabem em cada cartão sai da altura medida; o próximo cartão aparece pela borda; as setas e o indicador
 * ("Itens 1–8 de 16") mostram a posição. Mantém a ordem recebida. Serve ao cardápio da comanda e às listas do Admin.
 */
function PagedCards<T>({
  items,
  getKey,
  renderRow,
  rowProps,
  rowHeight = 48,
  label = 'Lista',
  noun = 'Itens',
  emptyText = 'Nenhum item encontrado.',
  resetKey,
  controlsPosition = 'top',
  footerStart,
}: PagedCardsProps<T>): React.ReactElement {
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

  // nova busca ou novo tamanho: volta ao primeiro cartão. Mudar quantidades ou acrescentar/remover itens NÃO muda de página.
  useEffect(() => {
    trackRef.current?.scrollTo?.({ left: 0 });
    setSlide(0);
  }, [resetKey, perCard]);

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
    <CarouselControls first={first} last={last} total={items.length} compact={atBottom} noun={noun} onPrev={() => goTo(current - 1)} onNext={() => goTo(current + 1)} />
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
            aria-label={`${noun} ${idx * perCard + 1} a ${idx * perCard + chunk.length}`}
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
            {chunk.map((item, rowIdx) => {
              const index = idx * perCard + rowIdx;
              const rp = rowProps?.(item, index) ?? {};
              return (
                <Box
                  key={getKey(item)}
                  data-testid={rp.testId}
                  data-selected={rp.selected ? 'true' : undefined}
                  sx={[
                    {
                      height: rowHeight,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      borderBottom: rowIdx < chunk.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      opacity: rp.dimmed ? 0.5 : 1,
                      color: rp.dimmed ? 'text.disabled' : 'text.primary',
                    },
                    rp.selected ? { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.1), mx: -0.5, px: 0.5, borderRadius: 1 } : {},
                    ...(Array.isArray(rp.sx) ? rp.sx : rp.sx ? [rp.sx] : []),
                  ]}
                >
                  {renderRow(item, index)}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      {atBottom && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: BAR_H, flexShrink: 0 }}>
          <Box sx={{ flexShrink: 0 }}>{footerStart}</Box>
          {controls}
        </Stack>
      )}
    </Box>
  );
}

export default PagedCards;
