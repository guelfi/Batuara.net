import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { FilhoCasa, FilhoCasaFormData } from '../../types/FilhoCasa';

interface FilhoCasaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FilhoCasaFormData) => void;
  editingFilho?: FilhoCasa | null;
  mode: 'create' | 'edit' | 'view';
}

const FilhoCasaForm: React.FC<FilhoCasaFormProps> = ({
  open,
  onClose,
  onSave,
  editingFilho,
  mode
}) => {
  const [formData, setFormData] = useState<FilhoCasaFormData>({
    nome: '',
    email: '',
    telefone: '',
    dataEntrada: '',
    status: 'ativo',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Partial<FilhoCasaFormData>>({});

  useEffect(() => {
    if (editingFilho) {
      setFormData({
        nome: editingFilho.nome,
        email: editingFilho.email || '',
        telefone: editingFilho.telefone || '',
        dataEntrada: editingFilho.dataEntrada.toISOString().split('T')[0],
        status: editingFilho.status,
        observacoes: editingFilho.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'ativo',
        observacoes: ''
      });
    }
    setErrors({});
  }, [editingFilho, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FilhoCasaFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (11) 99999-9999';
    }

    if (!formData.dataEntrada) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof FilhoCasaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('telefone', formatted);
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Novo Filho da Casa';
      case 'edit':
        return 'Editar Filho da Casa';
      case 'view':
        return 'Visualizar Filho da Casa';
      default:
        return 'Filho da Casa';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {getTitle()}
        </Typography>
        {mode === 'view' && editingFilho && (
          <Typography variant="body2" color="text.secondary">
            Cadastrado em: {editingFilho.createdAt.toLocaleDateString('pt-BR')} | 
            Última atualização: {editingFilho.updatedAt.toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {mode === 'create' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Fase 0.1:</strong> Formulário funcional com validação. 
              Na Fase Fundação, os dados serão salvos na API.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              error={!!errors.nome}
              helperText={errors.nome}
              required
              disabled={isReadOnly}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email || 'Opcional'}
              disabled={isReadOnly}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              error={!!errors.telefone}
              helperText={errors.telefone || 'Formato: (11) 99999-9999'}
              disabled={isReadOnly}
              variant="outlined"
              placeholder="(11) 99999-9999"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data de Entrada"
              type="date"
              value={formData.dataEntrada}
              onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
              error={!!errors.dataEntrada}
              helperText={errors.dataEntrada}
              required
              disabled={isReadOnly}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
                disabled={isReadOnly}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="afastado">Afastado</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={4}
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
              helperText="Informações adicionais sobre o filho da casa (opcional)"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          {isReadOnly ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isReadOnly && (
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            color="primary"
          >
            {mode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FilhoCasaForm;