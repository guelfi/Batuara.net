import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  MarkEmailRead as ReadIcon,
  Schedule as PendingIcon,
  CheckCircle as DoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'nova' | 'lida' | 'pendente' | 'concluida';
}

// Dados mockados de mensagens de contato
const mockContactMessages: ContactMessage[] = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1234',
    subject: 'Consulta espiritual',
    message: 'Gostaria de agendar uma consulta espiritual. Estou passando por um momento difícil e preciso de orientação.',
    date: '2024-02-08 14:30',
    status: 'nova'
  },
  {
    id: 2,
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 98888-5678',
    subject: 'Informações sobre giras',
    message: 'Olá, gostaria de saber os horários das giras e se posso participar como visitante.',
    date: '2024-02-07 16:45',
    status: 'lida'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 97777-9012',
    subject: 'Doação de roupas',
    message: 'Tenho algumas roupas em bom estado para doação. Como posso fazer a entrega?',
    date: '2024-02-06 10:15',
    status: 'pendente'
  },
  {
    id: 4,
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 96666-3456',
    subject: 'Trabalho voluntário',
    message: 'Gostaria de me voluntariar para ajudar nos trabalhos da casa. Tenho disponibilidade aos finais de semana.',
    date: '2024-02-05 19:20',
    status: 'concluida'
  },
  {
    id: 5,
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 95555-7890',
    subject: 'Festa de Iemanjá',
    message: 'Gostaria de informações sobre a próxima festa de Iemanjá. Quando será realizada?',
    date: '2024-02-04 08:30',
    status: 'lida'
  }
];

const ContatoContent: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>(mockContactMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'nova':
        return <Chip label="Nova" color="error" size="small" />;
      case 'lida':
        return <Chip label="Lida" color="info" size="small" />;
      case 'pendente':
        return <Chip label="Pendente" color="warning" size="small" />;
      case 'concluida':
        return <Chip label="Concluída" color="success" size="small" />;
      default:
        return <Chip label="Nova" color="default" size="small" />;
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    
    // Marcar como lida se for nova
    if (message.status === 'nova') {
      updateMessageStatus(message.id, 'lida');
    }
  };

  const updateMessageStatus = (id: number, newStatus: ContactMessage['status']) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status: newStatus } : msg
      )
    );
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'subject',
      headerName: 'Assunto',
      width: 180,
    },
    {
      field: 'date',
      headerName: 'Data',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('pt-BR')}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Visualizar"
          onClick={() => handleViewMessage(params.row)}
        />,
        <GridActionsCellItem
          icon={<ReadIcon />}
          label="Marcar como lida"
          onClick={() => updateMessageStatus(params.id as number, 'lida')}
          disabled={params.row.status === 'lida'}
        />,
        <GridActionsCellItem
          icon={<PendingIcon />}
          label="Marcar como pendente"
          onClick={() => updateMessageStatus(params.id as number, 'pendente')}
        />,
        <GridActionsCellItem
          icon={<DoneIcon />}
          label="Marcar como concluída"
          onClick={() => updateMessageStatus(params.id as number, 'concluida')}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Gerenciamento de Mensagens
            </Typography>
            <Chip label="Implementado" color="success" size="small" />
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Fase 0:</strong> Grid moderno com dados mockados. 
              Na Fase Fundação, as mensagens serão carregadas da API e as ações serão persistidas.
            </Typography>
          </Alert>

          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={messages}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Resumo de Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Novas: ${messages.filter(m => m.status === 'nova').length}`} 
                color="error" 
                variant="outlined" 
              />
              <Chip 
                label={`Lidas: ${messages.filter(m => m.status === 'lida').length}`} 
                color="info" 
                variant="outlined" 
              />
              <Chip 
                label={`Pendentes: ${messages.filter(m => m.status === 'pendente').length}`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                label={`Concluídas: ${messages.filter(m => m.status === 'concluida').length}`} 
                color="success" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para visualizar mensagem */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Mensagem de {selectedMessage?.name}
            </Typography>
            {selectedMessage && getStatusChip(selectedMessage.status)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Email:</strong> {selectedMessage.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Telefone:</strong> {selectedMessage.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Data:</strong> {new Date(selectedMessage.date).toLocaleString('pt-BR')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Assunto:</strong> {selectedMessage.subject}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Mensagem:</strong>
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {selectedMessage.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Fechar
          </Button>
          {selectedMessage && (
            <>
              <Button 
                onClick={() => {
                  updateMessageStatus(selectedMessage.id, 'pendente');
                  handleCloseDialog();
                }}
                color="warning"
              >
                Marcar Pendente
              </Button>
              <Button 
                onClick={() => {
                  updateMessageStatus(selectedMessage.id, 'concluida');
                  handleCloseDialog();
                }}
                color="success"
              >
                Marcar Concluída
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContatoContent;