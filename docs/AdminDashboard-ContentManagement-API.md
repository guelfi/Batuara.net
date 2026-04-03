# AdminDashboard e PublicWebsite — Gestão de Conteúdo

## Visão geral

Este documento descreve os módulos implementados para gestão de conteúdo institucional, relacionamento com o público e cadastros administrativos da Casa Batuara.

Os recursos foram distribuídos entre:

- AdminDashboard para operação interna
- PublicWebsite para exibição pública
- API REST para persistência, validação e sincronização

## Módulos entregues

### 1. Nossa História

- Edição administrativa via `SiteSettings`
- Campos de título, subtítulo, missão, HTML rico e texto institucional
- Editor textual em tela cheia no AdminDashboard
- Exibição pública dinâmica na seção Sobre
- Sanitização de HTML no backend para mitigar XSS
- Remoção dos campos `HistoryImageUrl` e `HistoryVideoUrl` do fluxo atual

### 2. Guias e Entidades

- CRUD administrativo completo
- Cadastro com:
  - nome
  - descrição
  - foto
  - especialidades
  - data de entrada
  - e-mail
  - telefone
  - WhatsApp
  - ordem de exibição
  - status ativo/inativo
- Listagem com busca, filtro, paginação e ordenação
- Endpoint público para consumo futuro do site

### 3. Filhos da Casa

- CRUD administrativo completo
- Cadastro com:
  - nome completo
  - data de nascimento
  - data de entrada
  - Orixá de frente
  - Orixá de costas
  - Orixá de ronda
  - e-mail
  - celular
  - CEP
  - logradouro
  - número
  - complemento
  - bairro
  - cidade
  - estado
  - status ativo/inativo
- Controle financeiro por histórico de contribuições
- Cada contribuição registra:
  - mês de referência
  - vencimento
  - valor
  - status pago/pendente
  - data de pagamento
  - observações

### 4. Doações e Contato

- Edição administrativa dos dados institucionais de contato
- Edição administrativa dos dados bancários e PIX
- Geração automática do payload PIX no backend
- Exibição pública do QR Code PIX com base nos dados salvos
- Persistência de mensagens do formulário público de contato
- Painel administrativo para leitura e atualização de status das mensagens

### 5. Localização e Redes Sociais

- Edição administrativa do endereço completo da casa
- Cadastro de referências e mapa incorporado
- Cadastro administrativo de links para:
  - Facebook
  - Instagram
  - YouTube
  - WhatsApp
- Exibição pública dos dados nas seções Localização e Rodapé

### 6. Regras de exibição temporal

- Eventos públicos filtrados automaticamente para o mês corrente
- Calendário público filtrado automaticamente para o mês corrente
- Atualização automática baseada na data corrente do servidor/cliente

## Endpoints

### Site settings

- `GET /api/site-settings/public`
- `GET /api/site-settings`
- `PUT /api/site-settings`
- `GET /api/v1/site-settings/public`
- `GET /api/v1/site-settings`
- `PUT /api/v1/site-settings`

### Guias e Entidades

- `GET /api/guides`
- `GET /api/guides/{id}`
- `POST /api/guides`
- `PUT /api/guides/{id}`
- `DELETE /api/guides/{id}`
- `GET /api/public/guides`
- `GET /api/public/guides/{id}`
- equivalentes versionados em `/api/v1/...`

### Filhos da Casa

- `GET /api/house-members`
- `GET /api/house-members/{id}`
- `POST /api/house-members`
- `PUT /api/house-members/{id}`
- `DELETE /api/house-members/{id}`
- equivalentes versionados em `/api/v1/...`

### Mensagens de contato

- `POST /api/public/contact-messages`
- `GET /api/contact-messages`
- `GET /api/contact-messages/{id}`
- `PATCH /api/contact-messages/{id}/status`
- equivalentes versionados em `/api/v1/...`

## Segurança aplicada

- Autenticação JWT nos endpoints administrativos
- Rate limiting para rotas públicas e autenticadas
- FluentValidation para payloads de entrada
- Sanitização do HTML de Nossa História
- Uso de EF Core e consultas parametrizadas para evitar SQL Injection
- Atualização de status e CRUD com validação de conflitos básicos

## Modelos persistidos

### `SiteSettings`

Centraliza:

- apresentação institucional
- história rica
- missão da casa
- contatos
- endereço
- redes sociais
- dados bancários
- PIX

### `GuideEntity`

- cadastro institucional de guias e entidades

### `HouseMember`

- cadastro interno de filhos da casa

### `HouseMemberContribution`

- histórico financeiro mensal vinculado ao membro

### `ContactMessage`

- mensagens recebidas do formulário público

## Fluxos principais

### Fluxo de edição institucional

1. Administrador acessa uma tela do AdminDashboard
2. AdminDashboard carrega dados via API autenticada
3. API valida e persiste em banco
4. PublicWebsite lê o mesmo dado pela rota pública
5. Mudança passa a refletir no site sem depender de mock local

### Fluxo de contato público

1. Visitante envia o formulário no PublicWebsite
2. Site chama `POST /api/public/contact-messages`
3. API valida e grava no banco
4. Mensagem fica disponível no AdminDashboard
5. Operador atualiza o status de atendimento

### Fluxo de doação PIX

1. Admin informa chave PIX e dados do recebedor
2. Backend gera payload PIX
3. PublicWebsite usa o payload/chave para renderizar QR Code
4. Visitante visualiza e copia os dados oficiais

## Validação executada

- Build da solução .NET
- Build do AdminDashboard
- Build do PublicWebsite
- Testes automatizados da camada Infrastructure
- Migração EF criada e aplicada no banco local do compose
- Smoke test da API para:
  - login
  - leitura pública de `site-settings`
  - criação pública de mensagem
  - criação/listagem de guia
  - criação de filho da casa
  - atualização de status de mensagem

## Observações operacionais

- O ambiente Docker local precisa de `JWT_SECRET` válido para a API subir
- O banco usado pelo compose local respondeu na porta `5434`
- A migração criada para os novos módulos é `ContentManagementModules`
