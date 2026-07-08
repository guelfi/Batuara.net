# Backlog Executável — Batuara.net

**Última atualização:** 2026.07.08
**Objetivo:** refletir o backlog executável conforme o código atual (não o plano original)

## Épicos (mapeados às rotas)

- EP-Events — `/batuara-api/api/events` e `/batuara-api/api/public/events`
- EP-Calendar — `/batuara-api/api/calendar/attendances` e `/batuara-api/api/public/calendar/attendances` (há também `/batuara-api/api/public/calendar/attendances` via controller público atual)
- EP-Orixas — `/batuara-api/api/orixas` e `/batuara-api/api/public/orixas`
- EP-UmbandaLines — `/batuara-api/api/umbanda-lines` e `/batuara-api/api/public/umbanda-lines`
- EP-SpiritualContents — `/batuara-api/api/spiritual-contents` e `/batuara-api/api/public/spiritual-contents`
- EP-Dashboard — `/batuara-api/api/dashboard/...`
- EP-SiteSettings — `/batuara-api/api/site-settings` e `/batuara-api/api/site-settings/public`
- EP-Contact — `/batuara-api/api/public/contact-messages` e resposta WhatsApp admin em `/batuara-api/api/contact-messages/{id}/whatsapp-response`
- EP-Audit — trilha de auditoria, correlação e retenção operacional
- EP-Segurança — MFA, RBAC, rate limiting, WAF, SIEM, Swagger protegido
- EP-WhatsApp — Evolution API OCI, login de Filho da Casa, autosserviço, lembretes de contribuição e resposta de contato por WhatsApp
- EP-Documentação — OpenAPI/Swagger e guias operacionais
- EP-Operação Local — scripts, docker compose, troubleshooting de proxy e verificação de saúde

## Personas

- Visitante: usuário anônimo do PublicWebsite.
- Devoto: membro da comunidade que utiliza leitura/inscrições públicas.
- Editor: cria/edita conteúdo via Admin.
- Moderador: revisa/aprova conteúdo e inscrições.
- Administrador: gestão completa e segurança.
- Filho da Casa: membro cadastrado que acessa somente o próprio cadastro via login WhatsApp.

## Histórias com Critérios de Aceite e Pontos (Fibonacci)

## Status Atual de Execução (Resumo)

| Épico | Situação atual | Observação |
|---|---|---|
| EP-Events | Implementado | CRUD admin e leitura pública já existem |
| EP-Calendar | Implementado | CRUD admin e leitura pública já existem |
| EP-Orixas | Implementado | CRUD admin e leitura pública já existem |
| EP-UmbandaLines | Implementado | CRUD admin e leitura pública já existem |
| EP-SpiritualContents | Implementado | CRUD admin e leitura pública já existem |
| EP-SiteSettings | Implementado | História, missão, localização, redes, PIX e dados bancários via `SiteSettings` |
| EP-Contact | Implementado | Endpoint público para mensagens, opt-in WhatsApp e resposta admin por WhatsApp existem |
| EP-Dashboard | Implementado | Dashboard e seções admin existem (consumo/integração pode evoluir) |
| EP-Segurança | Parcial | JWT, RBAC/multiadmin e rate limit base operando; itens avançados variam por ambiente |
| EP-WhatsApp | Implementado/Operacional | Código implementado; Evolution API `batuara-casa` conectada e validada com envio real; pendente E2E completo de login/autosserviço, recorrência e resposta de contato |
| EP-Documentação | Parcial | Existem docs e coleções Postman, mas requerem atualização contínua |
| EP-Operação Local | Implementado | Stack docker local existe e é o caminho recomendado |

## Uso do Documento

- Use a seção **Status Atual de Execução (Resumo)** para saber o que já foi entregue.
- Use as histórias para entender critérios de aceite, dependências e endpoints.
- Use a **Matriz Única de Execução** como referência histórica de priorização.
- Use as referências cruzadas em `docs/STATUS-PROJETO.md` e `docs/TASK_HISTORY.md` para validar mudanças recentes.

