# Requirements Document

## Introduction

Este documento define os requisitos para implementar a integração completa entre a API Batuara (backend) e as interfaces frontend (PublicWebsite e AdminDashboard) do projeto Casa de Caridade Batuara. Atualmente, todos os serviços estão funcionando individualmente: a API está 100% funcional com sistema de autenticação corrigido, e ambas as interfaces frontend estão operacionais com dados mockados. O objetivo desta especificação é estabelecer a comunicação efetiva entre os sistemas, substituindo os dados mockados por dados reais da API, implementando autenticação integrada e garantindo que todas as funcionalidades do sistema funcionem de forma coesa e segura.

Além da integração técnica, esta especificação também inclui melhorias visuais específicas para o PublicWebsite, como o aumento da legibilidade do texto principal, a incorporação do logo da Casa Batuara como favicon e a utilização de imagens do site antigo para manter a identidade visual.

## Requirements

### Requirement 1

**User Story:** Como um usuário do site público, quero que as informações exibidas sejam atualizadas automaticamente a partir do sistema administrativo, para que eu sempre veja conteúdo atual e preciso sobre eventos, atendimentos e informações da Casa de Caridade.

#### Acceptance Criteria

1. WHEN o PublicWebsite carrega THEN todas as seções DEVEM consumir dados reais da API Batuara em vez de dados mockados.
2. WHEN um administrador atualiza informações no AdminDashboard THEN as alterações DEVEM ser refletidas automaticamente no PublicWebsite.
3. WHEN a API está indisponível THEN o PublicWebsite DEVE exibir uma mensagem de erro amigável e dados em cache quando possível.
4. WHEN dados são carregados da API THEN eles DEVEM ser validados e formatados adequadamente antes da exibição.
5. IF a API retorna erro THEN o sistema DEVE implementar fallback gracioso com dados em cache ou mensagens informativas.

### Requirement 2

**User Story:** Como um visitante do site público, quero uma experiência visual clara e representativa da identidade da Casa de Caridade Batuara, para que eu possa me conectar melhor com a instituição e seus valores.

#### Acceptance Criteria

1. WHEN o PublicWebsite carrega THEN a frase "Casa de Caridade Batuara - Um lar espiritual dedicado à caridade, ao amor e à elevação da alma" DEVE ser exibida com maior contraste e legibilidade, eliminando problemas de transparência.
2. WHEN o site é acessado THEN o logo (Ponto) da Casa Batuara do site antigo DEVE ser utilizado como favicon em todas as páginas.
3. WHEN a página inicial carrega THEN o logo da Casa Batuara DEVE ser exibido acima da frase principal para reforçar a identidade visual.
4. WHEN o site é navegado THEN as imagens de fundo do site antigo (localizadas em ~/Projetos/BATUARA/batuara.org.br/images e ~/Projetos/BATUARA/batuara.org.br/assets/css/images) DEVEM ser incorporadas ao novo design para manter a identidade visual.
5. WHEN elementos visuais são carregados THEN eles DEVEM manter consistência com a identidade visual da Casa Batuara.
6. IF imagens ou elementos visuais não carregam THEN alternativas adequadas DEVEM ser exibidas para manter a experiência visual.

### Requirement 3

**User Story:** Como um administrador, quero fazer login no AdminDashboard usando o sistema de autenticação da API, para que eu possa gerenciar o conteúdo do site de forma segura e integrada.

#### Acceptance Criteria

1. WHEN um administrador acessa o AdminDashboard THEN ele DEVE ser redirecionado para tela de login integrada com a API.
2. WHEN credenciais válidas são fornecidas THEN o sistema DEVE autenticar via API e armazenar token JWT de forma segura.
3. WHEN o token JWT expira THEN o sistema DEVE renovar automaticamente usando refresh token ou solicitar novo login.
4. WHEN um usuário não autenticado tenta acessar páginas protegidas THEN ele DEVE ser redirecionado para login.
5. IF o login falha THEN mensagens de erro claras DEVEM ser exibidas ao usuário.
6. WHEN logout é realizado THEN todos os tokens DEVEM ser removidos e usuário redirecionado para login.

### Requirement 4

**User Story:** Como um administrador, quero gerenciar eventos, atendimentos e conteúdo através do AdminDashboard, para que as alterações sejam salvas na API e refletidas automaticamente no site público.

#### Acceptance Criteria

1. WHEN um administrador cria/edita/exclui eventos THEN as operações DEVEM ser realizadas via API com validação adequada.
2. WHEN operações CRUD são realizadas THEN feedback visual DEVE ser fornecido (loading, sucesso, erro).
3. WHEN dados são salvos THEN eles DEVEM ser validados tanto no frontend quanto no backend.
4. IF operações falham THEN mensagens de erro específicas DEVEM ser exibidas com orientações para correção.
5. WHEN listas são carregadas THEN paginação e filtros DEVEM funcionar via API.
6. WHEN formulários são submetidos THEN validação em tempo real DEVE ser implementada.

### Requirement 5

**User Story:** Como desenvolvedor, quero que a comunicação entre frontend e backend seja robusta e segura, para que o sistema seja confiável e mantenha a integridade dos dados.

#### Acceptance Criteria

1. WHEN requisições são feitas à API THEN elas DEVEM incluir headers de autenticação apropriados quando necessário.
2. WHEN erros de rede ocorrem THEN o sistema DEVE implementar retry automático com backoff exponencial.
3. WHEN dados sensíveis são transmitidos THEN eles DEVEM ser enviados via HTTPS com validação de certificado.
4. IF rate limiting é ativado THEN o frontend DEVE respeitar os limites e implementar throttling.
5. WHEN requisições são feitas THEN logs apropriados DEVEM ser gerados para auditoria e debugging.
6. WHEN dados são recebidos THEN eles DEVEM ser sanitizados antes de serem exibidos para prevenir XSS.

### Requirement 6

**User Story:** Como usuário do sistema, quero que as interfaces respondam rapidamente e forneçam feedback visual adequado, para que eu tenha uma experiência fluida ao usar o sistema.

#### Acceptance Criteria

1. WHEN dados estão sendo carregados THEN indicadores de loading DEVEM ser exibidos.
2. WHEN operações são realizadas THEN feedback de sucesso ou erro DEVE ser fornecido em até 3 segundos.
3. WHEN listas grandes são carregadas THEN paginação ou lazy loading DEVE ser implementado.
4. IF a conexão está lenta THEN o sistema DEVE otimizar requisições e implementar cache inteligente.
5. WHEN formulários são preenchidos THEN validação em tempo real DEVE fornecer feedback imediato.
6. WHEN erros ocorrem THEN mensagens claras e acionáveis DEVEM ser exibidas ao usuário.

### Requirement 7

**User Story:** Como administrador do sistema, quero que todas as ações realizadas no AdminDashboard sejam registradas, para que eu possa auditar alterações e manter controle sobre o conteúdo.

#### Acceptance Criteria

1. WHEN um administrador realiza operações CRUD THEN logs de auditoria DEVEM ser enviados para a API.
2. WHEN logs são gerados THEN eles DEVEM incluir timestamp, usuário, ação e dados relevantes.
3. WHEN erros ocorrem THEN eles DEVEM ser logados com detalhes suficientes para debugging.
4. IF operações críticas são realizadas THEN notificações DEVEM ser enviadas para administradores.
5. WHEN relatórios de auditoria são solicitados THEN eles DEVEM ser gerados a partir dos logs da API.