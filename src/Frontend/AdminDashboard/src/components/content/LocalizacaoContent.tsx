import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface LocationData {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  schedule: string;
  additionalInfo: string;
}

// Dados atuais de localização (mockados - na Fundação virão da API)
const currentLocationData: LocationData = {
  address: 'Rua das Flores, 123',
  neighborhood: 'Vila Esperança',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  phone: '(11) 99999-0000',
  email: 'contato@batuara.net',
  schedule: 'Giras: Sextas às 20h\nAtendimentos: Sábados das 14h às 17h\nCursos: Domingos das 9h às 12h',
  additionalInfo: 'Localizada próxima ao metrô Vila Esperança. Estacionamento disponível na rua.'
};

const LocalizacaoContent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<LocationData>(currentLocationData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(currentLocationData);
  };

  const handleSave = () => {
    // Na Fase 0, apenas simula o salvamento
    // Na Fundação, aqui será feita a chamada para a API
    console.log('Salvando dados de localização:', editedData);
    setIsEditing(false);
    setHasChanges(false);
    // Simular sucesso
    alert('Dados de localização salvos com sucesso! (Simulado - será real na Fundação)');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(currentLocationData);
    setHasChanges(false);
  };

  const handleFieldChange = (field: keyof LocationData, value: string) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(currentLocationData));
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Gerenciamento - Localização
            </Typography>
            <Chip label="Implementado" color="success" size="small" sx={{ mr: 2 }} />
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!hasChanges}
                  color="success"
                  size="small"
                >
                  Salvar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  size="small"
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Fase 0:</strong> Interface funcional com dados mockados. 
              Na Fase Fundação, as alterações serão salvas na API e refletidas automaticamente no PublicWebsite e Footer.
            </Typography>
          </Alert>

          {isEditing ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Editor de Informações de Localização
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    value={editedData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Bairro"
                    value={editedData.neighborhood}
                    onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    value={editedData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Estado"
                    value={editedData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="CEP"
                    value={editedData.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={editedData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editedData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Horários de Funcionamento"
                    value={editedData.schedule}
                    onChange={(e) => handleFieldChange('schedule', e.target.value)}
                    multiline
                    rows={4}
                    margin="normal"
                    placeholder="Ex: Giras: Sextas às 20h..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Informações Adicionais"
                    value={editedData.additionalInfo}
                    onChange={(e) => handleFieldChange('additionalInfo', e.target.value)}
                    multiline
                    rows={3}
                    margin="normal"
                    placeholder="Informações sobre transporte, estacionamento, etc."
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Informações Atuais
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Endereço</Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {currentLocationData.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentLocationData.neighborhood}, {currentLocationData.city} - {currentLocationData.state}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CEP: {currentLocationData.zipCode}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Contato</Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Telefone:</strong> {currentLocationData.phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {currentLocationData.email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Horários</Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                    >
                      {currentLocationData.schedule}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Informações Adicionais</Typography>
                    </Box>
                    <Typography variant="body1">
                      {currentLocationData.additionalInfo}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Técnicas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Dados sincronizados com a seção "Localização" do PublicWebsite<br />
              • Informações também aparecem no Footer do site<br />
              • Validação automática de formato de CEP, telefone e email<br />
              • Integração futura com Google Maps (Fase Avançada)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocalizacaoContent;