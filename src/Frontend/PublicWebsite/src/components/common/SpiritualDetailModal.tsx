import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

interface SpiritualDetailData {
  nome: string;
  saudacao: string;
  elemento: string;
  habitat: string;
  simbolo: string;
  cor: string;
  diaSemana: string;
  fruta: string;
  comida: string;
  bebida: string;
  atuacao: string;
  description: string;
  corTematica: string;
}

interface SpiritualDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: SpiritualDetailData;
  tipo: 'orixa' | 'guia' | 'linha';
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SpiritualDetailModal: React.FC<SpiritualDetailModalProps> = ({
  open,
  onClose,
  data,
  tipo
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Função unificada para obter cores suaves para fundo baseada na cor temática
  const getSoftBackgroundColor = (corTematica: string): string => {
    const softBackgroundMap: { [key: string]: string } = {
      // Sistema unificado baseado na cor temática
      '#e8eaf6': '#f3f4f9', // Branco/Oxalá - azul muito suave
      '#1976d2': '#e3f2fd', // Azul - azul suave
      '#9c27b0': '#f3e5f5', // Lilás/Roxo - roxo suave
      '#ffc107': '#fff8e1', // Amarelo - amarelo suave
      '#d32f2f': '#ffebee', // Vermelho - vermelho suave
      '#388e3c': '#e8f5e8', // Verde - verde suave
      '#795548': '#efebe9', // Marrom - marrom suave
      '#ff9800': '#fff3e0', // Laranja - laranja suave
      '#673ab7': '#ede7f6', // Roxo - roxo suave
      '#212121': '#f5f5f5', // Preto - cinza suave
      '#4caf50': '#e8f5e8', // Verde claro - verde suave
      '#ffeb3b': '#fffde7', // Amarelo claro - amarelo suave
      '#e91e63': '#fce4ec', // Rosa - rosa suave
      '#8bc34a': '#f1f8e9', // Verde claro - verde suave
      '#2196f3': '#e3f2fd', // Azul claro - azul suave
      '#424242': '#f5f5f5', // Cinza - cinza suave
      '#42a5f5': '#e3f2fd'  // Azul-claro - azul suave
    };
    return softBackgroundMap[corTematica] || '#f0f4f8';
  };

  const getTextColor = (corTematica: string): string => {
    const textColorMap: { [key: string]: string } = {
      // Sistema unificado para cores de texto mais fortes
      '#e8eaf6': '#5c6bc0', // Branco/Oxalá - azul médio
      '#1976d2': '#1565c0', // Azul - azul mais escuro
      '#9c27b0': '#8e24aa', // Lilás/Roxo - roxo mais escuro
      '#ffc107': '#ff8f00', // Amarelo - amarelo mais escuro
      '#d32f2f': '#c62828', // Vermelho - vermelho mais escuro
      '#388e3c': '#2e7d32', // Verde - verde mais escuro
      '#795548': '#6d4c41', // Marrom - marrom mais escuro
      '#ff9800': '#f57c00', // Laranja - laranja mais escuro
      '#673ab7': '#5e35b1', // Roxo - roxo mais escuro
      '#212121': '#424242', // Preto - cinza médio
      '#4caf50': '#388e3c', // Verde claro - verde médio
      '#ffeb3b': '#fbc02d', // Amarelo claro - amarelo mais escuro
      '#e91e63': '#c2185b', // Rosa - rosa mais escuro
      '#8bc34a': '#689f38', // Verde claro - verde mais escuro
      '#2196f3': '#1976d2', // Azul claro - azul médio
      '#424242': '#212121', // Cinza - cinza escuro
      '#42a5f5': '#1976d2'  // Azul-claro - azul médio
    };
    return textColorMap[corTematica] || '#1976d2';
  };





  const InfoRow: React.FC<{ label: string; value: string; leftCol?: boolean }> = ({ 
    label, 
    value, 
    leftCol = false 
  }) => (
    <Grid item xs={leftCol ? 6 : 12} sm={leftCol ? 6 : 12}>
      <Box sx={{ mb: 1.5 }}>
        <Box
          sx={{
            backgroundColor: getSoftBackgroundColor(data.corTematica),
            borderRadius: 1,
            p: 0.8,
            mb: 0.5,
            border: `1px solid ${data.corTematica}30`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: getTextColor(data.corTematica),
            }}
          >
            {label}:
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            minHeight: '20px',
            pl: 0.8,
          }}
        >
          {value || '—'}
        </Typography>
      </Box>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={isMobile ? false : "sm"}
      fullWidth={!isMobile}
      TransitionComponent={isMobile ? Transition : undefined}
      sx={{
        '& .MuiDialog-paper': {
          margin: isMobile ? 0 : theme.spacing(2),
          borderRadius: isMobile ? 0 : theme.spacing(1),
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header com cor suave e nome em cor forte */}
        <Box
          sx={{
            backgroundColor: getSoftBackgroundColor(data.corTematica),
            color: '#333',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: getTextColor(data.corTematica),
              mb: 0.5,
            }}
          >
            {data.nome}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            {data.saudacao}
          </Typography>
        </Box>

        {/* Conteúdo principal com scroll */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, md: 1 },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: data.corTematica,
              borderRadius: '3px',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          }}
        >
          <Grid container spacing={2}>
            {/* Layout específico para Orixás conforme especificação */}
            {/* Elemento | Habitat */}
            <InfoRow label="Elemento" value={data.elemento} leftCol />
            <InfoRow label="Habitat" value={data.habitat} leftCol />
            
            {/* Símbolo | Cor */}
            <InfoRow label="Símbolo" value={data.simbolo} leftCol />
            <InfoRow label="Cor" value={data.cor} leftCol />
            
            {/* Dia Semana | Fruta */}
            <InfoRow label="Dia Semana" value={data.diaSemana} leftCol />
            <InfoRow label="Fruta" value={data.fruta} leftCol />
            
            {/* Comida | Bebida */}
            <InfoRow label="Comida" value={data.comida} leftCol />
            <InfoRow label="Bebida" value={data.bebida} leftCol />

            {/* Atuação na Casa Batuara - Texto completo */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 4 }}>
                <Box
                  sx={{
                    backgroundColor: getSoftBackgroundColor(data.corTematica),
                    borderRadius: 1,
                    p: 1.5,
                    mb: 1.5,
                    border: `1px solid ${data.corTematica}30`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: getTextColor(data.corTematica),
                    }}
                  >
                    Atuação na Casa Batuara:
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                    textAlign: 'justify',
                    pl: 1.5,
                  }}
                >
                  {data.description}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Espaço extra para o botão em mobile */}
          {isMobile && <Box sx={{ height: 80 }} />}
        </Box>

        {/* Botão fechar flutuante - posicionado sobre o conteúdo */}
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<CloseIcon />}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: getTextColor(data.corTematica),
            color: '#ffffff',
            py: 0.9, // Reduzido de 1.5 para 0.9 (40% menor)
            px: 2.4, // Reduzido de 4 para 2.4 (40% menor)
            fontSize: '0.66rem', // Reduzido de 1.1rem para 0.66rem (40% menor)
            fontWeight: 'bold',
            borderRadius: 2,
            boxShadow: `0 4px 12px ${getTextColor(data.corTematica)}40`,
            zIndex: 1000,
            '&:hover': {
              backgroundColor: getTextColor(data.corTematica),
              opacity: 0.9,
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 16px ${getTextColor(data.corTematica)}50`,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SpiritualDetailModal;