# Backlog Executável — Batuara.net

## Épicos (mapeados às rotas)

- EP-Events — `/batuara-api/api/events` e `/batuara-api/api/public/events`
- EP-Calendar — `/batuara-api/api/calendar/attendances` e `/batuara-api/api/public/calendar/attendances`
- EP-Orixas — `/batuara-api/api/orixas` e `/batuara-api/api/public/orixas`
- EP-UmbandaLines — `/batuara-api/api/umbanda-lines` e `/batuara-api/api/public/umbanda-lines`
- EP-SpiritualContents — `/batuara-api/api/spiritual-contents` e `/batuara-api/api/public/spiritual-contents`
- EP-Dashboard — `/batuara-api/api/dashboard/...`
- EP-SiteSettings — `/batuara-api/api/site-settings` e `/batuara-api/api/public/site-settings`
- EP-Segurança — MFA, RBAC, rate limiting, WAF, SIEM, Swagger protegido
- EP-Documentação — OpenAPI/Swagger e guias operacionais

## Personas

- Visitante: usuário anônimo do PublicWebsite.
- Devoto: membro da comunidade que utiliza leitura/inscrições públicas.
- Editor: cria/edita conteúdo via Admin.
- Moderador: revisa/aprova conteúdo e inscrições.
- Administrador: gestão completa e segurança.

## Histórias com Critérios de Aceite e Pontos (Fibonacci)

### H-001 (EP-Events, Público)
Como Visitante, quero listar eventos futuros por tipo para planejar minha participação.

- Critérios de aceite
  - GET `/batuara-api/api/public/events` suporta `type`, `fromDate`, `toDate`, `q`, paginação e `sort`.
  - Retorna apenas `isActive=true`; ordenado por data asc quando solicitado.
  - Resposta no padrão PaginatedResponse; enums como string.
  - p95 ≤ 200ms (staging) em 100 req/s com cache habilitado (ETag).
- Pontos: 5 (filtros + ordenação + índices + DTO “card”).  
- Dependências: índices DB (date/type), DTOs/AutoMapper, ETag.

### H-002 (EP-Events, Admin)
Como Editor, quero criar um evento com horários para publicar uma festa.

- Critérios
  - POST `/batuara-api/api/events` valida título, descrição, tipo, data, start<end quando ambos presentes.
  - Regras: sem datas passadas; detecção de conflito; retorna 201 ou 409.
  - Audit log de criação com userId, ip, userAgent, traceId.
- Pontos: 8 (regras domínio + conflito + testes).  
- Dependências: EventDomainService, validações, transações.

### H-003 (EP-Events, Admin)
Como Editor, quero editar detalhes de um evento.

- Critérios
  - PUT/PATCH `/batuara-api/api/events/{id}` com validações e atualização parcial.
  - Mudanças auditadas; DTO de atualização; 200 com dados atualizados.
- Pontos: 5.
- Dependências: mapeamentos/validators.

### H-010 (EP-Calendar, Público)
Como Visitante, quero consultar atendimentos do calendário por intervalo de datas.

- Critérios
  - GET `/batuara-api/api/public/calendar/attendances?fromDate=&toDate=&type=` retorna apenas ativos.
  - Paginação; p95 ≤ 200ms; ETag em janelas cacheáveis.
- Pontos: 5.
- Dependências: índices por data/tipo.

### H-011 (EP-Calendar, Público)
Como Devoto, quero me inscrever em um atendimento quando houver vaga.

- Critérios
  - POST `/batuara-api/api/public/calendar/attendances/{id}/registrations`: 201 quando `requiresRegistration=true` e capacidade disponível; 409 quando lotado.
  - Idempotência por (attendanceId,email) por 24h; rate limit dedicado.
  - Audit log de criação; sem dados sensíveis em logs.
- Pontos: 13 (concorrência/capacidade + idempotência + limites).
- Dependências: transações/locks otimistas, policies de rate limit.

### H-020 (EP-Orixas, Público)
Como Visitante, quero listar e abrir detalhes de Orixás.

- Critérios
  - GET `/batuara-api/api/public/orixas` (ordenado por displayOrder) e `/{id}`.
  - Conteúdo estável com ETag; enums string.
