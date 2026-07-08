# Status Atual — RBAC, WhatsApp, Filho da Casa e COR-09

**Atualizado em:** 2026-07-08 (revisado após validação E2E real por Claude)
**Objetivo:** orientar outras ferramentas/agentes sobre o que foi implementado, validado e o que ainda depende de operação/E2E.

## ⚠️ Atualização: validação E2E real concluída (envio/recebimento WhatsApp de verdade)

Diferente das seções abaixo (que descrevem o estado no momento da implementação), o que segue foi **confirmado com evidência real** — login, envio e recebimento de mensagens de fato, não apenas build/testes automatizados:

- **RBAC:** login de Admin e de um Editor de teste validados no navegador; bloqueio real (403) de Editor em rota Admin-only confirmado; bug de regressão (`role` string vs número) encontrado e corrigido em `AuthContext.tsx`/`utils/roles.ts`/`UsersPage.tsx` via `normalizeUserRole`.
- **Login Filho da Casa por WhatsApp:** E2E completo — código solicitado, recebido de verdade no celular, verificado, perfil carregado com dados reais. 5 testes automatizados novos escritos para `MemberAuthService` (não existiam antes).
- **Migration local não aplicada:** `20260708130000_AddRecurringContributionAndWhatsAppContact` existia só no código, nunca tinha sido rodada no banco local — causava 500 em `/members/me`, `/house-members`, `/contact-messages`. Corrigido manualmente (SQL idempotente igual ao do `deploy-rolling.sh`). **Atenção:** confirmar que o deploy real na OCI de fato aplica essa migration na Step 3.5 — testes com EF InMemory não pegam esse tipo de dessincronia.
- **Resposta por WhatsApp a contato público — 2 bugs reais encontrados e corrigidos:**
  1. Mensagem marcada como "Respondida" mesmo com envio desabilitado (no-op silencioso não lançava exceção) — corrigido.
  2. Allowlist nunca batia com o telefone real por falta de normalização do código do país — corrigido com `PhoneNumberNormalizer.NormalizeBrazilMobile`.
  - E2E real confirmado após o fix: mensagem recebida de verdade no WhatsApp do destinatário.
- **Backend:** 33 testes passando (`dotnet test "Batuara.sln" -c Release`), incluindo os novos testes dos dois bugs acima.

**Pendente real:** rodar o deploy de verdade na OCI e confirmar que a Step 3.5 aplica as duas migrations sem erro; E2E manual de contribuição recorrente (hoje só validado por teste automatizado); revisão de logs da Evolution API antes de produção; troca do número temporário pelo chip dedicado da Casa.

## Resumo executivo

Implementação de código concluída para:
- Fase 1.2 — abstração backend de WhatsApp via Evolution API.
- Fase 2 — RBAC/multiadmin no AdminDashboard.
- COR-09 — seleção/autocomplete real de Orixás no cadastro administrativo de Filhos da Casa.
- Fase 3 — login de Filho da Casa por WhatsApp e autosserviço restrito.
- Recorrência e lembretes de contribuição por WhatsApp com opt-in.
- Resposta administrativa por WhatsApp para mensagens públicas autorizadas.

Validação local concluída via Docker/container SDK:
- Backend build OK.
- Backend tests OK: 33 passed.
- AdminDashboard build OK.
- PublicWebsite build OK.
- Compose produção OK.
- Scripts de deploy OK com `bash -n`.
- Containers locais `api`, `admindashboard` e `publicwebsite` recriados e `healthy`.

Ainda pendente para produção/E2E:
- ~~Executar o fluxo E2E real de login de Filho da Casa usando WhatsApp.~~ ✅ Feito em 2026-07-08 (ver seção no topo do arquivo).
- ~~Executar E2E de resposta de contato por WhatsApp.~~ ✅ Feito em 2026-07-08, com 2 bugs reais encontrados e corrigidos (ver seção no topo do arquivo).
- Executar E2E de contribuição recorrente (marcar como paga → confirmar geração automática do mês seguinte) — ainda só validado por teste automatizado, não manualmente no navegador.
- Aplicar migrations nos demais ambientes no momento do deploy (confirmar que a Step 3.5 do `deploy-rolling.sh` realmente roda sem erro — encontramos localmente que uma migration pode ficar sem aplicar silenciosamente).
- Manter lembretes automáticos desligados até decisão explícita.

## Infra Evolution API

