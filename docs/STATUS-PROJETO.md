# 📊 STATUS ATUAL DO PROJETO BATUARA.NET

**Última atualização:** 08/07/2026
**Versão de referência documental:** 2026.07.08
**Fase atual:** Plataforma funcional em produção OCI com RBAC, WhatsApp OCI, autosserviço de Filho da Casa, recorrência/lembretes de contribuição, resposta WhatsApp de contato e hardening básico de portas públicas
**Ambiente local:** Docker Compose com Nginx, API, PublicWebsite, AdminDashboard e PostgreSQL

## 🎯 Resumo Executivo

O projeto opera com backend .NET 8 funcional, banco PostgreSQL, autenticação JWT, módulos CMS reais consumidos pelos dois frontends, RBAC/multiadmin, login de Filho da Casa por WhatsApp, lembretes de contribuição com opt-in, resposta WhatsApp para contato público e Evolution API self-hosted na OCI.

Produção OCI validada em 2026-07-08 no commit `c8c7c4e`, com containers principais `healthy`. O banco de desenvolvimento local foi sincronizado a partir da produção após manutenção de dados religiosos.

### ✅ Entregas Confirmadas

- **Autenticação:** login, refresh, logout, verificação de token, perfil e alteração de senha
- **PublicWebsite:** calendário, eventos, Orixás, linhas, conteúdos, localização, rodapé e conteúdo institucional via API
- **AdminDashboard:** gestão de história, localização, calendário, eventos, Orixás, guias, linhas, conteúdos e Filhos da Casa
- **RBAC/multiadmin:** roles `Admin=1`, `Editor=2`, `Viewer=3`, `Member=4`; página de usuários e rotas protegidas por perfil
- **WhatsApp OCI:** Evolution API self-hosted em loopback, instância `batuara-casa` conectada e validada com envio real
- **Filho da Casa:** login por WhatsApp e autosserviço de cadastro/contribuição implementados em código
- **Contribuição recorrente:** flags reais de recorrência/lembrete, geração da próxima mensalidade e processor de lembrete com throttling conservador
- **Contato Público:** opt-in para resposta por WhatsApp no site público e endpoint admin para envio da resposta
- **Infra local:** deploy via `docker-compose.local.yml`, health checks e Swagger operacionais
- **Banco de dados:** migrations ativas para `SiteSettings`, `ContactMessages`, `Guides`, `HouseMembers` e módulos relacionados
- **Dados religiosos:** `Exu` e `Pomba Gira` tratados como Guias/Entidades, não Orixás, em produção e desenvolvimento
- **Segurança OCI:** ingress público reduzido para `22`, `80` e `443`; Evolution API sem exposição pública

## 🧩 Status por Módulo

| Módulo | Status | Detalhes técnicos |
|---|---|---|
| Auth | ✅ Implementado | JWT, refresh token, endpoints `/auth/*` |
| RBAC/multiadmin | ✅ Implementado | Admin/Editor/Viewer/Member alinhados no backend e frontend |
| SiteSettings | ✅ Implementado | História, missão, localização, redes, PIX e dados bancários |
| Nossa História (Admin) | ✅ Implementado | Editor textual em tela cheia, sem preview, sem mídia |
| Localização | ✅ Implementado | Admin e site público integrados via `site-settings` |
| Calendário | ✅ Implementado | CRUD admin + leitura pública |
| Eventos | ✅ Implementado | CRUD admin + catálogo público |
| Orixás | ✅ Implementado | CRUD admin + catálogo público |
| Guias e Entidades | ✅ Implementado | CRUD admin + leitura pública |
| Linhas da Umbanda | ✅ Implementado | CRUD admin + leitura pública |
| Conteúdos Espirituais | ✅ Implementado | CRUD admin + leitura pública |
| Filhos da Casa | ✅ Implementado | CRUD administrativo, login WhatsApp, autosserviço restrito e contribuições recorrentes |
| Contato Público | ✅ Implementado | Recebimento de mensagens públicas, opt-in WhatsApp e resposta admin por WhatsApp |
| Lembretes de contribuição | ✅ Implementado / 🔒 Desligado por padrão | Hosted service e processor com `ContributionReminders.Enabled=false` até ativação explícita |
| WhatsApp / Evolution API OCI | ✅ Operacional | `batuara-casa` conectada; API/Manager acessíveis apenas via loopback/túnel SSH |
| Segurança OCI | ✅ Básico aplicado / 🔄 Evoluir | Painel OCI com ingress público somente `22/80/443`; manter SSH por chave e considerar Bastion/VPN no futuro |

## 🆕 Mudanças Recentes Relevantes

### 0. RBAC, WhatsApp e Filho da Casa

