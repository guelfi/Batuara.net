import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Popover,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user: externalUser
}) => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Usar usuário do contexto de autenticação se não for fornecido externamente
  const user = externalUser || authUser;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-profile-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'secondary.main',
            fontSize: '1rem'
          }}
        >
          {user?.name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1
        }}
      >
        <Card sx={{ minWidth: 280, maxWidth: 320 }}>
          <CardContent>
            {/* Header do Perfil */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  mr: 2, 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main',
                  fontSize: '1.2rem'
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Menu de Opções */}
            <List dense sx={{ py: 0 }}>
              <ListItem 
                button 
                onClick={handleProfile}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Meu Perfil" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>

              <ListItem 
                button 
                onClick={handleClose}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Configurações" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>

              <Divider sx={{ my: 1 }} />

              <ListItem 
                button 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'error.light',
                    '& .MuiListItemIcon-root': {
                      color: 'error.main'
                    },
                    '& .MuiListItemText-primary': {
                      color: 'error.main'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Sair" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>

            {/* Footer */}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                Casa de Caridade Caboclo Batuara
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                Admin Dashboard v1.0
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
};

export default UserProfile;