## Handoff Atual — 2026-07-08

Concluído e validado localmente:

- RBAC/multiadmin, login WhatsApp e autosserviço de Filho da Casa.
- Contribuições recorrentes com persistência real e geração da próxima mensalidade quando a atual é paga.
- Lembretes de contribuição por WhatsApp com opt-in e throttling, desligados por padrão.
- Contato público com opt-in para resposta por WhatsApp e endpoint admin de resposta.
- Migration `20260708130000_AddRecurringContributionAndWhatsAppContact` e snapshot EF alinhados.
- Deploy rolling com migration idempotente e envs de WhatsApp/lembretes.

Validações executadas:

- Backend: `dotnet test "Batuara.sln" -c Release` via container SDK, 33 testes passaram.
- API: `dotnet build "src/Backend/Batuara.API/Batuara.API.csproj" -c Release` via container SDK, passou.
- Frontends: `npm run build` em AdminDashboard e PublicWebsite, passou com warnings antigos.
- Deploy/infra: compose produção validado, scripts de deploy validados com `bash -n`, imagens locais rebuiltadas e containers locais `healthy`.

Próximos passos para outra ferramenta:

- Preparar commit seletivo; evitar `.claude/`, `docs/.~lock.Plano de Testes Batuara.xlsx#` e `scripts/output/`.
- Executar E2E real dos fluxos WhatsApp antes de produção.
- Revisar logs da Evolution API e manter lembretes automáticos desligados até decisão explícita.

## Dependências Técnicas Transversais

- `.NET 8`, `EF Core 8`, `PostgreSQL`
- `React 19`, `Material UI 7`, `TanStack Query 5`
- `Nginx` e `docker-compose.local.yml`
- `SiteSettingsService`, validators, DTOs, controllers e migrations
- `EvolutionApiWhatsAppService`, `ContributionReminderProcessor`, `MemberAuthService` e `ContactMessageService`

## Exemplos de Validação

```bash
curl http://localhost/batuara-api/health
curl http://localhost/batuara-api/api/site-settings/public
curl http://localhost/batuara-api/api/public/calendar/attendances
```

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

### H-004 (EP-Events, Admin)
Como Editor, quero excluir (soft delete) ou desativar um evento.

- Critérios
  - DELETE `/batuara-api/api/events/{id}` realiza exclusão lógica (`isActive=false`); retorna 204.
  - PATCH `/batuara-api/api/events/{id}` permite toggle de `isActive`.
  - Evento desativado não aparece nas listagens públicas.
  - Audit log de exclusão/desativação.
- Pontos: 3.
- Dependências: H-002, H-003 (CRUD base implementado).

### H-005 (EP-Events, Admin)
Como Administrador, quero listar todos os eventos (incluindo inativos) no painel admin.

- Critérios
  - GET `/batuara-api/api/events` retorna todos os eventos (ativos e inativos) com filtros, paginação e ordenação.
  - Suporta filtro por `isActive`, `type`, `fromDate`, `toDate`, `q`.
- Pontos: 3.
- Dependências: H-001 (padrões de listagem pública já definidos).

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

### H-012 (EP-Calendar, Admin)
Como Administrador, quero criar e editar atendimentos no calendário.

- Critérios
  - POST `/batuara-api/api/calendar/attendances` cria atendimento com validações de data, tipo, capacidade; retorna 201.
  - PUT/PATCH `/batuara-api/api/calendar/attendances/{id}` atualiza dados; alterações auditadas.
  - Validação: `startTime < endTime`; `maxCapacity > 0` quando `requiresRegistration=true`.
- Pontos: 8.
- Dependências: H-010 (modelo e DTOs de Calendar já definidos), validators, AutoMapper.

### H-013 (EP-Calendar, Admin)
Como Administrador, quero listar, desativar e gerenciar inscrições de atendimentos.

