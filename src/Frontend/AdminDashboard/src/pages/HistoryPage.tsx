import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  FormatQuote as QuoteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { SiteSettingsDto } from '../types';

const DEFAULT_HISTORY_TITLE = 'Nossa História';
const DEFAULT_HISTORY_SUBTITLE = 'Uma jornada de fé, caridade e amor ao próximo';
const DEFAULT_HISTORY_MISSION = 'Promover a caridade, o amor fraterno e a elevação espiritual através da Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo assistência espiritual gratuita a todos que buscam a LUZ.';
const DEFAULT_HISTORY_PARAGRAPHS = [
  'A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Ciro na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.',
  "Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema 'Fora da caridade não há salvação' guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.",
  'Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.',
];
const DEFAULT_HISTORY_TEXT = DEFAULT_HISTORY_PARAGRAPHS.join('\n\n');
const LEGACY_HISTORY_TEXT =
  'A Casa de Caridade Batuara é um espaço sagrado dedicado à prática da Umbanda,\n' +
  'uma religião genuinamente brasileira que combina elementos das tradições africanas, indígenas e cristãs.\n\n' +
  'Fundada com o propósito de oferecer auxílio espiritual, orientação e caridade à comunidade, nossa casa\n' +
  'mantém viva a tradição umbandista através de giras, atendimentos fraternos e trabalhos de caridade.\n\n' +
  'Nossos dirigentes e médiuns trabalham com amor e dedicação, sempre guiados pelos Orixás, Guias e\n' +
  'Entidades espirituais que nos orientam no caminho da luz e do bem.\n\n' +
  'Aqui, todos são bem-vindos, independentemente de sua origem, cor ou credo. A Umbanda é uma religião\n' +
  'de amor, paz e caridade, e é com esses valores que recebemos a todos que nos procuram.';

const buildHtmlFromText = (value: string) =>
  value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, '<br />')}</p>`)
    .join('');

const normalizeHistoryForm = (data: SiteSettingsDto): SiteSettingsDto => {
  const aboutText = data.aboutText?.trim();
  const shouldUseDefaultText = !aboutText || aboutText === LEGACY_HISTORY_TEXT.trim();
  const normalizedText = shouldUseDefaultText ? DEFAULT_HISTORY_TEXT : data.aboutText;

  return {
    ...data,
    historyTitle: data.historyTitle?.trim() || DEFAULT_HISTORY_TITLE,
    historySubtitle: data.historySubtitle?.trim() || DEFAULT_HISTORY_SUBTITLE,
    historyMissionText: data.historyMissionText?.trim() || DEFAULT_HISTORY_MISSION,
    aboutText: normalizedText,
    historyHtml:
      shouldUseDefaultText || !data.historyHtml?.trim()
        ? buildHtmlFromText(DEFAULT_HISTORY_TEXT)
        : data.historyHtml,
  };
};

const buildHistoryPayload = (form: SiteSettingsDto): Partial<SiteSettingsDto> => {
  const historyTitle = form.historyTitle?.trim() || DEFAULT_HISTORY_TITLE;
  const historySubtitle = form.historySubtitle?.trim() || DEFAULT_HISTORY_SUBTITLE;
  const historyMissionText = form.historyMissionText?.trim() || DEFAULT_HISTORY_MISSION;
  const aboutText = form.aboutText?.trim() || DEFAULT_HISTORY_TEXT;
  const historyHtml = form.historyHtml?.trim() || buildHtmlFromText(aboutText);

  return {
    aboutText,
    historyTitle,
    historySubtitle,
    historyHtml,
    historyMissionText,
  };
};

const HistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiteSettingsDto | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const editorRef = useRef<HTMLDivElement | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getSiteSettings();
      setForm(normalizeHistoryForm(response.data));
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível carregar a seção Nossa História.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (editorRef.current && form && editorRef.current.innerHTML !== (form.historyHtml || '')) {
      editorRef.current.innerHTML = form.historyHtml || '';
    }
  }, [form]);

  const updateField = (field: keyof SiteSettingsDto, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const syncEditor = () => {
    if (!editorRef.current) {
      return;
    }

    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;
    setForm((prev) => (prev ? { ...prev, historyHtml: html, aboutText: text } : prev));
  };

  const runCommand = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false, value);
    syncEditor();
  };

  const handleSave = async () => {
    if (!form) {
      return;
    }

    setSaving(true);
    try {
      const payload = buildHistoryPayload(form);
      setForm((prev) => (prev ? { ...prev, ...payload } : prev));
      const response = await apiService.updateSiteSettings(payload);
      setForm(normalizeHistoryForm(response.data));
      setFeedback({ open: true, message: 'Seção Nossa História atualizada com sucesso.', severity: 'success' });
    } catch (error: any) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Não foi possível salvar a seção Nossa História.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Nossa História
          </Typography>
          <Typography color="text.secondary">
            Edite o conteúdo institucional em tela cheia com formatação rica e salvamento direto.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSettings}>
            Recarregar
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Use a área editável para aplicar negrito, itálico, listas, citações e links. A interface foi simplificada para focar apenas na edição textual da seção.
      </Alert>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Título"
            value={form.historyTitle}
            onChange={(e) => updateField('historyTitle', e.target.value)}
            fullWidth
          />
          <TextField
            label="Subtítulo"
            value={form.historySubtitle || ''}
            onChange={(e) => updateField('historySubtitle', e.target.value)}
            fullWidth
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Missão da casa"
            value={form.historyMissionText || ''}
            onChange={(e) => updateField('historyMissionText', e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<BoldIcon />} onClick={() => runCommand('bold')}>
            Negrito
          </Button>
          <Button variant="outlined" size="small" startIcon={<ItalicIcon />} onClick={() => runCommand('italic')}>
            Itálico
          </Button>
          <Button variant="outlined" size="small" startIcon={<ListIcon />} onClick={() => runCommand('insertUnorderedList')}>
            Lista
          </Button>
          <Button variant="outlined" size="small" startIcon={<QuoteIcon />} onClick={() => runCommand('formatBlock', 'blockquote')}>
            Citação
          </Button>
        </Stack>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncEditor}
          sx={{
            minHeight: 560,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            overflowY: 'auto',
            fontSize: '1rem',
            lineHeight: 1.9,
            '&:focus': {
              outline: 'none',
              borderColor: 'primary.main',
            },
            '& p': {
              mt: 0,
              mb: 2,
            },
            '& blockquote': {
              borderLeft: 4,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              color: 'text.secondary',
            },
            '& a': {
              color: 'primary.main',
            },
            '& ul': {
              pl: 3,
            },
          }}
        />
      </Paper>

      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoryPage;
