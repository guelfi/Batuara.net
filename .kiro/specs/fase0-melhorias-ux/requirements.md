# Requisitos - Melhorias UX Fase 0.1

## Introdução

Após o sucesso da Fase 0, identificamos melhorias importantes de UX/UI no AdminDashboard baseadas no feedback de uso real. Estas melhorias focam em responsividade mobile, navegação simplificada e funcionalidades essenciais.

## Requisitos

### Requisito 1 - Responsividade Mobile Otimizada

**User Story:** Como administrador acessando via mobile, quero uma interface limpa sem informações desnecessárias, para ter melhor usabilidade em telas pequenas.

#### Acceptance Criteria

1. QUANDO o AdminDashboard for acessado em dispositivos mobile (< 768px) E em ambiente de produção ENTÃO o sistema NÃO DEVE exibir chips de status/estágio do projeto no Sidebar
2. QUANDO o AdminDashboard for acessado em dispositivos mobile (< 768px) E em ambiente local/desenvolvimento ENTÃO o sistema DEVE exibir os chips de status normalmente
3. QUANDO o AdminDashboard for acessado em tablets/desktop (> 768px) ENTÃO o sistema DEVE exibir os chips de status em qualquer ambiente
4. QUANDO em mobile + produção ENTÃO o Sidebar DEVE manter funcionalidade completa mas com visual simplificado

### Requisito 2 - Navegação Simplificada

**User Story:** Como administrador, quero navegação direta e simples, sem elementos desnecessários como breadcrumbs em estruturas rasas.

#### Acceptance Criteria

1. QUANDO navegar entre seções do AdminDashboard ENTÃO o sistema NÃO DEVE exibir breadcrumbs
2. QUANDO clicar no logo ou nome da casa no header ENTÃO o sistema DEVE navegar para o Dashboard principal
3. QUANDO estiver em qualquer seção ENTÃO o sistema DEVE permitir retorno rápido ao Dashboard via header
4. QUANDO navegar ENTÃO o sistema DEVE manter indicação visual clara da seção ativa no Sidebar

### Requisito 3 - Perfil de Usuário

**User Story:** Como administrador, quero acessar informações do meu perfil de forma similar ao PublicWebsite, para manter consistência de interface.

#### Acceptance Criteria

1. QUANDO clicar no ícone de perfil no header ENTÃO o sistema DEVE exibir card com informações do usuário
2. QUANDO o card de perfil for exibido ENTÃO o sistema DEVE mostrar nome, email e opções básicas
3. QUANDO o card de perfil for exibido ENTÃO o sistema DEVE incluir opção de logout
4. QUANDO em mobile ENTÃO o card de perfil DEVE ser responsivo e bem posicionado

### Requisito 4 - Gerenciamento de Filhos da Casa

**User Story:** Como administrador, quero gerenciar informações dos filhos da casa, para manter dados atualizados e alimentar métricas do Dashboard.

#### Acceptance Criteria

1. QUANDO acessar "Filhos da Casa" no Sidebar ENTÃO o sistema DEVE exibir grid com lista completa
2. QUANDO visualizar o grid ENTÃO o sistema DEVE mostrar: nome, email, telefone, data de entrada, status
3. QUANDO clicar em "Adicionar" ENTÃO o sistema DEVE abrir formulário de cadastro
4. QUANDO clicar em "Editar" ENTÃO o sistema DEVE abrir formulário preenchido
5. QUANDO clicar em "Excluir" ENTÃO o sistema DEVE solicitar confirmação
6. QUANDO salvar dados ENTÃO o sistema DEVE atualizar contador no Dashboard principal
7. QUANDO filtrar ou buscar ENTÃO o sistema DEVE permitir localização rápida de registros

### Requisito 5 - Integração com Dados do PublicWebsite

**User Story:** Como administrador, quero que os dados de localização sejam consistentes entre PublicWebsite e AdminDashboard, para evitar duplicação de informações.

#### Acceptance Criteria