- Critérios
  - GET `/batuara-api/api/calendar/attendances` lista todos (ativos e inativos) com filtros e paginação.
  - DELETE `/batuara-api/api/calendar/attendances/{id}` realiza exclusão lógica; retorna 204.
  - GET `/batuara-api/api/calendar/attendances/{id}/registrations` lista inscrições; suporta filtro por status.
  - PATCH `/batuara-api/api/calendar/attendances/{id}/registrations/{regId}` permite alterar status (Confirmed/Cancelled).
  - Audit log de todas as operações.
- Pontos: 8.
- Dependências: H-012 (CRUD admin base), H-011 (inscrições).

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
  - Público: `GET /batuara-api/api/site-settings/public` com cache alto (ETag).
  - Admin: `GET/PUT/PATCH /batuara-api/api/site-settings`; validações de URL/e-mail; audit.
- Pontos: 5.
- Dependências: armazenamento de settings e invalidadores de cache.

### H-051 (EP-SiteSettings, Admin) — Atualização de Nossa História (texto rico, sem mídia)
Como Editor, quero atualizar a seção Nossa História com editor de texto rico, sem uploads de imagem/vídeo.

- Critérios
  - AdminDashboard apresenta apenas editor textual e campos de título/subtítulo/missão.
  - `PUT /batuara-api/api/site-settings` persiste `historyTitle`, `historySubtitle`, `historyHtml`, `historyMissionText` e `aboutText`.
  - O backend aplica fallback quando `historyTitle` vier vazio/whitespace.
  - Não há mais campos de `historyImageUrl` nem `historyVideoUrl` em DTOs e banco.
- Pontos: 3.
- Dependências: migrations de remoção de mídia e sincronização DTOs frontend/backend.

### H-090 (EP-Operação Local) — Recriação do Nginx para evitar 502
Como Desenvolvedor, quero restaurar rapidamente o ambiente local quando ocorrer 502 após rebuilds de containers.

- Critérios
  - `docker compose ps` exibe API como healthy, mas `/batuara-api/*` retorna 502 pelo proxy.
  - Executar recriação do Nginx restabelece rotas `/batuara-api`, `/batuara-public` e `/batuara-admin`.
  - Documentação descreve o procedimento e o motivo (upstreams/rota de proxy).
- Pontos: 2.
- Dependências: `docker-compose.local.yml` e `nginx/batuara.local.conf`.

### H-055 (EP-Contact, Público)
Como Visitante, quero enviar uma mensagem de contato para receber orientação ou esclarecimentos.

- Critérios
  - POST `/batuara-api/api/public/contact-messages` valida `name`, `email`, `subject` e `message`, com limites de tamanho e sanitização.
  - Retorna `202 Accepted` quando a mensagem é aceita para processamento.
  - Aplica rate limiting por IP, proteção anti-spam e não expõe detalhes internos de processamento.
  - Gera trilha mínima de auditoria com `traceId`, `ip`, `userAgent` e sem dados sensíveis em logs.
- Pontos: 5.
- Dependências: validators, policies de rate limit, mecanismo de persistência/filas e padronização de logs.

### H-060 (EP-Dashboard, Admin)
Como Administrador, quero métricas e trilha de auditoria.

- Critérios
  - `GET /batuara-api/api/dashboard/stats` e `GET /batuara-api/api/dashboard/activity-logs` paginado.
  - Logs estruturados; filtros por período/usuário/entidade.
- Pontos: 8.
- Dependências: pipeline de auditoria, índices por timestamp.

### H-061 (EP-Audit, Admin)
Como Administrador, quero consultar trilhas de auditoria por usuário, entidade e ação para investigar alterações e incidentes.

- Critérios
  - Eventos de criação, atualização, exclusão lógica, autenticação e ações sensíveis geram registros de auditoria consistentes.
  - Cada registro contém ao menos `timestamp`, `action`, `entityType`, `entityId`, `userId`, `traceId`, `ip` e `userAgent`.
  - Consulta administrativa suporta filtros por período, usuário, entidade e tipo de ação.
  - Política de retenção e estratégia de indexação ficam documentadas e alinhadas ao ambiente OCI/SIEM.
