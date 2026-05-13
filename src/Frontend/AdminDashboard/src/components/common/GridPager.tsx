import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { FirstPage as FirstPageIcon, LastPage as LastPageIcon, NavigateBefore as PrevIcon, NavigateNext as NextIcon } from '@mui/icons-material';

type GridPagerProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

const GridPager: React.FC<GridPagerProps> = ({ page, pageSize, totalCount, onPageChange }) => {
  const totalPages = totalCount > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 0;
  const currentPage = totalPages === 0 ? 0 : Math.min(page + 1, totalPages);
  const canGoPrev = totalPages > 0 && page > 0;
  const canGoNext = totalPages > 0 && page + 1 < totalPages;

  return (
    <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ px: 1, py: 0.25 }}>
      <IconButton aria-label="Início" size="small" disabled={!canGoPrev} onClick={() => onPageChange(0)}>
        <FirstPageIcon fontSize="small" />
      </IconButton>
      <IconButton aria-label="Anterior" size="small" disabled={!canGoPrev} onClick={() => onPageChange(page - 1)}>
        <PrevIcon fontSize="small" />
      </IconButton>
      <Typography variant="body2" sx={{ px: 1, minWidth: 72, textAlign: 'center' }}>
        {currentPage} de {totalPages}
      </Typography>
      <IconButton aria-label="Próximo" size="small" disabled={!canGoNext} onClick={() => onPageChange(page + 1)}>
        <NextIcon fontSize="small" />
      </IconButton>
      <IconButton
        aria-label="Final"
        size="small"
        disabled={!canGoNext}
        onClick={() => onPageChange(Math.max(0, totalPages - 1))}
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

export default GridPager;

