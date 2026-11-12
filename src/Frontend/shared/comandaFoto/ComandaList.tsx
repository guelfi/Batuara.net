import React, { useEffect, useRef } from 'react';
import { Box, ButtonBase, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { brl } from './comandaUtils';

export const COMANDA_ROW_H = 34;

export interface ComandaListEntry {
  id: string;
  comanda: string;
  nome: string;
  count: number;
  total: number;
}

interface ComandaListProps {
  entries: ComandaListEntry[];
  /** Soma das comandas da conta. */
  total: number;
  /** Comanda aberta no cardápio (null quando se está vendo a soma de todas). */
  selectedId: string | null;
  viewAll: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleAll: () => void;
  /** Quantas linhas aparecem antes de a lista passar a rolar por dentro. */
  maxRows: number;
  disabled?: boolean;
}

/** Lista vertical de todas as comandas que serão fechadas juntas; tocar numa comanda abre os itens dela no cardápio. */
const ComandaList: React.FC<ComandaListProps> = ({ entries, total, selectedId, viewAll, onSelect, onRemove, onToggleAll, maxRows, disabled }) => {
  const listRef = useRef<HTMLDivElement>(null);

  // mantém à vista a linha da comanda aberta no cardápio quando a lista passa a rolar por dentro
  useEffect(() => {
    const box = listRef.current;
    const row = box?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!box || !row) return;
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const bottom = top + row.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;
  }, [entries.length, selectedId, viewAll]);

  return (
  <Paper variant="outlined" sx={{ p: 1, mb: 1, flexShrink: 0 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
      <Typography variant="subtitle2" fontWeight={700} noWrap>
        Comandas para fechar juntas ({entries.length})
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700}>
          {brl(total)}
        </Typography>
        {entries.length > 1 && (
          <Button
            size="small"
            variant={viewAll ? 'contained' : 'outlined'}
            aria-pressed={viewAll}
            aria-label="Ver os itens de todas as comandas"
            onClick={onToggleAll}
            sx={{ minWidth: 0, px: 1, py: 0, fontSize: '0.72rem', lineHeight: 1.7 }}
          >
            Todas
          </Button>
        )}
      </Stack>
    </Stack>
    <Box ref={listRef} role="list" aria-label="Comandas para fechar juntas" sx={{ maxHeight: maxRows * COMANDA_ROW_H, overflowY: 'auto' }}>
      {entries.map((e) => {
        const selected = !viewAll && e.id === selectedId;
        return (
          <Stack
            key={e.id}
            role="listitem"
            data-selected={selected ? 'true' : undefined}
            direction="row"
            alignItems="center"
            sx={{
              height: COMANDA_ROW_H,
              borderBottom: 1,
              borderColor: 'divider',
              borderRadius: 1,
              ...(selected ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) } : {}),
            }}
          >
            <ButtonBase
              onClick={() => onSelect(e.id)}
              disabled={disabled}
              aria-current={selected ? 'true' : undefined}
              aria-label={`Abrir a comanda ${e.comanda || 'atual'}`}
              sx={{ flex: 1, minWidth: 0, height: '100%', px: 0.75, gap: 1, justifyContent: 'space-between', textAlign: 'left' }}
            >
              <Typography variant="body2" fontWeight={selected ? 800 : 600} noWrap sx={{ flex: 1, minWidth: 0 }}>
                {e.comanda || '—'}
                {e.nome ? ` · ${e.nome}` : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {e.count} {e.count === 1 ? 'item' : 'itens'}
              </Typography>
              <Typography variant="body2" fontWeight={700} noWrap>
                {brl(e.total)}
              </Typography>
            </ButtonBase>
            <IconButton
              size="small"
              aria-label={`Remover comanda ${e.comanda || 'atual'}`}
              disabled={disabled}
              onClick={() => onRemove(e.id)}
              sx={{ width: 28, height: 28, minWidth: 0, minHeight: 0, p: 0, mr: 0.25, color: 'error.main' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      })}
    </Box>
  </Paper>
  );
};

export default ComandaList;
