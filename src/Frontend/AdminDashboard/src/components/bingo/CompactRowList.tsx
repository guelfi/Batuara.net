import React, { useEffect, useState } from 'react';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Pagination, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

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
}

const PAGE_SIZE = 10;

// Lista de linhas compactas para o celular: uma linha por item, busca e paginação acima de 10 itens.
const CompactRowList: React.FC<{ rows: CompactRow[]; emptyText: string }> = ({ rows, emptyText }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ el: HTMLElement; row: CompactRow } | null>(null);
  const paged = rows.length > PAGE_SIZE;
  const q = query.trim().toLowerCase();
  const filtered = paged && q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = paged ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered;

  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);

  if (rows.length === 0) return <Typography color="text.secondary">{emptyText}</Typography>;

  return (
    <Stack spacing={1}>
      {paged && (
        <TextField size="small" fullWidth placeholder="Buscar por nome" value={query} onChange={(e) => setQuery(e.target.value)} />
      )}
      <Paper variant="outlined">
        {visible.map((r, i) => (
          <Box key={r.id} sx={{
            display: 'grid', gridTemplateColumns: '22px minmax(0,1fr) auto auto 36px', columnGap: 0.75, alignItems: 'center',
            px: 1, py: 0.5, minHeight: 48, borderTop: i === 0 ? 0 : 1, borderColor: 'divider',
          }}>
            <Typography variant="caption" color="text.secondary">{r.order}</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.25 }}>{r.name}</Typography>
              {r.note && <Typography variant="caption" color="text.secondary">{r.note}</Typography>}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.trailing ?? ''}</Typography>
            <Switch size="small" checked={r.checked} onChange={(e) => r.onToggle(e.target.checked)} />
            <IconButton size="small" aria-label="Ações" onClick={(e) => setMenu({ el: e.currentTarget, row: r })}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        {visible.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Nenhum resultado.</Typography>}
      </Paper>
      {paged && pages > 1 && (
        <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} size="small" sx={{ alignSelf: 'center' }} />
      )}
      <Menu anchorEl={menu?.el} open={!!menu} onClose={() => setMenu(null)}>
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
    </Stack>
  );
};

export default CompactRowList;