- Pontos: 8.
- Dependências: Serilog estruturado, storage/indexação de logs, correlação com dashboard e políticas de retenção.

### H-070 (EP-Segurança)
Como Administrador, quero MFA TOTP com fallback SMS e RBAC granular por endpoint.

- Critérios
  - Fluxo de login retorna “MFA required” quando ativo; verificação TOTP (RFC 6238), drift ≤ 1 janela.
  - Rotas com policies por role; Swagger protegido em produção.
  - Rate limit: IP 100 req/h (público), Token 1000 req/h (autenticado).
- Pontos: 13.
- Dependências: provider SMS, storage de secrets em Vault, policies de autorização.

### H-071 (EP-Segurança/RBAC) — Multiadmin e roles por rota
Como Administrador, quero gerir usuários administrativos e restringir telas por perfil.

- Status: implementado em 2026-07-08.
- Critérios
  - Roles alinhadas no backend/frontend: `Admin=1`, `Editor=2`, `Viewer=3`, `Member=4`.
  - Página `Usuários` disponível apenas para Admin.
  - Rotas de conteúdo disponíveis para Admin/Editor.
  - Member fica restrito a `Meu Cadastro`.
  - Labels de perfil corrigidos no frontend.
- Pontos: entregue.
- Referência: `docs/Status Atual - RBAC WhatsApp e COR-09.md`.

### H-090 (EP-WhatsApp) — Evolution API OCI e envio WhatsApp
Como Operador, quero enviar códigos de login por WhatsApp usando Evolution API self-hosted na OCI sem expor o painel publicamente.

- Status: implementado/operacional em 2026-07-08.
- Critérios
  - Evolution API executa na OCI via `scripts/docker/docker-compose.whatsapp.yml`.
  - API/Manager escutam somente em `127.0.0.1:8085`.
  - Acesso remoto ao Manager somente por túnel SSH.
  - Instância definitiva `batuara-casa` está `open`.
  - Envio real confirmado e recebido em `5511975747470` e `5511995384032`.
- Pontos: entregue.
- Pendências: revisar logs antes de produção e trocar para chip dedicado da Casa quando disponível.
- Referência: `docs/Evolution API - Operacao OCI.md`.

### H-091 (EP-WhatsApp) — Login e autosserviço de Filho da Casa
Como Filho da Casa, quero receber um código por WhatsApp e acessar apenas meu próprio cadastro.

- Status: implementado em código; pendente E2E completo.
- Critérios
  - `POST /api/member-auth/request-code` gera código e envia WhatsApp.
  - `POST /api/member-auth/verify-code` valida código e emite JWT `Member`.
  - `GET/PUT /api/members/me` acessa apenas o próprio cadastro.
  - `POST /api/members/me/contributions` registra contribuição pendente.
  - Member não acessa rotas administrativas.
- Pontos: entregue em código; validação E2E pendente.
- Referência: `docs/Plano de Implementacao - RBAC e Login WhatsApp.md`.

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

- Bloco 6.0–6.1 (núcleo): Fundação técnica + SiteSettings, Events, Contact, Calendar + OpenAPI.
- Bloco 6.2 (conteúdo): Orixás, UmbandaLines, SpiritualContents.
- Bloco 6.3–6.4 (governança e segurança): Dashboard, Audit trail, MFA/RBAC granular, WAF/SIEM e hardening contínuo.

## Matriz Única de Execução

> A matriz abaixo preserva a ordem histórica de execução. Para o estado real atual do produto, considerar prioritariamente a seção **Status Atual de Execução (Resumo)** no início deste documento.

### Legenda de Status Inicial

- Planejado: item ainda não iniciado
- Preparação: depende de contrato, modelagem ou infraestrutura base
- Bloqueado: depende de fator externo ou conclusão de pré-requisito

