import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  Lock as LockIcon,
  Public as PublicIcon,
  VisibilityOff as HiddenIcon,
} from '@mui/icons-material';
import { ContentVisibility, ContentVisibilityModule } from '../../types';
import { useContentVisibility } from '../../hooks/useContentVisibility';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/roles';

const OPTIONS: Array<{ value: ContentVisibility; label: string; icon: React.ReactElement }> = [
  { value: ContentVisibility.Hidden, label: 'Oculto', icon: <HiddenIcon fontSize="inherit" /> },
  { value: ContentVisibility.Authenticated, label: 'Restrito', icon: <LockIcon fontSize="inherit" /> },
  { value: ContentVisibility.Public, label: 'Público', icon: <PublicIcon fontSize="inherit" /> },
];

interface ContentVisibilityControlProps {
  module: ContentVisibilityModule;
  size?: 'small' | 'medium';
}

const ContentVisibilityControl: React.FC<ContentVisibilityControlProps> = ({
  module,
  size = 'small',
}) => {
  const { user } = useAuth();
  const { getVisibility, setVisibility, savingModule, loading } = useContentVisibility();

  if (!isAdmin(user?.role)) {
    return null;
  }

  const value = getVisibility(module);
  const disabled = loading || savingModule === module;

  const handleToggleChange = (_: React.MouseEvent<HTMLElement>, next: ContentVisibility | null) => {
    if (next === null) return;
    void setVisibility(module, next);
  };

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
          color: 'text.secondary',
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'primary.dark',
              color: 'primary.contrastText',
            },
          },
          '&.Mui-selected.Mui-disabled': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            opacity: 0.7,
          },
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
