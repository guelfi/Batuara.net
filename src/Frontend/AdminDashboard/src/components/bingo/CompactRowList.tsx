import React, { useRef, useState } from 'react';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { CheckCircleOutline as ConfirmIcon, Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import PagedCards from '../../_shared/comandaFoto/PagedCards';
import { useFillViewport } from '../../_shared/comandaFoto/useFillViewport';

export interface CompactRow {
  id: string;
  order: number;
  name: string;
  trailing?: string;
  note?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onEdit: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  /** Item a revisar: texto vermelho e fundo amarelado; "Confirmar" aparece no menu. */
  warn?: boolean;
  onConfirm?: () => void;
}

const ROW_H = 58;

// Lista de linhas compactas para o celular: cartões paginados (como o cardápio da comanda), uma linha por item,
// ocupando a altura que sobra na tela, sem rolar a página. Busca quando há mais de 6 itens.
const CompactRowList: React.FC<{ rows: CompactRow[]; emptyText: string }> = ({ rows, emptyText }) => {
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState<{ el: HTMLElement; row: CompactRow } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fitHeight = useFillViewport(rootRef, 260);
  const showSearch = rows.length > 6;
  const q = query.trim().toLowerCase();
  const filtered = showSearch && q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;

  if (rows.length === 0) return <Typography color="text.secondary">{emptyText}</Typography>;

  return (
    <Box ref={rootRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden', ...(fitHeight ? { height: fitHeight } : {}) }}>
      {showSearch && (
        <TextField size="small" fullWidth placeholder="Buscar por nome" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ flexShrink: 0 }} />
      )}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PagedCards
          items={filtered}
          getKey={(r) => r.id}
          rowHeight={ROW_H}
          label="Lista"
          emptyText="Nenhum resultado."
          resetKey={query}
          rowProps={(r) => ({ testId: `linha-${r.id}`, sx: r.warn ? { bgcolor: '#fff8d6', color: 'error.main' } : undefined })}
          renderRow={(r) => (
            <Box sx={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr) auto auto 36px', columnGap: 0.75, alignItems: 'center', width: '100%' }}>
              <Typography variant="caption" color="text.secondary">{r.order}</Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  title={r.name}
                  sx={{ fontWeight: 600, overflowWrap: 'anywhere', lineHeight: 1.25, color: r.warn ? 'error.main' : undefined, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {r.name}
                </Typography>
                {r.note && <Typography variant="caption" color="text.secondary" noWrap display="block" title={r.note}>{r.note}</Typography>}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.trailing ?? ''}</Typography>
              <Switch size="small" checked={r.checked} onChange={(e) => r.onToggle(e.target.checked)} />
              <IconButton size="small" aria-label="Ações" onClick={(e) => setMenu({ el: e.currentTarget, row: r })}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        />
      </Box>
      <Menu anchorEl={menu?.el} open={!!menu} onClose={() => setMenu(null)}>
        {menu?.row.onConfirm && (
          <MenuItem onClick={() => { const r = menu.row; setMenu(null); r.onConfirm!(); }}>
            <ListItemIcon><ConfirmIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Confirmar</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { const r = menu!.row; setMenu(null); r.onEdit(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {menu?.row.onDelete && (
          <MenuItem disabled={menu.row.deleteDisabled} onClick={() => { const r = menu.row; setMenu(null); r.onDelete!(); }}>
            <ListItemIcon><DeleteIcon fontSize="small" color={menu.row.deleteDisabled ? 'disabled' : 'error'} /></ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default CompactRowList;