1. QUANDO acessar "Gerenciamento - Localização" ENTÃO o sistema DEVE carregar dados atuais do PublicWebsite
2. QUANDO alterar informações de localização ENTÃO o sistema DEVE sincronizar com o PublicWebsite
3. QUANDO salvar alterações ENTÃO o sistema DEVE atualizar ambas as interfaces
4. QUANDO houver erro de sincronização ENTÃO o sistema DEVE exibir mensagem clara de erro
5. QUANDO carregar dados ENTÃO o sistema DEVE mostrar indicador de carregamento

### Requisito 6 - Posicionamento no Sidebar

**User Story:** Como administrador, quero encontrar facilmente a opção "Filhos da Casa" no menu, para acesso rápido a esta funcionalidade importante.

#### Acceptance Criteria

1. QUANDO visualizar o Sidebar ENTÃO "Filhos da Casa" DEVE aparecer na seção de funcionalidades implementadas (P0)
2. QUANDO visualizar o Sidebar ENTÃO "Filhos da Casa" DEVE estar posicionado após "Sobre/História" e antes de "Mensagens"
3. QUANDO visualizar o Sidebar ENTÃO "Contato" DEVE ser renomeado para "Mensagens"
4. QUANDO "Filhos da Casa" for implementado ENTÃO DEVE exibir chip "Funcional"
5. QUANDO clicar em "Filhos da Casa" ENTÃO DEVE navegar para interface de gerenciamento

### Requisito 7 - Melhoria de Contraste Visual

**User Story:** Como administrador, quero identificar claramente qual seção está ativa no Sidebar, para ter melhor orientação visual na navegação.

#### Acceptance Criteria

1. QUANDO um item do Sidebar estiver selecionado ENTÃO o sistema DEVE usar fonte mais escura para melhor legibilidade
2. QUANDO um item do Sidebar estiver selecionado ENTÃO o sistema DEVE usar fundo mais claro para maior contraste
3. QUANDO um item do Sidebar estiver selecionado ENTÃO o sistema DEVE garantir contraste mínimo de 4.5:1 (WCAG AA)
4. QUANDO navegar entre seções ENTÃO o sistema DEVE manter indicação visual clara e consistente
5. QUANDO em modo escuro (futuro) ENTÃO o sistema DEVE adaptar as cores mantendo o contraste adequado

### Requisito 8 - Limpeza Visual do Header

**User Story:** Como administrador, quero um header mais limpo e focado, para melhor experiência visual.

#### Acceptance Criteria

1. QUANDO visualizar o Sidebar ENTÃO o sistema NÃO DEVE exibir "Batuara.net" no topo
2. QUANDO visualizar o Sidebar ENTÃO o sistema DEVE manter apenas logo + "Admin Dashboard"
3. QUANDO visualizar o Sidebar ENTÃO o sistema DEVE manter proporções visuais equilibradas
4. QUANDO em mobile ENTÃO o header do Sidebar DEVE ser ainda mais compacto

### Requisito 9 - UX Mobile Otimizada para Dashboard

**User Story:** Como administrador acessando via mobile, quero ver mais informações do Dashboard na primeira tela, para ter visão geral completa sem precisar rolar muito.

#### Acceptance Criteria

1. QUANDO acessar o Dashboard em mobile (< 768px) ENTÃO os cards de métricas DEVEM ser dispostos 2x2 (dois por linha)
2. QUANDO acessar o Dashboard em mobile ENTÃO os cards DEVEM ter altura reduzida para otimizar espaço vertical
3. QUANDO acessar o Dashboard em mobile ENTÃO as seções "Atividades Recentes" e "Resumo Rápido" DEVEM ser visíveis sem scroll
4. QUANDO acessar o Dashboard em tablet/desktop ENTÃO DEVE manter layout atual (4 cards em linha)
5. QUANDO em mobile ENTÃO o conteúdo dos cards DEVE permanecer legível e funcional
6. QUANDO em mobile ENTÃO as informações essenciais DEVEM estar visíveis na primeira tela (above the fold)