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
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

// Texto atual da seção Sobre (mockado - na Fundação virá da API)
const currentAboutText = `A Casa de Caridade Batuara é um espaço sagrado dedicado à prática da Umbanda, 
uma religião genuinamente brasileira que combina elementos das tradições africanas, indígenas e cristãs.

Fundada com o propósito de oferecer auxílio espiritual, orientação e caridade à comunidade, nossa casa 
mantém viva a tradição umbandista através de giras, atendimentos fraternos e trabalhos de caridade.

Nossos dirigentes e médiuns trabalham com amor e dedicação, sempre guiados pelos Orixás, Guias e 
Entidades espirituais que nos orientam no caminho da luz e do bem.

Aqui, todos são bem-vindos, independentemente de sua origem, cor ou credo. A Umbanda é uma religião 
de amor, paz e caridade, e é com esses valores que recebemos a todos que nos procuram.`;

const SobreContent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(currentAboutText);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedText(currentAboutText);
  };

  const handleSave = () => {
    // Na Fase 0, apenas simula o salvamento
    // Na Fundação, aqui será feita a chamada para a API
    console.log('Salvando texto:', editedText);
    setIsEditing(false);
    setHasChanges(false);
    // Simular sucesso
    alert('Texto salvo com sucesso! (Simulado - será real na Fundação)');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(currentAboutText);
    setHasChanges(false);
    setShowPreview(false);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(event.target.value);
    setHasChanges(event.target.value !== currentAboutText);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Gerenciamento - Sobre / História
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
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={togglePreview}
                  size="small"
                >
                  {showPreview ? 'Editar' : 'Preview'}
                </Button>
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
              Na Fase Fundação, as alterações serão salvas na API e refletidas automaticamente no PublicWebsite.
            </Typography>
          </Alert>

          {isEditing && !showPreview ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Editor de Texto
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={editedText}
                onChange={handleTextChange}
                variant="outlined"
                placeholder="Digite o texto da seção Sobre..."
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Caracteres: {editedText.length}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                {showPreview ? 'Preview das Alterações' : 'Texto Atual'}
              </Typography>
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: showPreview ? 'success.light' : 'grey.50',
                  border: showPreview ? 2 : 1,
                  borderColor: showPreview ? 'success.main' : 'grey.300'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    color: showPreview ? 'success.dark' : 'text.primary'
                  }}
                >
                  {showPreview ? editedText : currentAboutText}
                </Typography>
              </Paper>
              {showPreview && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Este é o preview de como o texto aparecerá no PublicWebsite após salvar.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Técnicas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Texto sincronizado com a seção "Sobre" do PublicWebsite<br />
              • Suporte a quebras de linha e formatação básica<br />
              • Validação automática de conteúdo<br />
              • Preview em tempo real das alterações
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SobreContent;