| Ordem | Fase | Bloco | Épico | História | Persona | Objetivo resumido | Endpoints principais | Prioridade | Pontos | Dependências-chave | Status inicial |
|------|------|-------|--------|----------|---------|-------------------|----------------------|------------|--------|--------------------|----------------|
| 1 | Fundação | 6.0 | EP-Documentação | H-080 | Stakeholder | Consolidar OpenAPI 3.0 e versionamento | `/batuara-api/api/**`, `/batuara-api/swagger` | P0 | 3 | DTOs, rotas, componentes reutilizados, regra de exposição do Swagger | Preparação |
| 2 | Núcleo | 6.1 | EP-SiteSettings | H-050 | Visitante / Editor | Publicar e gerenciar conteúdo institucional | `/batuara-api/api/site-settings/public`, `/batuara-api/api/site-settings` | P0 | 5 | storage de settings, invalidação de cache, validações de URL/e-mail | Planejado |
| 3 | Núcleo | 6.1 | EP-Events | H-001 | Visitante | Listar eventos futuros com filtros e paginação | `/batuara-api/api/public/events` | P0 | 5 | índices date/type, DTO card, AutoMapper, ETag | Planejado |
| 4 | Núcleo | 6.1 | EP-Events | H-002 | Editor | Criar evento com validações e regras de domínio | `/batuara-api/api/events` | P0 | 8 | EventDomainService, validators, transações, auditoria | Planejado |
| 5 | Núcleo | 6.1 | EP-Events | H-003 | Editor | Editar detalhes e status de evento | `/batuara-api/api/events/{id}` | P0 | 5 | DTOs de update, validators, trilha de alterações | Planejado |
| 5a | Núcleo | 6.1 | EP-Events | H-004 | Editor | Excluir (soft delete) ou desativar evento | `/batuara-api/api/events/{id}` | P0 | 3 | H-002, H-003 (CRUD base) | Planejado |
| 5b | Núcleo | 6.1 | EP-Events | H-005 | Administrador | Listar todos os eventos (incluindo inativos) no admin | `/batuara-api/api/events` | P0 | 3 | H-001 (padrões de listagem) | Planejado |
| 6 | Núcleo | 6.1 | EP-Contact | H-055 | Visitante | Enviar mensagem de contato com proteção anti-spam | `/batuara-api/api/public/contact-messages` | P0 | 5 | validators, rate limit, persistência/fila, logs padronizados | Planejado |
| 7 | Conteúdo | 6.2 | EP-Orixas | H-020 | Visitante | Consultar catálogo e detalhes de Orixás | `/batuara-api/api/public/orixas`, `/batuara-api/api/public/orixas/{id}` | P1 | 3 | seeds/migrações, DTOs, ordenação, ETag | Planejado |
| 8 | Conteúdo | 6.2 | EP-Orixas | H-021 | Editor | Cadastrar e editar Orixás | `/batuara-api/api/orixas`, `/batuara-api/api/orixas/{id}` | P1 | 8 | validators, AutoMapper, repositórios, auditoria | Planejado |
| 9 | Conteúdo | 6.2 | EP-UmbandaLines | H-030 | Visitante / Editor | Consultar e gerenciar Linhas da Umbanda | `/batuara-api/api/public/umbanda-lines`, `/batuara-api/api/umbanda-lines` | P1 | 8 | entidades consolidadas, migrações, validators, auditoria | Planejado |
| 10 | Conteúdo | 6.2 | EP-SpiritualContents | H-040 | Visitante / Editor | Buscar e gerenciar orações e ensinamentos | `/batuara-api/api/public/spiritual-contents`, `/batuara-api/api/spiritual-contents` | P1 | 8 | sanitização XSS, busca textual, categorização, índices | Planejado |
| 11 | Núcleo avançado | 6.1 | EP-Calendar | H-010 | Visitante | Consultar atendimentos do calendário | `/batuara-api/api/public/calendar/attendances` | P1 | 5 | índices por data/tipo, paginação, ETag | Planejado |
| 12 | Núcleo avançado | 6.1 | EP-Calendar | H-011 | Devoto | Inscrever-se em atendimento com controle de vagas | `/batuara-api/api/public/calendar/attendances/{id}/registrations` | P1 | 13 | transações atômicas, locks/idempotência, rate limit dedicado | Planejado |
| 12a | Núcleo avançado | 6.1 | EP-Calendar | H-012 | Administrador | Criar e editar atendimentos no calendário | `/batuara-api/api/calendar/attendances` | P1 | 8 | H-010, validators, AutoMapper | Planejado |
| 12b | Núcleo avançado | 6.1 | EP-Calendar | H-013 | Administrador | Listar, desativar e gerenciar inscrições | `/batuara-api/api/calendar/attendances`, `.../registrations` | P1 | 8 | H-012, H-011 (CRUD + inscrições) | Planejado |
| 13 | Governança | 6.3 | EP-Dashboard | H-060 | Administrador | Consultar métricas e atividade administrativa | `/batuara-api/api/dashboard/stats`, `/batuara-api/api/dashboard/activity-logs` | P1 | 8 | pipeline de auditoria, índices por timestamp, dados dos domínios anteriores | Planejado |
| 14 | Governança | 6.3 | EP-Audit | H-061 | Administrador | Consultar trilhas de auditoria por usuário, ação e entidade | trilha transversal + consulta administrativa | P1 | 8 | Serilog estruturado, storage/indexação de logs, retenção, correlação com SIEM | Planejado |
| 15 | Segurança | 6.4 | EP-Segurança | H-070 | Administrador | Habilitar MFA, RBAC granular e limites por perfil | `/batuara-api/api/auth/**`, `/batuara-api/api/**` | P1 | 13 | provider SMS, Vault, policies, WAF, SIEM, domínio válido para HTTPS final | Bloqueado |