- Pontos: 3.
- Dependências: seeds/migrações, DTOs.

### H-021 (EP-Orixas, Admin)
Como Editor, quero cadastrar/editar Orixás com características, cores e elementos.

- Critérios
  - CRUD completo com validações de tamanho/conteúdo; 201/200/204 conforme operação.
  - Audit log de alterações.
- Pontos: 8.
- Dependências: validators, AutoMapper, repositórios.

### H-030 (EP-UmbandaLines, Público/Admin)
Como Visitante, quero conhecer Linhas da Umbanda; como Editor, quero gerenciá-las.

- Critérios
  - Público: `GET /batuara-api/api/public/umbanda-lines` e `/{id}` com ETag.
  - Admin: CRUD com validações; audit.
- Pontos: 8.
- Dependências: entidades e migrações consolidadas.

### H-040 (EP-SpiritualContents, Público/Admin)
Como Visitante, quero buscar orações/ensinamentos; como Editor, quero gerenciá-los.

- Critérios
  - Público: `GET /batuara-api/api/public/spiritual-contents?type=&category=&q=` com paginação/sort por displayOrder.
  - Admin: CRUD; sanitização de conteúdo; audit.
- Pontos: 8.
- Dependências: sanitização XSS, índices de busca.

### H-050 (EP-SiteSettings, Público/Admin)
Como Visitante, quero ver conteúdo institucional (hero, sobre, contato, doações, localização); como Editor, quero atualizá-lo.

- Critérios
  - Público: `GET /batuara-api/api/public/site-settings` com cache alto (ETag).
  - Admin: `GET/PUT/PATCH /batuara-api/api/site-settings`; validações de URL/e-mail; audit.
- Pontos: 5.
- Dependências: armazenamento de settings e invalidadores de cache.

### H-060 (EP-Dashboard, Admin)
Como Administrador, quero métricas e trilha de auditoria.

- Critérios
  - `GET /batuara-api/api/dashboard/stats` e `GET /batuara-api/api/dashboard/activity-logs` paginado.
  - Logs estruturados; filtros por período/usuário/entidade.
- Pontos: 8.
- Dependências: pipeline de auditoria, índices por timestamp.

### H-070 (EP-Segurança)
Como Administrador, quero MFA TOTP com fallback SMS e RBAC granular por endpoint.

- Critérios
  - Fluxo de login retorna “MFA required” quando ativo; verificação TOTP (RFC 6238), drift ≤ 1 janela.
  - Rotas com policies por role; Swagger protegido em produção.
  - Rate limit: IP 100 req/h (público), Token 1000 req/h (autenticado).
- Pontos: 13.
- Dependências: provider SMS, storage de secrets em Vault, policies de autorização.

### H-080 (EP-Documentação)
Como Stakeholder, quero documentação OpenAPI 3.0 completa e versionada.

- Critérios
  - OpenAPI com componentes reutilizados; exemplos por domínio.
  - Disponível via Swagger em staging/dev; protegido em produção.
- Pontos: 3.
- Dependências: mapeamento de DTOs/rotas finalizado.

## Critérios Gerais (todas as histórias)

- Prefixo obrigatório `/batuara-api`.
- Respostas padronizadas; enums como string; paginação consistente.
- Logs estruturados (Serilog) com `traceId`, `userId`, `ip`, `userAgent`; sem segredos/dados sensíveis.
- Segurança: validação robusta; CORS restrito; rate-limiting por endpoint.
- Testes: unitários (≥80% Domain/Application), integração essenciais; ZAP baseline no pipeline.

## Mapeamento de Dependências

- Internas: Migrations, Repositórios, AutoMapper, Validators, Policies, RateLimiter, Serilog.
- Externas: OCI WAF, SIEM, Vault, Provedor SMS/e-mail, Pipeline CI (ZAP/SAST), DNS/Cert.

## Roadmap de Execução (resumo)

- Fase 1 (núcleo): Events, Calendar, Contact, SiteSettings + OpenAPI.
- Fase 2: Orixás, UmbandaLines, SpiritualContents.
- Fase 3: Dashboard (stats/activity-logs), Segurança avançada e hardening contínuo.

