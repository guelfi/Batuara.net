# Requirements Document

## Introduction

Este documento define os requisitos para resolver o problema crítico atual do projeto Casa de Caridade Batuara: a incapacidade de visualizar as interfaces frontend (Public Website e Admin Dashboard) que já foram implementadas e estavam funcionando anteriormente. Os componentes frontend já estavam operacionais com dados mockados, e a API Batuara.API também estava bem adiantada, com todos os serviços buildando e levantando corretamente. No entanto, atualmente os servidores React não estão iniciando corretamente, o que impede a avaliação da UX/UI das interfaces e bloqueia o progresso do projeto. Esta especificação visa estabelecer os requisitos necessários para diagnosticar e resolver esses problemas, permitindo que as interfaces sejam visualizadas e avaliadas corretamente, retornando ao estado funcional anterior.

## Requirements

### Requirement 1

**User Story:** Como um desenvolvedor, quero poder iniciar e visualizar o site público (PublicWebsite) localmente, para que eu possa avaliar e validar a implementação da interface do usuário que estava funcionando anteriormente.

#### Acceptance Criteria

1. WHEN o comando `npm start` é executado no diretório `src/Frontend/PublicWebsite` THEN o servidor de desenvolvimento React DEVE iniciar sem erros, como estava funcionando anteriormente.
2. WHEN o servidor de desenvolvimento do site público está em execução THEN a interface DEVE ser acessível através do navegador em `http://localhost:3000`.
3. WHEN a interface do site público é carregada THEN todas as 9 seções principais DEVEM ser renderizadas corretamente com os dados mockados existentes.
4. IF existirem conflitos de dependências no package.json THEN eles DEVEM ser resolvidos sem quebrar a funcionalidade existente.
5. IF o servidor não iniciar devido a problemas de porta THEN o sistema DEVE fornecer uma mensagem de erro clara e sugerir uma solução.
6. WHEN a interface é restaurada THEN ela DEVE manter todas as funcionalidades que já estavam implementadas anteriormente.

### Requirement 2

**User Story:** Como um desenvolvedor, quero poder iniciar e visualizar o dashboard administrativo (AdminDashboard) localmente, para que eu possa avaliar e validar a implementação da interface administrativa que estava funcionando anteriormente.

#### Acceptance Criteria

1. WHEN o comando `npm start` é executado no diretório `src/Frontend/AdminDashboard` THEN o servidor de desenvolvimento React DEVE iniciar sem erros, como estava funcionando anteriormente.
2. WHEN o servidor de desenvolvimento do dashboard administrativo está em execução THEN a interface DEVE ser acessível através do navegador em `http://localhost:3001`.
3. WHEN a interface do dashboard administrativo é carregada THEN todas as páginas de gerenciamento DEVEM ser acessíveis através do menu de navegação e funcionar com os dados mockados existentes.
4. IF existirem conflitos de dependências no package.json THEN eles DEVEM ser resolvidos sem quebrar a funcionalidade existente.
5. IF o servidor não iniciar devido a problemas de porta THEN o sistema DEVE fornecer uma mensagem de erro clara e sugerir uma solução.
6. WHEN o sistema de autenticação é carregado THEN ele DEVE funcionar corretamente com as credenciais mockadas existentes.

### Requirement 3

**User Story:** Como um desenvolvedor, quero um processo de diagnóstico sistemático para identificar e resolver problemas de inicialização dos servidores React, para que eu possa solucionar problemas semelhantes no futuro.

#### Acceptance Criteria

1. WHEN um problema de inicialização é encontrado THEN um log detalhado DEVE ser gerado para auxiliar no diagnóstico.
2. WHEN o diagnóstico é realizado THEN um relatório DEVE ser gerado identificando a causa raiz do problema.
3. WHEN uma solução é implementada THEN ela DEVE ser documentada para referência futura.
4. IF o problema estiver relacionado a dependências THEN um processo de atualização segura DEVE ser estabelecido.
5. IF o problema estiver relacionado a configurações THEN um guia de configuração correta DEVE ser criado.

### Requirement 4

**User Story:** Como um desenvolvedor, quero garantir que as interfaces frontend sejam compatíveis com o ambiente de desenvolvimento atual, para que eu possa continuar o desenvolvimento sem problemas de compatibilidade.

#### Acceptance Criteria

1. WHEN as dependências são instaladas THEN elas DEVEM ser compatíveis com as versões do Node.js e npm utilizadas no ambiente de desenvolvimento.
2. WHEN o ambiente de desenvolvimento é configurado THEN todas as variáveis de ambiente necessárias DEVEM estar definidas corretamente.
3. IF forem necessárias atualizações de dependências THEN elas DEVEM ser realizadas de forma a manter a compatibilidade com o código existente.
4. IF forem necessárias alterações nas configurações THEN elas DEVEM ser documentadas no README do projeto.
5. WHEN a API Batuara.API é iniciada THEN ela DEVE ser acessível pelos frontends, caso necessário para testes de integração.
6. WHEN os serviços frontend são restaurados THEN eles DEVEM ser capazes de se comunicar com a API quando esta estiver disponível.