import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

// Importar componentes de conteúdo (serão criados nas próximas tarefas)
import DashboardContent from '../dashboard/DashboardContent';
import SobreContent from './SobreContent';
import ContatoContent from './ContatoContent';
import LocalizacaoContent from './LocalizacaoContent';
import DoacoesContent from './DoacoesContent';
import FilhosCasaContent from './FilhosCasaContent';
import PlaceholderContent from './PlaceholderContent';

interface ContentAreaProps {
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
}

const ContentArea: React.FC<ContentAreaProps> = ({ selectedItem, onItemSelect }) => {
  const getItemLabel = (itemId: string): string => {
    const labels: { [key: string]: string } = {
      dashboard: 'Dashboard',
      sobre: 'Sobre / História',
      'filhos-casa': 'Filhos da Casa',
      mensagens: 'Mensagens',
      contato: 'Contato', // Manter para compatibilidade
      localizacao: 'Localização',
      doacoes: 'Doações',
      calendario: 'Calendário',
      eventos: 'Festas e Eventos',
      orixas: 'Orixás',
      guias: 'Guias e Entidades',
      linhas: 'Linhas da Umbanda',
      oracoes: 'Orações',
    };
    return labels[itemId] || 'Dashboard';
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'dashboard':
        return <DashboardContent />;
      case 'sobre':
        return <SobreContent />;
      case 'filhos-casa':
        return <FilhosCasaContent />;
      case 'mensagens':
      case 'contato': // Manter para compatibilidade
        return <ContatoContent />;
      case 'localizacao':
        return <LocalizacaoContent />;
      case 'doacoes':
        return <DoacoesContent />;
      case 'calendario':
        return (
          <PlaceholderContent
            title="Calendário"
            description="Gerenciamento de Giras, Atendimentos e Cursos"
            phase="F1"
            phaseLabel="Fundação"
            features={[
              'Calendário visual interativo',
              'Agendamento de Giras',
              'Controle de Atendimentos',
              'Programação de Cursos',
              'Notificações automáticas'
            ]}
          />
        );
      case 'eventos':
        return (
          <PlaceholderContent
            title="Festas e Eventos"
            description="Gerenciamento de Festas, Bazares e Eventos especiais"
            phase="F1"
            phaseLabel="Fundação"
            features={[
              'Criação e edição de eventos',
              'Gestão de Festas tradicionais',
              'Organização de Bazares',
              'Controle de participantes',
              'Divulgação automática'
            ]}
          />
        );
      case 'orixas':
        return (
          <PlaceholderContent
            title="Orixás"
            description="CRUD completo para gerenciamento de informações sobre Orixás"
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Editor visual de informações',
              'Upload de imagens',
              'Gestão de oferendas',
              'Histórias e características',
              'Sincronização com PublicWebsite'
            ]}
          />
        );
      case 'guias':
        return (
          <PlaceholderContent
            title="Guias e Entidades"
            description="Gerenciamento completo de Guias e Entidades espirituais"
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Cadastro de Guias',
              'Informações detalhadas',
              'Galeria de imagens',
              'Histórico de manifestações',
              'Organização por linhas'
            ]}
          />
        );
      case 'linhas':
        return (
          <PlaceholderContent
            title="Linhas da Umbanda"
            description="Informações completas sobre as Linhas da Umbanda"
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Descrição das Linhas',
              'Características específicas',
              'Pontos cantados',
              'Rituais e procedimentos',
              'Material educativo'
            ]}
          />
        );
      case 'oracoes':
        return (
          <PlaceholderContent
            title="Orações"
            description="Gerenciamento de orações e textos sagrados"
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Editor de orações',
              'Categorização por tipo',
              'Áudio de orações',
              'Compartilhamento',
              'Favoritos dos usuários'
            ]}
          />
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box>
      {/* Breadcrumbs removidos - navegação simplificada */}

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default ContentArea;