- Implementado RBAC/multiadmin no AdminDashboard, incluindo página de Usuários e menus/rotas por perfil.
- Implementado `UserRole.Member = 4` para login de Filhos da Casa.
- Implementados endpoints `POST /api/member-auth/request-code`, `POST /api/member-auth/verify-code`, `GET/PUT /api/members/me` e `POST /api/members/me/contributions`.
- Implementada Evolution API na OCI em `127.0.0.1:8085`, sem porta pública exposta.
- Instância definitiva `batuara-casa` conectada em 2026-07-08 com número temporário `5511975747470`.
- Envio real validado e mensagens recebidas com sucesso nos celulares `5511975747470` e `5511995384032`.
- Acesso ao Manager somente via SSH/túnel local, por exemplo `127.0.0.1:18085 -> 127.0.0.1:8085` na OCI.

### 0.1 Recorrência, lembretes e resposta WhatsApp

- Implementadas flags reais `IsRecurring` e `AllowWhatsAppReminder` em contribuições de Filhos da Casa.
- Implementada geração automática da próxima contribuição mensal quando uma contribuição recorrente é marcada como paga.
- Implementado `ContributionReminderProcessor` e hosted service de lembretes por WhatsApp, com limites conservadores e desligado por padrão.
- Implementado opt-in no formulário público de contato para resposta por WhatsApp, com telefone obrigatório quando marcado.
- Implementado endpoint administrativo para responder mensagens públicas por WhatsApp e marcar a mensagem como resolvida.
- Migration/snapshot EF alinhados em `20260708130000_AddRecurringContributionAndWhatsAppContact`.
- Deploy rolling preparado para aplicar a migration de forma idempotente e configurar WhatsApp via Docker network (`http://batuara-evolution-api:8080`).

### 0.2 Produção, dados religiosos e hardening OCI

- CI/CD executado no `master`; produção validada no commit `c8c7c4e` após hotfix dos healthchecks dos frontends.
- Backup pré-deploy criado em `/var/www/batuara_net/backups/predeploy_20260708_164920` e cópia local em `backups/predeploy_20260708_164920`.
- Backup pré-manutenção de dados religiosos criado em `/var/www/batuara_net/backups/orixas_guides_maintenance_20260708_181511`.
- Manutenção aplicada diretamente na produção: `Exu` e `Pomba Gira` removidos de `batuara."Orixas"` e inseridos em `batuara."Guides"`.
- Validação pós-manutenção em produção: `Orixas=12`, `Guides=9`; API `Healthy`.
- Banco local recriado/sincronizado a partir da produção com `scripts/sync-db-from-oci.ps1 -FullDatabase`; validação local também retornou `Orixas=12`, `Guides=9`.
- Túnel SSH da Evolution API fechado; Manager/API continuam inacessíveis publicamente.
- Painel OCI revisado pelo usuário; regras públicas extras removidas, mantendo `22/tcp`, `80/tcp`, `443/tcp` e ICMP operacional.
- Como o usuário não tem IP fixo, `22/tcp` permanece público por necessidade operacional; usar somente chave SSH e considerar OCI Bastion/VPN no futuro.

### 1. Nossa História

- Remoção completa de upload de imagem e vídeo
- Remoção da interface dividida com preview
- Conteúdo padrão institucional incorporado ao editor
- Remoção do botão `Link` na toolbar do editor
- Correção do fluxo de salvamento para evitar erro `History title cannot be empty`

### 2. SiteSettings e Dados Públicos

- `SiteSettings` consolidado como núcleo de:
  - história institucional
  - contato institucional
  - endereço estruturado
  - mapa incorporado
  - redes sociais
  - dados de PIX e conta bancária
- Ajustados fallbacks para localização, e-mail institucional, Instagram e mapa

### 3. PublicWebsite

- Localização pública ajustada para refletir os dados reais da API
- Rodapé alinhado com endereço/e-mail/Instagram institucionais
- Calendário público simplificado visualmente, sem contador numérico por dia

### 4. Operação Local

- O ambiente local pode apresentar `502 Bad Gateway` quando o `nginx` mantém upstreams antigos após rebuilds
- Procedimento validado: recriar o `nginx` restaura acesso à API, Swagger, PublicWebsite e autenticação

## 🗄️ Banco de Dados e Schema

### Migrations mais relevantes

- `20260401234426_AddSiteSettings`
- `20260402235355_ContentManagementModules`
- `20260403014603_AddHistoryMissionTextToSiteSettings`
- `20260403043437_RemoveHistoryMediaFromSiteSettings`
- `20260708020346_AddMemberLoginCodes`
- `20260708130000_AddRecurringContributionAndWhatsAppContact`

### Alterações recentes de schema

- inclusão de `HistoryMissionText`
- remoção de `HistoryImageUrl`
- remoção de `HistoryVideoUrl`
- expansão da tabela `SiteSettings` para endereço, redes e doações
- criação de tabelas para `ContactMessages`, `Guides`, `HouseMembers` e contribuições
- criação da tabela `batuara.MemberLoginCodes` para login WhatsApp de Filhos da Casa
- adição de campos de recorrência/lembrete em `HouseMemberContributions`
- adição de campos de opt-in/resposta WhatsApp em `ContactMessages`

## 🌐 Endpoints em Produção Local

### Verificações principais

