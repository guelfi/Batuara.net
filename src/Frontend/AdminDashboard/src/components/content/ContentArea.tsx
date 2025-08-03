import React from 'react';
import { Box } from '@mui/material';

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

const ContentArea: React.FC<ContentAreaProps> = ({ selectedItem }) => {

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
            description="Gerenciamento completo de informações sobre os Orixás da Umbanda, suas características, oferendas e histórias sagradas."
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Cadastro completo de cada Orixá',
              'Informações sobre características e domínios',
              'Galeria de imagens e símbolos',
              'Gestão de oferendas e rituais',
              'Histórias e lendas tradicionais',
              'Pontos cantados e riscados',
              'Sincronização com PublicWebsite'
            ]}
          />
        );
      case 'guias':
        return (
          <PlaceholderContent
            title="Guias e Entidades"
            description="Sistema completo para gerenciamento de Guias espirituais, Pretos Velhos, Caboclos, Crianças e demais entidades da casa."
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Cadastro detalhado de cada Guia',
              'Informações sobre manifestações',
              'Histórico de trabalhos realizados',
              'Galeria de imagens e símbolos',
              'Organização por linhas espirituais',
              'Pontos cantados específicos',
              'Registro de consultas e orientações',
              'Calendário de manifestações'
            ]}
          />
        );
      case 'linhas':
        return (
          <PlaceholderContent
            title="Linhas da Umbanda"
            description="Sistema educativo completo sobre as diferentes Linhas da Umbanda, suas características, rituais e ensinamentos tradicionais."
            phase="A1"
            phaseLabel="Recursos Avançados"
            features={[
              'Descrição detalhada de cada Linha',
              'Características e fundamentos específicos',
              'Hierarquia espiritual de cada linha',
              'Pontos cantados tradicionais',
              'Rituais e procedimentos sagrados',
              'Material educativo e apostilas',
              'Histórico e origem das tradições',
              'Calendário de trabalhos por linha'
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