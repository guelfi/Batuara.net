import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { FilhoCasa, FilhoCasaFormData } from '../../types/FilhoCasa';
import { mockFilhosCasa, getFilhosCasaStats } from '../../data/mockFilhosCasa';
import FilhoCasaForm from '../forms/FilhoCasaForm';

const FilhosCasaContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filhosCasa, setFilhosCasa] = useState<FilhoCasa[]>(mockFilhosCasa);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingFilho, setEditingFilho] = useState<FilhoCasa | null>(null);
  
  const stats = getFilhosCasaStats();

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Chip label="Ativo" color="success" size="small" />;
      case 'afastado':
        return <Chip label="Afastado" color="warning" size="small" />;
      case 'inativo':
        return <Chip label="Inativo" color="error" size="small" />;
      default:
        return <Chip label="Desconhecido" color="default" size="small" />;
    }
  };

  const handleView = (id: string) => {
    const filho = filhosCasa.find(f => f.id === id);
    if (filho) {
      setEditingFilho(filho);
      setFormMode('view');
      setFormOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const filho = filhosCasa.find(f => f.id === id);
    if (filho) {
      setEditingFilho(filho);
      setFormMode('edit');
      setFormOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const filho = filhosCasa.find(f => f.id === id);
    if (filho && window.confirm(`Tem certeza que deseja excluir ${filho.nome}?`)) {
      setFilhosCasa(prev => prev.filter(f => f.id !== id));
      console.log('Filho da casa excluído:', id);
    }
  };

  const handleAdd = () => {
    setEditingFilho(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleFormSave = (data: FilhoCasaFormData) => {
    if (formMode === 'create') {
      // Criar novo filho da casa
      const newFilho: FilhoCasa = {
        id: Date.now().toString(),
        nome: data.nome,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        dataEntrada: new Date(data.dataEntrada),
        status: data.status,
        observacoes: data.observacoes || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setFilhosCasa(prev => [...prev, newFilho]);
    } else if (formMode === 'edit' && editingFilho) {
      // Atualizar filho da casa existente
      setFilhosCasa(prev => prev.map(f => 
        f.id === editingFilho.id 
          ? {
              ...f,
              nome: data.nome,
              email: data.email || undefined,
              telefone: data.telefone || undefined,
              dataEntrada: new Date(data.dataEntrada),
              status: data.status,
              observacoes: data.observacoes || undefined,
              updatedAt: new Date()
            }
          : f
      ));
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingFilho(null);
  };

  // Colunas responsivas baseadas no tamanho da tela
  const columns: GridColDef[] = isMobile ? [
    // Mobile: apenas nome e telefone
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'telefone',
      headerName: 'Celular',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'Não informado'}
        </Typography>
      ),
    },
  ] : [
    // Desktop: todas as colunas
    {
      field: 'nome',
      headerName: 'Nome',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'Não informado'}
        </Typography>
      ),
    },
    {
      field: 'telefone',
      headerName: 'Telefone',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'Não informado'}
        </Typography>
      ),
    },
    {
      field: 'dataEntrada',
      headerName: 'Data Entrada',
      width: 120,
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
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Visualizar"
          onClick={() => handleView(params.id as string)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.id as string)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDelete(params.id as string)}
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
              Gerenciamento - Filhos da Casa
            </Typography>
            <Chip label="Funcional" color="success" size="small" sx={{ mr: 2 }} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Adicionar
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Fase 0.1:</strong> Interface funcional com dados mockados realistas. 
              Na Fase Fundação, os dados serão integrados com a API e as operações serão persistidas.
            </Typography>
          </Alert>

          {/* Chips de filtro e controles */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${stats.total}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Ativos: ${stats.ativos}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`Afastados: ${stats.afastados}`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                label={`Inativos: ${stats.inativos}`} 
                color="error" 
                variant="outlined" 
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Paginação: 6 itens por página
            </Typography>
          </Box>

          {/* DataGrid */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filhosCasa}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 6 },
                },
                sorting: {
                  sortModel: [{ field: 'nome', sort: 'asc' }],
                },
              }}
              pageSizeOptions={[6, 12, 18]}
              checkboxSelection={!isMobile}
              disableRowSelectionOnClick
              onRowClick={isMobile ? (params) => handleView(params.id as string) : undefined}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection as string[]);
              }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </Box>

          {/* Ações em lote */}
          {selectedRows.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.dark">
                {selectedRows.length} item(ns) selecionado(s)
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                  onClick={() => console.log('Ação em lote:', selectedRows)}
                >
                  Alterar Status
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (window.confirm(`Excluir ${selectedRows.length} item(ns) selecionado(s)?`)) {
                      setFilhosCasa(prev => prev.filter(f => !selectedRows.includes(f.id)));
                      setSelectedRows([]);
                    }
                  }}
                >
                  Excluir Selecionados
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Formulário Modal */}
      <FilhoCasaForm
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        editingFilho={editingFilho}
        mode={formMode}
      />
    </Box>
  );
};

export default FilhosCasaContent;