- `GET /batuara-api/health`
- `GET /batuara-api/swagger`
- `POST /batuara-api/api/auth/login`
- `GET /batuara-api/api/site-settings/public`
- `PUT /batuara-api/api/site-settings`
- `GET /batuara-api/api/public/calendar/attendances`

### Exemplo de validação

```bash
curl http://localhost/batuara-api/health
curl http://localhost/batuara-api/swagger
curl http://localhost/batuara-public/
```

## 🚀 Operação e Deploy

### Produção OCI atual

- Branch: `master`.
- Commit validado em produção: `c8c7c4e`.
- CI `28964270844`: sucesso.
- CD OCI `28964614192`: sucesso.
- Containers validados após deploy: `batuara-net-api`, `batuara-net-admin-dashboard`, `batuara-net-public-website`, `batuara-net-db`.
- Health da API: `Healthy`.
- Ingress público esperado na OCI: `22`, `80`, `443`.
- Projetos publicados devem ser acessados via Nginx reverse proxy; não abrir portas diretas de containers no Security List/NSG.

### Evolution API na OCI

- Compose versionado: `scripts/docker/docker-compose.whatsapp.yml`.
- Compose ativo: `/var/www/batuara_net/Batuara.net/scripts/docker/docker-compose.whatsapp.yml`.
- Segredos reais somente na OCI: `/var/www/batuara_net/Batuara.net/scripts/docker/.env.whatsapp`.
- API/Manager: `http://127.0.0.1:8085`, bindado apenas em loopback.
- Não abrir porta pública para Evolution API.
- Para acesso administrativo temporário, usar túnel SSH local e acessar `http://127.0.0.1:18085/manager/`.
- Runbook detalhado: `docs/Evolution API - Operacao OCI.md`.

### Procedimento padrão de deploy local

```bash
$env:DB_PASSWORD='...'
$env:JWT_SECRET='...'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --build api publicwebsite admindashboard nginx
```

### Procedimento corretivo para 502

```bash
$env:DB_PASSWORD='...'
$env:JWT_SECRET='...'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --force-recreate nginx
```

## 📁 Estrutura Atual Relevante

- `src/Backend/Batuara.API/` — controllers, middleware, boot da API
- `src/Backend/Batuara.Infrastructure/` — EF Core, migrations e serviços
- `src/Frontend/PublicWebsite/` — SPA pública
- `src/Frontend/AdminDashboard/` — painel administrativo
- `docs/` — documentação funcional, operacional e de onboarding
- `agent.md` — guia de entendimento rápido para IA e novos devs

## 🔄 Próximos Passos Recomendados

1. Revisar `git status` e selecionar os arquivos de commit com cuidado; não incluir `.claude/`, `docs/.~lock.Plano de Testes Batuara.xlsx#`, `scripts/output/` nem dumps/backups.
2. Executar E2E real do login WhatsApp: solicitar código, receber mensagem, autenticar como Member e validar bloqueios administrativos.
3. Executar E2E de contribuição recorrente: criar contribuição recorrente, marcar como paga e confirmar geração do próximo mês.
4. Executar E2E de contato público: marcar opt-in WhatsApp, enviar mensagem e responder pelo AdminDashboard.
5. Revisar logs/configuração da Evolution API antes de produção para evitar conteúdo sensível.
6. Manter `ContributionReminders.Enabled=false` até decisão explícita de ativação em produção.
7. Trocar o pareamento para chip dedicado da Casa quando disponível.
8. Revisar `ufw` e compose dos demais projetos para remover portas host diretas ou bindar em `127.0.0.1`; a OCI já deve bloquear acesso externo direto.

## 📚 Referências Cruzadas

- `docs/EFT-especificacao-funcional-tecnica.md`
- `docs/Resumo-Executivo.md`
- `docs/Backlog-Executavel.md`
- `docs/TASK_HISTORY.md`
- `agent.md`

## 📝 Change Log

### 08/07/2026

- Atualizado estado do projeto com RBAC/multiadmin, login WhatsApp e autosserviço de Filho da Casa.
- Registrada Evolution API OCI operacional com instância `batuara-casa` conectada.
- Registrado que o painel Evolution Manager não tem acesso remoto público; somente loopback/túnel SSH.
- Registrado envio real recebido com sucesso nos celulares de teste.
- Registradas conclusões de recorrência/lembrete de contribuição e resposta WhatsApp de contato público.
- Registradas validações locais: backend 33 testes, builds dos frontends, compose produção, scripts de deploy, build Docker e containers locais healthy.
- Registrado deploy OCI em produção no commit `c8c7c4e`, hotfix de healthchecks dos frontends, manutenção `Exu`/`Pomba Gira` como Guias, sincronização do banco local com produção e hardening público OCI para `22/80/443`.

### 03/04/2026

- Documento reescrito para refletir o estado real da implementação
- Removidas referências desatualizadas à fase “aguardando API”
- Incluídas as mudanças recentes em `SiteSettings`, Nossa História, localização e deploy local
- Incluídas instruções operacionais para recuperação de `502` no ambiente local