Concluído em ambiente funcional/dev:
- Evolution API instalada e validada na OCI.
- API validada em `http://127.0.0.1:8085`.
- Compose versionado criado em `scripts/docker/docker-compose.whatsapp.yml`.
- Runbook criado em `docs/Evolution API - Operacao OCI.md`.
- Instância temporária `batuara-dev` conectada e validada com envio real.
- Instância definitiva `batuara-casa` pareada e validada com envio real em 2026-07-08.
- Evolution API/Manager sem acesso remoto público; escuta apenas em `127.0.0.1:8085` e acesso administrativo é via túnel SSH local.
- Envio real testado para:
  - `5511975747470`
  - `5511995384032`

Pendências operacionais:
- Revisar logs da Evolution API antes de produção para evitar conteúdo sensível.
- Trocar para chip dedicado da Casa quando disponível; hoje `batuara-casa` usa temporariamente o número pessoal `5511975747470`.

## Backend implementado

Arquivos novos:
- `src/Backend/Batuara.Application/Notifications/Services/IWhatsAppService.cs`
- `src/Backend/Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppOptions.cs`
- `src/Backend/Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppService.cs`
- `src/Backend/Batuara.Application/Common/PhoneNumbers/PhoneNumberNormalizer.cs`
- `src/Backend/Batuara.Application/MemberAuth/Models/MemberAuthModels.cs`
- `src/Backend/Batuara.Application/MemberAuth/Services/IMemberAuthService.cs`
- `src/Backend/Batuara.Infrastructure/MemberAuth/Services/MemberAuthService.cs`
- `src/Backend/Batuara.Domain/Entities/MemberLoginCode.cs`
- `src/Backend/Batuara.Infrastructure/Data/Configurations/MemberLoginCodeConfiguration.cs`
- `src/Backend/Batuara.Infrastructure/Data/Migrations/20260708020346_AddMemberLoginCodes.cs`
- `src/Backend/Batuara.Infrastructure/Data/Migrations/20260708020346_AddMemberLoginCodes.Designer.cs`
- `src/Backend/Batuara.API/Controllers/MemberAuthController.cs`
- `src/Backend/Batuara.API/Controllers/MemberSelfServiceController.cs`
- `src/Backend/Batuara.API/Services/ContributionReminderHostedService.cs`
- `src/Backend/Batuara.Infrastructure/HouseMembers/Services/ContributionReminderOptions.cs`
- `src/Backend/Batuara.Infrastructure/HouseMembers/Services/ContributionReminderProcessor.cs`
- `src/Backend/Batuara.Infrastructure/Data/Migrations/20260708130000_AddRecurringContributionAndWhatsAppContact.cs`

Arquivos alterados:
- `src/Backend/Batuara.API/Program.cs`
- `src/Backend/Batuara.API/appsettings.json`
- `src/Backend/Batuara.API/appsettings.Development.json`
- `src/Backend/Batuara.Application/Auth/Services/IJwtService.cs`
- `src/Backend/Batuara.Application/HouseMembers/Services/IHouseMemberService.cs`
- `src/Backend/Batuara.Domain/Enums/UserRole.cs`
- `src/Backend/Batuara.Infrastructure/Auth/Services/JwtService.cs`
- `src/Backend/Batuara.Infrastructure/Data/BatuaraDbContext.cs`
- `src/Backend/Batuara.Infrastructure/Data/Migrations/BatuaraDbContextModelSnapshot.cs`
- `src/Backend/Batuara.Infrastructure/HouseMembers/Services/HouseMemberService.cs`
- `src/Backend/Batuara.Domain/Entities/HouseMemberContribution.cs`
- `src/Backend/Batuara.Domain/Entities/ContactMessage.cs`
- `src/Backend/Batuara.Application/ContactMessages/Services/IContactMessageService.cs`
- `src/Backend/Batuara.Application/ContactMessages/Models/ContactMessageModels.cs`
- `src/Backend/Batuara.Infrastructure/ContactMessages/Services/ContactMessageService.cs`
- `src/Backend/Batuara.API/Controllers/ContactMessagesController.cs`
- `src/Backend/Batuara.API/Validators/ContactMessageValidators.cs`

Funcionalidades backend:
- `UserRole.Member = 4`.
- JWT de membro com role `Member` e claim `houseMemberId`.
- Códigos de login hashados em `MemberLoginCodes`.
- Expiração de código: 10 minutos.
- Máximo de tentativas: 5.
- Resposta genérica em `request-code` para evitar enumeração de membros.
- Allowlist de WhatsApp em desenvolvimento.
- Serviço WhatsApp desligado por padrão (`WhatsApp:Enabled=false`).
- Métodos WhatsApp para código de login, lembrete de contribuição e resposta de contato.
- `ContributionReminders.Enabled=false` por padrão.
- Geração da próxima contribuição recorrente ao marcar a atual como paga.
- Campos de tracking de lembrete em contribuição: `ReminderSentAt`, `ReminderLastAttemptAt`, `ReminderAttemptCount`.
- Campos de contato WhatsApp: `WantsWhatsAppResponse`, `WhatsAppResponseSentAt`, `WhatsAppResponseText`.