### Visão por Dependência de Execução

| Grupo de dependência | Itens impactados | Observação operacional |
|----------------------|------------------|------------------------|
| Contratos/DTOs/OpenAPI | H-080, H-050, H-001, H-002, H-003, H-004, H-005, H-010 | Deve ser resolvido primeiro para evitar retrabalho entre frontend e backend |
| Cache/ETag | H-050, H-001, H-020, H-030, H-040, H-010 | Importante para atingir os SLAs de leitura pública |
| Auditoria estruturada | H-002, H-003, H-004, H-012, H-013, H-021, H-030, H-040, H-055, H-060, H-061 | Convém padronizar cedo para não gerar lacunas históricas |
| Concorrência/Transação | H-011, H-012, H-013 | Exige desenho cuidadoso por capacidade, idempotência e race condition |
| CRUD Admin completo | H-004, H-005, H-012, H-013 | Histórias complementares para cobrir DELETE, toggle e listagem admin |
| Segurança avançada | H-070 | Parte pode avançar sem HTTPS final, mas WAF/SIEM/MFA dependem de preparação infra |
| WhatsApp | H-090, H-091 | Evolution API já operacional; E2E de login depende de backend configurado com segredos reais e migration aplicada no ambiente alvo |

### Sequência Executável Recomendada

1. H-080 (Fundação/OpenAPI)
2. H-050 (SiteSettings)
3. H-001 (Events público)
4. H-002 (Events criar)
5. H-003 (Events editar)
6. H-004 (Events excluir/desativar)
7. H-005 (Events listar admin)
8. H-055 (Contact)
9. H-020 (Orixas público)
10. H-021 (Orixas admin)
11. H-030 (UmbandaLines)
12. H-040 (SpiritualContents)
13. H-010 (Calendar público)
14. H-011 (Calendar inscrições)
15. H-012 (Calendar admin CRUD)
16. H-013 (Calendar admin gestão)
17. H-060 (Dashboard)
18. H-061 (Audit)
19. H-070 (Segurança avançada)

