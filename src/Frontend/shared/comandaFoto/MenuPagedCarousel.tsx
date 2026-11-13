import React from 'react';
import { Box, Typography } from '@mui/material';
import { CarouselItem, QtyControls, QtyIcons } from './CarouselParts';
import PagedCards from './PagedCards';
import { brl } from './comandaUtils';

type QtyMap = { [id: string]: number } | { [id: number]: number };
const qtyOf = (qty: QtyMap, id: string | number): number => (qty as Record<string, number>)[String(id)] ?? 0;

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
  /** O carrossel volta ao primeiro cartão só quando este valor muda (ex.: o texto da busca); mudar a lista ou as quantidades mantém a página. */
  resetKey?: string | number;
}

/**
 * Cardápio em cartões com vários itens cada um (uma lista por cartão), com rolagem lateral entre cartões.
 * Preenche a altura do contêiner: quantos itens cabem em cada cartão é calculado pela altura medida (ver PagedCards).
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
  resetKey,
}: MenuPagedCarouselProps<T>): React.ReactElement {
  return (
    <PagedCards
      items={items}
      getKey={(m) => m.id}
      rowHeight={rowHeight}
      label={label}
      emptyText={emptyText}
      resetKey={resetKey}
      controlsPosition={controlsPosition}
      footerStart={footerStart}
      rowProps={(m) => ({
        testId: testIdPrefix ? `${testIdPrefix}${m.id}` : undefined,
        selected: highlightSelected && qtyOf(qty, m.id) > 0,
        dimmed: m.isAvailable === false,
      })}
      renderRow={(m) => {
        const q = qtyOf(qty, m.id);
        const available = m.isAvailable !== false;
        return (
          <>
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
              compactRows ? null : (
                <Typography fontWeight={700} sx={{ minWidth: 56, textAlign: 'right' }} aria-label={`Quantidade de ${m.name}`}>
                  × {q}
                </Typography>
              )
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
          </>
        );
      }}
    />
  );
}

export default MenuPagedCarousel;