Endpoints novos:
- `POST /api/member-auth/request-code`
- `POST /api/member-auth/verify-code`
- `GET /api/members/me`
- `PUT /api/members/me`
- `POST /api/members/me/contributions`
- `POST /api/contact-messages/{id}/whatsapp-response`

## Frontend implementado

Arquivos novos:
- `src/Frontend/AdminDashboard/src/pages/UsersPage.tsx`
- `src/Frontend/AdminDashboard/src/pages/MemberProfilePage.tsx`
- `src/Frontend/AdminDashboard/src/utils/roles.ts`
- `src/Frontend/AdminDashboard/src/utils/phone.ts`

Arquivos alterados:
- `src/Frontend/AdminDashboard/src/App.tsx`
- `src/Frontend/AdminDashboard/src/components/common/ProtectedRoute.tsx`
- `src/Frontend/AdminDashboard/src/components/layout/AdminLayout.tsx`
- `src/Frontend/AdminDashboard/src/components/layout/Sidebar.tsx`
- `src/Frontend/AdminDashboard/src/contexts/AuthContext.tsx`
- `src/Frontend/AdminDashboard/src/pages/LoginPage.tsx`
- `src/Frontend/AdminDashboard/src/pages/MembersPage.tsx`
- `src/Frontend/AdminDashboard/src/pages/ProfilePage.tsx`
- `src/Frontend/AdminDashboard/src/services/api.ts`
- `src/Frontend/AdminDashboard/src/types/index.ts`
- `src/Frontend/AdminDashboard/src/pages/ContactMessagesPage.tsx`
- `src/Frontend/PublicWebsite/src/components/sections/ContactSection.tsx`
- `src/Frontend/PublicWebsite/src/types/index.ts`

Funcionalidades frontend:
- Enum `UserRole` alinhado ao backend: `Admin=1`, `Editor=2`, `Viewer=3`, `Member=4`.
- Helper `getRoleLabel`, `isAdmin`, `isEditorOrAdmin`, `isMember`.
- Página `Usuários` para CRUD administrativo via `/api/users`.
- Rotas Admin-only: Usuários, Doações e Contato, Localização.
- Rotas de conteúdo restritas a Admin/Editor.
- Login com alternância:
  - Equipe: e-mail/senha.
  - Filho da Casa: celular/código WhatsApp.
- Página `Meu Cadastro` para Member.
- Menu Member mostra apenas `Meu Cadastro` e logout.
- COR-09 implementado: `MembersPage.tsx` carrega Orixás via API e usa `Autocomplete` nos campos de Orixá.
- `Orixá de frente` obrigatório no formulário administrativo de Filhos da Casa.
- `freeSolo` mantido nos Autocomplete para preservar cadastros antigos com texto livre.
- Switches de contribuição recorrente/lembrete agora enviam campos reais, não notas textuais.
- ContactMessagesPage permite enviar resposta por WhatsApp quando a mensagem pública tem opt-in.
- PublicWebsite tem checkbox de opt-in WhatsApp e exige telefone com DDD quando marcado.

## Banco de dados

Migration criada pelo EF no container SDK:
- `20260708020346_AddMemberLoginCodes`
- `20260708130000_AddRecurringContributionAndWhatsAppContact`

Migration ajustada para aplicar somente a tabela nova `MemberLoginCodes`, porque o banco local já possuía alterações antigas de `HouseMembers`/`ContactMessages` que o snapshot ainda detectava.

Migration aplicada no banco local via container SDK:
- `dotnet ef database update`
- Rede Docker: `batuara-net-local_batuara-network`
- Variável usada pelo design-time factory: `BATUARA_CONNECTION_STRING`

Tabela nova:
- `batuara.MemberLoginCodes`

Campos novos:
- `HouseMemberContributions`: `IsRecurring`, `AllowWhatsAppReminder`, `ReminderSentAt`, `ReminderLastAttemptAt`, `ReminderAttemptCount`.
- `ContactMessages`: `WantsWhatsAppResponse`, `WhatsAppResponseSentAt`, `WhatsAppResponseText`.

## Validações executadas

Backend build via Docker local:
```powershell
docker compose -f "docker-compose.local.yml" build api
```
Resultado:
- Sucesso.
- `0 Warning(s)`.
- `0 Error(s)`.

Backend tests via container SDK:
```powershell
docker run --rm -v "${PWD}:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test "src/Backend/Batuara.Infrastructure.Tests/Batuara.Infrastructure.Tests.csproj"
```
Resultado:
- Sucesso.
- `33 passed`.
- `0 failed`.

