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
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  Pix as PixIcon,
} from '@mui/icons-material';

interface DonationData {
  pixKey: string;
  pixKeyType: string;
  bankName: string;
  accountType: string;
  agency: string;
  account: string;
  accountHolder: string;
  instructions: string;
  qrCodeUrl: string;
}

// Dados atuais de doações (mockados - na Fundação virão da API)
const currentDonationData: DonationData = {
  pixKey: 'contato@batuara.net',
  pixKeyType: 'Email',
  bankName: 'Banco do Brasil',
  accountType: 'Conta Corrente',
  agency: '1234-5',
  account: '12345-6',
  accountHolder: 'Casa de Caridade Batuara',
  instructions: 'Sua doação é muito importante para manter nossos trabalhos de caridade e assistência espiritual. Qualquer valor é bem-vindo e será usado com responsabilidade.',
  qrCodeUrl: '/qr-code-pix.png'
};

const DoacoesContent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<DonationData>(currentDonationData);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(currentDonationData);
  };

  const handleSave = () => {
    // Na Fase 0, apenas simula o salvamento
    // Na Fundação, aqui será feita a chamada para a API
    console.log('Salvando dados de doações:', editedData);
    if (selectedFile) {
      console.log('Arquivo QR Code selecionado:', selectedFile.name);
    }
    setIsEditing(false);
    setHasChanges(false);
    setSelectedFile(null);
    // Simular sucesso
    alert('Dados de doações salvos com sucesso! (Simulado - será real na Fundação)');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(currentDonationData);
    setHasChanges(false);
    setSelectedFile(null);
  };

  const handleFieldChange = (field: keyof DonationData, value: string) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(currentDonationData) || selectedFile !== null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar se é uma imagem
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setHasChanges(true);
      } else {
        alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc.)');
      }
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Gerenciamento - Doações
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
              Na Fase Fundação, as alterações serão salvas na API e o upload de QR Code será real.
            </Typography>
          </Alert>

          {isEditing ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Editor de Informações de Doações
              </Typography>
              
              <Grid container spacing={3}>
                {/* Upload de QR Code */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, border: '2px dashed', borderColor: 'primary.main' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload do QR Code PIX
                      </Typography>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="qr-code-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="qr-code-upload">
                        <Button variant="contained" component="span" startIcon={<UploadIcon />}>
                          Selecionar Imagem
                        </Button>
                      </label>
                      {selectedFile && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                          Arquivo selecionado: {selectedFile.name}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Informações PIX */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chave PIX"
                    value={editedData.pixKey}
                    onChange={(e) => handleFieldChange('pixKey', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tipo da Chave PIX"
                    value={editedData.pixKeyType}
                    onChange={(e) => handleFieldChange('pixKeyType', e.target.value)}
                    margin="normal"
                    placeholder="Ex: Email, CPF, Telefone, Aleatória"
                  />
                </Grid>

                {/* Informações Bancárias */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Banco"
                    value={editedData.bankName}
                    onChange={(e) => handleFieldChange('bankName', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tipo de Conta"
                    value={editedData.accountType}
                    onChange={(e) => handleFieldChange('accountType', e.target.value)}
                    margin="normal"
                    placeholder="Ex: Conta Corrente, Poupança"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Agência"
                    value={editedData.agency}
                    onChange={(e) => handleFieldChange('agency', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Conta"
                    value={editedData.account}
                    onChange={(e) => handleFieldChange('account', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Titular da Conta"
                    value={editedData.accountHolder}
                    onChange={(e) => handleFieldChange('accountHolder', e.target.value)}
                    margin="normal"
                  />
                </Grid>

                {/* Instruções */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instruções para Doação"
                    value={editedData.instructions}
                    onChange={(e) => handleFieldChange('instructions', e.target.value)}
                    multiline
                    rows={4}
                    margin="normal"
                    placeholder="Mensagem motivacional e instruções para os doadores..."
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Informações Atuais de Doação
              </Typography>
              
              <Grid container spacing={3}>
                {/* QR Code */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <QrCodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">QR Code PIX</Typography>
                    </Box>
                    <Box sx={{ 
                      width: 200, 
                      height: 200, 
                      mx: 'auto', 
                      bgcolor: 'grey.100', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: 1
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        QR Code PIX<br />
                        (Imagem mockada)
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Informações PIX */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PixIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">PIX</Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Chave PIX:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                      {currentDonationData.pixKey}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tipo:</strong> {currentDonationData.pixKeyType}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Informações Bancárias */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BankIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Dados Bancários</Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Banco:</strong> {currentDonationData.bankName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tipo:</strong> {currentDonationData.accountType}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Agência:</strong> {currentDonationData.agency}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Conta:</strong> {currentDonationData.account}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Titular:</strong> {currentDonationData.accountHolder}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Instruções */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Instruções para Doadores
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {currentDonationData.instructions}
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
              • QR Code e informações sincronizados com a seção "Doações" do PublicWebsite<br />
              • Upload de imagem com validação de formato<br />
              • Suporte a múltiplos tipos de chave PIX<br />
              • Integração futura com gateway de pagamento (Fase Avançada)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoacoesContent;