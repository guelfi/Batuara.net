import React from 'react';
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  Lock as LockIcon,
  Public as PublicIcon,
  VisibilityOff as HiddenIcon,
} from '@mui/icons-material';
import { ContentVisibility, ContentVisibilityModule } from '../types';
import { useContentVisibility } from '../hooks/useContentVisibility';

const OPTIONS: Array<{ value: ContentVisibility; label: string; shortLabel: string; icon: React.ReactElement }> = [
  { value: ContentVisibility.Hidden, label: 'Oculto', shortLabel: 'Oculto', icon: <HiddenIcon fontSize="inherit" /> },
  { value: ContentVisibility.Authenticated, label: 'Restrito', shortLabel: 'Restrito', icon: <LockIcon fontSize="inherit" /> },
  { value: ContentVisibility.Public, label: 'Público', shortLabel: 'Público', icon: <PublicIcon fontSize="inherit" /> },
];

interface ContentVisibilityControlProps {
  module: ContentVisibilityModule;
  variant?: 'compact' | 'page';
  size?: 'small' | 'medium';
}

const ContentVisibilityControl: React.FC<ContentVisibilityControlProps> = ({
  module,
  variant = 'page',
  size = 'small',
}) => {
  const { getVisibility, setVisibility, savingModule, loading } = useContentVisibility();
  const value = getVisibility(module);
  const disabled = loading || savingModule === module;

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    void setVisibility(module, Number(event.target.value) as ContentVisibility);
  };

  const handleToggleChange = (_: React.MouseEvent<HTMLElement>, next: ContentVisibility | null) => {
    if (next === null) return;
    void setVisibility(module, next);
  };

  if (variant === 'compact') {
    return (
      <FormControl
        size="small"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        sx={{ minWidth: 96, ml: 0.5 }}
      >
        <Select
          value={value}
          onChange={handleSelectChange}
          disabled={disabled}
          displayEmpty
          inputProps={{ 'aria-label': 'Visibilidade do conteúdo' }}
          sx={{
            height: 28,
            fontSize: 12,
            '& .MuiSelect-select': {
              py: 0.5,
              px: 1,
            },
          }}
        >
          {OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: 13 }}>
              {option.shortLabel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <ToggleButtonGroup
      exclusive
      size={size}
      value={value}
      disabled={disabled}
      onChange={handleToggleChange}
      aria-label="Visibilidade do conteúdo"
      sx={{
        '& .MuiToggleButton-root': {
          px: 1.25,
          py: 0.5,
          textTransform: 'none',
          gap: 0.5,
        },
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
          <Tooltip title={option.label}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {option.icon}
              {option.label}
            </span>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ContentVisibilityControl;