Backend suite completa via container SDK:
```powershell
docker run --rm -v "${PWD}:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test "Batuara.sln" -c Release
```
Resultado:
- Sucesso.
- `33 passed`.
- `0 failed`.

AdminDashboard build local:
```powershell
npm run build
```
Diretório:
- `src/Frontend/AdminDashboard`

Resultado:
- Sucesso.
- Permanecem warnings antigos de lint em páginas não relacionadas.

PublicWebsite build local:
```powershell
npm run build
```
Diretório:
- `src/Frontend/PublicWebsite`

Resultado:
- Sucesso.
- Permanecem warnings antigos de lint em páginas não relacionadas.

Validação de deploy/compose:
```powershell
docker compose -f "scripts/docker/docker-compose.production.yml" config --quiet
docker run --rm -v "${PWD}:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 bash -n scripts/ci/deploy-rolling.sh scripts/ci/deploy-rolling-staging.sh
```
Resultado:
- Sucesso.

AdminDashboard build via Docker local:
```powershell
docker compose -f "docker-compose.local.yml" build admindashboard
```
Resultado:
- Sucesso.
- Permanecem warnings antigos de lint em páginas não relacionadas.

Migration local:
```powershell
dotnet ef database update --project src/Backend/Batuara.Infrastructure --startup-project src/Backend/Batuara.API
```
Executado dentro de container SDK com `BATUARA_CONNECTION_STRING` apontando para `db` na rede Docker local.

Resultado:
- `Applying migration '20260708020346_AddMemberLoginCodes'.`
- `Done.`

Containers atualizados:
```powershell
docker compose -f "docker-compose.local.yml" up -d api admindashboard publicwebsite
```
Resultado:
- `batuara-net-local-api`: healthy.
- `batuara-net-local-admin-dashboard`: healthy.
- `batuara-net-local-public-website`: healthy.

## Warnings conhecidos

Warnings de lint ainda existentes e considerados preexistentes/não bloqueantes:
- `DonationsContactPage.tsx`: `formatCnpj` não usado.
- `EventsPage.tsx`: BOM Unicode e `eventTypeNameMap` não usado.
- `GuidesPage.tsx`: imports MUI não usados.
- `MembersPage.tsx`: `getContributionStatusLabel` e `openDetails` não usados.
- `OrixasPage.tsx`: imports MUI não usados.
- `SpiritualContentPage.tsx`: `escapeHtml` não usado.
- `UmbandaLinesPage.tsx`: imports MUI não usados.

## Pendências reais

Para fechar produção:
1. Configurar segredos reais em ambiente, sem commit:
   - `WhatsApp__Enabled=true`
   - `WhatsApp__BaseUrl=http://127.0.0.1:8085`
   - `WhatsApp__ApiKey=<secret>`
   - `WhatsApp__InstanceName=batuara-casa`
2. Aplicar migrations `20260708020346_AddMemberLoginCodes` e `20260708130000_AddRecurringContributionAndWhatsAppContact` nos demais ambientes no deploy (confirmar que a Step 3.5 do `deploy-rolling.sh` roda sem erro — localmente essa migration ficou sem aplicar silenciosamente até ser detectado via teste manual).
3. E2E já validado com evidência real em 2026-07-08 (ver seção no topo do arquivo):
   - ✅ Filho da Casa solicita código, recebe no WhatsApp, login funciona, perfil carrega com dados reais.
   - ✅ Visitante envia contato com opt-in WhatsApp, Admin responde e mensagem chega de verdade no WhatsApp.
   - ✅ RBAC: Admin e Editor testados no navegador, bloqueio real confirmado.
4. E2E ainda não validado manualmente (só por teste automatizado):
   - Admin cria contribuição recorrente e marca como paga → sistema gera a contribuição do próximo mês.
   - Membro edita dados pessoais/endereço via `Meu Cadastro`.
   - Membro registra contribuição pendente.
   - Membro é bloqueado em rotas administrativas.
5. Revisar configuração de logs da Evolution API antes de produção.

## Observações para próximas ferramentas/agentes

- Não executar build backend com `dotnet` no host Windows; usar Docker local.
- O container runtime `batuara-net-local-api` não possui SDK. Para EF/testes, usar `mcr.microsoft.com/dotnet/sdk:8.0` com volume do workspace.
- O design-time factory do EF usa `BATUARA_CONNECTION_STRING`, não `ConnectionStrings__DefaultConnection`.
- O banco local está em container `batuara-net-local-db` na rede `batuara-net-local_batuara-network`.
- Existem várias alterações não relacionadas já presentes no worktree; não reverter sem confirmação do usuário.
