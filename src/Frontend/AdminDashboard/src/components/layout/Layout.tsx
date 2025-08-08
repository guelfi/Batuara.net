import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import UserProfile from '../common/UserProfile';

interface LayoutProps {
  children: React.ReactNode;
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, selectedItem, onItemSelect }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              cursor: 'pointer',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.02)'
              },
              '&:active': {
                transform: 'scale(0.98)'
              }
            }}
            onClick={() => {
              onItemSelect('dashboard');
              if (isMobile) {
                setSidebarOpen(false);
              }
            }}
            title="Voltar ao Dashboard"
          >
            <img 
              src="/batuara_logo.png" 
              alt="Batuara Logo" 
              style={{ 
                height: isMobile ? '24px' : '32px', 
                marginRight: isMobile ? '8px' : '12px' 
              }} 
            />
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.25rem'
              }}
            >
              Casa de Caridade Caboclo Batuara
            </Typography>
          </Box>
          <UserProfile />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
          variant="temporary"
        />
      ) : (
        <Sidebar
          open={true}
          onClose={handleSidebarClose}
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
          variant="permanent"
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 }, // Offset for AppBar
          ml: isMobile ? 0 : '320px', // Offset for Sidebar on desktop
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'auto', // Permitir scroll na área principal
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        id="main-content" // ID para facilitar o scroll
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;